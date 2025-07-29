# ⚡ VoltGuard PV

> Smart voltage protection script for PV inverters using Shelly devices  
> Skrypt ochrony napięciowej dla falowników PV z użyciem urządzeń Shelly

---

## 🇬🇧 English

### 📌 Purpose

This script automatically **turns on a device** (via a Shelly module) when the AC voltage **exceeds a defined threshold** (e.g., 252V).  
Its purpose is to **prevent PV inverters from shutting down** due to grid overvoltage.  
By enabling a Shelly-controlled load, the system **reduces voltage** through increased consumption.

- The **voltage threshold** and **activation time** are set using **Virtual Components**.
- ✅ Tested on **Shelly Plug S Gen3**, but should work with any Shelly device controlling 230V (e.g., Shelly Plug, Shelly 1PM).

---

### 🛠 Requirements

- A compatible Shelly device with scripting support
- Up-to-date firmware ✅ *(Check and update via device web interface or Shelly Cloud)*
- Access to device via [https://control.shelly.cloud](https://control.shelly.cloud) and its local IP

---

### 🧭 Setup Instructions

1. 🔐 Log in to [https://control.shelly.cloud](https://control.shelly.cloud)
2. ⚙️ Open your **device settings**
3. 📶 Click **Wi-Fi settings**, then click the **IP address**
4. 🌐 A new browser tab will open the **local web interface**
5. 🧩 Go to the **Components** tab and **create two virtual number components**:
    - `Max Voltage` (e.g., min: 240, max: 260, default: 253)
    - `Active Time` (e.g., min: 1, max: 100 minutes, default: 10)
6. 💻 Go to **Scripts** → click **Create script**
7. ✍️ Name your script (e.g., `VoltGuardPV`)
8. 📋 Paste the script code from this GitHub repo
9. 💾 Click **Save**, then toggle **Run on startup**
10. 🟢 Click **Start** to activate the script
11. ↩️ Return to [https://control.shelly.cloud](https://control.shelly.cloud)
12. 🧱 Go to **Virtual Components** and create a **group**, if needed

---

### 🧪 Debugging

If you want to see logs (voltage, threshold, activation), **uncomment** the `console.log(...)` lines in the script.

---

### ✅ Notes

- This solution was tested on **Shelly Plug S Gen3**
- Should work on other Shelly devices controlling 230V
- Make sure your firmware version supports **scripts** and **virtual components**

If you have suggestions or issues, contact: **pege28@wp.pl**

---

## 🇵🇱 Polski

### 📌 Przeznaczenie

Ten skrypt automatycznie **włącza urządzenie** (poprzez moduł Shelly), gdy napięcie sieciowe **przekroczy ustawiony próg** (np. 252V).  
Celem jest **ochrona falownika PV przed wyłączeniem** z powodu zbyt wysokiego napięcia.  
Włączenie obciążenia poprzez Shelly **obniża napięcie** poprzez zwiększenie poboru energii.

- **Wartość napięcia progowego** i **czas działania** są definiowane przez **Wirtualne Komponenty**.
- ✅ Przetestowano na **Shelly Plug S Gen3**, ale powinno działać na każdym urządzeniu Shelly sterującym 230V (np. Shelly Plug, Shelly 1PM)

---

### 🛠 Wymagania

- Kompatybilne urządzenie Shelly z obsługą skryptów
- Aktualna wersja firmware ✅ *(Sprawdź i zaktualizuj przez web interface lub Shelly Cloud)*
- Dostęp do urządzenia przez [https://control.shelly.cloud](https://control.shelly.cloud) oraz lokalny adres IP

---

### 🧭 Instrukcja konfiguracji

1. 🔐 Zaloguj się na [https://control.shelly.cloud](https://control.shelly.cloud)
2. ⚙️ Przejdź do **ustawień urządzenia**
3. 📶 Kliknij **ustawienia Wi-Fi**, a potem **adres IP**
4. 🌐 Otworzy się **lokalny interfejs webowy** urządzenia
5. 🧩 Przejdź do zakładki **Components** i **utwórz dwa wirtualne komponenty liczbowe**:
    - `Max Voltage` (np. min: 240, max: 260, domyślnie: 253)
    - `Active Time` (np. min: 1, max: 100 minut, domyślnie: 10)
6. 💻 Przejdź do **Scripts** → kliknij **Create script**
7. ✍️ Nazwij skrypt (np. `VoltGuardPV`)
8. 📋 Wklej kod skryptu z tego repozytorium GitHub
9. 💾 Kliknij **Save**, zaznacz **Run on startup**
10. 🟢 Kliknij **Start**, aby uruchomić skrypt
11. ↩️ Wróć do [https://control.shelly.cloud](https://control.shelly.cloud)
12. 🧱 Przejdź do zakładki **Virtual Components** i utwórz **grupę**, jeśli jeszcze nie istnieje

---

### 🧪 Debugowanie

Jeśli chcesz widzieć dane w konsoli (napięcie, próg, czas aktywacji), **odkomentuj** linie `console.log(...)` w kodzie skryptu.

---

### ✅ Uwagi

- Skrypt testowany na **Shelly Plug S Gen3**
- Powinien działać na innych urządzeniach Shelly obsługujących 230V
- Upewnij się, że firmware obsługuje **skrypty** i **komponenty wirtualne**

W razie uwag lub propozycji napisz na: **pegw28@wp.pl**