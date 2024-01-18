"use strict";

const BluePromise = require("bluebird");
const neeoapi = require("neeo-sdk");
const CONSTANTS = require("./constants");

let switchValue = true;

module.exports = class LightController {
  constructor() {
    this.switchHandlers = {
      getter: (deviceId) => this.switchSet(deviceId),
      setter: (deviceId, params) => this.switchSet(deviceId, params),
    };
  }

  static build() {
    return new LightController();
  }
  /**
   * Shared set switch handler for both devices
   * @param {string} deviceid
   * @param {boolean} value
   */
  switchSet(deviceid, value) {
    console.log("[CONTROLLER] switch set to", deviceid, value);

    const url = "http://192.168.1.183:8081/zeroconf/switch";
    const data = {
      deviceid: "1000985aa1",
      data: {
        switch: value == true ? "on" : "off",
      },
    };
    const customHeaders = {
      "Content-Type": "application/json",
    };

    fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });

    switchValue = value;
  }

  /**
   * Shared get switch handler for both devices
   * @param {string} deviceid
   */
  switchGet(deviceid) {
    console.log("[CONTROLLER] return switch value", deviceid, switchValue);
    return BluePromise.resolve(switchValue);
  }

  buildProDevice() {
    //NOTE the device name must match the "root" name of the driver!
    return (
      neeoapi
        .buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
        .setSpecificName("Sonoff - Pro Mini")
        .setManufacturer("SAGAR")
        .setType("light")
        .addCapability("dynamicDevice")
        // Here we add the power switch like the lite device
        .addSwitch(CONSTANTS.POWER_SWITCH, this.switchHandlers)
    );
  }

  buildLightDevice() {
    return (
      neeoapi
        .buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
        .setSpecificName("Sonoff - Mini")
        .setManufacturer("SAGAR")
        .setType("light")
        .addCapability("dynamicDevice")
        // Here we add the power switch like the lite device
        .addSwitch(CONSTANTS.POWER_SWITCH, this.switchHandlers)
    );
  }

  /**
   * if the discover function requests a specific device (optionalDeviceId is set), this means:
   * - the device has enabled the enableDynamicDeviceBuilder feature
   * - first time the NEEO Brain want to use this device, the driver is responsible to build
   *   it and return that driver.
   */
  discoverDevices(optionalDeviceId) {
    console.log("[CONTROLLER] discovery call", optionalDeviceId);
    return sharedDeviceDiscovery(optionalDeviceId).then((discoveryResults) => {
      return discoveryResults.map((device) => {
        return {
          id: device.id,
          name: device.name,
          room: device.room,
          reachable: device.reachable,
          device: device.pro ? this.buildProDevice() : this.buildLightDevice(),
        };
      });
    });
  }
};

/**
 * Since both devices are very similar they can use the same discovery function internally.
 *
 * However we need a way to filter results for the Brain by type. This is because on the Brain
 * they are exposing different functionality.
 * - Adding a lite device as a pro device would result in broken functionality in the UI (pro functions wont work on lite)
 * - Adding a pro device as a lite device would result in missing functionality in the UI (pro functions wont be listed)
 *
 *
 */
function sharedDeviceDiscovery(deviceIdFilter) {
  const MOCKED_DISCOVER_RESULTS = [
    {
      id: "unique-device-id-001",
      name: "Sonoff - PRO: 1st device",
      room: "Living Room",
      pro: true,
    },
  ];
  const noFilter = deviceIdFilter === undefined;
  const discoveredDevices = MOCKED_DISCOVER_RESULTS.filter(
    (entry) => entry.id === deviceIdFilter || noFilter
  );
  return BluePromise.resolve(discoveredDevices);
}
