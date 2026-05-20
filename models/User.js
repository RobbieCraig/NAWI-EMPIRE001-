// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Strict Platform Verification Watermark
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true
    },
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    
    // Core Identity Profile Block (From Code 1)
    identity: {
        sovereign_name: { type: String, default: "" },
        legacy_rank: { type: String, default: "User" }, // e.g., Founder, Top User, Citizen
        id_verified: { type: Boolean, default: false },
        joined_date: { type: String, default: "2026-05-20" }
    },
    
    // Operational Metrics (Corrected to Numbers for sorting leaderboards)
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 },
        activity_score: { type: Number, default: 0 }
    },
    
    // Platform Level Access Gates (Corrected to Booleans)
    eligibility: {
        can_go_live: { type: Boolean, default: false },
        is_monetized: { type: Boolean, default: false },
        gate_1k_reached: { type: String, default: "" },
        gate_20k_reached: { type: Boolean, default: false }
    },
    
    // The Financial Engine (Corrected to Numbers for flawless Math processing)
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0 },
        welcome_bonus_used: { type: Boolean, default: false }
    },
    
    // Antiscam Guardrails & Defenses
    security: {
        is_banned: { type: String, default: "false" }, // Can flag custom statuses like "AURORA_231_PENDING"
        scam_alert_flag: { type: Number, default: 0 },
        multi_factor_auth: { type: String, default: "ENABLED" }
    }
}, { collection: 'users', timestamps: true }); // Directs strictly to your live NAWI_DB users collection

module.exports = mongoose.model('User', UserSchema);
