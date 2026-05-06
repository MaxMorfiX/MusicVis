/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { blocks as textBlocks } from './blocks/text';
import { blocks as musicBlocks } from './blocks/music';
import { blocks as canvasBlocks } from './blocks/canvas';
import { forBlock } from './generators/javascript';
import { javascriptGenerator } from 'blockly/javascript';
import { save, load } from './serialization';
import { toolbox } from './toolbox';
import './index.css';

// ------------------------------------------------------------
// Audio analyser variables + helper (must be ready BEFORE any runCode)
// ------------------------------------------------------------
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

/** Returns the current RMS volume (0–1) of the playing audio. */
function getAnalyzerVolume(): number {
    if (!analyser) return 0;
    const bufferLength = analyser.frequencyBinCount; // fftSize / 2
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        const sample = (dataArray[i] - 128) / 128;
        sum += sample * sample;
    }
    return Math.sqrt(sum / bufferLength);
}

// Expose globally so the generated block code can call it
(window as any).getAnalyzerVolume = getAnalyzerVolume;

// ------------------------------------------------------------
// Blockly setup
// ------------------------------------------------------------
Blockly.common.defineBlocks(textBlocks);
Blockly.common.defineBlocks(musicBlocks);
Blockly.common.defineBlocks(canvasBlocks);
Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode')?.firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');

if (!blocklyDiv) {
    throw new Error(`div with id 'blocklyDiv' not found`);
}
const ws = Blockly.inject(blocklyDiv, { toolbox });

// ---------- Animation loop control ----------
let stopAnimation: (() => void) | null = null;

// This function resets the code and output divs, and runs the generated code
const runCode = () => {
    const code = javascriptGenerator.workspaceToCode(ws as Blockly.Workspace);
    if (codeDiv) codeDiv.textContent = code;
    if (outputDiv) outputDiv.innerHTML = '';

    // Stop any previously running animation loop
    if (stopAnimation) {
        stopAnimation();
        stopAnimation = null;
    }

    // Split the generated code into function definitions and executable statements
    const lastFuncDefIndex = code.lastIndexOf('function ');
    let funcDefs = '';
    let statements = code;

    if (lastFuncDefIndex !== -1) {
        // Find the matching closing brace of this last function definition
        let braceStart = code.indexOf('{', lastFuncDefIndex);
        let braceCount = 1;
        let i = braceStart;
        while (braceCount > 0 && i < code.length) {
            i++;
            if (code[i] === '{') braceCount++;
            if (code[i] === '}') braceCount--;
        }
        const funcEnd = i + 1; // position after the matching '}'
        funcDefs = code.substring(0, funcEnd);
        statements = code.substring(funcEnd).trim();
        if (statements.startsWith(';')) {
            statements = statements.substring(1).trim();
        }
    }

    // Build the new code with an animation loop
    const wrappedCode = `
        ${funcDefs}
        let __running = true;
        function __animationFrame() {
            if (!__running) return;
            try {
                ${statements}
            } finally {
                requestAnimationFrame(__animationFrame);
            }
        }
        __animationFrame();
        window.__stopAnimation = () => { __running = false; };
    `;

    eval(wrappedCode);

    // Store the stop function for later use
    stopAnimation = (window as any).__stopAnimation;
};

if (ws) {
    load(ws);
    runCode();

    ws.addChangeListener((e: Blockly.Events.Abstract) => {
        if (e.isUiEvent) return;
        save(ws);
    });

    ws.addChangeListener((e: Blockly.Events.Abstract) => {
        if (
            e.isUiEvent ||
            e.type == Blockly.Events.FINISHED_LOADING ||
            ws.isDragging()
        ) {
            return;
        }
        runCode();
    });
}

// ------------------------------------------------------------
// Music playback UI + Web Audio graph
// ------------------------------------------------------------
const fileInput = document.getElementById('musicFile') as HTMLInputElement | null;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement | null;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement | null;

let audio: HTMLAudioElement = new Audio();
let currentUrl: string | null = null;

if (fileInput && playBtn && stopBtn) {
    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = URL.createObjectURL(file);
        audio.src = currentUrl;
        audio.load();

        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }

        audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        (window as any).audioAnalyser = analyser;
    });

    playBtn.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audio.currentTime = 30;
        audio.play();
    });

    stopBtn.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
    });
}