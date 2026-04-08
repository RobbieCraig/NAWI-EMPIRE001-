/* NAWI-EMPIRE MASTER ENGINE 
   Sovereign Edition 2026
   Target: Node.js / MongoDB Atlas
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

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

// User Schema with Pillar Management
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: "Authenticated Citizen" },
    email: String,
    password: { type: String, select: false },
    deviceId: String,
    bio: { type: String, default: "No professional knowledge shared yet." },
    pfpUrl: { type: String, default: "/assets/default-pfp.png" },
    empireCoins: { type: Number, default: 0 },
    totalEarningsUSD: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    rank: { type: String, default: "Citizen" },
    isVerifiedCitizen: { type: Boolean, default: false }, 
    mandateAcceptedAt: Date, 
    ruleViolations: { type: Number, default: 0 },
    pillarsManaged: [String], // Tracking Pillar Authority
    activityLog: [{ action: String, timestamp: { type: Date, default: Date.now } }]
});
const User = mongoose.model('User', userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
    authorName: String,
    authorId: String,
    mediaUrl: String,
    description: String,
    type: { type: String, enum: ['graphic', 'video', 'lifestyle', 'audio', 'market'], default: 'lifestyle' },
    priceInCoins: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isMasterPost: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Imperial Message Schema (Missing Structure Restored)
const messageSchema = new mongoose.Schema({
    recipientId: String,
    sender: String,
    text: String,
    type: { type: String, default: "P2P ALERT" },
    icon: { type: String, default: "fa-solid fa-bell" },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- 🛡️ 4. SECURITY GATEKEEPER ---
app.use(async (req, res, next) => {
    const userId = req.headers['user-id'];
    
    if (userId === "NAWI-EMPIRE001") return next();

    if (isSystemLocked) {
        return res.status(503).json({ message: "SYSTEM UNDER MAINTENANCE." });
    }

    const publicPaths = ['/api/login', '/api/register', '/api/verify-mandate', '/api/bot/inquiry'];
    if (!publicPaths.includes(req.path) && userId) {
        try {
            const user = await User.findOne({ userId });
            if (user && !user.isVerifiedCitizen) {
                return res.status(403).json({ message: "MANDATE NOT ACCEPTED", requireVerification: true });
            }
        } catch (err) {
            return res.status(500).json({ message: "Security Check Failure." });
        }
    }
    next();
});

// --- 👤 5. IDENTITY & DEEP INQUIRY BOT (Missing Structure Restored) ---

app.post('/api/bot/inquiry', (req, res) => {
    const { userInput } = req.body;
    const input = userInput.toLowerCase();

    if (input.includes("what is") || input.includes("about")) {
        return res.json({ response: "NAWI-EMPIRE is a Sovereign Ecosystem built to protect Founders. We value integrity over profit and operate under the Seven Pillars." });
    }

    if (input.includes("who is the owner") || input.includes("who is the ceo")) {
        return res.json({ response: "The Architect's identity is hidden within the shadows of the Seven Pillars. Type 'REVEAL 001' if you are prepared for the truth." });
    }

    if (input === "reveal 001") {
        return res.json({ response: "Leadership Confirmed: NAWI-EMPIRE001. Social Identity: 7 Pillars. General Name: NAWI-EMPIRE. You have looked deeper; now you must build stronger." });
    }

    res.json({ response: "The Empire is listening. Your query has been logged to the Seven Pillars." });
});

app.post('/api/verify-mandate', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userId: userId },
            { 
                $set: { rank: "Verified Citizen", isVerifiedCitizen: true, mandateAcceptedAt: new Date() }, 
                $push: { activityLog: { action: "ACCEPTED_MANDATE" } } 
            },
            { new: true }
        );
        res.json({ success: true, message: "Citizenship confirmed in Empire Ledger." });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "akpanvictor848@gmail.com" && password === "$Nsikak111") {
        return res.status(200).json({ success: true, userId: "NAWI-EMPIRE001", rank: "FOUNDER" });
    }
    res.status(401).json({ success: false, message: "Invalid Credentials." });
});

// --- 📡 6. PILLAR TOOLS & ECONOMY (Missing Structure Restored) ---

const PILLAR_ECONOMY = {
    rose: { cost: 1, payout: 0.02 },
    crown: { cost: 500, payout: 10.00 },
    lion: { cost: 500000, payout: 10000.00 }
};

app.post('/api/send-gift', async (req, res) => {
    const { senderId, receiverId, giftKey } = req.body;
    const gift = PILLAR_ECONOMY[giftKey];
    try {
        const sender = await User.findOne({ userId: senderId });
        if (sender.empireCoins < gift.cost) return res.status(400).json({ message: "Insufficient Coins." });

        await User.updateOne({ userId: senderId }, { $inc: { empireCoins: -gift.cost } });
        await User.updateOne({ userId: receiverId }, { $inc: { totalEarningsUSD: gift.payout } });

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Transaction Failed." }); }
});

app.get('/api/get-feed', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

// --- ⚖️ 8. MONITORING & OVERRIDE ---
app.post('/api/admin/self-destruct', (req, res) => {
    if (req.body.masterPin !== "7777") return res.status(403).json({ message: "DENIED" });
    isSystemLocked = (req.body.action === "LOCK_ALL");
    res.json({ success: true, message: isSystemLocked ? "LOCKED" : "RESTORED" });
});

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// --- ⚙️ 9. ENGINE START ---
const URI = "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";
const PORT = process.env.PORT || 10000;

mongoose.connect(URI).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
    });
}).catch(err => console.error("Database Connection Failure:", err));
