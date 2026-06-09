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
// Audio analyser variables + helper
// ------------------------------------------------------------
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

/** Returns the current RMS volume (0–1) of the playing audio. */
function getAnalyzerVolume(): number {
  if (!analyser) return 0;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const sample = (dataArray[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / bufferLength);
}

(window as any).getAnalyzerVolume = getAnalyzerVolume;

// ------------------------------------------------------------
// Blockly setup
// ------------------------------------------------------------
Blockly.common.defineBlocks(textBlocks);
Blockly.common.defineBlocks(musicBlocks);
Blockly.common.defineBlocks(canvasBlocks);
Object.assign(javascriptGenerator.forBlock, forBlock);

const codeDiv = document.getElementById('generatedCode')?.firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');

if (!blocklyDiv) {
  throw new Error(`div with id 'blocklyDiv' not found`);
}
const ws = Blockly.inject(blocklyDiv, { toolbox, oneBasedIndex: false });

let stopAnimation: (() => void) | null = null;

const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws as Blockly.Workspace);
  if (codeDiv) codeDiv.textContent = code;
  if (outputDiv) outputDiv.innerHTML = '';

  if (stopAnimation) {
    stopAnimation();
    stopAnimation = null;
  }

  const lastFuncDefIndex = code.lastIndexOf('function ');
  let funcDefs = '';
  let statements = code;

  if (lastFuncDefIndex !== -1) {
    let braceStart = code.indexOf('{', lastFuncDefIndex);
    let braceCount = 1;
    let i = braceStart;
    while (braceCount > 0 && i < code.length) {
      i++;
      if (code[i] === '{') braceCount++;
      if (code[i] === '}') braceCount--;
    }
    const funcEnd = i + 1;
    funcDefs = code.substring(0, funcEnd);
    statements = code.substring(funcEnd).trim();
    if (statements.startsWith(';')) {
      statements = statements.substring(1).trim();
    }
  }

  const wrappedCode = `
    ${funcDefs}
    let __running = true;
    function __animationFrame() {
        if (!__running) return;
        try {
        ${statements}
        } catch (e) {
        console.error('Blockly animation error:', e);
        } finally {
        requestAnimationFrame(__animationFrame);
        }
    }
    __animationFrame();
    window.__stopAnimation = () => { __running = false; };
    `;

  eval(wrappedCode);
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

let audio = new Audio();
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

// ------------------------------------------------------------
// Full‑screen toggle + canvas resize (square)
// ------------------------------------------------------------
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement;

