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

// Multer for HD Content Handling
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB Limit

// --- ☣️ 2. GLOBAL SYSTEM STATE ---
let isSystemLocked = false; 

// --- 🏛️ 3. DATABASE SCHEMAS ---

// User/Citizen Schema
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
    ruleViolations: { type: Number, default: 0 },
    pillarsManaged: [String],
    activityLog: [{ action: String, timestamp: { type: Date, default: Date.now } }]
});
const User = mongoose.model('User', userSchema);

// Content/Post Schema
const postSchema = new mongoose.Schema({
    authorName: String,
    authorId: String,
    mediaUrl: String,
    description: String,
    type: { type: String, enum: ['graphic', 'video', 'lifestyle', 'audio'], default: 'lifestyle' },
    priceInCoins: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isMasterPost: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Imperial Message Schema
const messageSchema = new mongoose.Schema({
    recipientId: String,
    sender: String,
    text: String,
    type: { type: String, default: "P2P ALERT" },
    icon: { type: String, default: "fa-solid fa-bell" },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Kitchen/Market Schema
const kitchenSchema = new mongoose.Schema({
    itemName: String,
    price: Number,
    category: String,
    image: String
});
const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema);

// --- 🛡️ 4. THE GATEKEEPER (Security Middleware) ---
app.use((req, res, next) => {
    const userId = req.headers['user-id'];
    if (isSystemLocked && userId !== "NAWI-EMPIRE001") {
        return res.status(503).json({ 
            message: "SYSTEM UNDER MAINTENANCE. PLEASE WAIT FOR THE FOUNDER." 
        });
    }
    next();
});

const checkLoyalty = async (req, res, next) => {
    const userId = req.headers['user-id'];
    const user = await User.findOne({ userId });
    if (user && user.ruleViolations > 0) {
        return res.status(403).json({ message: "ACCESS DENIED: Loyalty Protocol Violated." });
    }
    next();
};

// --- 👤 5. IDENTITY & AUTHENTICATION ---
app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        const existingDevice = await User.findOne({ deviceId });
        if (existingDevice) {
            return res.status(403).json({ success: false, message: "⚠️ SYSTEM ALERT: One Node per Human allowed." });
        }
        const newUser = new User({ email, password, deviceId });
        await newUser.save();
        res.json({ success: true, userId: newUser._id });
    } catch (err) { res.status(500).json({ error: "Security Vault Error." }); }
});

app.post('/api/login', async (req, res) => {
    if (req.body.email === "akpanvictor848@gmail.com" && req.body.password === "$Nsikak111") {
        return res.status(200).json({ success: true, token: "FOUNDER_001", userId: "NAWI-EMPIRE001" });
    }
    res.status(401).json({ success: false, message: "Invalid Imperial Credentials." });
});

// --- 📡 6. CONTENT & UPLOAD ENGINE ---

