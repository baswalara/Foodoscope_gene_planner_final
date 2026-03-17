// frontend/js/recipes.js
const API_BASE_URL = "http://localhost:8000"; 

export function initRecipeUpload() {
    fetchRecommendations();
}

async function fetchRecommendations() {
    const userId = "test_user";
    
    // Selectors
    const container = document.getElementById('recipe-container');
    const countLabel = document.getElementById('recipe-count'); // NEW
    const needsContainer = document.getElementById('needs-container');
    const includeList = document.getElementById('include-list');
    const excludeList = document.getElementById('exclude-list');

    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/${userId}`);
        if (!response.ok) throw new Error("API Error");
        
        const data = await response.json();
        console.log("📦 Data:", data);

        // 1. Render Insights (Clean Side-by-Side)
        if (needsContainer) {
            needsContainer.innerHTML = '';
            if (data.nutritional_needs?.length > 0) {
                data.nutritional_needs.forEach(need => {
                    const pill = document.createElement('div');
                    pill.className = 'insight-pill';
                    // REMOVED the "Genetic" badge span
                    pill.textContent = need; 
                    needsContainer.appendChild(pill);
                });
            } else {
                needsContainer.innerHTML = '<div class="insight-pill">Balanced Profile</div>';
            }
        }

        // 2. Ingredients (Same as before)
        if (includeList) {
            includeList.innerHTML = '';
            data.lists.included.slice(0, 15).forEach(item => {
                const li = document.createElement('li');
                li.textContent = capitalize(item);
                includeList.appendChild(li);
            });
        }
        if (excludeList) {
            excludeList.innerHTML = '';
            data.lists.excluded.slice(0, 15).forEach(item => {
                const li = document.createElement('li');
                li.textContent = capitalize(item);
                excludeList.appendChild(li);
            });
        }

        // 3. Render ALL Included Ingredients (GREEN)
        if (includeList) {
            includeList.innerHTML = '';
            // REMOVED .slice() so it shows the full list you provided
            data.lists.included.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${capitalize(item)}</span>`;
                includeList.appendChild(li);
            });
        }

        // 4. Render ALL Excluded Ingredients (RED)
        if (excludeList) {
            excludeList.innerHTML = '';
            // REMOVED .slice() to show full excluded list
            data.lists.excluded.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${capitalize(item)}</span>`;
                excludeList.appendChild(li);
            });
        }
        // 5. Render Recipes (Random 10 + Scroll)
        if (container) {
            container.innerHTML = ''; // Clear current loading/error state
            
            // Randomly shuffle and take 10 recipes from the provided JSON
            const selected = data.recipes.sort(() => 0.5 - Math.random()).slice(0, 10);
            
            selected.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'recipe-card-new';
                
                // Use the image from JSON (emoji or URL)
                const displayImage = recipe.image;

                card.innerHTML = `
                    <div class="recipe-img-box">${displayImage}</div>
                    <div class="recipe-details">
                        <div class="recipe-title">${recipe.title}</div>
                        <div class="recipe-cals">🔥 ${recipe.calories} kcal</div>
                        <div class="tag-container">
                            <span class="tag tag-ingredient">${recipe.matched_on}</span>
                            <span class="tag tag-region">${recipe.region}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}