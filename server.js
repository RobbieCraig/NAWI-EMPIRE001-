const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- FIX 1: ULTRA-COMPATIBLE CORS ---
// This ensures your frontend can "talk" to the backend without being blocked.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- DATABASE CONNECTION ---
const uri = "mongodb+srv://NAWIEMPIRE001:NAWI-EMPIRE01@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";

// FIX 2: Added connection options for stability on mobile-managed servers
mongoose.connect(uri)
  .then(() => console.log("🏰 NAWI EMPIRE: Database Connected Successfully"))
  .catch(err => console.log("❌ Connection Error:", err));

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

// --- ROUTES ---

app.get('/api/get-products', async (req, res) => {
    try {
        const products = await Product.find().sort({ timestamp: -1 }); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
            status: "Escrow Active",
            timestamp: new Date()
        });
        await newProduct.save();
        res.status(201).json({ success: true, message: "Worldwide Asset Registered" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Vault Entry Failed" });
    }
});

app.post('/api/create-wallet', (req, res) => {
    res.json({ balance: 0.00, currency: "USD", status: "Verified" });
});

// FOUNDER LOGIN
const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});

// FIX 3: Health Check Route
// This tells Render "I am alive" every 30 seconds so it doesn't sleep.
app.get('/health', (req, res) => { res.status(200).send('Empire Active'); });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START ENGINE ---
// Use 0.0.0.0 to make sure Render can see the port externally
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Empire Engine Active on Port ${PORT}`);
});
