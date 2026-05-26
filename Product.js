// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // ========================================================
    // 🛡️ SECURITY, PLATFORM WATERMARK & ACCESS AUTHORIZATION
    // ========================================================
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true
    },
    creator_id: { 
        type: String, 
        required: true 
        // Identifies the uploading citizen profile. "NAWI-EMPIRE001" bypasses standard audit.
    },

    // ========================================================
    // 🔀 THE GUARDRAIL: "What are you sharing today?"
    // ========================================================
    pillar_tool: {
        type: String,
        required: true,
        enum: [
            'MARKETPLACE_APPAREL', // 💼 Marketplace / Apparel Studio
            'DIAMONDBACK_ASSETS',  // 💎 Diamondback 231 Assets
            'SOVEREIGN_STYLIST',   // ✂️ Sovereign Stylist Tools/Lookbooks
            'GAMING_HUB',         // 🎮 Gaming Hub Battles & Clips
            'KITCHEN_CANTEEN',     // 🍳 Kitchen & Canteen Feed / Live Streams
            'MUSIC_HUB',          // 🎵 Music Hub Streaming & Downloads
            'ADS_MANAGER'          // 📢 Ads Program Manager
        ]
    },

    // ========================================================
    // 📦 CORE POST, ITEM, AND MEDIA STRUCTURE
    // ========================================================
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1000 },
    category_feed_target: { 
        type: String, 
        required: true 
        // Controls routing to: 'Content Feed Only', 'Marketplace Only', or 'Universal Feed'
    },
    
    // Cross-platform media components supporting mobile image carousels and stream files
    media_assets: [{
        asset_id: { type: String, required: true },
        file_url: { type: String, required: true },
        media_type: { type: String, enum: ['IMAGE', 'VIDEO', 'AUDIO', '3D_SOURCE_ZIP'], required: true },
        is_downloadable_to_phone: { type: Boolean, default: false }, // Mandatory for Music Hub track downloading
        download_watermark_seal: { type: String, default: "NAWI-EMPIRE001-SECURE-MEDIA" }
    }],

    // ========================================================
    // 🪙 THE COIN ENGINE & ESCROW RULES
    // ========================================================
    pricing: {
        base_price: { type: Number, default: 0.00 }, // 0 balance means free stream/post
        currency: { type: String, default: "🪙 Empire Coins" },
        currency_support: { type: [String], default: ["EMPIRE_COINS", "USD", "NGN", "GBP", "EUR"] },
        stock_quantity: { type: Number, default: 1 }, // Available units for sale
        transaction_type: { type: String, enum: ['FREE_ACCESS', 'DIRECT_PURCHASE', 'P2P_ESCROW', 'GIFT_SUPPORT'], default: 'FREE_ACCESS' },
        stock_status: { type: String, enum: ['In Stock', 'AVAILABLE', 'OUT_OF_STOCK', 'LIVE_STREAMING'], default: 'AVAILABLE' }
    },

    // ========================================================
    // ⚡ THE 7 PILLARS SPECIFIC COMPONENT LOGIC
    // ========================================================
    
    // 💼 Pillar 1: Marketplace & Apparel Studio Meta
    apparel_studio_metadata: {
        target_demographic: { type: String, enum: ['Men', 'Women', 'Children', 'Universal', 'None'], default: 'Universal' },
        available_sizes: { type: [String], default: [] }, // e.g., ["S", "M", "L", "XL"]
        accessories_tags: { type: [String], default: [] }  // e.g., ["Watch", "Cap", "Belt"]
    },

    // 💎 Pillar 2: Diamondback 231 Premium Digital Frameworks
    diamondback_metadata: {
        framework_version: { type: String, default: "DIAMONDBACK-231-V1" },
        allowed_extensions: { type: [String], default: [".obj", ".fbx", ".blend", ".zip", ".rar"] },
        is_remixable_canvas: { type: Boolean, default: true }
    },

    // ✂️ Pillar 3: Sovereign Stylist Infrastructure
    sovereign_stylist_metadata: {
        tool_type: { type: String, enum: ['Barbershop_Tools', 'Cosmetics', 'Baby_Fashion_Tools', 'Style_Lookbook', 'None'], default: 'None' },
        portfolio_gallery_urls: { type: [String], default: [] },
        content_feed_approved: { type: Boolean, default: true }
    },

    // 🎮 Pillar 4: Gaming Hub Challenge Engine (Strict Anti-Scam / No Betting)
    gaming_metadata: {
        game_title: { type: String, default: "" },
        opponent_username: { type: String, default: "" },
        battle_winner_id: { type: String, default: "" },
        wager_protocol_enforced: { type: String, default: "XP_AND_RANK_ONLY", immutable: true }, // Absolutely NO money betting
        battle_clip_duration_secs: { type: Number, default: 0 }
    },

    // 🍳 Pillar 5: Kitchen & Canteen Live Stream Feed
    kitchen_canteen_metadata: {
        meal_shop_name: { type: String, default: "" },
        live_stream_scheduled: { type: Boolean, default: false },
        rtmp_endpoint_url: { type: String, default: "" },
        menu_ingredients_labels: { type: [String], default: [] } // e.g., ["Spices", "Vegan", "Cooked"]
    },

    // 🎵 Pillar 6: Global Music Hub & Promotion Center
    music_metadata: {
        artist_name: { type: String, default: "" },
        lyrics_display: { type: String, default: "" },
        track_duration_secs: { type: Number, default: 0 },
        total_stream_plays: { type: Number, default: 0 },
        total_device_downloads: { type: Number, default: 0 }
    },

    // 📢 Pillar 7: Ads Program Manager Core
    ads_manager_metadata: {
        boost_enabled: { type: Boolean, default: false },
        ad_campaign_budget_coins: { type: Number, default: 0 },
        target_demographic_pillar: { type: String, default: "ALL_TOOLS" },
        impressions_logged: { type: Number, default: 0 },
        clicks_logged: { type: Number, default: 0 }
    },

    // ========================================================
    // 🛡️ ANTI-SCAM SYSTEM COMPLIANCE GATES
    // ========================================================
    trust_and_security: {
        is_verified_seller: { type: Boolean, default: false },
        safety_clearance_hash: { type: String, default: "PASSED" },
        audit_status: { type: String, enum: ['PENDING_AUDIT', 'APPROVED', 'REJECTED'], default: 'PENDING_AUDIT' }
    }
}, { 
    collection: 'marketplace_products', 
    timestamps: true 
});

module.exports = mongoose.model('Product', ProductSchema);
