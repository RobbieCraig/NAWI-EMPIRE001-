const express = require('express');
const cors = require('cors');
const path = require('path');
const { ObjectId } = require('mongodb');

// 👑 1. IMPORT MODELS & DB CONNECTION
const { mongoose, KitchenMeal, pushToGlobalMarket } = require('./db-connect');

const app = express();
const db = mongoose.connection;

// --- ☣️ GLOBAL SYSTEM STATE ---
let isSystemLocked = false; 

// --- 👤 2. IMPERIAL MODELS & SCHEMAS ---
const citizenSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: "Authenticated Citizen" },
    bio: { type: String, default: "No professional knowledge shared yet." },
    pfpUrl: { type: String, default: "/assets/default-pfp.png" },
    posts: [{
        imageUrl: String,
        views: { type: Number,default: 0 },
        likes: { type: Number,default: 0 },
        timestamp: { type: Date,default: Date.now }
    }],
    walletBalance: { type: Number,default: 0 },
    ruleViolations: { type: Number,default: 0 }
});

const Citizen = mongoose.model('Citizen', citizenSchema);

// --- 🛡️ 3. MIDDLEWARE STACK ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- 🛡️ THE GATEKEEPER (Sovereign Lockdown & Security) ---
app.use((req, res, next) => {
    const userId = req.headers['user-id'];

    // If system is locked, only Node 001 can pass
    if (isSystemLocked && userId !== "NAWI-EMPIRE001") {
        return res.status(503).json({ 
            message: "SYSTEM UNDER MAINTENANCE. PLEASE WAIT FOR THE FOUNDER." 
        });
    }
    next();
});

const authorizeFounder = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === "FOUNDER_001") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Empire Authority Required." });
    }
};

const checkLoyalty = async (req, res, next) => {
    const userId = req.headers['user-id'];
    const citizen = await Citizen.findOne({ userId: userId });
    
    if (citizen && citizen.ruleViolations > 0) {
        return res.status(403).json({ message: "ACCESS DENIED: Loyalty Protocol Violated." });
    }
    next();
};

// --- 👤 4. IDENTITY, REGISTRATION & PROFILES ---
app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        const existingDevice = await db.collection('users').findOne({ deviceId: deviceId });
        if (existingDevice) {
            return res.status(403).json({ 
                success: false, 
                message: "⚠️ SYSTEM ALERT: Multiple accounts detected. Only one Node per Human allowed." 
            });
        }

        const newUser = {
            email,
            password, 
            deviceId,
            balance: 0, 
            violationCount: 0,
            isVerified: false,
            status: "PENDING_HUMAN_CHECK",
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        
        // Create initial Citizen Profile linked to the User
        await Citizen.create({ userId: result.insertedId.toString() });

        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Security Vault Error.");
    }
});

// API ROUTE: UPDATE PROFILE (From Settings)
app.post('/api/update-profile', async (req, res) => {
    try {
        const { username, bio } = req.body;
        const userId = req.headers['user-id']; 
        const updatedCitizen = await Citizen.findOneAndUpdate(
            { userId: userId }, 
            { username, bio },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: "Identity Synced Successfully" });
    } catch (err) {
        res.status(500).json({ error: "Sync Failed" });
    }
});

// API ROUTE: GET PROFILE (For Profile Page)
app.get('/api/get-profile', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const citizen = await Citizen.findOne({ userId: userId });
        if (!citizen) return res.status(404).json({ error: "Citizen Not Found" });
        res.status(200).json(citizen);
    } catch (err) {
        res.status(500).json({ error: "Retrieval Failed" });
    }
});

// --- 🛰️ 5. THE ALL-SEEING EYE (Global Content Monitor) ---
const BANNED_PATTERNS = [/t\.me\//i, /chat\.whatsapp\.com/i, /wa\.me\//i, /bit\.ly\//i, /crypto-giveaway/i];

app.post('/api/global-monitor', async (req, res) => {
    const { userId, content, type, attachmentType } = req.body; 
    let violationFound = false;
    let reason = "";

    const hasForbiddenLink = BANNED_PATTERNS.some(pattern => pattern.test(content));
    if (hasForbiddenLink) {
        violationFound = true;
        reason = "🚩 FORBIDDEN EXTERNAL LINK (TELEGRAM/WHATSAPP)";
    }

    if (attachmentType === 'video') {
        const nsfwKeywords = ['nude', 'sex', '18+', 'xxx', 'viral_video'];
        if (nsfwKeywords.some(word => content.toLowerCase().includes(word))) {
            violationFound = true;
            reason = "🔞 ADULT CONTENT VIOLATION";
        }
    }

    if (violationFound) {
        await db.collection('reports').insertOne({
            suspect: userId,
            reason: reason,
            evidence: content,
            timestamp: new Date(),
            status: "PENDING_JUDGMENT"
        });

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) }, 
            { $inc: { violationCount: 1 }, $set: { status: "FLAGGED" } }
        );

        // Also update the Citizen Profile record
        await Citizen.updateOne({ userId: userId }, { $inc: { ruleViolations: 1 } });

        return res.json({ success: false, message: "Content violates Imperial Safety Rules." });
    }
    res.json({ success: true });
});

