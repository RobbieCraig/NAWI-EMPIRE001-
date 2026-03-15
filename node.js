const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('./'));

// --- 1. MASTER AUTHORITY CONFIGURATION ---
const NAWI_CONFIG = {
    founder_id: "NAWI-EMPIRE001",
    founder_email: "akpanvictor848@gmail.com", // VERIFIED
    founder_pass: "$Nsikak111", // VERIFIED
    unit: "Coin 🪙",
    stores: {
        ios: "https://apps.apple.com/app/nawi-empire", 
        android: "https://play.google.com/store/apps/nawi-empire", 
        web: "/app-grid.html" 
    }
};

// --- 2. DATABASE CONNECTION ---
// Using your official MongoDB URI
const uri = process.env.MONGODB_URI || "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";
const client = new MongoClient(uri);

async function startPlatform() {
    try {
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const posts = db.collection("posts");
        console.log("NAWI-EMPIRE Cluster Active: Authority Verified.");

        // 🔑 THE MASTER GATE (Login Logic)
        app.post('/api/login', (req, res) => {
            const { email, password } = req.body;
            
            // Strict verification against NAWI_CONFIG
            if (email === NAWI_CONFIG.founder_email && password === NAWI_CONFIG.founder_pass) {
                console.log(`Founder Access Granted: ${email}`);
                res.json({ success: true, role: "FOUNDER", redirect: "/app-grid.html" });
            } else {
                console.log(`Access Denied for: ${email}`);
                res.status(401).json({ success: false, message: "Credential rejected by 7 Pillars Authority." });
            }
        });

        // 🛡️ GATEWAY: Device-Specific Redirection
        app.get('/gateway', (req, res) => {
            const userAgent = req.headers['user-agent'].toLowerCase();
            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return res.redirect(NAWI_CONFIG.stores.ios);
            } else if (userAgent.includes('android')) {
                return res.redirect(NAWI_CONFIG.stores.android);
            } else {
                return res.redirect('/login.html'); 
            }
        });

        // 🛒 MARKETPLACE: Create Post/Ad
        app.post('/api/posts/create', async (req, res) => {
            const doc = {
                author: req.body.author || "7 PILLARS CITIZEN",
                content: req.body.content,
                type: req.body.type || "standard", 
                timestamp: new Date(),
                likes: Math.floor(Math.random() * 100)
            };
            await posts.insertOne(doc);
            res.json({ success: true });
        });

        // 📊 FEED: Load Platform Activity
        app.get('/api/posts/feed', async (req, res) => {
            const data = await posts.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        });

        // 🏛️ FALLBACK: Keep users on the Login page until verified
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'login.html'));
        });

    } catch (e) { 
        console.error("Critical Empire Error:", e); 
    }
}

// --- 3. EXECUTION ---
startPlatform();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`NAWI-EMPIRE Running on Port ${PORT}`);
});
