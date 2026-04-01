

# 7TV Auto Case Opener

A lightweight, efficient, and **safe** automation script for 7TV.app. This tool automates the repetitive process of opening reward cases, including clicking the "Unlock" button, waiting for animations, and confirming the loot.

## Features

* **Fully Automated Workflow**: Handles the "Unlock Case" → "Animation Wait" → "Confirm" loop.
* **Built-in Modern UI**: Floating control panel at the top-right of your screen.
* **Progress Tracking**: Real-time progress bar and status updates.
* **Smart Delays**: Pre-configured safety margins to ensure animations finish before clicking.
* **Customizable**: Adjust the number of cases to open directly through the UI or console.
* **Developer Console Logs**: Detailed, color-coded logs to track every action.

---

## Is it Safe?


1.  **Local Execution only**: The script runs entirely in your browser's memory. It **never** sends your data, cookies, or credentials to external servers.
2.  **No API Calls**: It does not "hack" the 7TV backend. It simply mimics human mouse clicks on the buttons already present on your screen.
3.  **Human-Like Timing**: It includes safety delays (e.g., 12 seconds for animations) to ensure the site's anti-spam or UI triggers aren't overwhelmed.
4.  **Open Source**: The code is short and readable. Anyone can audit the logic to see there are no malicious "stealer" functions.
5.  **Non-Persistent**: It doesn't modify your 7TV account or files. Once you refresh the page, the script is gone.

---

## How to Use

### Method 1: Browser Console (Quickest)
1.  Open the 7TV Case Opening page.
2.  Press `F12` (or `Ctrl+Shift+I`) and go to the **Console** tab.
3.  Paste the entire script and press **Enter**.
4.  Use the **UI Panel** that appears on the top right to start.

### Method 2: Userscript Manager (Recommended)
1.  Install an extension like **Tampermonkey** or **Violentmonkey**.
2.  Create a new script and paste the code.
3.  The script will load automatically whenever you visit the 7TV case page.

---

## ⚙️ Configuration
You can adjust these values at the top of the script if you want to customize the behavior:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `maxCases` | 10 | Total cases to open before stopping automatically. |
| `animationWait` | 12000 | Time (ms) to wait for the case opening animation. |
| `nextCaseDelay` | 2000 | Rest period (ms) between finishing one case and starting another. |

---

## ⌨️ Console Commands
If you prefer using the console over the UI, the script exposes a global `caseOpener` object:
* `caseOpener.start()` - Starts the opening process.
* `caseOpener.stop()` - Stops the process immediately.
* `caseOpener.status()` - Shows the current progress in the console.
* `caseOpener.setMax(50)` - Changes the target number of cases.

---

**Disclaimer**: *This script is an independent tool and is not affiliated with 7TV. Use responsibly and according to the platform's terms of service.*
