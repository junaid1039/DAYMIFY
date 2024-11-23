const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Ensure emails are not duplicated
            lowercase: true,
            match: [/.+@.+\..+/, "Invalid email format"], // Email validation
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);
