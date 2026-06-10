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