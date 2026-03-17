# 🍃 GeneEats — Planner by Foodoscope

> A personalised nutrition planner that generates a 7-day diet plan based on your genetic dietary profile, calculated metabolic targets, and curated recipe data.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [First-Time Setup](#-first-time-setup)
6. [Running the App](#-running-the-app)
7. [Using the App](#-using-the-app)
8. [Troubleshooting](#-troubleshooting)
9. [Stopping the App](#-stopping-the-app)

---

## 🧬 Project Overview

GeneEats helps users plan their weekly meals by:
- Calculating **BMI, BMR, TDEE, and daily calorie targets** from their personal profile
- Suggesting **allowed and excluded ingredients** based on a NutriDNA genetic profile
- Displaying **curated recipes** matched to the user's dietary needs
- Generating a **7-day diet plan** with calorie-balanced meals across breakfast, lunch, and dinner

---

## 🛠 Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Plain HTML, CSS, JavaScript (ES Modules) |
| Backend  | Python · FastAPI · Uvicorn |
| Data     | JSON (generated via `generate_data.py`) |
| Fonts    | Google Fonts — Inter |

---

## 📁 Project Structure

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
├── start.sh                              # Launcher for Mac / Linux
├── start.bat                             # Launcher for Windows
├── readme                                # Plain-text quick reference
└── README.md                             # This file
```

---

## ✅ Prerequisites

Make sure these are installed before you begin:

| Tool | Minimum Version | Check with |
|------|----------------|------------|
| Python | 3.10+ | `python3 --version` |
| pip | bundled with Python | `pip --version` |

> **Windows users:** Use **Command Prompt** or **PowerShell** — not Git Bash — for the commands below.

---

## 🚀 First-Time Setup

> Run these steps **once** when you first clone or receive the project.

### Step 1 — Create a virtual environment

```bash
# Mac / Linux
python3 -m venv .venv

# Windows
python -m venv .venv
```

### Step 2 — Install dependencies

```bash
# Mac / Linux
.venv/bin/pip install -r backend/requirements.txt

# Windows
.venv\Scripts\pip install -r backend\requirements.txt
```

### Step 3 — Generate recipe data *(optional — skip if `backend/final_output.json` already exists)*

> ⚠️ This step requires the **NutriDNA API server** to be running on the same local network (IP `192.168.1.92:3030`). If you don't have access to it, skip this step — the pre-generated `final_output.json` file is included and the app will work fine.

```bash
# Mac / Linux
cd backend && ../.venv/bin/python3 generate_data.py && cd ..

# Windows
cd backend && ..\.venv\Scripts\python generate_data.py && cd ..
```

---

## ▶️ Running the App

| Platform | Command |
|----------|---------|
| 🐧 Linux | `./start.sh` |
| 🍎 Mac | `./start.sh` |
| 🪟 Windows | Double-click `start.bat` — or run it in Command Prompt |

The script will:
1. Activate the virtual environment
2. Start the **backend** API server on **port 8000**
3. Start the **frontend** HTTP server on **port 8001**
4. Automatically open your browser at **http://localhost:8001**

> If the browser doesn't open automatically, go to **http://localhost:8001** manually.

---

## 🧭 Using the App

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

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Backend failed to start` | Port 8000 is already in use | Run `fuser -k 8000/tcp 8001/tcp` (Linux/Mac) or kill processes in Task Manager (Windows) |
| `Could not load recipes` | Backend isn't running | Make sure `start.sh` / `start.bat` ran without errors |
| `generate_data.py` times out | NutriDNA API server unreachable | Skip step 3 — use the existing `final_output.json` |
| Page shows old data | Cached localStorage | Run `localStorage.clear(); location.reload();` in browser console |

---

## ⏹ Stopping the App

| Platform | How to stop |
|----------|------------|
| 🐧 Linux / 🍎 Mac | Press **Ctrl + C** in the terminal where `start.sh` is running |
| 🪟 Windows | Close the **Command Prompt** window that ran `start.bat` |
