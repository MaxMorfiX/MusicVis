/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

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

const getFrequencyData = {
  "type": "get_frequency_data",
  "tooltip": "Returns an array of 128 numbers (0-255) representing the current audio frequencies.",
  "helpUrl": "",
  "message0": "Frequency Data %1",
  "args0": [
    {
      "type": "input_dummy",
      "name": "label"
    }
  ],
  "output": "Array",
  "colour": 225
};

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  getEnergy,
  getFrequencyData,
]);