// =========================================================
// NAWI-EMPIRE MASTER SYSTEM ENGINE v7.5 - UNIFIED PRODUCTION BUILD
// SYSTEMS: 7 Pillars, Aurora-231 Handshake, Sovereign P2P Escrow, WebSocket Stream Core
// AUTHORITY WATERMARK: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
// Real Platform Framework optimized for verified human interactions.
// =========================================================

require('dotenv').config();
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
const { Server } = require('socket.io');
const { body, validationResult } = require('express-validator');

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
const NODE_ENV = process.env.NODE_ENV || 'production';

const SOVEREIGN_ID = 'NAWI-EMPIRE001';
const SYSTEM_WATERMARK = 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001';
const MONGO_URI = process.env.MONGO_URI;

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
        'Content-Type', 'Authorization', 'user-id', 'x-node-uuid',
        'x-node-ram', 'x-node-display', 'x-node-signature', 'x-nawi-identity'
    ]
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// RATE LIMITER
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests detected.' }
});
app.use(limiter);

// PLATFORM HEADERS
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'NAWI-EMPIRE');
    res.setHeader('X-Platform-Authority', SOVEREIGN_ID);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// STATIC ASSETS
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// FILE UPLOAD CONFIGURATION
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadsDir); },
    filename: (req, file, cb) => {
        const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const uniqueName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${safeOriginal}`;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg','image/png','image/webp','image/gif',
            'video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp3'
        ];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(new Error('Unsupported file type'));
    }
});

// =========================================================
// DATABASE SCHEMAS & UTILITIES
// =========================================================
const UserSchema = new mongoose.Schema({
    userId: { type: String, default: () => crypto.randomUUID(), unique: true },
    username: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone_number: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'creator', 'admin', 'founder'], default: 'user' },
    current_tier: { type: Number, enum: [1, 2, 3], default: 1 },
    identity: {
        sovereign_name: { type: String, default: 'Authenticated Citizen' },
        legacy_rank: { type: String, default: 'Citizen' },
        id_verified: { type: Boolean, default: false }
    },
    verification_metrics: {
        day_1_video_url: { type: String, default: '' },
        corporate_docs_submitted: { type: Boolean, default: false },
        businessName: { type: String, default: '' },
        cacNumber: { type: String, default: '' }
    },
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 }
    },
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0 }
    },
    backupCodes: [{
        codeHash: String,
        createdAt: { type: Date, default: Date.now },
        used: { type: Boolean, default: false }
    }]
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    creator_id: { type: String, required: true },
    pillar_tool: {
        type: String,
        enum: ['GENERAL', 'THE_SOVEREIGN_EXCHANGE', 'THE_VISIBILITY_ENGINE', 'THE_ARENA_NODE', 'THE_CULINARY_MATRIX', 'THE_AESTHETIC_NEXUS', 'THE_DIAMONDBACK_FORGE', 'THE_SONIC_LEDGER'],
        default: 'GENERAL'
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pricing: {
        base_price: { type: Number, default: 0 },
        transaction_type: { type: String, default: 'P2P_ESCROW' }
    },
    apparel_metadata: {
        canvas_json_data: { type: String, default: "" },
        framework_version: { type: String, default: "DIAMONDBACK-231-V1" }
    },
    ads_manager_metadata: {
        boost_enabled: { type: Boolean, default: false },
        target_impressions: { type: Number, default: 0 }
    },
    music_metadata: {
        total_device_downloads: { type: Number, default: 0 },
        artist_name: { type: String, default: "NAWI Artist" }
    },
    media_assets: [{
        asset_id: String,
        file_url: String,
        file_type: String
    }],
    status: { type: String, enum: ['active', 'draft', 'sold'], default: 'active' }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    authorName: { type: String, default: '' },
    caption: String,
    mediaUrl: String,
    mediaType: { type: String, enum: ['image', 'video', 'audio', 'live_stream'], default: 'image' },
    pillarType: { type: String, enum: ['Comedy', 'Arena', 'Music', 'Kitchen', 'Apparel', 'Normal'], default: 'Normal' },
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    live_stream_metadata: {
        room_id: String,
        is_live_now: { type: Boolean, default: false },
        current_viewers: { type: Number, default: 0 }
    }
}, { timestamps: true });

const DailyLedgerSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    totalVolumeProcessedUsd: { type: Number, default: 0 },
    maxLimitCapUsd: { type: Number, default: 35000000 }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const DailyLedger = mongoose.models.DailyLedger || mongoose.model('DailyLedger', DailyLedgerSchema);

// =========================================================
// EXPLICIT MODULE COUPLING LAYER (MATCHING YOUR REPO LAYOUT)
// =========================================================
const authController = require('./controllers/authController.js');
const battleController = require('./controllers/battleController.js');
const borderControl = require('./controllers/borderControl.js');
const masterPayout = require('./controllers/masterPayout.js');
const p2pGateway = require('./controllers/p2pGateway.js');

// =========================================================
// SECURITY ACCESS CONTROL MIDDLEWARES
// =========================================================
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers['x-access-token']) {
            token = req.headers['x-access-token'];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token missing.' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid secure token identity.' });
        req.user = user;
        next();
    } catch (error) { return res.status(401).json({ success: false, message: 'Authentication failed.' }); }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
};

const enforceEcosystemTierSecurity = async (req, res, next) => {
    try {
        const requesterId = req.headers['x-nawi-identity'] || req.headers['user-id'] || req.body.userId || (req.user && req.user.userId);
        if (!requesterId) return res.status(401).json({ success: false, message: 'Missing user identity validation context.' });

        if (requesterId === SOVEREIGN_ID) {
            req.sovereignOverride = true;
            return next();
        }

        const user = await User.findOne({ userId: requesterId });
        if (!user) return res.status(403).json({ success: false, message: 'Access Denied: Signature footprint missing.' });

        req.citizenProfile = user;
        next();
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

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
        return res.status(403).json({ status: 'DENIED', message: 'Unauthorized execution context.' });
    }

    const verificationPayload = `${systemUuid}-${systemRam}-${systemDisplay}`;
    const expectedSignature = crypto.createHmac('sha256', NODE_SECRET_KEY).update(verificationPayload).digest('hex');

    const hardwareMatches = systemUuid === AURORA_231_HARDWARE_PROFILE.expectedUuid &&
                             systemRam === AURORA_231_HARDWARE_PROFILE.expectedRamGb &&
                             systemDisplay === AURORA_231_HARDWARE_PROFILE.expectedDisplaySize;

    if (hardwareMatches && secureSignature === expectedSignature) {
        req.isMasterAuthority = true;
        return next();
    }
    return res.status(401).json({ status: 'DENIED', message: 'Hardware handshake verification failed.' });
};

// =========================================================
// P2P LIQUIDITY CAP ENGINE
// =========================================================
class P2PLiquidityManager {
    async verifyAndTrackVolume(amountUsd) {
        const currentDate = new Date().toISOString().split('T')[0];
        let ledger = await DailyLedger.findOne({ date: currentDate });
        if (!ledger) ledger = new DailyLedger({ date: currentDate, totalVolumeProcessedUsd: 0 });

        if (ledger.totalVolumeProcessedUsd + amountUsd > ledger.maxLimitCapUsd) {
            return { allowed: false, currentVolume: ledger.totalVolumeProcessedUsd };
        }
        ledger.totalVolumeProcessedUsd += amountUsd;
        await ledger.save();
        return { allowed: true, currentVolume: ledger.totalVolumeProcessedUsd };
    }

    async createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet) {
        const volumeCheck = await this.verifyAndTrackVolume(amountUsd);
        if (!volumeCheck.allowed) throw new Error('Transaction Blocked: Limit Breached. $35 Million Daily Cap Reached.');
        return { transactionId, escrowStatus: 'PENDING', amountUsd, buyerWallet, sellerWallet, currentDailyPlatformVolume: volumeCheck.currentVolume, timestamp: Date.now() };
    }
}
const LiquidityEngine = new P2PLiquidityManager();

// =========================================================
// VALIDATION HELPERS
// =========================================================
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

// =========================================================
// CORE PRODUCTION ENDPOINTS
// =========================================================
app.get('/health', (req, res) => res.status(200).json({ status: "ONLINE", node: "Aurora-231 Main Core Terminal", uptime: process.uptime() }));

app.post('/api/auth/register',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 8 }),
        body('username').notEmpty().trim()
    ],
    validateRequest,
    authController.registerUser
);

app.post('/api/auth/session',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    validateRequest,
    authController.handleUserSession
);

app.post('/api/login',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    validateRequest,
    authController.handleUserSession
);

app.get('/api/v1/profile', authenticateToken, (req, res) => res.status(200).json({ success: true, profile: req.user }));

app.get('/api/feed/home', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 }).limit(20);
        return res.status(200).json({ success: true, emptyState: posts.length === 0, count: posts.length, data: posts });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/v1/posts/create',
    authenticateToken,
    upload.single('media'),
    [
        body('mediaType').optional().isIn(['image','video','audio','live_stream']),
        body('caption').optional().isLength({ max: 500 }),
        body('pillarType').optional().isIn(['Comedy','Arena','Music','Kitchen','Apparel','Normal'])
    ],
    validateRequest,
    async (req, res) => {
        try {
            const mediaUrl = req.file ? `/uploads/${req.file.filename}` : '';
            const post = await Post.create({
                authorId: req.user.userId,
                authorName: req.user.username,
                caption: req.body.caption,
                mediaUrl,
                mediaType: req.body.mediaType || 'image',
                pillarType: req.body.pillarType || 'Normal'
            });
            return res.status(201).json({ success: true, post });
        } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
    }
);

// =========================================================
// THE 7 STRUCTURAL CORE PILLARS ROUTING INTERFACES
// =========================================================
app.get('/api/pillar/arena-node', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const games = await Product.find({ pillar_tool: 'THE_ARENA_NODE' }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: games });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pillar/sovereign-exchange', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const catalog = await Product.find({ pillar_tool: 'THE_SOVEREIGN_EXCHANGE' }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: catalog });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pillar/visibility-engine', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const campaigns = await Product.find({ pillar_tool: 'THE_VISIBILITY_ENGINE', 'ads_manager_metadata.boost_enabled': true });
        return res.status(200).json({ success: true, data: campaigns });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pillar/culinary-matrix', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const logs = await Product.find({ pillar_tool: 'THE_CULINARY_MATRIX' });
        return res.status(200).json({ success: true, data: logs });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/culinary/log-file', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const log = await Product.create({ creator_id: req.user.userId, pillar_tool: 'THE_CULINARY_MATRIX', title: req.body.title, description: req.body.description });
        return res.status(201).json({ status: "SUCCESS", asset: log });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pillar/academic-nexus', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const stylings = await Product.find({ pillar_tool: 'THE_AESTHETIC_NEXUS' });
        return res.status(200).json({ success: true, data: stylings });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/pillar/diamondback-forge/compile', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const frameworkAsset = await Product.create({
            creator_id: req.user.userId,
            pillar_tool: 'THE_DIAMONDBACK_FORGE',
            title: req.body.title,
            description: req.body.description,
            pricing: { base_price: req.body.pricingCoins || 0, transaction_type: 'P2P_ESCROW' },
            apparel_metadata: { canvas_json_data: req.body.canvasJsonCoordinates, framework_version: "DIAMONDBACK-231-V1" }
        });
        return res.status(200).json({ success: true, frameworkId: frameworkAsset._id });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pillar/sonic-ledger/download/:assetId', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const track = await Product.findOne({ 'media_assets.asset_id': req.params.assetId, pillar_tool: 'THE_SONIC_LEDGER' });
        if (!track) return res.status(404).json({ success: false, message: "Track record missing." });
        track.music_metadata.total_device_downloads += 1;
        await track.save();
        return res.redirect(track.media_assets[0].file_url);
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// =========================================================
// BIOMETRIC AND ESCROW VALUATION SYSTEMS
// =========================================================
app.post('/api/verify/video-lock', authenticateToken, upload.single('videoLock'), async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        if (req.user.userId !== userId && !['admin','founder'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const profile = await User.findOneAndUpdate(
            { userId },
            { 'verification_metrics.day_1_video_url': fileUrl, current_tier: 1, verified: true, 'identity.id_verified': true },
            { upsert: false, new: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ status: "AUTHENTICATED", profile });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/api/verify/sovereign-challenge', authenticateToken, authorizeRoles('admin','founder'), async (req, res) => {
    try {
        const { userId, businessName, cacNumber } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        const profile = await User.findOneAndUpdate(
            { userId },
            { 'verification_metrics.businessName': businessName, 'verification_metrics.cacNumber': cacNumber, 'verification_metrics.corporate_docs_submitted': true, current_tier: 3 },
            { new: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ status: "SUCCESS", profile });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/finance/escrow/create',
    authenticateToken,
    authorizeRoles('admin','founder'),
    [
        body('transactionId').notEmpty(),
        body('amountUsd').isFloat({ gt: 0 }),
        body('buyerUserId').notEmpty(),
        body('sellerUserId').notEmpty(),
        body('buyerWallet').optional().isString(),
        body('sellerWallet').optional().isString()
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { transactionId, amountUsd, buyerWallet, sellerWallet, buyerUserId, sellerUserId } = req.body;

            const buyer = await User.findOne({ userId: buyerUserId });
            const seller = await User.findOne({ userId: sellerUserId });
            if (!buyer || !seller) return res.status(404).json({ success: false, message: 'Participant user not found' });

            if (!buyer.verification_metrics?.day_1_video_url || !seller.verification_metrics?.day_1_video_url) {
                return res.status(403).json({
                    success: false,
                    required_action: "DAY_1_VIDEO_LOCK_REQUIRED",
                    message: "Both buyer and seller must complete video KYC for escrow transactions."
                });
            }

            const escrow = await LiquidityEngine.createEscrowTransaction(transactionId, parseFloat(amountUsd), buyerWallet || null, sellerWallet || null);
            return res.status(200).json({ status: 'SUCCESS', escrow });
        } catch (error) { return res.status(500).json({ status: 'ERROR', message: error.message }); }
    }
);

// =========================================================
// LEDGER & ADMIN
// =========================================================
app.get('/api/ledger/volume-status', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const ledger = await DailyLedger.findOne({ date: today }) || { totalVolumeProcessedUsd: 0, maxLimitCapUsd: 35000000 };
        return res.status(200).json({ status: 'ACTIVE', date: today, processed: ledger.totalVolumeProcessedUsd, remaining: ledger.maxLimitCapUsd - ledger.totalVolumeProcessedUsd });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/bypass', verifySovereignNodeHandshake, (req, res) => {
    return res.status(200).json({ status: 'SYNCHRONIZED', message: 'Welcome Back NAWI-EMPIRE001. Master Authority Bypass Engaged.' });
});

// =========================================================
// REAL-TIME LOW-LATENCY WEBSOCKET LIVE STREAMING CORE
// Pure human WebRTC Signaling Coordination Channels
// =========================================================
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth && socket.handshake.auth.token ? socket.handshake.auth.token : (socket.handshake.query && socket.handshake.query.token ? socket.handshake.query.token : null);
        if (!token) return next(new Error('Authentication error: token missing'));
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) return next(new Error('Authentication error: invalid token user'));
        socket.user = user;
        return next();
    } catch (err) {
        return next(new Error(`Authentication error: ${err && err.message ? err.message : 'unknown'}`));
    }
});

io.on('connection', (socket) => {
    console.log(`[AURORA-231] Socket linked: ${socket.id} user:${socket.user?.userId || 'unknown'}`);

    socket.on('start_live_room', async (data) => {
        try {
            const { roomId, hostId, hostName, roomTitle } = data;
            if (!socket.user) return socket.emit('error', { message: 'Not authenticated' });
            if (socket.user.userId !== hostId && !['admin','founder'].includes(socket.user.role)) {
                return socket.emit('error', { message: 'Not authorized to start this live stream' });
            }

            socket.join(roomId);
            socket.roomId = roomId;
            socket.hostId = hostId;

            await Post.create({
                authorId: hostId,
                authorName: hostName,
                caption: roomTitle,
                mediaType: 'live_stream',
                pillarType: 'Arena',
                live_stream_metadata: { room_id: roomId, is_live_now: true, current_viewers: 1 }
            });
            io.to(roomId).emit('stream_status_update', { event: "STARTED", roomId, hostId });
        } catch (err) {
            console.error('start_live_room error:', err.message);
            socket.emit('error', { message: 'Failed to initialize live space' });
        }
    });

    socket.on('join_live_room', async (data) => {
        try {
            const { roomId } = data;
            if (!socket.user) return socket.emit('error', { message: 'Not authenticated' });
            socket.join(roomId);
            socket.roomId = roomId;

            const stream = await Post.findOneAndUpdate(
                { "live_stream_metadata.room_id": roomId },
                { $inc: { "live_stream_metadata.current_viewers": 1 } },
                { new: true }
            );

            if (stream && stream.live_stream_metadata.current_viewers < 0) {
                stream.live_stream_metadata.current_viewers = 0;
                await stream.save();
            }

            io.to(roomId).emit('viewer_count_changed', { roomId, currentViewers: stream ? stream.live_stream_metadata.current_viewers : 1 });
        } catch (err) {
            console.error('join_live_room error:', err.message);
            socket.emit('error', { message: 'Failed to connect to live room' });
        }
    });

    // WebRTC Peer-to-Peer Secure Signaling
    socket.on('stream_signal_handshake', (data) => {
        try {
            if (!socket.user) return socket.emit('error', { message: 'Not authenticated' });
            if (!data.targetRoomId) return socket.emit('error', { message: 'Target routing context missing.' });
            socket.to(data.targetRoomId).emit('incoming_peer_signal', {
                senderId: socket.user.userId,
                signalPayload: data.payload
            });
        } catch (err) {
            console.error('stream_signal_handshake error:', err.message);
        }
    });

    socket.on('disconnect', async () => {
        try {
            if (socket.roomId) {
                if (socket.hostId) {
                    await Post.updateOne({ "live_stream_metadata.room_id": socket.roomId }, { $set: { "live_stream_metadata.is_live_now": false, status: 'expired' } });
                    io.to(socket.roomId).emit('stream_status_update', { event: "ENDED", roomId: socket.roomId });
                } else {
                    const stream = await Post.findOneAndUpdate({ "live_stream_metadata.room_id": socket.roomId }, { $inc: { "live_stream_metadata.current_viewers": -1 } }, { new: true });
                    if (stream && stream.live_stream_metadata.current_viewers < 0) {
                        stream.live_stream_metadata.current_viewers = 0;
                        await stream.save();
                    }
                    io.to(socket.roomId).emit('viewer_count_changed', { roomId: socket.roomId, currentViewers: stream ? stream.live_stream_metadata.current_viewers : 0 });
                }
            }
        } catch (err) {
            console.error('disconnect handling error:', err.message);
        }
    });
});

// =========================================================
// ACCOUNT RECOVERY: BACKUP CODES (one-time use)
// =========================================================
const generatePlainBackupCodes = (count = 8, len = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(Math.ceil(len * 0.6)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
        codes.push(code);
    }
    return codes;
};

app.post('/api/account/backup-codes/generate', authenticateToken, async (req, res) => {
    try {
        const { count } = req.body;
        const n = Number.isInteger(count) && count > 0 ? Math.min(20, count) : 8;
        const codes = generatePlainBackupCodes(n, 12);

        const codeHashes = codes.map(c => ({ codeHash: crypto.createHash('sha256').update(c).digest('hex'), used: false }));
        await User.updateOne({ userId: req.user.userId }, { $push: { backupCodes: { $each: codeHashes } } });
        return res.status(201).json({ success: true, backupCodes: codes, note: 'Store these codes securely. Each code is shown only once.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/account/backup-codes/consume',
    [
        body('email').isEmail(),
        body('code').isLength({ min: 6 })
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { email, code } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            const codeHash = crypto.createHash('sha256').update(code).digest('hex');

            const updated = await User.findOneAndUpdate(
                { email, "backupCodes.codeHash": codeHash, "backupCodes.used": false },
                { $set: { "backupCodes.$.used": true } },
                { new: true }
            );

            if (!updated) return res.status(400).json({ success: false, message: 'Invalid or used backup code' });

            const token = jwt.sign({ userId: updated.userId, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ success: true, token, user: updated });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
);

// =========================================================
// ERROR AND FALLBACK OVERRIDES
// =========================================================
app.use((err, req, res, next) => {
    console.error('Unhandled error middleware:', err && err.message);
    return res.status(500).json({ success: false, message: 'Internal engine pipeline fault.' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// =========================================================
// SYSTEM SEED STRATEGY & IGNITION
// =========================================================
const seedEmpire = async () => {
    try {
        const doSeed = (process.env.SEED_FOUNDER || '').toString().toLowerCase() === 'true';
        if (!doSeed) {
            console.log('SEED_FOUNDER not enabled; skipping founder seeding.');
            return;
        }
        const seedEmail = process.env.SEED_FOUNDER_EMAIL;
        const seedPassword = process.env.SEED_FOUNDER_PASSWORD;
        if (!seedEmail || !seedPassword) {
            console.warn('SEED_FOUNDER enabled but SEED_FOUNDER_EMAIL or SEED_FOUNDER_PASSWORD not provided. Skipping seed.');
            return;
        }

        const founderExists = await User.findOne({ email: seedEmail });
        if (!founderExists) {
            const hashedPassword = await bcrypt.hash(seedPassword, 12);
            await User.create({
                userId: SOVEREIGN_ID,
                username: 'founder',
                email: seedEmail,
                password: hashedPassword,
                phone_number: "+00000000000",
                role: 'founder',
                verified: true,
                current_tier: 3,
                identity: { sovereign_name: '7 pillars', legacy_rank: 'Founder', id_verified: true },
                verification_metrics: { day_1_video_url: "", corporate_docs_submitted: true }
            });
            console.log('🛡️ Master System Founder Node Seeded via env variables.');
        } else {
            console.log('Founder already exists; seed skipped.');
        }
    } catch (e) { console.error("Seed execution fault:", e.message); }
};

if (!MONGO_URI) {
    console.error('[CRITICAL]: Execution halted. MONGO_URI configuration missing.');
    process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
.then(async () => {
    await seedEmpire();
    server.listen(PORT, '0.0.0.0', () => {
        console.log('====================================================');
        console.log(`NAWI-EMPIRE ENGINE ONLINE PORT ${PORT}`);
        console.log(`WATERMARK: ${SYSTEM_WATERMARK}`);
        console.log(`NODE_ENV: ${NODE_ENV}`);
        console.log('====================================================');
    });

    server.on('error', (err) => {
        console.error('Server encountered an error:', err && err.message);
        process.exit(1);
    });

    const shutdown = async (signal) => {
        console.info(`Received ${signal}. Closing server and MongoDB connection...`);
        server.close(() => {
            console.info('HTTP server closed.');
            mongoose.connection.close(false, () => {
                console.info('MongoDB connection closed. Exiting process.');
                process.exit(0);
            });
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception thrown:', err);
        process.exit(1);
    });
})
.catch((err) => { console.error('Database connection sync failed:', err && err.message); process.exit(1); });
