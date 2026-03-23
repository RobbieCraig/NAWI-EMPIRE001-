const express = require('express');
const cors = require('cors');
const path = require('path');
const { ObjectId } = require('mongodb');

// 👑 IMPORT MODELS & DB CONNECTION
const { mongoose, KitchenMeal, pushToGlobalMarket } = require('./db-connect');

const app = express();
const db = mongoose.connection;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- 🛡️ FOUNDER SECURITY MIDDLEWARE ---
const authorizeFounder = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === "FOUNDER_001") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Empire Authority Required." });
    }
};

// --- 👤 IDENTITY & REGISTRATION (ANTI-SCAM) ---

app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        // 1. Device Lock: One Phone, One Node
        const existingDevice = await db.collection('users').findOne({ deviceId: deviceId });
        if (existingDevice) {
            return res.status(403).json({ 
                success: false, 
                message: "⚠️ SYSTEM ALERT: Multiple accounts detected. Only one Node per Human allowed." 
            });
        }

        // 2. Create User: Locked until ID Verification
        const newUser = {
            email: email,
            password: password, // In production, hash this password!
            deviceId: deviceId,
            balance: 0, 
            violationCount: 0,
            isVerified: false,
            status: "PENDING_HUMAN_CHECK",
            createdAt: new Date()
        };

        await db.collection('users').insertOne(newUser);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Security Vault Error.");
    }
});

// --- 💰 SOVEREIGN WITHDRAWAL (IDENTITY MATCHING) ---

app.post('/api/request-withdrawal', async (req, res) => {
    const { userId, accountName, accountNumber, bankName, amount } = req.body;
    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ success: false, message: "Identity Not Found." });

        // THE STRICT MATCH: Comparing Registered Name vs Bank Account Name
        const registeredName = (user.fullName || "").toLowerCase().trim();
        const withdrawalName = (accountName || "").toLowerCase().trim();

        if (registeredName !== withdrawalName) {
            await db.collection('users').updateOne({ _id: user._id }, { $inc: { violationCount: 1 } });
            return res.status(403).json({ 
                success: false, 
                type: "GOLDEN_WARNING",
                message: "⚠️ IDENTITY MISMATCH: Name does not match Sovereign ID. Violation logged." 
            });
        }

        const withdrawalRequest = {
            userId: user._id,
            fullName: user.fullName,
            bankDetails: { accountName, accountNumber, bankName },
            amount: parseFloat(amount),
            status: "PENDING_AUTHORIZATION",
            timestamp: new Date()
        };

        await db.collection('withdrawals').insertOne(withdrawalRequest);
        res.status(200).json({ success: true, message: "✨ Authorized. Awaiting Founder Release." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Vault Sync Error." });
    }
});

// --- ⚖️ THE FOUNDER'S JUDGMENT & HQ ROUTES ---

// Approve Human ID & Release 10 Coin Bonus
app.post('/api/admin/verify-human', authorizeFounder, async (req, res) => {
    const { userId } = req.body;
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { balance: 10, isVerified: true, status: "ACTIVE" } }
    );
    res.json({ success: true, message: "10 🪙 Bonus Unlocked." });
});

// Issue Golden Warning
app.post('/api/admin/issue-warning', authorizeFounder, async (req, res) => {
    const { suspectId } = req.body;
    await db.collection('users').updateOne(
        { _id: new ObjectId(suspectId) },
        { $set: { pendingWarning: "⚠️ FINAL WARNING: Imperial Violation Detected. Obey the rules." } }
    );
    res.json({ success: true, message: "Warning Published." });
});

// Terminate Node (Permanent Ban)
app.post('/api/admin/terminate-node', authorizeFounder, async (req, res) => {
    const { suspectId } = req.body;
    await db.collection('users').updateOne(
        { _id: new ObjectId(suspectId) },
        { $set: { status: "TERMINATED", balance: 0 } }
    );
    res.json({ success: true, message: "Node Removed from Empire." });
});

// --- 🛡️ REPORTING & MONITORING ---

app.post('/api/submit-report', async (req, res) => {
    try {
        await db.collection('reports').insertOne(req.body);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).send("Command Sync Error.");
    }
});

app.get('/api/get-withdrawals', authorizeFounder, async (req, res) => {
    try {
        const requests = await db.collection('withdrawals').find({ status: "PENDING_AUTHORIZATION" }).toArray();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Sync Error." });
    }
});

// --- 📦 KITCHEN & GLOBAL MARKET ---

app.get('/api/get-products', async (req, res) => {
    try {
        const products = await KitchenMeal.find({}).sort({ _id: -1 }); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

app.post('/api/add-product', async (req, res) => {
    try {
        const result = await pushToGlobalMarket(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: "Vault Entry Failed" });
    }
});

// --- 🔐 FOUNDER LOGIN ---
const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});

// --- ⚙️ SYSTEM HEALTH & ROUTING ---
app.get('/health', (req, res) => { res.status(200).send('Empire Engine Active'); });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
});
