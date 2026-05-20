// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    // Strict Platform Integrity Watermark
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true // Locked at the database layer; cannot be modified
    },
    
    // Core Transaction Movement Fields
    sender_id: { 
        type: String, 
        required: true 
        // NOTE: "NAWI-EMPIRE001" represents the Master CEO Bypass account.
        // Backend controllers will recognize this ID to unlock unlimited platform features.
    },
    receiver_id: { 
        type: String, 
        required: true 
    },
    
    // Routing Channels across the 7 Pillars Ecosystem
    hub_destination: { 
        type: String, 
        enum: ['marketplace', 'gaming_hub', 'kitchen_live_stream', 'music_hub', 'sovereign_stylist'], 
        required: true 
    },
    
    // Gift Categories & Support Manifests
    gift_type: { 
        type: String, 
        enum: ['DIRECT_SUPPORT', 'direct_support', 'PREMIUM_FOOD_PACK', 'premium_food_pack', 'MUSIC_BOOST', 'STREAM_UPGRADE'],
        default: 'DIRECT_SUPPORT' 
    },
    
    // Financial Ledger Values
    empire_coins_spent: { 
        type: Number, 
        required: true 
    },
    
    // Operational States for Escrow and P2P tracking
    status: { 
        type: String, 
        enum: ['SUCCESS', 'FAILED', 'PENDING', 'ROUTING_BYPASS'], 
        default: 'SUCCESS' 
    }
}, { 
    collection: 'transactions', 
    timestamps: true // Automatically generates accurate createdAt and updatedAt entries in NAWI_DB
});

module.exports = mongoose.model('Transaction', TransactionSchema);
