// canvas.ts

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { colour } from 'blockly/blocks';
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

const drawLine = {
    "type": "draw_line",
    "tooltip": "Draw a line from (x1,y1) to (x2,y2) with specified width and colour.",
    "helpUrl": "",
    "message0": "Draw Line %1 start x %2 y %3 end x %4 y %5 width %6 colour %7",
    "args0": [
        {
            "type": "input_dummy",
            "name": "DrawLine"
        },
        {
            "type": "input_value",
            "name": "x1",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "y1",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "x2",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "y2",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "width",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "colour",
            "check": "Colour"
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

const colourHsv = {
    "type": "colour_hsv",
    "message0": "colour with hue %1 saturation %2 value %3",
    "args0": [
        {
            "type": "input_value",
            "name": "H",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "S",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "V",
            "check": "Number"
        }
    ],
    "output": "Colour", // Outputs a colour type, compatible with your draw blocks
    "style": "colour_blocks",
    "tooltip": "Create a colour from its Hue (0-360), Saturation (0-1), and Value (0-1) components.",
    "helpUrl": ""
};

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    drawRect, drawLine, clearScreen, colourHsv
]);