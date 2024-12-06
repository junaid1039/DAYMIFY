const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: { type: String, required: true },
    colors: [{
        color: { type: String },
        available: { type: Boolean, default: true }  // Availability for this color
    }],
    sizes: [{
        size: { type: String },
        available: { type: Boolean, default: true }  // Availability for this size
    }],
    description: { type: String, required: true },
    brand: { type: String },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true, required: true },
    visible: { type: Boolean, required: true },

    prices: {
        USD: {
            oldprice: { type: Number },
            newprice: { type: Number },
        },
        EUR: {
            oldprice: { type: Number },
            newprice: { type: Number },
        },
        PKR: {
            oldprice: { type: Number },
            newprice: { type: Number },
        },
        GBP: {
            oldprice: { type: Number },
            newprice: { type: Number },
        },
        AED: {
            oldprice: { type: Number },
            newprice: { type: Number },
        },
    }
});

module.exports = mongoose.model('Product', productSchema);
