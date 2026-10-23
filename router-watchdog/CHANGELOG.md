# Changelog

## [1.0.0] - 2026-10-23

First public release.

- Internet check with HTTP GET to several endpoints; one answer is enough.
- Router power cycle after `failThreshold` failed checks in a row.
- Power restored by the firmware (`toggle_after`), independent of the script.
- Exponential backoff between restarts (`bootGrace` → `maxBackoff`), reset when the Internet comes back.
- Start delay after script start (`startDelay`).
- Checks paused while the output is switched off by hand (`respectManualOff`).
- Validation of the switch channel and endpoint list.
- Log messages in English and Polish (`lang`).