// --- 🛡️ 6. IMPERIAL CHAT MONITOR (TRAP LOGIC) ---
app.post('/api/send-message', async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    const scamKeywords = ["password", "login", "otp", "verify account", "give me money", "admin", "founder", "hack"];
    
    let scamScore = 0;
    const cleanMessage = message.toLowerCase();
    const hasPhoneNumber = /\+?\d{10,15}/.test(cleanMessage);

    if (scamKeywords.some(word => cleanMessage.includes(word))) scamScore += 50;
    if (scamScore >= 50 && hasPhoneNumber) scamScore += 50;

    if (scamScore >= 50) {
        await db.collection('reports').insertOne({
            suspect: senderId,
            reason: `🚩 SCAM PATTERN DETECTED: "${message}"`,
            timestamp: new Date(),
            status: "PENDING_JUDGMENT"
        });
    }

    try {
        await db.collection('messages').insertOne({ senderId, receiverId, message, timestamp: new Date() });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 💰 7. SOVEREIGN WITHDRAWAL & IDENTITY ---
app.post('/api/request-withdrawal', async (req, res) => {
    const { userId, accountName, accountNumber, bankName, amount } = req.body;
    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ success: false, message: "Identity Not Found." });

        if ((user.fullName || "").toLowerCase().trim() !== (accountName || "").toLowerCase().trim()) {
            await db.collection('users').updateOne({ _id: user._id }, { $inc: { violationCount: 1 } });
            return res.status(403).json({ success: false, message: "⚠️ IDENTITY MISMATCH: Name does not match Sovereign ID." });
        }

        await db.collection('withdrawals').insertOne({
            userId: user._id,
            fullName: user.fullName,
            bankDetails: { accountName, accountNumber, bankName },
            amount: parseFloat(amount),
            status: "PENDING_AUTHORIZATION",
            timestamp: new Date()
        });
        res.status(200).json({ success: true, message: "✨ Authorized. Awaiting Founder Release." });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- ⚖️ 8. THE FOUNDER'S JUDGMENT (HQ ROUTES) ---
app.post('/api/admin/verify-human', authorizeFounder, async (req, res) => {
    await db.collection('users').updateOne(
        { _id: new ObjectId(req.body.userId) },
        { $set: { balance: 10, isVerified: true, status: "ACTIVE" } }
    );
    res.json({ success: true });
});

app.post('/api/admin/terminate-node', authorizeFounder, async (req, res) => {
    await db.collection('users').updateOne(
        { _id: new ObjectId(req.body.suspectId) },
        { $set: { status: "TERMINATED", balance: 0 } }
    );
    res.json({ success: true });
});

app.get('/api/admin-panel', authorizeFounder, checkLoyalty, (req, res) => {
    res.json({ message: "Welcome to the Imperial Command Center." });
});

// --- ☣️ 9. SOVEREIGN OVERRIDE (GLOBAL LOCKOUT) ---
app.post('/api/admin/self-destruct', async (req, res) => {
    const { masterPin, action } = req.body;
    if (masterPin !== "7777") return res.status(403).json({ message: "AUTHORITY DENIED" });

    isSystemLocked = (action === "LOCK_ALL");
    console.log(isSystemLocked ? "⚠️ EMPIRE IN LOCKDOWN." : "✅ EMPIRE RESTORED.");
    res.json({ success: true, message: isSystemLocked ? "EMPIRE LOCKED" : "EMPIRE RESTORED" });
});

// --- 📦 10. KITCHEN & GLOBAL MARKET ---
app.get('/api/get-products', async (req, res) => {
    const products = await KitchenMeal.find({}).sort({ _id: -1 }); 
    res.json(products);
});

app.post('/api/add-product', async (req, res) => {
    const result = await pushToGlobalMarket(req.body);
    res.status(201).json(result);
});

// --- 🔐 11. FOUNDER LOGIN ---
app.post('/api/login', (req, res) => {
    if (req.body.email === "akpanvictor848@gmail.com" && req.body.password === "$Nsikak111") {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false });
});

// --- ⚙️ 12. START ENGINE ---
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
});
