const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE (The Airway) ---
app.use(cors()); // Allows your website to talk to this server
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- DATABASE CONNECTION (The Vault) ---
const uri = "mongodb+srv://NAWIEMPIRE001:NAWI-EMPIRE01@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("🏰 NAWI EMPIRE: Database Connected Successfully"))
  .catch(err => console.log("❌ Connection Error:", err));

// --- PRODUCT SCHEMA (The Blueprint) ---
// This tells Node.js how to read products from your MongoDB
const productSchema = new mongoose.Schema({
    product_name: String,
    category: String,
    price: String,
    currency: String,
    market: String,
    description: String
});

const Product = mongoose.model('Product', productSchema, 'products');

// --- ROUTES (The Nerve System) ---

// 1. Discovery Route: Fetches all products for the Search Bar
app.get('/api/get-products', async (req, res) => {
    try {
        const products = await Product.find(); 
        res.json(products);
    } catch (err) {
        console.error("Vault Retrieval Error:", err);
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

// 2. Founder Login Route
const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});

// 3. Serve the Gateway (Front-end)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START ENGINE ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Empire Engine Active on Port ${PORT}`);
});
