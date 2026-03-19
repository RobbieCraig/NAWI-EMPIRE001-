/**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: PERMANENT LIVE SYNC & GLOBAL PUSH
 */

const mongoose = require('mongoose');

// 🔒 Your Secure Connection String
const uri = "mongodb+srv://NAWIEMPIRE001:NAWI-EMPIRE01@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority&appName=NAWI-EMPIRE001";

const clientOptions = { 
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    autoIndex: true, 
};

/**
 * 🏰 PART 1: THE POWER CONNECTION (Always-On)
 */
async function connectVault() {
  try {
    if (mongoose.connection.readyState === 1) return; // Already connected
    
    await mongoose.connect(uri, clientOptions);
    console.log("🏰 NAWI EMPIRE: Vault Synchronized Successfully!");
    console.log("🚀 Status: Database is now PERMANENTLY ACTIVE.");
  } catch (error) {
    console.error("❌ Vault Connection Failed:", error.message);
    setTimeout(connectVault, 5000); // Re-sync attempt
  }
}

// Start the engine immediately
connectVault();

// Keep-Alive Listener
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Vault Sync Lost. Re-establishing connection...');
  connectVault();
});

/**
 * 📦 PART 2: THE DATA SCHEMA (Kitchen Meals)
 */
const kitchenSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    category: { type: String, default: "Kitchen Meal" },
    price: String,
    description: String,
    market: { type: String, default: "Worldwide" },
    currency: { type: String, default: "USD" },
    tier: { type: String, default: "7 Pillars Elite" },
    status: { type: String, default: "Available" },
    last_updated: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

/**
 * 🚀 PART 3: THE GLOBAL PUSH PROTOCOL
 * Authority: NAWI-EMPIRE CEO (Victor Johnson)
 */
async function pushToGlobalMarket(productData) {
    try {
        if (mongoose.connection.readyState !== 1) {
            return { success: false, error: "Vault Syncing... Please wait 5 seconds." };
        }

        const finalProduct = new KitchenMeal({
            ...productData,
            market: "Worldwide",
            currency: "USD",
            tier: "7 Pillars Elite"
        });

        const result = await finalProduct.save();
        console.log("✅ Success: Asset registered in Kitchen-meals. ID:", result._id);
        
        return { 
            success: true, 
            id: result._id,
            message: "Worldwide Asset Registered Successfully" 
        };
    } catch (err) {
        console.error("❌ Empire DB Push Failed:", err.message);
        return { success: false, error: err.message };
    }
}

// Export both the connection and the push function
module.exports = { mongoose, pushToGlobalMarket };
