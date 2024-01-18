"use strict";

const sonoffMini = require("../lib/sonoffMini");

module.exports = {
  devices: [...sonoffMini.devices],
};
