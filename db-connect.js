const mongoose = require('mongoose');

// 🔒 CLEAN MASTER URI
// Username: NAWI-EMPIRE001 | Password: NAWI-EMPIRE001
const uri = "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";

const clientOptions = { 
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    autoIndex: true, 
};

async function connectVault() {
  try {
    if (mongoose.connection.readyState === 1) return; 
    await mongoose.connect(uri, clientOptions);
    console.log("🏰 NAWI EMPIRE: Vault Synchronized Successfully!");
  } catch (error) {
    console.error("❌ Vault Connection Failed:", error.message);
    setTimeout(connectVault, 5000); 
  }
}

connectVault();

const kitchenSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    price: String,
    tier: { type: String, default: "7 Pillars Elite" }
});

const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

async function pushToGlobalMarket(productData) {
    try {
        if (mongoose.connection.readyState !== 1) return { success: false, error: "Syncing..." };
        const finalProduct = new KitchenMeal(productData);
        const result = await finalProduct.save();
        return { success: true, id: result._id };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = { mongoose, pushToGlobalMarket };
