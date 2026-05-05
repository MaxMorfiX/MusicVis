/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from 'blockly/javascript';
import * as Blockly from 'blockly/core';

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock['add_text'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const addText = generator.provideFunction_(
        'addText',
        `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text) {

            // Add text to the output area.
            const outputDiv = document.getElementById('output');
            const textEl = document.createElement('p');
            textEl.innerText = text;
            outputDiv.appendChild(textEl);
        }`,
    );
    // Generate the function call for this block.
    const code = `${addText}(${text});\n`;
    return code;
};

forBlock['get_energy'] = function() {

  // TODO: Assemble javascript into the code variable.
  const code = '20';
  // TODO: Change Order.NONE to the correct operator precedence strength
  return [code, Order.NONE];
}

forBlock['draw_rect'] = function(block: Blockly.Block, generator: Blockly.Generator) {
    const x1 = generator.valueToCode(block, 'x1', Order.ATOMIC) || "0";
    const x2 = generator.valueToCode(block, 'x2', Order.ATOMIC) || "0";
    const y1 = generator.valueToCode(block, 'y1', Order.ATOMIC) || "0";
    const y2 = generator.valueToCode(block, 'y2', Order.ATOMIC) || "0";

    const drawRect = generator.provideFunction_(
        'drawRect',
        `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(x1, x2, y1, y2) {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            // Use the parameters, not hardcoded 10,10,150,100
            const x = Math.min(x1, x2);
            const y = Math.min(y1, y2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            ctx.fillStyle = "green";
            ctx.fillRect(x, y, width, height);
        }`
    );

    const code = `${drawRect}(${x1}, ${x2}, ${y1}, ${y2});\n`;
    return code;
}