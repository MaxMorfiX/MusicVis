/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from 'blockly/javascript';
import * as Blockly from 'blockly/core';

export const forBlock = Object.create(null);

forBlock['add_text'] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const addText = generator.provideFunction_(
    'addText',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text) {

      console.log(text)  
      return;

      const outputDiv = document.getElementById('output');
      const textEl = document.createElement('p');
      textEl.innerText = text;
    //   outputDiv.appendChild(textEl);
    }`,
  );
  return `${addText}(${text});\n`;
};

forBlock['get_energy'] = function(
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
) {
  return ['getAnalyzerVolume()', Order.FUNCTION_CALL];
};

forBlock['draw_rect'] = function(block: Blockly.Block, generator: Blockly.Generator) {
  const x = generator.valueToCode(block, 'x', Order.ATOMIC) || "0";
  const y = generator.valueToCode(block, 'y', Order.ATOMIC) || "0";
  const width = generator.valueToCode(block, 'width', Order.ATOMIC) || "50";
  const height = generator.valueToCode(block, 'height', Order.ATOMIC) || "50";
  const colour = generator.valueToCode(block, 'colour', Order.ATOMIC) || "'#00FF00'";  // default green

  const drawRect = generator.provideFunction_(
    'drawRect',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(x, y, width, height, colour) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      // Convert 0–100 values to pixels
      const pixelX = (x / 100) * canvas.width;
      const pixelY = (y / 100) * canvas.height;
      const pixelW = (width / 100) * canvas.width;
      const pixelH = (height / 100) * canvas.height;
      ctx.fillStyle = colour;
      ctx.fillRect(pixelX, pixelY, pixelW, pixelH);
    }`
  );

  return `${drawRect}(${x}, ${y}, ${width}, ${height}, ${colour});\n`;
};

forBlock['clear_screen'] = function(block: Blockly.Block, generator: Blockly.Generator) {
  const clearScreen = generator.provideFunction_(
    'clearScreen',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }`
  );
  return `${clearScreen}();\n`;
};

forBlock['get_frequency_data'] = function(
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    const code = `(function() {
        const analyser = window.audioAnalyser;
        if (!analyser) {
            return [];
        }
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        return Array.from(dataArray);
    })()`;
    return [code, Order.FUNCTION_CALL];
};

forBlock['draw_line'] = function(block: Blockly.Block, generator: Blockly.Generator) {
  const x1 = generator.valueToCode(block, 'x1', Order.ATOMIC) || "0";
  const y1 = generator.valueToCode(block, 'y1', Order.ATOMIC) || "0";
  const x2 = generator.valueToCode(block, 'x2', Order.ATOMIC) || "0";
  const y2 = generator.valueToCode(block, 'y2', Order.ATOMIC) || "0";
  const width = generator.valueToCode(block, 'width', Order.ATOMIC) || "2";
  const colour = generator.valueToCode(block, 'colour', Order.ATOMIC) || "'#FFFFFF'";

  const drawLine = generator.provideFunction_(
    'drawLine',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(x1, y1, x2, y2, width, colour) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const pixelX1 = (x1 / 100) * canvas.width;
      const pixelY1 = (y1 / 100) * canvas.height;
      const pixelX2 = (x2 / 100) * canvas.width;
      const pixelY2 = (y2 / 100) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(pixelX1, pixelY1);
      ctx.lineTo(pixelX2, pixelY2);
      ctx.lineWidth = width;
      ctx.strokeStyle = colour;
      ctx.stroke();
    }`
  );

  return `${drawLine}(${x1}, ${y1}, ${x2}, ${y2}, ${width}, ${colour});\n`;
};

forBlock['colour_hsv'] = function(block: Blockly.Block, generator: Blockly.Generator) {
  const hue = generator.valueToCode(block, 'H', Order.ATOMIC) || '0';
  const saturation = generator.valueToCode(block, 'S', Order.ATOMIC) || '0';
  const value = generator.valueToCode(block, 'V', Order.ATOMIC) || '0';

  const hsvToHex = generator.provideFunction_(
    'hsvToHex',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(h, s, v) {
      // Constrain inputs
      h = Math.max(0, Math.min(360, h));
      s = Math.max(0, Math.min(1, s));
      v = Math.max(0, Math.min(1, v));

      let r, g, b;
      if (s === 0) {
        r = g = b = v;
      } else {
        const segment = h / 60;
        const i = Math.floor(segment);
        const f = segment - i;
        const p = v * (1 - s);
        const q = v * (1 - s * f);
        const t = v * (1 - s * (1 - f));

        switch (i) {
          case 0: r = v; g = t; b = p; break;
          case 1: r = q; g = v; b = p; break;
          case 2: r = p; g = v; b = t; break;
          case 3: r = p; g = q; b = v; break;
          case 4: r = t; g = p; b = v; break;
          default: r = v; g = p; b = q; break;
        }
      }

      const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }`
  );

  return [`${hsvToHex}(${hue}, ${saturation}, ${value})`, Order.FUNCTION_CALL];
};
