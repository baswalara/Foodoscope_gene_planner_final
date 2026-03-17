# 🍃 GeneEats — Planner by Foodoscope

> A personalised nutrition planner that generates a 7-day diet plan based on your genetic dietary profile, calculated metabolic targets, and curated recipe data.

---

## Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Running the App](#-running-the-app)
6. [Using the App](#-using-the-app)
7. [Troubleshooting](#-troubleshooting)
8. [Stopping the App](#-stopping-the-app)

---

## Project Overview

GeneEats helps users plan their weekly meals by:
- Calculating **BMI, BMR, TDEE, and daily calorie targets** from their personal profile
- Suggesting **allowed and excluded ingredients** based on a NutriDNA genetic profile
- Displaying **curated recipes** matched to the user's dietary needs
- Generating a **7-day diet plan** with calorie-balanced meals across breakfast, lunch, and dinner

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Plain HTML, CSS, JavaScript (ES Modules) |
| Backend  | Python · FastAPI · Uvicorn |
| Data     | JSON (generated via `generate_data.py`) |
| Fonts    | Google Fonts — Inter |

---

## Project Structure

```
v2/
├── backend/
│   ├── server.py                         # FastAPI server (port 8000)
│   ├── generate_data.py                  # Fetches recipe data from NutriDNA API
│   ├── final_output.json                 # Pre-generated recipe data (used by server)
│   ├── NutriDNA_Dietary_Recommendations.xlsx
│   └── requirements.txt                  # Python dependencies
│
├── frontend/
│   ├── index.html                        # Main single-page app
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── calculator.js                 # BMI / BMR / TDEE calculations
│       ├── recipes.js                    # Fetches & renders recipes
│       ├── diet.js                       # Generates 7-day diet plan
│       └── tabs.js                       # Tab navigation & locking
│
├── start.sh                              # Launcher for Mac / Linux (auto-setup on first run)
├── start.bat                             # Launcher for Windows  (auto-setup on first run)
└── README.md                             # This file
```

---

## Prerequisites

The **only** thing you need installed:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Python | 3.10+ | `python3 --version` |

> **Windows users:** Use **Command Prompt** — not Git Bash — to run `start.bat`.

> Everything else (virtual environment, pip packages) is handled automatically by the launcher.

---

## Running the App

> **Just cloned the repo? No manual setup needed — just run the launcher.**

| Platform | Command |
|----------|---------|
| Linux | `./start.sh` |
| Mac | `./start.sh` |
| Windows | Double-click `start.bat` (or run in Command Prompt) |

**What happens on the very first run:**
1. Creates a `.venv` virtual environment automatically
2. Installs all Python packages from `backend/requirements.txt`
3. Frees ports 8000 and 8001 if anything else is using them
4. Starts the **backend** API on **port 8000**
5. Starts the **frontend** server on **port 8001**
6. Opens your browser at **http://localhost:8001**

**On every run after that**, steps 1 and 2 are skipped — startup is instant.

> If the browser doesn't open automatically, go to **http://localhost:8001** manually.

---

### Optional — Regenerate recipe data

> Only needed to refresh data from the NutriDNA API (`192.168.1.92:3030`).  
> The repo already ships with `backend/final_output.json` — skip this unless you need new data.

```bash
# Mac / Linux
cd backend && ../.venv/bin/python3 generate_data.py && cd ..

# Windows
cd backend && ..\.venv\Scripts\python generate_data.py && cd ..
```

---

## Using the App

The app has four tabs — they unlock in order as you complete each step:

| Tab | What to do |
|-----|-----------|
| **👤 Basic Info** | Enter your name, age, weight, height, gender, activity level, goal, diet type, and meals/day. Click **Calculate Metrics**. |
| **📊 Your Numbers** | View your calculated BMI, BMR, TDEE, target calories, and macro breakdown. |
| **🍲 Allowed Recipes** | Browse recipes curated for your genetic dietary profile, along with allowed and excluded ingredients. |
| **📅 Diet Plan** | See your auto-generated 7-day meal plan, balanced to hit your daily calorie target. Hit **🔀 Regenerate** to get a new plan. |

### Refreshing stale data

If the page shows old content after re-running `generate_data.py`, open **DevTools → Console** (`F12`) and run:

```js
localStorage.clear(); location.reload();
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Backend failed to start` | Port still locked after force-kill | Wait 2 sec and re-run the launcher |
| `Could not load recipes` | Backend isn't running | Re-run the launcher and check for errors |
| `generate_data.py` times out | NutriDNA API unreachable | Skip — use the existing `final_output.json` |
| Page shows old data | Cached localStorage | Run `localStorage.clear(); location.reload();` in browser console |
| `python3` not found (Linux/Mac) | Python not installed | Install from [python.org](https://python.org) |
| `python` not found (Windows) | Python not on PATH | Reinstall Python and tick **Add to PATH** |

---

## Stopping the App

| Platform | How to stop |
|----------|------------|
| 🐧 Linux / 🍎 Mac | Press **Ctrl + C** in the terminal where `start.sh` is running |
| 🪟 Windows | Close the **Command Prompt** window that ran `start.bat` |
