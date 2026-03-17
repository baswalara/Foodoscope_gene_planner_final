// frontend/js/tabs.js

export function initTabs() {
    // UPDATED SELECTOR: .nav-item instead of .tab-btn
    const tabs = document.querySelectorAll('.nav-item'); 
    const contents = document.querySelectorAll('.tab-content');

    checkLocks();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            if (tab.classList.contains('locked')) {
                alert("🔒 Please fill out your Basic Info first!");
                return;
            }

            // Switch Active Classes
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });
}

export function goToTab(targetId) {
    const tabs = document.querySelectorAll('.nav-item'); // UPDATED
    const contents = document.querySelectorAll('.tab-content');
    
    // UPDATED: Look for .nav-item
    const targetTab = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    const targetContent = document.getElementById(targetId);

    if (targetTab && targetContent) {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        targetTab.classList.add('active');
        targetContent.classList.add('active');
    } else {
        console.error(`❌ goToTab failed: Could not find tab '${targetId}'`);
    }
}

export function unlockTabs() {
    // UPDATED: Unlock .nav-item
    const tabs = document.querySelectorAll('.nav-item');
    tabs.forEach(tab => {
        tab.classList.remove('locked');
    });
}

function checkLocks() {
    const isComplete = localStorage.getItem('foodoscope_complete'); 
    const tabs = document.querySelectorAll('.nav-item'); // UPDATED

    if (isComplete !== 'true') {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-target') !== 'basic') {
                tab.classList.add('locked');
            }
        });
    } else {
        tabs.forEach(tab => tab.classList.remove('locked'));
    }
}   