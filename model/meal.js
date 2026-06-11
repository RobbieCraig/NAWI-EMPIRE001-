const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({

    // ==============================
    // PLATFORM SECURITY WATERMARK
    // ==============================
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    // ==============================
    // OWNER INFORMATION
    // ==============================
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // ==============================
    // PRODUCT DETAILS
    // ==============================
    product_name: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        enum: [
            'Kitchen Meal',
            'Canteen',
            'Restaurant',
            'Cooked Meal',
            'Raw Food',
            'Spices',
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snacks',
            'Drinks',
            'International'
        ],
        default: 'Kitchen Meal'
    },

    description: {
        type: String,
        required: true,
        maxlength: 1000
    },

    images: {
        type: [String],
        default: []
    },

    // ==============================
    // PRICING
    // ==============================
    price: {
        type: Number,
        required: true,
        min: 0
    },

    currency: {
        type: String,
        default: 'EC'
    },

    pricing_and_logistics: {

        base_price_usd: {
            type: Number,
            default: 0
        },

        currency_support: {
            type: [String],
            default: [
                'EC',
                'USD',
                'NGN',
                'GBP',
                'EUR'
            ]
        },

        transaction_type: {
            type: String,
            default: 'P2P_ESCROW'
        },

        shipping_scope: {
            type: String,
            default: 'WORLDWIDE'
        },

        stock_status: {
            type: String,
            enum: [
                'AVAILABLE',
                'LOW_STOCK',
                'OUT_OF_STOCK'
            ],
            default: 'AVAILABLE'
        }
    },

    // ==============================
    // INVENTORY
    // ==============================
    inventory: {

        quantity_available: {
            type: Number,
            default: 0
        },

        low_stock_alert: {
            type: Boolean,
            default: false
        }
    },

    // ==============================
    // SPECIFICATIONS
    // ==============================
    specifications: {

        volume_weight: {
            type: String,
            default: ''
        },

        packaging: {
            type: String,
            default: ''
        },

        shelf_life: {
            type: String,
            default: ''
        },

        dietary_labels: {
            type: [String],
            default: []
        }
    },

    // ==============================
    // LIVE STUDIO SYSTEM
    // ==============================
    live_studio: {

        is_live_featured: {
            type: Boolean,
            default: false
        },

        live_stream_id: {
            type: String,
            default: ''
        },

        chef_name: {
            type: String,
            default: ''
        }
    },

    // ==============================
    // VISIBILITY ENGINE
    // ==============================
    visibility_engine: {

        promoted: {
            type: Boolean,
            default: false
        },

        ad_campaign_id: {
            type: String,
            default: ''
        }
    },

    // ==============================
    // ESCROW PROTECTION
    // ==============================
    escrow_protection: {

        enabled: {
            type: Boolean,
            default: true
        },

        escrow_protocol: {
            type: String,
            default: 'DIAMONDBACK-231-ESCROW-SHIELD'
        }
    },

    // ==============================
    // FORENSIC STAMPING
    // ==============================
    forensic_stamp: {

        isForensicStamped: {
            type: Boolean,
            default: true
        },

        assetFingerprint: {
            type: String,
            default: ''
        }
    },

    // ==============================
    // TRUST & SECURITY
    // ==============================
    trust_and_security: {

        is_verified_seller: {
            type: Boolean,
            default: false
        },

        safety_clearance: {
            type: String,
            default: 'PENDING'
        },

        audit_status: {
            type: String,
            enum: [
                'PENDING_AUDIT',
                'APPROVED',
                'REJECTED'
            ],
            default: 'PENDING_AUDIT'
        }
    },

    // ==============================
    // RATINGS
    // ==============================
    ratings: {

        average_rating: {
            type: Number,
            default: 0
        },

        total_reviews: {
            type: Number,
            default: 0
        }
    },

    // ==============================
    // PILLAR METADATA
    // ==============================
    pillar_metadata: {

        source_pillar: {
            type: String,
            default: 'CULINARY_MATRIX'
        },

        node_authority: {
            type: String,
            default: 'NAWI-EMPIRE001'
        }
    }

},
{
    collection: 'kitchenmeals',
    timestamps: true
});

module.exports = mongoose.model('Meal', MealSchema);
