# Shelly Scripts

[English](README.md) | **Polski**

Zbiór skryptów do urządzeń Shelly, powstałych na bazie realnych instalacji i pytań ze szkoleń. Każdy skrypt ma własny folder z dokumentacją, instrukcją instalacji i historią zmian. Wszystkie działają lokalnie na urządzeniu, bez chmury.

## Skrypty

| Skrypt | Co robi | Urządzenia |
|---|---|---|
| [pv-heat](pv-heat/README.pl.md) | Kieruje nadwyżkę z PV do bufora ciepła i zasobników CWU, steruje pompą cyrkulacyjną na różnicy temperatur. | Shelly 1PM Gen4 + Plus Add-on, Shelly Pro 3EM |
| [voltguard-pv](voltguard-pv/) | Załącza odbiornik, gdy napięcie sieci przekroczy próg, żeby falownik PV nie wyłączał się przez przepięcie. | Shelly Plug S Gen3 i inne urządzenia ze skryptami |
| [cover-manual-override](cover-manual-override/README.pl.md) | Zjazd rolet o zadanej godzinie, pomijany, gdy roleta została ręcznie otwarta do końca. Ustawienia w Virtual Components. | Gen3/Gen4, Pro (tryb Cover) |

## Narzędzia webowe

Narzędzia w przeglądarce do budowania adresów sterujących Shelly (RPC/HTTP). Mają osobne repozytoria, bo działają jako strony internetowe.

| Narzędzie | Link | Repozytorium |
|---|---|---|
| Shelly DDD Wizard 2.0 | [otwórz](https://pietia28.github.io/shelly-ddd-wizard-2.0/) | [shelly-ddd-wizard-2.0](https://github.com/pietia28/shelly-ddd-wizard-2.0) |
| Shelly DDD Wizard (1.0) | [otwórz](https://pietia28.github.io/shelly-ddd-wizard/) | [shelly-ddd-wizard](https://github.com/pietia28/shelly-ddd-wizard) |

## Jak wgrać skrypt

1. Otwórz web UI urządzenia (jego adres IP w przeglądarce).
2. Wejdź w **Scripts → Create script**, wklej plik `.js` z folderu skryptu i zapisz.
3. Postępuj według README skryptu: większość wymaga wcześniej utworzenia Virtual Components lub innych ustawień.
4. Kliknij **Start** i włącz **Run on startup**.

## Struktura repozytorium

```
shelly-scripts/
├── README.md / README.pl.md     ten spis
├── LICENSE                      MIT
└── <nazwa-skryptu>/             osobny folder dla każdego skryptu,
                                 z własnym README, CHANGELOG i plikami źródłowymi
```

Wersje są tagowane osobno dla każdego skryptu, np. `pv-heat/v5.1.0`. Skrypty przeniesione tu z osobnych repozytoriów mają zachowaną pełną historię commitów.

## Licencja

[MIT](LICENSE) — możesz swobodnie używać, modyfikować i rozpowszechniać, także komercyjnie. Bez gwarancji, „tak jak jest”. Niektóre foldery mają własny plik licencji MIT; obowiązuje on dla danego folderu.

To skrypty społecznościowe, a nie oficjalne produkty Shelly. Shelly jest znakiem towarowym swojego właściciela. Skrypty sterują urządzeniami elektrycznymi — instaluj i testuj je ostrożnie, na własną odpowiedzialność.
