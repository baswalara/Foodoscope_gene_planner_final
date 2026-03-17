# backend/generate_data.py
import sys
import json
import pandas as pd
import requests
from time import sleep
from collections import defaultdict

# =========================
# CONFIG
# =========================

INPUT_EXCEL = "NutriDNA_Dietary_Recommendations.xlsx"
INTERMEDIATE_JSON = "NutriDNA_Dietary_Recommendations.json" # <--- The Visible JSON Input
OUTPUT_JSON = "final_output.json"                         # <--- The Final Output

BASE_URL = "http://192.168.1.92:3030/recipe2-api/recipebyingredient/by-ingredients-categories-title"

PAGE_LIMIT = 10
MAX_PAGES = 3
API_SLEEP = 0.2

# =========================
# TAXONOMY (Original)
# =========================

CATEGORY_SET = {
    "additive", "additive-salt", "additive-sugar", "additive-vinegar", "additive-yeast",
    "bakery", "berry", "beverage", "beverage caffeinated", "beverage-alcoholic",
    "cereal", "condiment", "dairy", "dish", "essential oil", "fish", "flower",
    "fruit", "fungi", "fungus", "gourd", "herb", "legume", "maize", "meat",
    "nuts and seeds", "plant", "plant derivative", "seafood", "seed", "vegetable"
}

# =========================
# STEP 1: XLSX -> JSON INPUT
# =========================
print(f"📊 Converting {INPUT_EXCEL} to {INTERMEDIATE_JSON}...")

try:
    df = pd.read_excel(INPUT_EXCEL)
    # Clean whitespace (Using .map for compatibility)
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
    
    # Save the intermediate JSON (Visible in backend)
    df.to_json(INTERMEDIATE_JSON, orient='records', indent=4)
    print("✅ Conversion complete.")
    
except Exception as e:
    print(f"❌ Error reading Excel: {e}")
    sys.exit(1)

# =========================
# STEP 2: READ JSON INPUT
# =========================
print(f"📖 Reading {INTERMEDIATE_JSON} for processing...")

with open(INTERMEDIATE_JSON, 'r') as f:
    input_data = json.load(f)

include_items = set()
exclude_items = set()

# Parse the JSON data
for item in input_data:
    food = str(item.get("Food Item", "")).lower().strip()
    instruction = str(item.get("Instruction", "")).lower()

    if not food: continue

    if instruction == "include":
        include_items.add(food)
    elif "avoid" in instruction or "monitor" in instruction:
        exclude_items.add(food)

# =========================
# SPLIT INGREDIENTS / CATEGORIES (Original Logic)
# =========================

include_ingredients, include_categories = [], []
exclude_ingredients, exclude_categories = [], []

for item in include_items:
    (include_categories if item in CATEGORY_SET else include_ingredients).append(item)

for item in exclude_items:
    (exclude_categories if item in CATEGORY_SET else exclude_ingredients).append(item)

print("\nINCLUDE INGREDIENTS:", include_ingredients)
print("INCLUDE CATEGORIES:", include_categories)
print("EXCLUDE INGREDIENTS:", exclude_ingredients)
print("EXCLUDE CATEGORIES:", exclude_categories)

# =========================
# HELPER FUNCTION (Original Logic)
# =========================

def fetch_recipes(param_key, param_value):
    collected = []
    # Optimization: If listing is huge, limit calls for demo
    # Remove [:1] to run full scan
    for page in range(1, MAX_PAGES + 1):
        params = {
            param_key: param_value,
            "page": page,
            "limit": PAGE_LIMIT,
        }

        try:
            resp = requests.get(BASE_URL, params=params, timeout=10)
            if resp.status_code != 200:
                break

            data = resp.json()
            recipes = data.get("payload", {}).get("data", [])
            if not recipes:
                break

            collected.extend(recipes)
            sleep(API_SLEEP)
        except Exception as e:
            print(f"   ⚠️ Connection Error: {e}")
            break

    return collected

# =========================
# INCLUDE PHASE (Original Logic)
# =========================

include_map = {}  # recipe_id -> recipe data
include_reasons = defaultdict(set)  # recipe_id -> matched ingredients/categories

print("\n🟢 INCLUDE PHASE")

for ing in include_ingredients:
    print(f"🔍 Fetching include ingredient: {ing}")
    for r in fetch_recipes("includeIngredients", ing):
        rid = r["Recipe_id"]
        include_map[rid] = r
        include_reasons[rid].add(ing)

for cat in include_categories:
    print(f"🔍 Fetching include category: {cat}")
    for r in fetch_recipes("includeCategories", cat):
        rid = r["Recipe_id"]
        include_map[rid] = r
        include_reasons[rid].add(cat)

print(f"\n✅ Total included recipes: {len(include_map)}")

# =========================
# EXCLUDE PHASE (Original Logic)
# =========================

exclude_ids = set()

print("\n🔴 EXCLUDE PHASE")

for ing in exclude_ingredients:
    print(f"🚫 Fetching exclude ingredient: {ing}")
    for r in fetch_recipes("includeIngredients", ing):
        exclude_ids.add(r["Recipe_id"])

for cat in exclude_categories:
    print(f"🚫 Fetching exclude category: {cat}")
    for r in fetch_recipes("includeCategories", cat):
        exclude_ids.add(r["Recipe_id"])

print(f"\n🚫 Total excluded recipes: {len(exclude_ids)}")

# =========================
# FINAL DATASET CONSTRUCTION
# =========================

final_recipes = []

for rid, r in include_map.items():
    if rid in exclude_ids:
        continue
    
    # Format exactly for Frontend
    final_recipes.append({
        "id": rid,
        "title": r["Recipe_title"],
        "region": r.get("Region"),
        "calories": r.get("Calories"),
        "image": "🍲", # Placeholder until API provides images
        "matched_on": ", ".join(sorted(include_reasons[rid]))
    })

# =========================
# OUTPUT TO FINAL JSON
# =========================

output_data = {
    "user_name": "Navya", 
    "nutritional_needs": [
        "Prone to Vitamin A deficiency",
        "Prone to Lactose Intolerance",
        "High Whole Grains Intake Recommended",
        "Prone to Inflammation",
        "Caffeine Sensitivity",
        "Alcohol Sensitivity"
    ],
    "lists": {
        "included": list(include_items),
        "excluded": list(exclude_items)
    },
    "recipes": final_recipes
}

if not final_recipes:
    print("\n⚠ No recipes after exclusion (saving empty list)")

with open(OUTPUT_JSON, 'w') as f:
    json.dump(output_data, f, indent=4)

print("\n✅ DONE")
print(f"📄 input JSON: {INTERMEDIATE_JSON}")
print(f"📄 Output JSON: {OUTPUT_JSON}")