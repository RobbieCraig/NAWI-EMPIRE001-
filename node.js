const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('./')); 

// 1. PULL FROM ENVIRONMENT VARIABLES (The Secure Way)
const uri = process.env.MONGODB_URI; 
const PORT = process.env.PORT || 3000;

const client = new MongoClient(uri);

async function startEmpire() {
    try {
        // 2. Connect to the Warehouse
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const users = db.collection("users");
        
        console.log("------------------------------------");
        console.log("7 PILLARS SYSTEM: ONLINE");
        console.log("IDENTITY PROTECTION: ACTIVE");
        console.log("------------------------------------");

        // 3. Login API (Stage 2)
        app.post('/api/auth/login', async (req, res) => {
            const { email, password } = req.body;
            const user = await users.findOne({ email, password });

            if (user) {
                // Identity Masking: Forces display as 7 PILLARS OFFICIAL
                const title = user.role === 'admin' ? "7 PILLARS OFFICIAL" : user.username;
                res.json({ 
                    success: true, 
                    displayName: title,
                    mission: "NAWI-EMPIRE → A digital ecosystem where people connect, learn, create, and build opportunities."
                });
            } else {
                res.status(401).json({ success: false, error: "ACCESS REJECTED" });
            }
        });

        // 4. Default route to serve your index.html
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

    } catch (e) {
        console.error("FATAL: DATABASE CONNECTION FAILED. Check MONGODB_URI in Render settings.", e);
    }
}

startEmpire();
app.listen(PORT, () => console.log(`Empire Authority active on Port ${PORT}`));