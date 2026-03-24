const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    mealName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    origin: { 
        type: String, 
        default: "Global" 
    },
    description: { 
        type: String, 
        required: true,
        maxlength: 500 
    },
    price: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: "🪙 Empire Coins" 
    },
    category: { 
        type: String, 
        enum: ['Raw Food', 'Cooked Meal', 'Spices', 'International', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'], 
        required: true 
    },
    // We use an array so citizens can upload multiple photos of their food
    images: {
        type: [String],
        default: ['https://via.placeholder.com/300x200?text=Imperial+Meal']
    },
    stockStatus: { 
        type: String, 
        enum: ['AVAILABLE', 'OUT_OF_STOCK'],
        default: "AVAILABLE" 
    },
    status: { 
        type: String, 
        enum: ['PENDING_AUDIT', 'APPROVED', 'REJECTED'], 
        default: 'PENDING_AUDIT' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create the Model
const Meal = mongoose.model('Meal', MealSchema);

module.exports = Meal;
