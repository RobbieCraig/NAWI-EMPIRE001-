const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('./'));

// --- 1. CONFIGURATION & IDENTITY PROTECTION ---
const NAWI_CONFIG = {
    founder: process.env.FOUNDER_ID || "NAWI-EMPIRE001",
    unit: "Coin 🪙",
    stores: {
        ios: "https://apps.apple.com/app/nawi-empire", 
        android: "https://play.google.com/store/apps/nawi-empire", 
        web: "https://nawi-empire.onrender.com/dashboard" // This is your portal
    }
};

const uri = process.env.MONGODB_URI || "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";
const client = new MongoClient(uri);

// --- 2. THE MASTER LOGIC ---
async function startPlatform() {
    try {
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const posts = db.collection("posts");
        console.log("NAWI-EMPIRE Cluster Connected: Identity Protected.");

        // 🛡️ GATEWAY: The 'One QR Code' Logic
        // This is what happens when someone scans your QR Code
        app.get('/gateway', (req, res) => {
            const userAgent = req.headers['user-agent'].toLowerCase();

            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return res.redirect(NAWI_CONFIG.stores.ios);
            } else if (userAgent.includes('android')) {
                return res.redirect(NAWI_CONFIG.stores.android);
            } else {
                // Laptop/PC users go to the main website
                return res.redirect('/'); 
            }
        });

        // 🛒 MARKETPLACE & FEED: Save Post/Ad
        app.post('/api/posts/create', async (req, res) => {
            const doc = {
                author: "7 PILLARS OFFICIAL", // Hidden Identity
                content: req.body.content,
                type: req.body.type || "standard", // Can be 'standard' or 'boosted_ad'
                timestamp: new Date(),
                likes: 0
            };
            await posts.insertOne(doc);
            res.json({ success: true });
        });

        // 📊 FEED: Load busy activity
        app.get('/api/posts/feed', async (req, res) => {
            const data = await posts.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        });

        // 🏛️ WEBSITE ENTRY
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

    } catch (e) { 
        console.error("Critical Empire Error:", e); 
    }
}

// --- 3. START THE EMPIRE ---
startPlatform();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`NAWI-EMPIRE is active on port ${PORT}`);
});
