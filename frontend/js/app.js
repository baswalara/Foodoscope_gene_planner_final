import { initTabs, goToTab } from './tabs.js';
import { calculateMetabolism } from './calculator.js';
import { initRecipeUpload } from './recipes.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Components
    initTabs();
    initRecipeUpload();

    // 2. Attach "Calculate" Button Listener
    const calcBtn = document.getElementById('btn-calculate');
    
    if (calcBtn) {
        calcBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission refresh
            
            // Run Calculations
            calculateMetabolism();
            
            // Redirect to Tab 2
            goToTab('calculations');
            
            // Optional: Scroll to top for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});