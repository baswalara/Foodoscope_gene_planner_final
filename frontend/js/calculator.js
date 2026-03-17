// frontend/js/calculator.js
import { unlockTabs, goToTab } from './tabs.js';

// ── Validation helpers ─────────────────────────────────────────────────────

function setFieldError(inputEl) {
    // For <input> inside .input-wrapper
    const wrapper = inputEl.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.add('field-error');
        // Remove error as soon as the user types something
        inputEl.addEventListener('input', () => clearFieldError(inputEl), { once: true });
    }
    // For <select> (has no wrapper, sits directly in .input-field)
    if (inputEl.tagName === 'SELECT') {
        inputEl.classList.add('field-error-select');
        inputEl.addEventListener('change', () => inputEl.classList.remove('field-error-select'), { once: true });
    }
    // Highlight the label above the field
    const field = inputEl.closest('.input-field') || inputEl.closest('.header-info');
    if (field) {
        const label = field.querySelector('label');
        if (label) label.classList.add('label-error');
    }
    // Ghost input (name field) — highlight its parent card header
    if (inputEl.classList.contains('ghost-input')) {
        inputEl.classList.add('ghost-input-error');
        inputEl.addEventListener('input', () => inputEl.classList.remove('ghost-input-error'), { once: true });
    }
}

function clearFieldError(inputEl) {
    const wrapper = inputEl.closest('.input-wrapper');
    if (wrapper) wrapper.classList.remove('field-error');
    const field = inputEl.closest('.input-field') || inputEl.closest('.header-info');
    if (field) {
        const label = field.querySelector('label');
        if (label) label.classList.remove('label-error');
    }
}

