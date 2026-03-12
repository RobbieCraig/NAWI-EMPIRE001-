const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// YOUR SECURE WAREHOUSE LINK
const uri = "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";
const client = new MongoClient(uri);

async function startPlatform() {
    try {
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const users = db.collection("users");
        console.log("7 PILLARS SYSTEM: ONLINE & PROTECTED");

        // LOGIN SYSTEM (Stage 2)
        app.post('/api/auth/login', async (req, res) => {
            const { email, password } = req.body;
            const user = await users.findOne({ email, password });

            if (user) {
                // IDENTITY PROTECTION: We only send the System Title back
                const publicTitle = user.role === 'admin' ? "7 PILLARS OFFICIAL" : user.username;
                res.json({ success: true, user: { title: publicTitle, role: user.role } });
            } else {
                res.status(401).json({ success: false, error: "Access Denied" });
            }
        });

    } catch (e) { console.error("CONNECTION ERROR:", e); }
}

startPlatform();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Platform moving forward on port ${PORT}`));
