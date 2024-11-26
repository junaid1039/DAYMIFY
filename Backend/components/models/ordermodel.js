const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    orderId: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User
        ref: 'User',
        required: false
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId, // Reference to Product
            ref: 'Products',
            required: false
        },
        productId: { type: String},
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        color: { type: String, required: true },  // Added color field
        size: { type: String, required: true },   // Added size field
    }],
    shippingInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        postcode: { type: Number, required: true },
        phone: { type: Number, required: true }
    },
    paymentInfo: {
        id: { type: String, required: true },
        status: { type: String, required: true },
        method: { type: String, required: true },
        paidAt: { type: Date, required: true }
    },
    orderStatus: {
        type: String,
        default: 'Processing',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    shippingPrice: { type: Number, required: true },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
