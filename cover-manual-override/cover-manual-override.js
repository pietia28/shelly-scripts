// ============================================================
// Shelly Cover Manual Override  v1.0.0
// https://github.com/<your-username>/shelly-scripts/tree/main/cover-manual-override
// License: MIT
//
// Moves a cover (roller shutter / blind) to a target position at a
// scheduled time, UNLESS someone has manually opened it fully before.
// All user parameters live in Virtual Components, so they can be
// changed from the device web UI or the Shelly app without editing code.
//
// Required Virtual Components (IDs can be changed in CFG.ids):
//   boolean:200  Automation enabled          (toggle)
//   boolean:201  Manual-open lock            (toggle, can be reset by hand)
//   number:200   Target position [%]         e.g. 20  (0-100)
//   number:201   Open threshold [%]          e.g. 100 (position treated as "fully open")
//   text:200     Execution time              e.g. 15:00 (HH:MM)
//   text:201     Days of week                e.g. 34  (1=Mon ... 7=Sun, empty = every day)
// Optional:
//   text:202     Recent events               (event log, max 255 chars)
//
// Requires: device with Virtual Components support (Gen3/Gen4, Pro series),
// Cover mode with calibrated position, synchronized time and time zone.
// ============================================================

let CFG = {
  coverId: 0,                 // cover channel (cover:0)
  ids: {
    enable: "boolean:200",
    lock:   "boolean:201",
    pos:    "number:200",
    thr:    "number:201",
    time:   "text:200",
    days:   "text:201",
    log:    "text:202"        // optional - leave the VC out if not needed
  },
  // Command sources that are NOT treated as manual opening.
  // "loopback" = commands issued by this script.
  // Check the console/log to see which source your automations report.
  ignoredSources: ["loopback"],
  graceMin: 5,                // minutes after the set time in which the action may still run (e.g. after a reboot)
  tickMs: 30000,              // schedule check interval
  lang: "en",                 // "en" or "pl" - language of log messages
  debug: true                 // print messages to the script console
};

// ---------- Messages ----------
let MSG = {
  en: {
    start: function (a) {
      return "Start OK - " + a.now + ", weekday: " + a.wd + " (1=Mon), time: " + a.at +
        ", days: " + (a.days ? a.days : "every day") + ", position: " + a.pos + "%, threshold: " + a.thr + "%";
    },
    noTime:   function () { return "Start - time NOT synchronized, waiting"; },
    lockOn:   function (s) { return "Lock ON (manual opening, source: " + s + ")"; },
    lockHeld: function (s) { return "Fully open, source: " + s + " - lock already active"; },
    ignored:  function (s) { return "Fully open, source: " + s + " - ignored"; },
    skip:     function () { return "Skipped - cover was opened manually"; },
    done:     function (p) { return "Executed: position " + p + "%"; },
    newDay:   function () { return "New day - lock reset"; },
    badTime:  function (t) { return "Invalid time '" + t + "' - use HH:MM, e.g. 15:00"; },
    missing:  function (k) { return "ERROR: virtual component " + k + " not found - check CFG.ids"; }
  },
  pl: {
    start: function (a) {
      return "Start OK – " + a.now + ", dzień tyg.: " + a.wd + " (1=Pn), godzina: " + a.at +
        ", dni: " + (a.days ? a.days : "codziennie") + ", pozycja: " + a.pos + "%, próg: " + a.thr + "%";
    },
    noTime:   function () { return "Start – czas NIEZSYNCHRONIZOWANY, czekam"; },
    lockOn:   function (s) { return "Blokada ON (ręczne otwarcie, źródło: " + s + ")"; },
    lockHeld: function (s) { return "Pełne otwarcie, źródło: " + s + " – blokada już aktywna"; },
    ignored:  function (s) { return "Pełne otwarcie, źródło: " + s + " – ignoruję"; },
    skip:     function () { return "Pomijam – rolety otwarte ręcznie"; },
    done:     function (p) { return "Wykonano: pozycja " + p + "%"; },
    newDay:   function () { return "Nowy dzień – blokada skasowana"; },
    badTime:  function (t) { return "Błędna godzina '" + t + "' – użyj formatu GG:MM, np. 15:00"; },
    missing:  function (k) { return "BŁĄD: brak komponentu wirtualnego " + k + " – sprawdź CFG.ids"; }
  }
};
let T = MSG[CFG.lang] ? MSG[CFG.lang] : MSG.en;

// ---------- Virtual Components ----------
let vEnable = Virtual.getHandle(CFG.ids.enable);
let vLock   = Virtual.getHandle(CFG.ids.lock);
let vPos    = Virtual.getHandle(CFG.ids.pos);
let vThr    = Virtual.getHandle(CFG.ids.thr);
let vTime   = Virtual.getHandle(CFG.ids.time);
let vDays   = Virtual.getHandle(CFG.ids.days);
let vLog    = Virtual.getHandle(CFG.ids.log);   // optional

