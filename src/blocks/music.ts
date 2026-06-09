//music.ts

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {javascriptGenerator, Order} from 'blockly/javascript';
// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
const getEnergy = {
  "type": "get_energy",
  "tooltip": "",
  "helpUrl": "",
  "message0": "Volume %1",
  "args0": [
    {
      "type": "input_dummy",
      "name": "label"
    }
  ],
  "output": "Number",
  "colour": 225
};

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    getEnergy,
]);
