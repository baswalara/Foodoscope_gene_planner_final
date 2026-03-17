# backend/server.py
import json
import os # <--- IMPORT THIS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 🔧 FIX: DYNAMIC FILE PATH
# ==========================================
# Get the folder where THIS server.py file lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build the path to the JSON file relative to this script
DATA_FILE = os.path.join(BASE_DIR, "final_output.json")

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        # Debugging aid: Print where we TRIED to look
        print(f"❌ Error: Could not find file at: {DATA_FILE}")
        return {
            "error": "Data file not found. Please run 'python generate_data.py' inside the backend folder."
        }