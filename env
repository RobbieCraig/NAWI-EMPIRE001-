// --- 👑 NAWI-EMPIRE GLOBAL CONTROLLER ---

const API_URL = "https://nawi-empire1.onrender.com";

/**
 * 🏆 THE GOLDEN ALERT SYSTEM (Notification Bar)
 * This is the official voice of the Empire.
 */
function showEmpireAlert(message, type = "success") {
    // Remove existing alert if present to prevent stacking
    const existingAlert = document.getElementById('empire-toast');
    if (existingAlert) existingAlert.remove();

    const alertBox = document.createElement('div');
    alertBox.id = "empire-toast";
    
    // Luxury Styling: Gold text on Black glass background
    alertBox.style.cssText = `
        position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
        width: 90%; max-width: 400px; background: rgba(5, 5, 5, 0.98);
        border: 1px solid #D4AF37;
        color: #D4AF37; padding: 18px 25px; border-radius: 15px;
        text-align: center; font-weight: 900; font-size: 11px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.8); z-index: 9999;
        transition: 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-transform: uppercase; letter-spacing: 1.5px;
        backdrop-filter: blur(10px);
    `;

    // Fixed Syntax: Assigning icon based on type
    let icon = "✨ ";
    if (type === "warning") icon = "⚠️ ";
    if (type === "pillar") icon = "🏛️ ";

    alertBox.innerHTML = `<span>${icon} ${message}</span>`;
    document.body.appendChild(alertBox);

    // Slide up into view
    setTimeout(() => { alertBox.style.top = "25px"; }, 100);

    // Slide Up and remove after 5 seconds
    setTimeout(() => {
        alertBox.style.top = "-120px";
        setTimeout(() => { alertBox.remove(); }, 600);
    }, 5000);
}

/**
 * 🛡️ SOVEREIGN STATUS & BALANCE SYNC
 */
async function syncEmpireData() {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        console.log("Guest Node: Authority Limited.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/user-profile/${userId}`);
        const data = await response.json();

        if (data.status === "TERMINATED") {
            window.location.href = "banished.html";
            return;
        }

        if (data.pendingWarning) {
            showEmpireAlert(data.pendingWarning, "warning");
        }

        const coinDisplay = document.getElementById('empire-balance-top');
        if (coinDisplay) {
            coinDisplay.innerHTML = `<i class="fa-solid fa-coins"></i> ${data.balance || '0.00'}`;
        }

        const userName = document.getElementById('nav-user-name');
        if (userName) {
            userName.innerText = data.name || "CITIZEN NODE";
        }

        console.log("Empire Sync: Operational.");

    } catch (err) {
        console.log("Connection to Vault Lost. Retrying...");
    }
}

/**
 * 🛠️ NAVIGATION & TOOL REDIRECTION
 * Ensures tools go to the correct files instead of the homepage.
 */
function initializeNavigation() {
    // Select all tool cards/containers
    const toolCards = document.querySelectorAll('.tool-card, [data-tool]');

    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = card.getAttribute('data-tool');
            if (target) {
                window.location.href = `${target}.html`;
            }
        });
    });
}

/**
 * 🚀 INITIALIZATION
 */
window.addEventListener('DOMContentLoaded', () => {
    syncEmpireData();
    initializeNavigation();
    
    // Auto-sync every 60 seconds
    setInterval(syncEmpireData, 60000);
});
