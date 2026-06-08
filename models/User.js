/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: models/User.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Description: Unified, high-performance database schema tracking compliance, themes, and pillar authorizations.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
{
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    userId: {
        type: String,
        unique: true,
        index: true,
        default: () => crypto.randomUUID()
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    // Unified fields supporting legacy and new formats
    phone: {
        type: String,
        default: ''
    },
    
    phone_number: {
        type: String,
        default: ''
    },

    profilePhoto: {
        type: String,
        default: ''
    },

    verified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: [
            'citizen',
            'user',
            'verified',
            'creator',
            'moderator',
            'admin',
            'founder',
            'super_admin'
        ],
        default: 'user'
    },

    accountStatus: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'banned'],
        default: 'active'
    },

    // Retained dual-tracking options to prevent route breaking
    verificationTier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

    current_tier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

    // ==========================================
    // IDENTITY & LEGISLATIVE RANK METRICS
    // ==========================================
    identity: {
        sovereign_name: {
            type: String,
            default: ''
        },

        legacy_rank: {
            type: String,
            default: 'Citizen'
        },

        id_verified: {
            type: Boolean,
            default: false
        },

        joined_date: {
            type: Date,
            default: Date.now
        }
    },

    // ==========================================
    // BIOMETRIC AND VERIFICATION METRICS (TIER 1/3)
    // ==========================================
    biometricVerification: {
        day1VideoUrl: {
            type: String,
            default: ''
        },
        verifiedAt: {
            type: Date
        },
        biometricStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },

    verification_metrics: {
        day_1_video_url: {
            type: String,
            default: ''
        },
        corporate_docs_submitted: {
            type: Boolean,
            default: false
        },
        businessName: {
            type: String,
            default: ''
        },
        cacNumber: {
            type: String,
            default: ''
        },
        secure_docs_url: {
            type: String,
            default: ''
        }
    },

    businessVerification: {
        businessName: {
            type: String,
            default: ''
        },
        registrationNumber: {
            type: String,
            default: ''
        },
        registrationDocument: {
            type: String,
            default: ''
        },
        approved: {
            type: Boolean,
            default: false
        }
    },

    // ==========================================
    // ESCROW COMPLIANCE TRACKING LOGS
    // ==========================================
    complianceMetrics: {
        cleanEscrowTransactions: {
            type: Number,
            default: 0
        },

        rulesViolated: {
            type: Number,
            default: 0
        },

        successfulDeliveries: {
            type: Number,
            default: 0
        },

        disputesOpened: {
            type: Number,
            default: 0
        }
    },

    metrics: {
        follower_count: {
            type: Number,
            default: 0
        },

        following_count: {
            type: Number,
            default: 0
        },

        daily_streak: {
            type: Number,
            default: 0
        },

        activity_score: {
            type: Number,
            default: 0
        }
    },

    eligibility: {
        can_go_live: {
            type: Boolean,
            default: false
        },

        is_monetized: {
            type: Boolean,
            default: false
        },

        gate_1k_reached: {
            type: Boolean,
            default: false
        },

        gate_20k_reached: {
            type: Boolean,
            default: false
        }
    },

    // ==========================================
    // THE 7 PILLARS ACCESS GATEWAYS
    // ==========================================
    pillarAccess: {
        marketplace: {
            type: Boolean,
            default: true
        },

        ads_program: {
            type: Boolean,
            default: true
        },

        gaming_studio: {
            type: Boolean,
            default: true
        },

        live_stream: {
            type: Boolean,
            default: true
        },

        kitchen_meal: {
            type: Boolean,
            default: true
        },

        music_promotion: {
            type: Boolean,
            default: true
        },

        content_creation: {
            type: Boolean,
            default: true
        }
    },

    // ==========================================
    // EMPIRE WALLET LEDGER
    // ==========================================
    wallet: {
        empire_coins: {
            type: Number,
            default: 5
        },

        total_earned_to_date: {
            type: Number,
            default: 0
        },

        pending_conversion: {
            type: Number,
            default: 0
        },
        
        usdBalance: {
            type: Number,
            default: 0
        },

        ngnBalance: {
            type: Number,
            default: 0
        }
    },

    // ==========================================
    // SOVEREIGN STYLIST STYLING RULES
    // ==========================================
    sovereignStylistTheme: {
        activeTheme: {
            type: String,
            enum: [
                'deep_obsidian',
                'industrial_titanium',
                'polished_gold'
            ],
            default: 'deep_obsidian'
        },

        titaniumAccents: {
            type: Boolean,
            default: true
        },

        polishedGoldBorders: {
            type: Boolean,
            default: true
        }
    },

    challengesEntered: [{
        type: String
    }],

    backupCodes: [
        {
            codeHash: {
                type: String
            },

            createdAt: {
                type: Date,
                default: Date.now
            },

            used: {
                type: Boolean,
                default: false
            }
        }
    ],

    // ==========================================
    // SYSTEM REF ACCESS POINTERS
    // ==========================================
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },

    verificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Verification'
    },

    advertisements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    }],

    escrows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escrow'
    }],

    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],

    security: {
        is_banned: {
            type: Boolean,
            default: false
        },

        scam_alert_flag: {
            type: Number,
            default: 0
        },

        multi_factor_auth: {
            type: String,
            default: 'ENABLED'
        },

        lastLogin: {
            type: Date
        }
    }
},
{
    collection: 'users',
    timestamps: true
});

// Middleware verification proxy layer
UserSchema.pre('save', function (next) {
    // Dynamically synchronizes state names between keys across migrations
    if (this.isModified('phone_number') && this.phone_number) {
        this.phone = this.phone_number;
    } else if (this.isModified('phone') && this.phone) {
        this.phone_number = this.phone;
    }

    if (this.isModified('current_tier')) {
        this.verificationTier = this.current_tier;
    } else if (this.isModified('verificationTier')) {
        this.current_tier = this.verificationTier;
    }
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
