const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
{
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
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

    phone: {
        type: String,
        default: ''
    },

    profilePhoto: {
        type: String,
        default: ''
    },

    role: {
        type: String,
        enum: [
            'citizen',
            'verified',
            'moderator',
            'admin',
            'founder',
            'super_admin'
        ],
        default: 'citizen'
    },

    accountStatus: {
        type: String,
        enum: [
            'active',
            'pending',
            'suspended',
            'banned'
        ],
        default: 'active'
    },

    verificationTier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

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
            enum: [
                'pending',
                'approved',
                'rejected'
            ],
            default: 'pending'
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

    walletSnapshot: {
        empireCoins: {
            type: Number,
            default: 5
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

module.exports =
    mongoose.models.User ||
    mongoose.model('User', UserSchema);