// Fetch Feed
app.get('/api/get-feed', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

// Upload Asset (Multimedia)
app.post('/api/upload-asset', upload.single('mediaFile'), async (req, res) => {
    try {
        const { authorId, description, type, price, name } = req.body;
        
        // Content Level Restriction
        const user = await User.findById(authorId);
        if (type === 'market' && user.level < 1) {
            return res.status(403).json({ message: "Level 1 Required to publish in Market." });
        }

        // Standard Filter
        if (description.includes("naked") || description.length < 5) {
            return res.status(400).json({ message: "Content does not meet Empire standards." });
        }

        const newPost = new Post({
            authorName: name || "Citizen",
            authorId: authorId,
            mediaUrl: req.body.mediaUrl, // URL from Frontend Cloudinary/AWS upload
            description: description,
            type: type,
            priceInCoins: price || 0,
            isMasterPost: (authorId === "NAWI-EMPIRE001")
        });

        await newPost.save();
        
        // Auto-Check Level Up after posting
        const postCount = await Post.countDocuments({ authorId: authorId });
        if (postCount >= 3 && user.level === 0) {
            user.level = 1;
            user.rank = "Verified Contributor";
            user.pillarsManaged.push("Market_Full_Access");
            
            const alert = new Message({
                recipientId: authorId,
                sender: "Empire Authority",
                text: "Requirement Met. Level 1 Unlocked. You can now sell in the Global Market."
            });
            await alert.save();
            await user.save();
        }

        res.status(201).json({ success: true, message: "Asset Logged to Empire Ledger" });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 💰 7. ECONOMY & GIFTING ENGINE (The $0.02 Sync) ---
const GIFTS = {
    rose: { cost: 1, minLevel: 0, label: "Imperial Rose" },
    crown: { cost: 500, minLevel: 5, label: "Empire Crown" },
    sov7: { cost: 50000, minLevel: 10, label: "Sovereign 7" },
    lion: { cost: 500000, minLevel: 15, label: "Empire Lion" }
};

app.post('/api/send-gift', async (req, res) => {
    try {
        const { senderId, receiverId, giftKey, isPrivate } = req.body;
        const gift = GIFTS[giftKey];

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (sender.level < gift.minLevel) {
            return res.status(403).json({ message: `Reach Level ${gift.minLevel} to unlock this!` });
        }
        if (sender.empireCoins < gift.cost) {
            return res.status(400).json({ message: "Insufficient Coins in Vault." });
        }

        // Execute Transfer
        sender.empireCoins -= gift.cost;
        const payoutUSD = gift.cost * 0.02; 
        receiver.totalEarningsUSD += payoutUSD;

        // Log Activity
        sender.activityLog.push({ action: `Sent ${gift.label} to ${receiver.username}` });

        // Private vs Public Alert
        const alert = new Message({
            recipientId: receiverId,
            sender: isPrivate ? "Empire Shadow-Vault" : sender.username,
            text: `${isPrivate ? 'A Citizen' : sender.username} sent you a ${gift.label}. $${payoutUSD} added to earnings.`,
            icon: isPrivate ? "fa-solid fa-user-secret" : "fa-solid fa-gift"
        });

        await sender.save();
        await receiver.save();
        await alert.save();

        res.json({ success: true, message: "Tribute delivered.", newBalance: sender.empireCoins });
    } catch (err) { res.status(500).json({ error: "Transaction Interrupted." }); }
});

// --- ⚖️ 8. MONITORING & CHAT ---
app.post('/api/global-monitor', async (req, res) => {
    const { userId, content } = req.body;
    const BANNED = [/t\.me\//i, /chat\.whatsapp\.com/i, /wa\.me\//i];
    if (BANNED.some(p => p.test(content))) {
        await User.updateOne({ userId }, { $inc: { ruleViolations: 1 } });
        return res.json({ success: false, message: "Violates Imperial Rules. Violation logged." });
    }
    res.json({ success: true });
});

// --- 🛰️ 9. LIVE STREAM LOGIC ---
app.post('/api/live/join', async (req, res) => {
    res.json({ canSpeak: false, viewOnly: true, message: "Observing. Support by gifting." });
});

app.get('/api/admin/omni-view/:streamId', (req, res) => {
    res.json({ access: "GRANULAR_ADMIN_CONTROL", bypass: true });
});

// --- ☣️ 10. SOVEREIGN OVERRIDE & START ---
app.post('/api/admin/self-destruct', (req, res) => {
    if (req.body.masterPin !== "7777") return res.status(403).json({ message: "DENIED" });
    isSystemLocked = (req.body.action === "LOCK_ALL");
    res.json({ success: true, message: isSystemLocked ? "EMPIRE LOCKED" : "EMPIRE RESTORED" });
});

// Final fallback for Single Page Application
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 10000;
mongoose.connect('YOUR_MONGODB_URI_HERE')
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
        });
    })
    .catch(err => console.error("Database Connection Failure:", err));