let required = [
  [vEnable, CFG.ids.enable], [vLock, CFG.ids.lock], [vPos, CFG.ids.pos],
  [vThr, CFG.ids.thr], [vTime, CFG.ids.time], [vDays, CFG.ids.days]
];
for (let i = 0; i < required.length; i++) {
  if (!required[i][0]) {
    print(T.missing(required[i][1]));
    die();
  }
}

let coverKey = "cover:" + CFG.coverId;
let lastRunKey = "";     // day + time of the last execution
let lastDay = -1;
let lastCmdSource = "";  // source of the command that started the movement
let atTop = false;       // current full opening already handled
let lastBadTime = "";    // avoid repeating the invalid-time warning

// ---------- Helpers ----------
function log(m) {
  if (CFG.debug) print("[cover-override] " + m);
  if (vLog) {
    let t = Shelly.getComponentStatus("sys").time || "--:--";
    let prev = vLog.getValue() || "";
    let all = t + " " + m + (prev ? " | " + prev : "");
    if (all.length > 250) all = all.slice(0, 250);
    vLog.setValue(all);
  }
}

// Local time and weekday without the Date object:
// time zone offset = sys.time (local HH:MM) vs unixtime (UTC).
function localNow() {
  let s = Shelly.getComponentStatus("sys");
  if (!s.time || !s.unixtime) return null; // time not synchronized
  let p = s.time.split(":");
  let lMin = Number(p[0]) * 60 + Number(p[1]);
  let uMin = Math.floor(s.unixtime / 60) % 1440;
  let off = lMin - uMin;
  if (off > 720) off -= 1440;
  if (off < -720) off += 1440;
  let day = Math.floor((s.unixtime + off * 60) / 86400);
  let wd = (day + 3) % 7 + 1; // 1970-01-01 was a Thursday -> 1=Mon ... 7=Sun
  return { min: lMin, day: day, wd: wd };
}

// "HH:MM" -> minutes since midnight, -1 if invalid
function parseHM(t) {
  if (!t) return -1;
  let p = t.split(":");
  if (p.length !== 2) return -1;
  let h = Number(p[0]);
  let m = Number(p[1]);
  if (h !== h || m !== m) return -1; // NaN
  if (h < 0 || h > 23 || m < 0 || m > 59) return -1;
  return h * 60 + m;
}

function dayAllowed(wd) {
  let d = vDays.getValue();
  if (!d) return true;
  return d.indexOf(String(wd)) >= 0;
}

// ---------- 1) Detect manual full opening ----------
Shelly.addStatusHandler(function (ev) {
  if (ev.component !== coverKey) return;
  let st = Shelly.getComponentStatus(coverKey);

  // Movement started - remember who issued it
  // (when the end stop is reached, firmware reports "limit_switch")
  if (st.state === "opening" || st.state === "closing") {
    if (st.source && st.source !== "limit_switch") lastCmdSource = st.source;
    return;
  }

  if (typeof st.current_pos !== "number") return;

  if (st.current_pos < vThr.getValue()) {
    atTop = false;
    return;
  }

  if (atTop) return; // this full opening was already handled
  atTop = true;

  let src = lastCmdSource !== "" ? lastCmdSource : st.source;

  if (CFG.ignoredSources.indexOf(src) >= 0) {
    log(T.ignored(src));
    return;
  }

  if (vLock.getValue()) {
    log(T.lockHeld(src));
  } else {
    vLock.setValue(true);
    log(T.lockOn(src));
  }
});

// ---------- 2) Schedule ----------
function tick() {
  let n = localNow();
  if (!n) return;

  // new day -> reset lock
  if (n.day !== lastDay) {
    if (lastDay !== -1 && vLock.getValue()) {
      vLock.setValue(false);
      log(T.newDay());
    }
    lastDay = n.day;
  }

  if (!vEnable.getValue()) return;

  let tStr = vTime.getValue();
  let t = parseHM(tStr);
  if (t < 0) {
    if (lastBadTime !== tStr) {
      log(T.badTime(tStr));
      lastBadTime = tStr;
    }
    return;
  }
  lastBadTime = "";

  let runKey = n.day + "_" + t;
  if (lastRunKey === runKey) return;

  if (n.min < t || n.min > t + CFG.graceMin) return;
  if (!dayAllowed(n.wd)) return;

  lastRunKey = runKey;

  if (vLock.getValue()) {
    log(T.skip());
    vLock.setValue(false); // lock consumed for today
    return;
  }

  let pos = vPos.getValue();
  Shelly.call("Cover.GoToPosition", { id: CFG.coverId, pos: pos });
  log(T.done(pos));
}

Timer.set(CFG.tickMs, true, tick);

// ---------- Start ----------
let n0 = localNow();
if (n0) {
  log(T.start({
    now: Shelly.getComponentStatus("sys").time,
    wd: n0.wd,
    at: vTime.getValue(),
    days: vDays.getValue(),
    pos: vPos.getValue(),
    thr: vThr.getValue()
  }));
} else {
  log(T.noTime());
}
tick();
