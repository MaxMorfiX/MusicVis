/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
const drawRect = {
    "type": "draw_rect",
    "tooltip": "",
    "helpUrl": "",
    "message0": "Draw Rect %1 x1 %2 y1 %3 x2 %4 y2 %5",
    "args0": [
        {
            "type": "input_dummy",
            "name": "DrawRect"
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
        }
    ],
    "colour": 225,
    "previousStatement": null,
    "nextStatement": null,
};

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    drawRect,
]);
