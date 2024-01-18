"use strict";

const neeoapi = require("neeo-sdk");
const LightController = require("./LightController");
const CONSTANTS = require("./constants");

console.log(" $$$$$$$$ INITIALIZED $$$$$$");
const discoverHeaderText = "Sonoff Mini Example";
const discoverDescription = "This is sonoff mini example.";

const controller = LightController.build();

const complexDeviceFull = neeoapi
  .buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
  .setManufacturer("SAGAR")
  .setType("light")
  .addAdditionalSearchToken("SDK")
  .enableDiscovery(
    {
      headerText: discoverHeaderText,
      description: discoverDescription,
      enableDynamicDeviceBuilder: true,
    },
    (optionalDeviceId) => controller.discoverDevices(optionalDeviceId)
  );

module.exports = {
  devices: [complexDeviceFull],
};
