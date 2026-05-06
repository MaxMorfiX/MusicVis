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

    const drawRect = generator.provideFunction_(
        'drawRect',
        `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(x, y, width, height) {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            
            ctx.fillStyle = "green";
            ctx.fillRect(x, y, width, height);
        }`
    );

    const code = `${drawRect}(${x}, ${y}, ${width}, ${height});\n`;
    return code;
}

forBlock['clear_screen'] = function(block: Blockly.Block, generator: Blockly.Generator) {

    const clearScreen = generator.provideFunction_(
        'clearScreen',
        `function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");

            const x = 0;
            const y = 0;
            const width = canvas.width;
            const height = canvas.height;
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, width, height);
        }`
    );

    const code = `${clearScreen}();\n`;
    return code;
}