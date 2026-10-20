# Shelly Scripts

**English** | [Polski](README.pl.md)

A collection of scripts for Shelly devices, built from real installation cases and training questions. Each script lives in its own folder with its own documentation, installation steps and changelog. All scripts run locally on the device — no cloud required.

## Scripts

| Script | What it does | Devices |
|---|---|---|
| [pv-heat](pv-heat/) | Diverts surplus PV power into a heat buffer and DHW cylinders, with a differential circulation pump. | Shelly 1PM Gen4 + Plus Add-on, Shelly Pro 3EM |
| [voltguard-pv](voltguard-pv/) | Switches on a load when the grid voltage exceeds a threshold, so the PV inverter does not trip on overvoltage. | Shelly Plug S Gen3 and other devices with scripting |
| [cover-manual-override](cover-manual-override/) | Scheduled cover position that is skipped when the cover was opened fully by hand. Settings via Virtual Components. | Gen3/Gen4, Pro (Cover mode) |

## Web tools

Browser tools for building Shelly RPC/HTTP control URLs. They live in separate repositories because they are served as web pages.

| Tool | Link | Repository |
|---|---|---|
| Shelly DDD Wizard 2.0 | [open](https://pietia28.github.io/shelly-ddd-wizard-2.0/) | [shelly-ddd-wizard-2.0](https://github.com/pietia28/shelly-ddd-wizard-2.0) |
| Shelly DDD Wizard (1.0) | [open](https://pietia28.github.io/shelly-ddd-wizard/) | [shelly-ddd-wizard](https://github.com/pietia28/shelly-ddd-wizard) |

## How to install a script

1. Open the device web UI (its IP address in a browser).
2. Go to **Scripts → Create script**, paste the `.js` file from the script's folder and save.
3. Follow the script's README: most scripts need Virtual Components or other settings first.
4. Click **Start** and enable **Run on startup**.

## Repository layout

```
shelly-scripts/
├── README.md / README.pl.md     this index
├── LICENSE                      MIT
└── <script-name>/               one folder per script, with its own
                                 README, CHANGELOG and source files
```

Versions are tagged per script, e.g. `pv-heat/v5.1.0`. Scripts moved here from separate repositories keep their full commit history.

## License

[MIT](LICENSE) — free to use, modify and distribute, including commercially. Provided "as is", without warranty. Some script folders carry their own MIT license file; it applies to that folder.

These are community scripts, not official Shelly products. Shelly is a trademark of its respective owner. The scripts control electrical equipment — install and test them carefully, at your own risk.
