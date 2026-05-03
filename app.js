// ========== BLOCKLY SETUP ==========
window.addEventListener('load', () => {
    const toolbox = `
        <xml id="toolbox" style="display: none">
            <block type="controls_repeat_ext"></block>
            <block type="math_number"></block>
            <block type="text"></block>
        </xml>
    `;
    
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        grid: { spacing: 20, length: 3, colour: '#ccc' },
        zoom: { controls: true, wheel: true }
    });
    
    console.log("Blockly ready");
});

// ========== AUDIO ENGINE ==========
let audioContext = null;
let currentBuffer = null;
let activeSource = null;
let analyser = null;
let isPlaying = false;
let animationFrameId = null;

const canvas = document.getElementById('visualizer');
const canvasContext = canvas.getContext('2d');
const filePicker = document.getElementById('fileInput');
const playButton = document.getElementById('playBtn');
const pauseButton = document.getElementById('pauseBtn');

// Helpers
async function ensureAudioContextRunning() {
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

function stopCurrentSource() {
    if (activeSource) {
        try { activeSource.stop(); } catch(e) {}
        activeSource.disconnect();
        activeSource = null;
    }
}

// File loading
filePicker.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    stopCurrentSource();
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.connect(audioContext.destination);
    }
    
    const arrayBuffer = await file.arrayBuffer();
    currentBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    playButton.disabled = false;
    pauseButton.disabled = true;
    isPlaying = false;
    
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    startVisualization();
});

// Playback controls
playButton.addEventListener('click', async () => {
    if (!audioContext || !currentBuffer) return;
    await ensureAudioContextRunning();
    
    stopCurrentSource();
    
    activeSource = audioContext.createBufferSource();
    activeSource.buffer = currentBuffer;
    activeSource.connect(analyser);
    activeSource.loop = false;
    activeSource.start();
    
    isPlaying = true;
    playButton.disabled = true;
    pauseButton.disabled = false;
    
    activeSource.onended = () => {
        isPlaying = false;
        playButton.disabled = false;
        pauseButton.disabled = true;
    };
});

pauseButton.addEventListener('click', () => {
    if (!audioContext || !activeSource) return;
    audioContext.suspend();
    isPlaying = false;
    playButton.disabled = false;
    pauseButton.disabled = true;
});

// Visualization loop (currently draws bars)
function startVisualization() {
    if (!analyser) return;
    
    const frequencyBinCount = analyser.frequencyBinCount; // = fftSize/2 = 128
    const frequencyData = new Uint8Array(frequencyBinCount);
    
    function drawFrame() {
        if (!analyser) return;
        analyser.getByteFrequencyData(frequencyData);
        
        // Clear canvas
        canvasContext.fillStyle = '#000';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw each frequency bar
        const barWidth = canvas.width / frequencyBinCount;
        let x = 0;
        
        for (let i = 0; i < frequencyBinCount; i++) {
            const amplitude = frequencyData[i];
            const barHeight = (amplitude / 255) * canvas.height;
            const hue = (i / frequencyBinCount) * 360;
            
            canvasContext.fillStyle = `hsl(${hue}, 100%, 50%)`;
            canvasContext.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
        
        animationFrameId = requestAnimationFrame(drawFrame);
    }
    
    drawFrame();
}