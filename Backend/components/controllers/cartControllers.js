const Users = require('../models/usermodel');

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { productId, color, size, quantity } = req.body;
        // Find user
        const userdata = await Users.findOne({ _id: req.user.id });
        // Check if the item with the specified color and size already exists in the cart
        const itemIndex = userdata.cartData.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        
        if (itemIndex > -1) {
            // If the item exists, increase the quantity
            userdata.cartData[itemIndex].quantity += quantity;
        } else {
            // If the item does not exist, add it as a new entry
            userdata.cartData.push({ productId, quantity, color, size });
        }

        await userdata.save();
        res.json({ success: true, message: "Added to cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add to cart", error });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId, color, size, quantity } = req.body;

        const userdata = await Users.findOne({ _id: req.user.id });

        // Find the item with the specified color and size in the cart
        const itemIndex = userdata.cartData.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        if (itemIndex > -1) {
            // If item exists, decrease the quantity
            userdata.cartData[itemIndex].quantity -= quantity;

            // Remove the item if quantity reaches 0 or less
            if (userdata.cartData[itemIndex].quantity <= 0) {
                userdata.cartData.splice(itemIndex, 1); // Remove item from cart if quantity is 0 or less
            }

            await userdata.save();
            res.json({ success: true, message: "Removed from cart" });
        } else {
            res.status(400).json({ success: false, message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove from cart", error });
    }
};

// Get cart items
const getCart = async (req, res) => {
    try {
        const userdata = await Users.findOne({ _id: req.user.id }).populate('cartData.productId');

        if (!userdata) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json(userdata.cartData);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch cart', error });
    }
};

module.exports = { addToCart, removeFromCart, getCart };
