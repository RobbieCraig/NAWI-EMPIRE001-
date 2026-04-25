/* NAWI-EMPIRE INBOX BRIDGE
   Role: Fetch and Render Imperial Communications
*/

/**
 * Main entry point to initialize the Inbox.
 * Replaces the static "Bridge Interrupted" UI with live data.
 */
async function loadInbox() {
    // Priority: 1. LocalStorage (Session) 2. Master ID (Fallback)
    const userId = localStorage.getItem('userId') || "NAWI-EMPIRE001"; 
    const inboxContainer = document.getElementById('message-list') || document.getElementById('inbox-container');

    try {
        const response = await fetch(`/api/inbox/${userId}`);
        
        if (!response.ok) throw new Error("Vault Connection Refused");

        const messages = await response.json();
        
        if (messages && messages.length > 0) {
            renderMessages(messages, inboxContainer);
        } else {
            inboxContainer.innerHTML = `
                <div class="text-center py-20">
                    <i class="fa-solid fa-ghost text-zinc-800 text-4xl mb-4"></i>
                    <p class="text-zinc-500 text-xs">The Imperial Inbox is silent.</p>
                </div>`;
        }
    } catch (error) {
        console.error("Bridge Error:", error);
        // If fetch fails, we keep the UI in "Interrupted" state
        if (inboxContainer) {
            inboxContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <i class="fa-solid fa-triangle-exclamation text-amber-500 text-3xl mb-4"></i>
                    <h2 class="text-white font-bold text-sm">Bridge Connection Interrupted</h2>
                    <p class="text-zinc-500 text-[10px] mt-2">Check your uplink to the Seven Pillars.</p>
                </div>`;
        }
    }
}

/**
 * Handles the visual generation of message cards.
 * @param {Array} messages - Array of message objects from the API.
 * @param {HTMLElement} container - The target element to inject HTML.
 */
function renderMessages(messages, container) {
    container.innerHTML = ''; // Wipe placeholders or error states

    messages.forEach(msg => {
        // Use default icons/types if server data is missing them
        const icon = msg.icon || "fa-solid fa-bell";
        const type = msg.type || "SYSTEM ALERT";
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "NOW";

        const card = `
        <div class="p-4 mb-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex gap-4 animate-fade-in">
            <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-700">
                <i class="${icon} text-amber-500"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <h4 class="text-[11px] font-black text-white uppercase tracking-wider">${msg.sender}</h4>
                    <span class="text-[8px] text-zinc-500 font-mono">${time}</span>
                </div>
                <p class="text-[10px] text-zinc-400 leading-snug mb-2">${msg.text}</p>
                <div class="flex items-center gap-2">
                    <span class="text-[7px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase tracking-tighter">
                        ${type}
                    </span>
                </div>
            </div>
        </div>`;
        
        container.innerHTML += card;
    });
}

// Initial Execution
document.addEventListener('DOMContentLoaded', loadInbox);
