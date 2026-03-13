const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const uri = process.env.MONGODB_URI || "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";
const client = new MongoClient(uri);

async function startPlatform() {
    try {
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const posts = db.collection("posts"); // Ensure you created this collection in Atlas
        
        // Feed Pipe: Save Post
        app.post('/api/posts/create', async (req, res) => {
            const doc = {
                author: "7 PILLARS OFFICIAL", // Masking your identity
                content: req.body.content,
                timestamp: new Date(),
                likes: 0
            };
            await posts.insertOne(doc);
            res.json({ success: true });
        });

        // Feed Pipe: Load Posts
        app.get('/api/posts/feed', async (req, res) => {
            const data = await posts.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        });

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

    } catch (e) { console.error(e); }
}

startPlatform();
app.listen(process.env.PORT || 3000);
