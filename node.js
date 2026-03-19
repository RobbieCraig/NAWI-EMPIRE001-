const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE (The Airway) ---
// This version allows your Render URL and local testing to both work
app.use(cors()); 
app.use(express.json());
// This ensures all your CSS/JS files are served correctly from the root folder
app.use(express.static(path.join(__dirname, '/')));

// --- DATABASE CONNECTION (The Vault) ---
const uri = "mongodb+srv://NAWIEMPIRE001:NAWI-EMPIRE01@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("🏰 NAWI EMPIRE: Database Connected Successfully"))
  .catch(err => console.log("❌ Connection Error:", err));

// --- GLOBAL PRODUCT SCHEMA (The Blueprint) ---
const productSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    category: String,
    price: String,
    sku: String,
    origin_country: { type: String, default: "Global Empire" }, 
    market: { type: String, default: "Worldwide" },
    description: String,
    certification: String,
    currency: { type: String, default: "USD" },
    status: { type: String, default: "Active" },
    timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema, 'products');

// --- ROUTES (The Nerve System) ---

// 1. Discovery Route: Fetches all products for the Gateway
app.get('/api/get-products', async (req, res) => {
    try {
        // Sort by newest first (-1)
        const products = await Product.find().sort({ timestamp: -1 }); 
        res.json(products);
    } catch (err) {
        console.error("Vault Retrieval Error:", err);
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

// 2. Global Registration Route: Deploys new assets to the Vault
app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
            status: "Escrow Active", // P2P Protection enabled by default
            timestamp: new Date()
        });
        
        await newProduct.save();
        res.status(201).json({ success: true, message: "Worldwide Asset Registered" });
    } catch (err) {
        console.error("Vault Save Error:", err);
        res.status(500).json({ success: false, error: "Vault Entry Failed" });
    }
});

// 3. P2P Gateway: Initializing new accounts with Zero Balance
app.post('/api/create-wallet', (req, res) => {
    // Every new citizen starts at 0.00 to protect the platform
    const initialBalance = { 
        balance: 0.00, 
        currency: "USD",
        status: "Verified"
    };
    res.json(initialBalance);
});

// 4. Founder Login Route
const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});

// 5. Serve the Gateway (Front-end)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START ENGINE ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Empire Engine Active on Port ${PORT}`);
});