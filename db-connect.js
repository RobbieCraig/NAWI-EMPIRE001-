/**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: ACTIVE SOVEREIGN CONNECTION
 */

const mongoose = require('mongoose');

// We use the Schema already defined in your system to ensure data integrity
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

// Link to the specific "Kitchen-meals" collection in your NAWI_DB
const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

/**
 * Pushes new assets directly to the Global Market
 * Authority: NAWI-EMPIRE CEO (Victor Johnson)
 */
async function pushToGlobalMarket(productData) {
    try {
        // Validation: Ensure the system is connected before attempting push
        if (mongoose.connection.readyState !== 1) {
            console.log("Attempting to reconnect to Vault...");
            return { success: false, error: "Database not ready. Please wait 5 seconds and try again." };
        }

        const finalProduct = new KitchenMeal({
            ...productData,
            market: "Worldwide",
            currency: "USD",
            tier: "7 Pillars Elite",
            status: "Available"
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

module.exports = { pushToGlobalMarket };
