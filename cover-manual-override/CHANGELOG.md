# Changelog

## [1.0.0] - 2026-10-20

First public release.

- Scheduled move to a target position (time + days of week) configured in Virtual Components.
- Manual-open lock with command source detection (source remembered at movement start, `limit_switch` ignored).
- `ignoredSources` filter for automatic openings.
- Lock consumed by the skipped run and reset at midnight.
- Repeated execution on the same day after changing the time.
- Grace window after the set time (`graceMin`).
- Optional event log in `text:202`.
- Validation of the time format and of the required Virtual Components.
- Log messages in English and Polish (`lang`).