function resizeCanvasForDisplay() {
  const rect = canvas.getBoundingClientRect();
  const size = Math.floor(rect.width);
  canvas.width = size;
  canvas.height = size;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      console.error(`Fullscreen error: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// ------------------------------------------------------------
// Demo workspaces loader (using embedded objects)
// ------------------------------------------------------------
const demoSelect = document.getElementById('demoSelect') as HTMLSelectElement;
const loadDemoBtn = document.getElementById('loadDemoBtn') as HTMLButtonElement;

// Define your demos here.
// Each demo is a key (ID) and the value is the workspace JSON object.
// Example:
const DEMO_EQUALIZER = {
    "blocks": {
        "languageVersion": 0,
        "blocks": [
            {
                "type": "clear_screen",
                "id": ";Dt#)W;~E5dj1d$B-B?n",
                "x": 129,
                "y": 145,
                "next": {
                    "block": {
                        "type": "controls_for",
                        "id": "XTyWvo7Fi@yw@)29O|D!",
                        "fields": {
                            "VAR": {
                                "id": "b[$@eMvkVy6tEfVa6{WM"
                            }
                        },
                        "inputs": {
                            "FROM": {
                                "shadow": {
                                    "type": "math_number",
                                    "id": "!K}*V(%GG(8/*nb#GWy7",
                                    "fields": {
                                        "NUM": 0
                                    }
                                }
                            },
                            "TO": {
                                "shadow": {
                                    "type": "math_number",
                                    "id": "T:U{SLR!,ZR#+}E6)1ev",
                                    "fields": {
                                        "NUM": 100
                                    }
                                },
                                "block": {
                                    "type": "lists_length",
                                    "id": "B_?`1hLF=ss@-$|rQHj*",
                                    "inputs": {
                                        "VALUE": {
                                            "block": {
                                                "type": "get_frequency_data",
                                                "id": "/ymrCtx+vMO.Ea8*{`yL"
                                            }
                                        }
                                    }
                                }
                            },
                            "BY": {
                                "shadow": {
                                    "type": "math_number",
                                    "id": "f}}a}T$*0T~o{!*e,pzq",
                                    "fields": {
                                        "NUM": 1
                                    }
                                }
                            },
                            "DO": {
                                "block": {
                                    "type": "draw_rect",
                                    "id": "y+,O8tp.SL}ALud!}[E;",
                                    "inputs": {
                                        "x": {
                                            "block": {
                                                "type": "math_arithmetic",
                                                "id": "^QM{5J1l@j3qu/{?O8vh",
                                                "fields": {
                                                    "OP": "DIVIDE"
                                                },
                                                "inputs": {
                                                    "A": {
                                                        "shadow": {
                                                            "type": "math_number",
                                                            "id": "LV$(*:n;pYLJ}[,T3?fD",
                                                            "fields": {
                                                                "NUM": 1
                                                            }
                                                        },
                                                        "block": {
                                                            "type": "variables_get",
                                                            "id": "FSB.5kh;tw-$u4=xOn}#",
                                                            "fields": {
                                                                "VAR": {
                                                                    "id": "b[$@eMvkVy6tEfVa6{WM"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "B": {
                                                        "shadow": {
                                                            "type": "math_number",
                                                            "id": "O83FG4m9wiR)re#G2Q4=",
                                                            "fields": {
                                                                "NUM": 1
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "y": {
                                            "block": {
                                                "type": "math_number",
                                                "id": "Yt#%;{5a?21#Hr^ZsPG|",
                                                "fields": {
                                                    "NUM": 100
                                                }
                                            }
                                        },
                                        "width": {
                                            "block": {
                                                "type": "math_number",
                                                "id": "%QO~sbRStc=@Z[O4U|;]",
                                                "fields": {
                                                    "NUM": 1.1
                                                }
                                            }
                                        },
                                        "height": {
                                            "block": {
                                                "type": "math_arithmetic",
                                                "id": ")%.1%i#uF!,yO-=AJa`x",
                                                "fields": {
                                                    "OP": "DIVIDE"
                                                },
                                                "inputs": {
                                                    "A": {
                                                        "shadow": {
                                                            "type": "math_number",
                                                            "id": "ZtOo0g(bnq@@^P$D3Rux",
                                                            "fields": {
                                                                "NUM": 1
                                                            }
                                                        },
                                                        "block": {
                                                            "type": "lists_getIndex",
                                                            "id": "R}1A-5bUR@*a[;{*:gk4",
                                                            "fields": {
                                                                "MODE": "GET",
                                                                "WHERE": "FROM_START"
                                                            },
                                                            "inputs": {
                                                                "VALUE": {
                                                                    "block": {
                                                                        "type": "get_frequency_data",
                                                                        "id": "M[];te1#5e*5AmiZ;%v~"
                                                                    }
                                                                },
                                                                "AT": {
                                                                    "block": {
                                                                        "type": "variables_get",
                                                                        "id": "0I]+Bj]U%2EP;-tiZ~LU",
                                                                        "fields": {
                                                                            "VAR": {
                                                                                "id": "b[$@eMvkVy6tEfVa6{WM"
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "B": {
                                                        "shadow": {
                                                            "type": "math_number",
                                                            "id": "O?,jT8wWk.Za#[)NH#*e",
                                                            "fields": {
                                                                "NUM": -2.5
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "next": {
                                        "block": {
                                            "type": "controls_if",
                                            "id": "iu.1%QmBBv3RUZ6ngZ2N",
                                            "inputs": {
                                                "IF0": {
                                                    "block": {
                                                        "type": "logic_compare",
                                                        "id": "X7QNB?T9kNvlQ*={%$a:",
                                                        "fields": {
                                                            "OP": "EQ"
                                                        },
                                                        "inputs": {
                                                            "A": {
                                                                "block": {
                                                                    "type": "variables_get",
                                                                    "id": "$Xc?eGxdLk!PZTa3++s}",
                                                                    "fields": {
                                                                        "VAR": {
                                                                            "id": "b[$@eMvkVy6tEfVa6{WM"
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            "B": {
                                                                "block": {
                                                                    "type": "math_number",
                                                                    "id": "lFFw$TmO80::IhFQDH8O",
                                                                    "fields": {
                                                                        "NUM": 123
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                },
                                                "DO0": {
                                                    "block": {
                                                        "type": "add_text",
                                                        "id": "{:Cv`WYC+ryS%vOVlosR",
                                                        "inputs": {
                                                            "TEXT": {
                                                                "shadow": {
                                                                    "type": "text",
                                                                    "id": "m@PQylsvcE]O.`)rjCKO",
                                                                    "fields": {
                                                                        "TEXT": "abc"
                                                                    }
                                                                },
                                                                "block": {
                                                                    "type": "variables_get",
                                                                    "id": "t:*b5B{cMby@io3WV]o8",
                                                                    "fields": {
                                                                        "VAR": {
                                                                            "id": "b[$@eMvkVy6tEfVa6{WM"
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]
    },
    "variables": [
        {
            "name": "item",
            "id": "!JFb?~*ivgS{NSht?:z0"
        },
        {
            "name": "i",
            "id": "b[$@eMvkVy6tEfVa6{WM"
        }
    ]
};

const demos: Record<string, any> = {
  'equalizer': DEMO_EQUALIZER,
  // Add more demos as you export them, e.g.:
  // 'bouncing_bars': DEMO_BOUNCING_BARS,
  // 'circle_pulse': DEMO_CIRCLE_PULSE,
};

// Populate dropdown from demos object keys
for (const key in demos) {
  if (Object.prototype.hasOwnProperty.call(demos, key)) {
    const option = document.createElement('option');
    option.value = key;
    // Make a readable label (capitalize, replace underscores)
    option.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    demoSelect.appendChild(option);
  }
}

function loadDemoWorkspace(demoId: string) {
  const demoData = demos[demoId];
  if (!demoData) {
    alert(`Demo "${demoId}" not found.`);
    return;
  }

  const workspace = Blockly.getMainWorkspace();
  Blockly.Events.disable();   // prevent triggering save during load
  workspace.clear();          // remove all existing blocks
  Blockly.serialization.workspaces.load(demoData, workspace);
  Blockly.Events.enable();

  // Save the loaded workspace to localStorage
  save(workspace);
  console.log(`Demo "${demoId}" loaded successfully.`);
}

if (loadDemoBtn) {
  loadDemoBtn.addEventListener('click', () => {
    const selected = demoSelect.value;
    if (!selected) {
      alert('Please select a demo from the dropdown.');
      return;
    }
    loadDemoWorkspace(selected);
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

document.addEventListener('fullscreenchange', () => {
  resizeCanvasForDisplay();
  // Optionally redraw immediately
  if (stopAnimation) runCode();
});

window.addEventListener('resize', () => {
  if (!document.fullscreenElement) {
    resizeCanvasForDisplay();
  }
});

window.addEventListener('load', () => {
  resizeCanvasForDisplay();
});

(window as any).Blockly = Blockly;