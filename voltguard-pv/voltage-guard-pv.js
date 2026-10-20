/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * Voltage Guard PV Script for Shelly
 *
 * This software is provided "as is", without warranty of any kind.
 * Use at your own risk. The author assumes no responsibility for any
 * damage, malfunction, or unintended behavior resulting from the use of this script.
 *
 * Copyright (c) 2025 Piotr Głowacki
 */

// Initial configuration
let voltageThreshold = 253;
let runDuration = 10 * 60 * 1000;
let checkInterval = 5000;

let isRunning = false;
let activationTime = 0;
let lastVoltageThreshold = voltageThreshold;
let lastRunDuration = runDuration;

function updateSettingsAndResetIfNeeded(callback) {
    Shelly.call("Number.GetStatus", { id: 200 }, function (res1) {
        if (typeof res1.value === "number") {
            voltageThreshold = res1.value;
        }
        Shelly.call("Number.GetStatus", { id: 201 }, function (res2) {
            if (typeof res2.value === "number") {
                runDuration = res2.value * 60 * 1000;
            }

            // Check if any parameter has changed
            if (voltageThreshold !== lastVoltageThreshold || runDuration !== lastRunDuration) {
                //console.log("Settings changed - resetting operation");
                lastVoltageThreshold = voltageThreshold;
                lastRunDuration = runDuration;

                Shelly.call("Switch.Set", { id: 0, on: false }, function () {
                    isRunning = false;
                    activationTime = 0;
                    if (callback) callback();
                });
            } else {
                if (callback) callback();
            }
        });
    });
}

function checkVoltage() {
    updateSettingsAndResetIfNeeded(function () {
        Shelly.call("Switch.GetStatus", { id: 0 }, function (res) {
            let voltage = res.voltage;
            let isOn = res.output;
            let now = Date.now();

            if (typeof voltage !== "number") {
                //console.log("Failed to read voltage.");
                return;
            }

            //console.log("Voltage:", voltage, "V");
            //console.log("Threshold:", voltageThreshold, "Run time:", runDuration / 60000, "min");

            if (!isOn && voltage >= voltageThreshold) {
                //console.log("Voltage above threshold, turning on the socket.");
                Shelly.call("Switch.Set", { id: 0, on: true }, null);
                isRunning = true;
                activationTime = now;
            }

            if (isOn && isRunning && now - activationTime >= runDuration) {
                //console.log("Run time exceeded, turning off the socket.");
                Shelly.call("Switch.Set", { id: 0, on: false }, null);
                isRunning = false;
                activationTime = 0;
            }
        });
    });
}

Timer.set(checkInterval, true, checkVoltage);
