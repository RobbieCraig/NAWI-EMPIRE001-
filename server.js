# server.js

```javascript
require('dotenv').config();

// =========================================================
// NAWI-EMPIRE MASTER SYSTEM ENGINE v7.0
// PRODUCTION UNIFIED BUILD
// =========================================================

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { Server } = require('socket.io');

// =========================================================
// EXPRESS SERVER INITIALIZATION
// =========================================================

const app = express();
const server = http.createServer(app);

// =========================================================
// ENVIRONMENT VARIABLES
// =========================================================

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'NAWI_EMPIRE_SECRET';
const NODE_SECRET_KEY = process.env.NODE_SECRET_KEY || 'NAWI_DEFAULT_KEY';
const NODE_ENV = process.env.NODE_ENV || 'development';

const SOVEREIGN_ID = 'NAWI-EMPIRE001';
const SYSTEM_WATERMARK = 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nawi_empire';

// =========================================================
// CREATE REQUIRED DIRECTORIES
// =========================================================

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// =========================================================
// SECURITY MIDDLEWARE
// =========================================================

app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'user-id',
        'x-node-uuid',
        'x-node-ram',
        'x-node-display',
        'x-node-signature',
        'x-nawi-identity'
    ]
}));

app.use(compression());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// =========================================================
// RATE LIMITER
// =========================================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests detected.'
    }
});

app.use(limiter);

// =========================================================
// RESPONSE HEADERS
// =========================================================

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'NAWI-EMPIRE');
    res.setHeader('X-Platform-Authority', SOVEREIGN_ID);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// =========================================================
// STATIC FILES
// =========================================================

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// =========================================================
// FILE UPLOAD CONFIGURATION
// =========================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

// =========================================================
// SAFE CONTROLLER LOADER
// =========================================================

const safeLoad = (primaryPath, fallbackPath, rootFallbackPath, moduleName) => {
    try {
        return require(primaryPath);
    } catch (e) {
        if (fallbackPath) {
            try {
                return require(fallbackPath);
            } catch (err) {}
        }

        if (rootFallbackPath) {
            try {
                return require(rootFallbackPath);
            } catch (rootErr) {
                console.warn(`⚠️ ${moduleName} missing.`);
                return null;
            }
        }

        return null;
    }
};

// =========================================================
// OPTIONAL CONTROLLERS
// =========================================================

let authController = safeLoad(
    './controllers/authController',
    './controllers/authcontroller',
    './authController',
    'authController'
) || {
    registerUser: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists.'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                username,
                email,
                password: hashedPassword
            });

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            );

            return res.status(201).json({
                success: true,
                token,
                user
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    handleUserSession: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials.'
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials.'
                });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            );

            return res.status(200).json({
                success: true,
                token,
                user
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

// =========================================================
// DATABASE SCHEMAS
// =========================================================

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: () => crypto.randomUUID()
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
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
        enum: ['user', 'creator', 'admin', 'founder'],
        default: 'user'
    },
    identity: {
        sovereign_name: {
            type: String,
            default: 'Authenticated Citizen'
        },
        legacy_rank: {
            type: String,
            default: 'Citizen'
        },
        id_verified: {
            type: Boolean,
            default: false
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
        }
    },
    followers: {
        type: Number,
        default: 0
    },
    following: {
        type: Number,
        default: 0
    },
    wallet: {
        empireCoins: {
            type: Number,
            default: 0
        },
        totalEarned: {
            type: Number,
            default: 0
        },
        pendingConversion: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

const ProductSchema = new mongoose.Schema({
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pillar_tool: {
        type: String,
        default: 'GENERAL'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    pricing: {
        base_price: {
            type: Number,
            default: 0
        },
        transaction_type: {
            type: String,
            default: 'P2P_ESCROW'
        }
    },
    media_assets: [
        {
            asset_id: String,
            file_url: String,
            file_type: String
        }
    ],
    status: {
        type: String,
        enum: ['active', 'draft', 'sold'],
        default: 'active'
    }
}, {
    timestamps: true
});

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authorName: {
        type: String,
        default: ''
    },
    caption: String,
    mediaUrl: String,
    mediaType: {
        type: String,
        enum: ['image', 'video', 'audio', 'live'],
        default: 'image'
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    liveData: {
        roomId: String,
        isLive: {
            type: Boolean,
            default: false
        },
        viewers: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

const DailyLedgerSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },
    totalVolumeProcessedUsd: {
        type: Number,
        default: 0
    },
    maxLimitCapUsd: {
        type: Number,
        default: 35000000
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const DailyLedger = mongoose.models.DailyLedger || mongoose.model('DailyLedger', DailyLedgerSchema);

// =========================================================
// AUTH MIDDLEWARE
// =========================================================

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token missing.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

// =========================================================
// TIER SECURITY MIDDLEWARE
// =========================================================

const enforceEcosystemTierSecurity = async (req, res, next) => {
    try {
        const requesterId = req.headers['x-nawi-identity'] || req.body.userId;

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                message: 'Missing user identity.'
            });
        }

        if (requesterId === SOVEREIGN_ID) {
            req.sovereignOverride = true;
            return next();
        }

        const user = await User.findOne({ userId: requesterId });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'User not found.'
            });
        }

        req.citizenProfile = user;

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =========================================================
// HARDWARE SECURITY HANDSHAKE
// =========================================================

const AURORA_231_HARDWARE_PROFILE = {
    expectedUuid: 'AURORA-231-MASTER-NODE-99X-7P',
    expectedRamGb: 192,
    expectedDisplaySize: 27
};

const verifySovereignNodeHandshake = (req, res, next) => {
    const systemUuid = req.headers['x-node-uuid'];
    const systemRam = parseInt(req.headers['x-node-ram'], 10);
    const systemDisplay = parseInt(req.headers['x-node-display'], 10);
    const secureSignature = req.headers['x-node-signature'];

    if (!systemUuid || !systemRam || !systemDisplay || !secureSignature) {
        return res.status(403).json({
            status: 'DENIED',
            message: 'Unauthorized terminal.'
        });
    }

    const verificationPayload = `${systemUuid}-${systemRam}-${systemDisplay}`;

    const expectedSignature = crypto
        .createHmac('sha256', NODE_SECRET_KEY)
        .update(verificationPayload)
        .digest('hex');

    const hardwareMatches =
        systemUuid === AURORA_231_HARDWARE_PROFILE.expectedUuid &&
        systemRam === AURORA_231_HARDWARE_PROFILE.expectedRamGb &&
        systemDisplay === AURORA_231_HARDWARE_PROFILE.expectedDisplaySize;

    if (hardwareMatches && secureSignature === expectedSignature) {
        req.isMasterAuthority = true;
        return next();
    }

    return res.status(401).json({
        status: 'DENIED',
        message: 'Handshake failed.'
    });
};

// =========================================================
// HEALTH CHECK
// =========================================================

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        platform: 'NAWI-EMPIRE',
        environment: NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// =========================================================
// AUTH ROUTES
// =========================================================

app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/session', authController.handleUserSession);

app.post('/api/v1/auth/register', authController.registerUser);
app.post('/api/v1/auth/login', authController.handleUserSession);

// =========================================================
// PROFILE ROUTE
// =========================================================

app.get('/api/v1/profile', authenticateToken, async (req, res) => {
    return res.status(200).json({
        success: true,
        profile: req.user
    });
});

// =========================================================
// FEED SYSTEM
// =========================================================

app.get('/api/feed/home', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================================================
// CREATE POSTS
// =========================================================

app.post('/api/v1/posts/create', authenticateToken, upload.single('media'), async (req, res) => {
    try {
        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const post = await Post.create({
            author: req.user._id,
            authorName: req.user.username,
            caption: req.body.caption,
            mediaUrl,
            mediaType: req.body.mediaType || 'image'
        });

        return res.status(201).json({
            success: true,
            post
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================================================
// PRODUCTS
// =========================================================

app.post('/api/v1/products/create', authenticateToken, async (req, res) => {
    try {
        const product = await Product.create({
            creator_id: req.user._id,
            pillar_tool: req.body.pillar_tool || 'GENERAL',
            title: req.body.title,
            description: req.body.description,
            pricing: {
                base_price: req.body.price || 0
            }
        });

        return res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/v1/products', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('creator_id', 'username email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================================================
// VIDEO VERIFICATION
// =========================================================

app.post('/api/verify/video-lock', upload.single('videoLock'), async (req, res) => {
    try {
        const { userId } = req.body;

        const videoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : '';

        const user = await User.findOneAndUpdate(
            { userId },
            {
                'verification_metrics.day_1_video_url': videoUrl,
                verified: true,
                'identity.id_verified': true
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            profile: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================================================
// P2P ESCROW ENGINE
// =========================================================

class P2PLiquidityManager {

    async verifyAndTrackVolume(amountUsd) {

        const currentDate = new Date().toISOString().split('T')[0];

        let ledger = await DailyLedger.findOne({
            date: currentDate
        });

        if (!ledger) {
            ledger = new DailyLedger({
                date: currentDate,
                totalVolumeProcessedUsd: 0
            });
        }

        if (ledger.totalVolumeProcessedUsd + amountUsd > ledger.maxLimitCapUsd) {
            return {
                allowed: false,
                currentVolume: ledger.totalVolumeProcessedUsd
            };
        }

        ledger.totalVolumeProcessedUsd += amountUsd;

        await ledger.save();

        return {
            allowed: true,
            currentVolume: ledger.totalVolumeProcessedUsd
        };
    }

    async createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet) {

        const volumeCheck = await this.verifyAndTrackVolume(amountUsd);

        if (!volumeCheck.allowed) {
            throw new Error('Daily limit reached.');
        }

        return {
            transactionId,
            escrowStatus: 'PENDING',
            amountUsd,
            buyerWallet,
            sellerWallet,
            currentDailyPlatformVolume: volumeCheck.currentVolume,
            timestamp: Date.now()
        };
    }
}

const LiquidityEngine = new P2PLiquidityManager();

app.post('/api/finance/escrow/create', async (req, res) => {
    try {
        const {
            transactionId,
            amountUsd,
            buyerWallet,
            sellerWallet
        } = req.body;

        const escrow = await LiquidityEngine.createEscrowTransaction(
            transactionId,
            amountUsd,
            buyerWallet,
            sellerWallet
        );

        return res.status(200).json({
            success: true,
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================================================
// ADMIN BYPASS
// =========================================================

app.post('/api/admin/bypass', verifySovereignNodeHandshake, (req, res) => {
    return res.status(200).json({
        status: 'SYNCHRONIZED',
        message: 'Master Authority Bypass Engaged.',
        founderMandate: 'Founder privileges granted.'
    });
});

// =========================================================
// SOCKET.IO LIVE ENGINE
// =========================================================

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {

    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {

        socket.join(roomId);

        io.to(roomId).emit('user_joined', {
            socketId: socket.id
        });
    });

    socket.on('start_live_stream', async (data) => {

        socket.join(data.roomId);

        io.to(data.roomId).emit('live_started', {
            roomId: data.roomId,
            host: data.host
        });
    });

    socket.on('stream_message', (data) => {

        io.to(data.roomId).emit('new_message', {
            sender: data.sender,
            message: data.message,
            createdAt: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {

    console.error(err.stack);

    return res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// =========================================================
// FRONTEND FALLBACK
// =========================================================

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =========================================================
// DATABASE SEED
// =========================================================

const seedEmpire = async () => {

    try {

        const founderExists = await User.findOne({
            email: 'akpanvictor848@gmail.com'
        });

        if (!founderExists) {

            const hashedPassword = await bcrypt.hash('$Nsikak111', 12);

            await User.create({
                userId: SOVEREIGN_ID,
                username: 'founder',
                email: 'akpanvictor848@gmail.com',
                password: hashedPassword,
                role: 'founder',
                verified: true,
                identity: {
                    sovereign_name: '7 pillars',
                    legacy_rank: 'Founder',
                    id_verified: true
                }
            });

            console.log('Founder account seeded successfully.');
        }

    } catch (error) {
        console.error(error.message);
    }
};

// =========================================================
// DATABASE CONNECTION
// =========================================================

mongoose.connect(MONGO_URI)
.then(async () => {

    console.log('====================================================');
    console.log('NAWI-EMPIRE DATABASE CONNECTED');
    console.log('MongoDB Synchronization Successful');
    console.log('====================================================');

    await seedEmpire();

    server.listen(PORT, () => {

        console.log('====================================================');
        console.log(`NAWI-EMPIRE RUNNING ON PORT ${PORT}`);
        console.log(`ENVIRONMENT: ${NODE_ENV}`);
        console.log(`SECURITY WATERMARK: ${SYSTEM_WATERMARK}`);
        console.log('GLOBAL PLATFORM ONLINE');
        console.log('====================================================');

    });

})
.catch((error) => {

    console.error('DATABASE CONNECTION FAILED');
    console.error(error.message);

    process.exit(1);
});
```

# Required packages

```bash
npm install express mongoose dotenv cors helmet compression morgan multer fs crypto bcryptjs jsonwebtoken express-rate-limit socket.io axios
```

# Recommended .env

```env
PORT=10000
NODE_ENV=production
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_super_secret_key
NODE_SECRET_KEY=your_node_secret
```
