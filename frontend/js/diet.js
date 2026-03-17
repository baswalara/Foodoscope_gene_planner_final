// frontend/js/diet.js
// Generates a 7-day meal plan from available recipes, fitted to the user's target calories.

const API_BASE_URL = "http://localhost:8000";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Calorie split per meal slot depending on meals-per-day
const CAL_SPLITS = {
    3: [
        { label: "🌅 Breakfast", share: 0.25 },
        { label: "☀️  Lunch",     share: 0.40 },
        { label: "🌙 Dinner",    share: 0.35 },
    ],
    4: [
        { label: "🌅 Breakfast", share: 0.20 },
        { label: "🍎 Snack",     share: 0.10 },
        { label: "☀️  Lunch",     share: 0.40 },
        { label: "🌙 Dinner",    share: 0.30 },
    ],
    5: [
        { label: "🌅 Breakfast",     share: 0.20 },
        { label: "🍎 Morning Snack", share: 0.10 },
        { label: "☀️  Lunch",         share: 0.35 },
        { label: "🍊 Evening Snack", share: 0.10 },
        { label: "🌙 Dinner",        share: 0.25 },
    ],
};

export async function initDietPlan() {
    const section = document.getElementById('diet');
    if (!section) return;

    const targetCal = parseInt(localStorage.getItem('foodoscope_targetCal') || '2000');
    const mealsPerDay = parseInt(localStorage.getItem('foodoscope_meals') || '3');
    const splits = CAL_SPLITS[mealsPerDay] || CAL_SPLITS[3];

    // Show loading state
    section.innerHTML = `
        <div class="diet-header">
            <h2>🗓️ Your 7-Day Diet Plan</h2>
            <div class="diet-meta-row">
                <span class="diet-badge">🎯 ${targetCal} kcal / day</span>
                <span class="diet-badge">🍽️ ${mealsPerDay} meals / day</span>
            </div>
        </div>
        <div class="diet-loading">
            <div class="diet-spinner"></div>
            <p>Building your personalised plan…</p>
        </div>`;

    let recipes = [];
    try {
        const res = await fetch(`${API_BASE_URL}/recommendations/test_user`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        recipes = data.recipes || [];
    } catch (e) {
        section.innerHTML += `<p class="diet-error">⚠️ Could not load recipes. Make sure the backend is running.</p>`;
        return;
    }

    if (recipes.length === 0) {
        section.innerHTML = `<p class="diet-error">No recipes found. Please run generate_data.py first.</p>`;
        return;
    }

    // Build the plan
    const plan = buildPlan(recipes, DAYS, splits, targetCal);
    renderPlan(section, plan, targetCal, mealsPerDay, splits);
}

// ── Plan builder ────────────────────────────────────────────────────────────

function buildPlan(recipes, days, splits, targetCal) {
    // Shuffle once so every day gets different meals
    const pool = [...recipes].sort(() => Math.random() - 0.5);
    let poolIdx = 0;

    return days.map(day => {
        const meals = splits.map(slot => {
            const targetSlotCal = Math.round(targetCal * slot.share);
            // Find best-fitting recipe within ±40% of target slot calories
            const recipe = pickBestRecipe(pool, poolIdx, targetSlotCal);
            poolIdx = (poolIdx + 1) % pool.length;
            return {
                label: slot.label,
                targetCal: targetSlotCal,
                recipe,
            };
        });
        const totalActual = meals.reduce((s, m) => s + parseFloat(m.recipe.calories || 0), 0);
        return { day, meals, totalActual: Math.round(totalActual) };
    });
}

function pickBestRecipe(pool, startIdx, targetCal) {
    // Scan up to 30 recipes to find the closest calorie match
    let best = pool[startIdx % pool.length];
    let bestDiff = Math.abs(parseFloat(best.calories || 0) - targetCal);

    for (let i = 1; i < Math.min(30, pool.length); i++) {
        const candidate = pool[(startIdx + i) % pool.length];
        const diff = Math.abs(parseFloat(candidate.calories || 0) - targetCal);
        if (diff < bestDiff) {
            best = candidate;
            bestDiff = diff;
        }
    }
    return best;
}

// ── Renderer ────────────────────────────────────────────────────────────────

function renderPlan(section, plan, targetCal, mealsPerDay, splits) {
    section.innerHTML = `
        <div class="diet-header">
            <div class="diet-title-row">
                <h2>🗓️ Your 7-Day Diet Plan</h2>
                <button class="btn-regenerate" id="btn-regenerate">🔀 Regenerate</button>
            </div>
            <div class="diet-meta-row">
                <span class="diet-badge">🎯 ${targetCal} kcal / day</span>
                <span class="diet-badge">🍽️ ${mealsPerDay} meals / day</span>
            </div>
        </div>

        <div class="diet-scroll-track">
            ${plan.map(dayPlan => renderDay(dayPlan, targetCal)).join('')}
        </div>

        <div class="diet-legend">
            <span class="legend-dot green"></span> Within ±100 kcal of target
            <span class="legend-dot orange" style="margin-left:16px"></span> Slightly over/under
            <span class="legend-dot red" style="margin-left:16px"></span> Off target
        </div>`;

    document.getElementById('btn-regenerate')?.addEventListener('click', () => initDietPlan());
}

function renderDay(dayPlan, targetCal) {
    const diff = dayPlan.totalActual - targetCal;
    const absDiff = Math.abs(diff);
    const statusClass = absDiff <= 100 ? 'cal-on-target' : absDiff <= 250 ? 'cal-near' : 'cal-off';
    const sign = diff >= 0 ? '+' : '';

    return `
        <div class="diet-day-col">
            <div class="diet-day-header-card">
                <span class="diet-day-name">${dayPlan.day}</span>
                <span class="diet-day-total ${statusClass}">${dayPlan.totalActual} kcal</span>
                <span class="diet-day-diff ${statusClass}">${sign}${diff} kcal vs target</span>
            </div>
            <div class="diet-meal-stack">
                ${dayPlan.meals.map(m => renderMeal(m)).join('')}
            </div>
        </div>`;
}

function renderMeal(meal) {
    const r = meal.recipe;
    const cal = parseFloat(r.calories || 0);
    return `
        <div class="diet-meal-item">
            <div class="diet-meal-slot-label">${meal.label}</div>
            <div class="diet-meal-emoji">${r.image || '🍽️'}</div>
            <div class="diet-meal-title">${r.title}</div>
            <div class="diet-meal-meta">
                <span class="diet-cal-pill">🔥 ${Math.round(cal)} kcal</span>
                <span class="diet-tag">${r.region || ''}</span>
            </div>
        </div>`;
}

