// ============================================================
// Shelly Router Watchdog  v1.0.0
// https://github.com/pietia28/shelly-scripts/tree/main/router-watchdog
// License: MIT
//
// Power-cycles a router / modem that hangs and loses Internet access.
// The script runs locally on the plug (or relay) that powers the router,
// so it works exactly when the Internet and the cloud are unavailable.
//
// How it works:
//   - every `checkEvery` seconds it sends HTTP GET requests to several
//     endpoints; one answer is enough to treat the Internet as up,
//   - after `failThreshold` failed checks in a row it switches the output
//     OFF with `toggle_after`, so the FIRMWARE (not the script) switches
//     the router back on after `offTime` seconds,
//   - after each restart it waits for the router to boot; if the Internet
//     still does not come back (e.g. an ISP outage), the pause between
//     restarts doubles up to `maxBackoff`, so the router is not
//     power-cycled in an endless loop,
//   - when the Internet comes back, the backoff resets.
//
// Requires: Shelly Gen2 or newer with scripting (Plus Plug S, Plug S Gen3,
// Outdoor Plug S, Plus 1, 1 Gen3, ...). Gen1 devices have no scripting.
// ============================================================

let CFG = {
  switchId: 0,                // relay / plug channel powering the router (switch:0)
  // One successful answer = Internet is up. Plain HTTP uses less memory than
  // HTTPS. The IP address (1.1.1.1) needs no DNS, so it also detects
  // the case where only the router's DNS is broken.
  endpoints: [
    "http://www.google.com/generate_204",
    "http://www.msftconnecttest.com/connecttest.txt",
    "http://1.1.1.1"
  ],
  httpTimeout: 10,            // [s] timeout of a single request
  checkEvery: 60,             // [s] interval between checks
  failThreshold: 5,           // failed checks in a row that trigger a restart
  offTime: 30,                // [s] how long the router stays without power
  startDelay: 120,            // [s] wait after script start (e.g. after a power outage, router boot)
  bootGrace: 300,             // [s] first pause after a restart (router boot + connection)
  maxBackoff: 3600,           // [s] maximum pause between consecutive restarts
  respectManualOff: true,     // true = do nothing while the output is OFF (someone switched the router off on purpose)
  lang: "en",                 // "en" or "pl" - language of log messages
  debug: true                 // print messages to the script console
};

// ---------- Messages ----------
let MSG = {
  en: {
    start:   function (c) {
      return "Start OK - check every " + c.checkEvery + " s, restart after " + c.failThreshold +
        " failures, off time " + c.offTime + " s, first check in " + c.startDelay + " s";
    },
    fail:    function (n) { return "No Internet - failure " + n + "/" + CFG.failThreshold; },
    back:    function (n) { return "Internet is back (after " + n + " failed checks)"; },
    restart: function (w) { return "Restarting router - next check in " + w + " s"; },
    noSw:    function (id) { return "ERROR: switch:" + id + " not found - check CFG.switchId"; },
    manOff:  function () { return "Output is OFF (switched off manually) - checks paused"; },
    manOn:   function () { return "Output is ON again - checks resumed"; },
    badCfg:  function () { return "ERROR: CFG.endpoints is empty"; }
  },
  pl: {
    start:   function (c) {
      return "Start OK – sprawdzanie co " + c.checkEvery + " s, restart po " + c.failThreshold +
        " błędach, wyłączenie na " + c.offTime + " s, pierwsze sprawdzenie za " + c.startDelay + " s";
    },
    fail:    function (n) { return "Brak internetu – błąd " + n + "/" + CFG.failThreshold; },
    back:    function (n) { return "Internet wrócił (po " + n + " nieudanych sprawdzeniach)"; },
    restart: function (w) { return "Restart routera – kolejne sprawdzenie za " + w + " s"; },
    noSw:    function (id) { return "BŁĄD: brak switch:" + id + " – sprawdź CFG.switchId"; },
    manOff:  function () { return "Wyjście wyłączone ręcznie – sprawdzanie wstrzymane"; },
    manOn:   function () { return "Wyjście znowu włączone – sprawdzanie wznowione"; },
    badCfg:  function () { return "BŁĄD: lista CFG.endpoints jest pusta"; }
  }
};
let T = MSG[CFG.lang] ? MSG[CFG.lang] : MSG.en;

function log(s) { if (CFG.debug) print(s); }

// ---------- State ----------
let fails = 0;                // failed checks in a row
let backoff = CFG.bootGrace;  // current pause after a restart [s]
let pausedUntil = 0;          // uptime [s] until which checks are skipped
let busy = false;             // a check is in progress
let manualOff = false;        // output is off and it was not us

function uptime() { return Shelly.getComponentStatus("sys").uptime; }

// ---------- Check ----------
function evaluate(ok) {
  busy = false;
  if (ok) {
    if (fails > 0) log(T.back(fails));
    fails = 0;
    backoff = CFG.bootGrace;
    return;
  }
  fails++;
  log(T.fail(fails));
  if (fails < CFG.failThreshold) return;

  fails = 0;
  let wait = CFG.offTime + backoff;
  log(T.restart(wait));
  pausedUntil = uptime() + wait;
  // toggle_after: the firmware switches the output back ON by itself,
  // even if the script is stopped in the meantime.
  Shelly.call("Switch.Set", { id: CFG.switchId, on: false, toggle_after: CFG.offTime });
  backoff = Math.min(backoff * 2, CFG.maxBackoff);
}

function check() {
  if (busy || uptime() < pausedUntil) return;

  let st = Shelly.getComponentStatus("switch", CFG.switchId);
  if (CFG.respectManualOff) {
    // Output off and no pending toggle back on = switched off on purpose.
    let off = !st.output && typeof st.timer_duration === "undefined";
    if (off && !manualOff) log(T.manOff());
    if (!off && manualOff) log(T.manOn());
    manualOff = off;
    if (off) { fails = 0; return; }
  }

  busy = true;
  let pending = CFG.endpoints.length;
  let ok = false;
  for (let i = 0; i < CFG.endpoints.length; i++) {
    Shelly.call("HTTP.GET", { url: CFG.endpoints[i], timeout: CFG.httpTimeout }, function (res, err) {
      if (err === 0 && res && res.code >= 200 && res.code < 400) ok = true;
      pending--;
      if (pending === 0) evaluate(ok);
    });
  }
}

// ---------- Start ----------
function init() {
  if (CFG.endpoints.length === 0) { print(T.badCfg()); return; }
  if (Shelly.getComponentStatus("switch", CFG.switchId) === null) { print(T.noSw(CFG.switchId)); return; }
  pausedUntil = uptime() + CFG.startDelay;
  log(T.start(CFG));
  Timer.set(CFG.checkEvery * 1000, true, check);
}

init();
