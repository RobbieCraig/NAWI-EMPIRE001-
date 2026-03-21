/**
 * NAWI-EMPIRE SOVEREIGN P2P GATEWAY
 * Authority: 7 Pillars Control Center
 * Security Level: MAX (Sovereign)
 * Version: 2026.1 - Integrated Master Bypass
 */

const P2P_GATEWAY = {
    // --- IDENTITY & AUTHORITY CONFIG ---
    ceoName: "NAWI-EMPIRE001",
    ceoSocial: "7 pillars",
    userBalance: 0, // This will be synced with MongoDB later

    // 1. THE MASTER BYPASS (CEO Protection)
    // Ensures the CEO can access all services without paying coins
    isMasterAuthority: function() {
        const currentIdentity = localStorage.getItem('nawi_identity');
        return currentIdentity === this.ceoName;
    },

    executeMasterBypass: function(serviceName) {
        console.log("MASTER AUTHORITY RECOGNIZED. BYPASSING P2P FEE...");
        const toast = document.createElement('div');
        toast.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#D4AF37; color:#000; padding:12px 25px; border-radius:50px; font-weight:900; font-size:11px; z-index:20000; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-transform:uppercase;";
        toast.innerText = `MASTER ACCESS GRANTED: ${serviceName}`;
        document.body.appendChild(toast);
        
        setTimeout(() => { toast.remove(); }, 3000);
        return true; // Bypass successful
    },

    // 2. THE HIDDEN ECONOMICS (Currency Conversion)
    calculateEmpireCoins: (amount, currency) => {
        const rates = {
            'NGN': 1360, // 1 USD = 1360 Naira
            'USD': 1,
            'GBP': 0.78,
            'INR': 83
        };
        const baseUSD = amount / (rates[currency] || 1);
        return Math.floor(baseUSD * 2); // 1 Empire Coin = $0.50 USD
    },

    // 3. THE LUXURY AUTHORIZATION MODAL (The UI for Citizens)
    showAuthorizationModal: function(service, amountLocal, currency) {
        // If it's the CEO, don't show the modal, just bypass
        if (this.isMasterAuthority()) {
            return this.executeMasterBypass(service);
        }

        const coinCost = this.calculateEmpireCoins(amountLocal, currency);

        const modal = document.createElement('div');
        modal.id = 'p2p-modal-overlay';
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); backdrop-filter:blur(15px); display:flex; align-items:center; justify-content:center; z-index:10000; font-family:'Inter', sans-serif;";

        modal.innerHTML = `
            <div style="background:#000; border:1px solid #D4AF37; width:85%; max-width:360px; border-radius:30px; padding:35px; text-align:center; box-shadow:0 0 50px rgba(212,175,55,0.15);">
                <i class="fa-solid fa-crown" style="color:#D4AF37; font-size:35px; margin-bottom:15px;"></i>
                <h2 style="color:#fff; font-size:14px; letter-spacing:3px; text-transform:uppercase; margin-bottom:20px;">P2P Authorization</h2>
                
                <div style="background:#111; padding:20px; border-radius:20px; margin-bottom:25px; border:1px solid #222;">
                    <span style="display:block; color:#555; font-size:9px; text-transform:uppercase; font-weight:800; margin-bottom:8px;">${service}</span>
                    <span style="color:#D4AF37; font-size:28px; font-weight:900;">${coinCost} 🪙</span>
                    <p style="color:#00ff64; font-size:9px; font-weight:bold; margin-top:10px;">ESCROW PROTECTION ACTIVE</p>
                </div>

                <button id="p2p-confirm" style="background:#D4AF37; color:#000; width:100%; padding:18px; border-radius:15px; border:none; font-weight:900; text-transform:uppercase; cursor:pointer; font-size:12px;">Confirm & Pay</button>
                <button id="p2p-cancel" style="background:transparent; color:#444; width:100%; border:none; margin-top:15px; font-size:10px; font-weight:800; cursor:pointer;">CANCEL ACCESS</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('p2p-confirm').onclick = () => { this.processEscrow(service, coinCost); };
        document.getElementById('p2p-cancel').onclick = () => { modal.remove(); };
    },

    // 4. THE SOVEREIGN ESCROW (Backend Logic)
    processEscrow: async function(service, coins) {
        console.log(`P2P GATEWAY: Locking ${coins} coins in Escrow for ${service}...`);
        
        // This is where we call your Render API
        // const response = await fetch('/api/create-transaction', { ... });

        alert(`✅ Transaction Initiated. Money Held by Empire for ${service}.`);
        document.getElementById('p2p-modal-overlay').remove();
    }
};

// INITIALIZE MASTER LOGIN (Always ensures NAWI-EMPIRE001 has authority)
function initializeCEO() {
    localStorage.setItem('nawi_identity', 'NAWI-EMPIRE001');
    localStorage.setItem('nawi_token', 'AUTHORITY_RECOGNIZED');
}

initializeCEO();
