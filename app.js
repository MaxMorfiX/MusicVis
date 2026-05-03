// Wait for the page to load
window.addEventListener('load', () => {
    // Inject Blockly workspace
    const workspaceConfig = {
        toolbox: `<xml id="toolbox" style="display: none">
                    <block type="controls_repeat_ext"></block>
                    <block type="math_number"></block>
                    <block type="text"></block>
                    </xml>`,
        grid: { spacing: 20, length: 3, colour: '#ccc' },
        zoom: { controls: true, wheel: true }
    };
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (blocklyDiv) {
        const workspace = Blockly.inject(blocklyDiv, workspaceConfig);
        console.log("Blockly workspace injected");
    } else {
        console.error("blocklyDiv not found");
    }
});


let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let analyserNode = null;
let isPlaying = false;
let animationId = null;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');

async function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.connect(audioContext.destination);
    }

    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    isPlaying = false;
    
    if (animationId) cancelAnimationFrame(animationId);
    startVisualizationLoop();
});

playBtn.addEventListener('click', async () => {
    if (!audioContext || !audioBuffer) return;
    await resumeAudioContext();
    
    if (sourceNode) {
        try { sourceNode.stop(); } catch(e) {}
        sourceNode.disconnect();
    }
    
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(analyserNode);
    sourceNode.loop = false;
    sourceNode.start();
    
    isPlaying = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    
    sourceNode.onended = () => {
        isPlaying = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    };
});

pauseBtn.addEventListener('click', () => {
    if (!audioContext || !sourceNode) return;
    audioContext.suspend();
    isPlaying = false;
    playBtn.disabled = false;
    pauseBtn.disabled = true;
});

function startVisualizationLoop() {
    if (!analyserNode) return;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!analyserNode) return;
        analyserNode.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const barHeight = (value / 255) * canvas.height;
            const hue = (i / bufferLength) * 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
        animationId = requestAnimationFrame(draw);
    }
    draw();
}