function showValidationPopup(missingCount) {
    // Remove any existing popup
    const existing = document.getElementById('validation-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'validation-popup';
    popup.className = 'validation-popup';
    popup.innerHTML = `
        <span class="popup-icon">⚠️</span>
        <div class="popup-body">
            <strong>Missing Required Fields</strong>
            <span>Please fill in the ${missingCount} highlighted field${missingCount > 1 ? 's' : ''} before continuing.</span>
        </div>
        <button class="popup-close" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(popup);

    // Auto-dismiss after 4 seconds
    setTimeout(() => popup && popup.remove(), 4000);
}

// ── Main function ──────────────────────────────────────────────────────────

export function calculateMetabolism() {
    console.log("🧮 Calculator running...");

    // 1. GET INPUTS
    const nameInput = document.getElementById('full-name');
    const ageInput = document.getElementById('age');
    const genderInput = document.getElementById('gender');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const activityInput = document.getElementById('activity');
    const goalInput = document.getElementById('goal');
    const targetWeightInput = document.getElementById('target-weight');
    const mealsInput = document.getElementById('meals');

    // 2. VALIDATE — collect all missing required fields
    const requiredFields = [
        { el: nameInput,   check: () => nameInput.value.trim() !== '' },
        { el: ageInput,    check: () => ageInput.value !== '' },
        { el: weightInput, check: () => weightInput.value !== '' },
        { el: heightInput, check: () => heightInput.value !== '' },
        { el: genderInput, check: () => genderInput.value !== '' },
    ];

    const missingFields = requiredFields.filter(f => !f.check());

    if (missingFields.length > 0) {
        missingFields.forEach(f => setFieldError(f.el));
        showValidationPopup(missingFields.length);
        // Shake the calculate button for feedback
        const btn = document.getElementById('calculate-btn');
        btn.classList.add('btn-shake');
        btn.addEventListener('animationend', () => btn.classList.remove('btn-shake'), { once: true });
        return;
    }

    // 2. STORE DATA
    localStorage.setItem('foodoscope_user', nameInput.value.trim());
    localStorage.setItem('foodoscope_complete', 'true');
    // Persist for diet plan page (set after targetCal is calculated below)
    // — actual persist happens after calculation block

    // 3. CALCULATION LOGIC
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const age = parseFloat(ageInput.value);
    const gender = genderInput.value;
    const activityVal = parseFloat(activityInput.value);
    
    // BMI
    const heightM = height / 100;
    const bmi = (heightM > 0) ? (weight / (heightM * heightM)).toFixed(1) : 0;

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;

    // TDEE & Target
    const tdee = bmr * activityVal;
    
    let modifier = 1.0;
    let adjText = "0%";
    
    if (goalInput.value === 'loss') { modifier = 0.85; adjText = "-15%"; }
    if (goalInput.value === 'gain') { modifier = 1.10; adjText = "+10%"; }
    
    let targetCal = Math.floor(tdee * modifier);
    if (targetCal < 1200) targetCal = 1200;

    // Save for Diet Plan page
    localStorage.setItem('foodoscope_targetCal', targetCal);
    localStorage.setItem('foodoscope_meals', mealsInput.value || '3');

    // Macros
    const proteinG = Math.round(weight * 2.0); // 2g per kg
    const fatG = Math.round(weight * 0.7);     // 0.7g per kg
    const remainCal = targetCal - ((proteinG * 4) + (fatG * 9));
    const carbsG = Math.max(0, Math.round(remainCal / 4));

    // 4. UPDATE UI
    updateDashboardUI({
        bmi,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCal,
        adjText,
        gender,
        age,
        height,
        weight,
        goalWeight: targetWeightInput.value || "--",
        activityText: activityInput.options[activityInput.selectedIndex].text.split('(')[0].trim(),
        macros: { p: proteinG, f: fatG, c: carbsG }
    });

    // 5. NAVIGATE
    unlockTabs(); 
    goToTab('calculations');
}

function updateDashboardUI(data) {
    // TEXT UPDATES
    safeSetText('bmi-val', data.bmi);
    safeSetText('cal-target', data.targetCal);
    safeSetText('macro-p', data.macros.p + "g");
    safeSetText('macro-c', data.macros.c + "g");
    safeSetText('macro-f', data.macros.f + "g");
    
    // SUMMARY TABLE
    safeSetText('res-gender', data.gender);
    safeSetText('res-age', data.age + " years");
    safeSetText('res-height', data.height + " cm");
    safeSetText('res-weight', data.weight + " kg");
    safeSetText('res-goal-weight', data.goalWeight + (data.goalWeight !== "--" ? " kg" : ""));
    safeSetText('res-act', data.activityText);
    
    safeSetText('res-bmr', data.bmr + " kcal");
    safeSetText('res-tdee', data.tdee + " kcal");
    safeSetText('res-adj', data.adjText);
    safeSetText('res-target', data.targetCal + " kcal");

    // BMI STATUS TEXT
    const bmiText = document.getElementById('bmi-text');
    let rotation = -90; // Default (Far Left)

    if (bmiText) {
        if (data.bmi < 18.5) {
            bmiText.textContent = "Underweight";
            rotation = -70; // Orange Zone Left
        } else if (data.bmi < 25) {
            bmiText.textContent = "Normal";
            rotation = 0; // Green Zone Center (Upright)
        } else if (data.bmi < 30) {
            bmiText.textContent = "Overweight";
            rotation = 70; // Orange Zone Right
        } else {
            bmiText.textContent = "Obese";
            rotation = 85; // Red Zone
        }
    }

    // ANIMATE GAUGE NEEDLE
    const needle = document.getElementById('gauge-needle');
    if (needle) {
        // -90deg is far left, 90deg is far right.
        // We map the zones roughly visually to the CSS gradient
        setTimeout(() => {
            needle.style.transform = `rotate(${rotation}deg)`;
        }, 100);
    }

    // ANIMATE CALORIE RING
    const circle = document.getElementById('cal-ring');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        // Calculate percent based on a "Max" of 3000 (just for visual scale)
        const percent = Math.min(100, (data.targetCal / 3000) * 100);
        const offset = circumference - (percent / 100) * circumference;

        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);
    }
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}