/* NAWI-EMPIRE MASTER ENGINE v2.6
   Sovereign Edition 2026
   Integrated: Pulse Feed, Surveillance, Inbox Bridge, & Vault Engine
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// --- ⚙️ 1. MIDDLEWARE CONFIGURATION ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); 

// --- ☣️ 2. GLOBAL SYSTEM STATE ---
let isSystemLocked = false; 

// --- 🏛️ 3. DATABASE SCHEMAS & MODELS ---

// Unified User Schema (Matches user-schema.json)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    identity: {
        sovereign_name: { type: String, default: "Authenticated Citizen" },
        legacy_rank: { type: String, default: "Citizen" },
        id_verified: { type: Boolean, default: false },
        joined_date: { type: String, default: () => new Date().toISOString().split('T')[0] }
    },
    email: String,
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 },
        activity_score: { type: Number, default: 0 }
    },
    eligibility: {
        can_go_live: { type: Boolean, default: false },
        is_monetized: { type: Boolean, default: false },
        gate_1k_reached: { type: Boolean, default: false },
        gate_20k_reached: { type: Boolean, default: false }
    },
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0.00 },
        last_mint_date: String
    },
    security: {
        is_banned: { type: Boolean, default: false },
        scam_alert_flag: { type: Number, default: 0 },
        multi_factor_auth: { type: String, default: "ENABLED" }
    }
});
const User = mongoose.model('User', userSchema);

// Universal Post Schema
const postSchema = new mongoose.Schema({
    authorName: String,
    authorId: String,
    mediaUrl: String,
    description: String,
    pillarType: { type: String, enum: ['Comedy', 'Arena', 'Music', 'Kitchen', 'Apparel', 'Normal'], default: 'Normal' },
    type: { type: String, enum: ['graphic', 'video', 'audio', 'promotion'], default: 'video' },
    isAd: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    durationWatched: { type: Number, default: 0 }, 
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 🛡️ 4. SEEDING & INITIATION ---
const seedEmpire = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const templatePath = path.join(__dirname, 'templates', 'user-schema.json');
            
            if (fs.existsSync(templatePath)) {
                const data = fs.readFileSync(templatePath, 'utf8');
                const template = JSON.parse(data);
                template.userId = "NAWI-EMPIRE001";
                template.email = "akpanvictor848@gmail.com"; 
                
                const founder = new User(template);
                await founder.save();
                console.log("🏛️ NAWI-EMPIRE001: Genesis Founder Seeded.");
            } else {
                const fallbackFounder = new User({
                    userId: "NAWI-EMPIRE001",
                    email: "akpanvictor848@gmail.com",
                    identity: { sovereign_name: "Architect", legacy_rank: "Founder", id_verified: true },
                    metrics: { follower_count: 50000 },
                    wallet: { empire_coins: 1000 }
                });
                await fallbackFounder.save();
                console.log("🛡️ Fallback Founder Created.");
            }
        }
    } catch (err) { console.error("❌ Seed Error:", err.message); }
};

// --- 📡 5. THE PULSE API ---

app.get('/api/feed', async (req, res) => {
    try {
        const limit = 12;
        const feedItems = await Post.aggregate([{ $match: { status: 'active' } }, { $sample: { size: limit } }]);
        res.json(feedItems);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/track-engagement', async (req, res) => {
    const { contentId, duration } = req.body;
    try {
        await Post.findByIdAndUpdate(contentId, { $inc: { durationWatched: duration } });
        res.sendStatus(200);
    } catch (err) { res.sendStatus(500); }
});

// --- 👤 6. IDENTITY & SECURITY ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "akpanvictor848@gmail.com" && password === "$Nsikak111") {
        return res.status(200).json({ success: true, userId: "NAWI-EMPIRE001", rank: "FOUNDER" });
    }
    res.status(401).json({ success: false, message: "Invalid Credentials." });
});

// --- 📥 7. INBOX ENGINE (Fixes "Bridge Connection Interrupted") ---
app.get('/api/inbox/:userId', async (req, res) => {
    try {
        const messages = [{
            id: "msg_001",
            sender: "SYSTEM",
            text: "Welcome to NAWI-EMPIRE. Your Connection Vault is now active.",
            type: "ANNOUNCEMENT",
            timestamp: new Date()
        }];
        res.json(messages);
    } catch (err) { res.status(500).json({ error: "Inbox Bridge Failure" }); }
});

// --- 💰 8. VAULT ENGINE (Fetches Founder Balance) ---
app.get('/api/vault/balance/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ error: "Citizen not found" });
        res.json({
            coins: user.wallet.empire_coins,
            usd: user.wallet.total_earned_to_date,
            pending: user.wallet.pending_conversion
        });
    } catch (err) { res.status(500).json({ error: "Vault Link Failed" }); }
});

// --- ⚖️ 9. PILLAR ECONOMY ---
const COIN_VAL = 0.02;
app.post('/api/convert-coins', async (req, res) => {
    const { userId, amount } = req.body;
    if (amount < 2500) return res.status(400).json({ message: "Min 2500 Coins required." });
    try {
        const user = await User.findOne({ userId });
        if (!user || user.wallet.empire_coins < amount) return res.status(400).json({ message: "Insufficient balance." });
        const usdAmount = amount * COIN_VAL;
        await User.updateOne({ userId }, { $inc: { "wallet.empire_coins": -amount, "wallet.pending_conversion": usdAmount } });
        res.json({ success: true, usd: usdAmount });
    } catch (err) { res.status(500).json({ error: "Vault error." }); }
});

// --- ⚙️ 10. ENGINE START ---
const URI = "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";
const PORT = process.env.PORT || 10000;

mongoose.connect(URI).then(() => {
    seedEmpire();
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 NAWI-EMPIRE ACTIVE ON PORT ${PORT}`));
}).catch(err => console.error("Database Failure:", err));

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
