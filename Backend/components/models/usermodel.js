const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: [true, "Please enter your username."] },
    email: { type: String, required: [true, "Please enter your email."] },
    password: { type: String, required: [true, "Please enter your password"], select: false },
    avatar: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    role: {
        type: String,
        default: "user",
    },
    allowComponents: { 
        type: [String],
        default: [] 
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
