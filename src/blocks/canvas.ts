// canvas.ts

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const drawRect = {
    "type": "draw_rect",
    "tooltip": "Draw a rectangle with a chosen fill colour.",
    "helpUrl": "",
    "message0": "Draw Rect %1 x %2 y %3 width %4 height %5 colour %6",
    "args0": [
        {
            "type": "input_dummy",
            "name": "DrawRect"
        },
        {
            "type": "input_value",
            "name": "x",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "y",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "width",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "height",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "colour",
            "check": "Colour"   // Accepts any block that outputs a Colour type
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 225
};

const clearScreen = {
    "type": "clear_screen",
    "tooltip": "Clear the canvas (fill with black).",
    "helpUrl": "",
    "message0": "clear screen",
    "colour": 455,
    "previousStatement": null,
    "nextStatement": null,
};

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    drawRect, clearScreen
]);