// Shelly Voltage Control with dynamic NumberComponent creation
let voltageThreshold = 253;
let runDuration = 10 * 60 * 1000;
let checkInterval = 5000;

let isRunning = false;
let activationTime = 0;
let lastVoltageThreshold = voltageThreshold;
let lastRunDuration = runDuration;

// Unikalne ID komponentów używane tylko przez ten skrypt
let COMPONENT_VOLTAGE_ID = 9200;
let COMPONENT_DURATION_ID = 9201;

function ensureComponentsExist() {
    Shelly.call("Number.List", {}, function (res) {
        let ids = res.map(c => c.id);

        if (!ids.includes(COMPONENT_VOLTAGE_ID)) {
            print("Tworzę komponent Voltage Threshold...");
            Shelly.call("Number.Create", {
                id: COMPONENT_VOLTAGE_ID,
                name: "Voltage Threshold",
                type: "number",
                min: 200,
                max: 270,
                step: 1,
                initial: 253,
                unit: "V",
                readonly: false
            }, null);
        }

        if (!ids.includes(COMPONENT_DURATION_ID)) {
            print("Tworzę komponent Run Duration...");
            Shelly.call("Number.Create", {
                id: COMPONENT_DURATION_ID,
                name: "Run Duration",
                type: "number",
                min: 1,
                max: 60,
                step: 1,
                initial: 10,
                unit: "min",
                readonly: false
            }, null);
        }
    });
}

function updateSettingsAndResetIfNeeded(callback) {
    Shelly.call("Number.GetStatus", { id: COMPONENT_VOLTAGE_ID }, function (res1) {
        if (typeof res1.value === "number") {
            voltageThreshold = res1.value;
        }
        Shelly.call("Number.GetStatus", { id: COMPONENT_DURATION_ID }, function (res2) {
            if (typeof res2.value === "number") {
                runDuration = res2.value * 60 * 1000;
            }

            if (voltageThreshold !== lastVoltageThreshold || runDuration !== lastRunDuration) {
                print("Zmieniono ustawienia - reset działania");
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
                print("Nie udało się odczytać napięcia.");
                return;
            }

            print("Napięcie:", voltage, "V");
            print("Próg:", voltageThreshold, "Czas działania:", runDuration / 60000, "min");

            if (!isOn && voltage >= voltageThreshold) {
                print("Napięcie powyżej progu, włączam gniazdko.");
                Shelly.call("Switch.Set", { id: 0, on: true }, null);
                isRunning = true;
                activationTime = now;
            }

            if (isOn && isRunning && now - activationTime >= runDuration) {
                print("Minął zadany czas, wyłączam gniazdko.");
                Shelly.call("Switch.Set", { id: 0, on: false }, null);
                isRunning = false;
                activationTime = 0;
            }
        });
    });
}

ensureComponentsExist();
Timer.set(checkInterval, true, checkVoltage);
