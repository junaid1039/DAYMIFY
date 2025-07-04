const Order = require('../models/ordermodel');

function newId() {
    const prefix = 'dmfy';
    const randomNumber = Math.floor(Math.random() * 100000);
    return `${prefix}${randomNumber.toString().padStart(5, '0')}`;
}

// Create new order
const newOrder = async (req, res) => {
    const {
        user, // Optional user ID
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        shippingPrice
    } = req.body;

    try {
        let orderId;
        do {
            orderId = newId();
        } while (await Order.findOne({ orderId }));

        const orderData = {
            orderId,
            user: user || null, // Use null if no user is provided
            shippingInfo,
            orderItems,
            paymentInfo,
            orderStatus: 'Processing',
            totalPrice,
            shippingPrice,
            dateOrdered: Date.now()
        };

        const order = await Order.create(orderData);

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
        console.error(error);
    }
};



// Get all orders -- Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        let totalAmount = 0;
        orders.forEach((order) => {
            totalAmount += order.totalPrice;
        });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'No orders found', error: error.message });
    }
};

// Order details -- Admin
const getOrderDetails = async (req, res) => {
    try {
        // Assuming you're passing orderId in the request params
        const order = await Order.findOne({ orderId: req.params.id })
            .populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        
        // Ensuring that order items include color and size
        const orderDetails = order.orderItems.map(item => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            color: item.color, // Include color
            size: item.size    // Include size
        }));

        res.status(200).json({ success: true, order: { ...order.toObject(), orderItems: orderDetails } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get order details", error: error.message });
    }
};

// User order details show to -- User
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('user', 'name email');

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found." });
        }

        // Ensuring that each order includes color, size, and orderId details
        const userOrders = orders.map(order => ({
            ...order.toObject(),
            orderId: order.orderId, // Include orderId
            orderItems: order.orderItems.map(item => ({
                product: item.product,
                name: item.name,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                color: item.color, // Include color
                size: item.size,   // Include size
                orderId: order.orderId // Include orderId in each item as well
            }))
        }));

        res.status(200).json({ success: true, orders: userOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get order details", error: error.message });
    }
};


// Update order status -- Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        
        order.orderStatus = req.body.status;
        if (order.orderStatus === "Delivered") {
            order.deliveredAt = Date.now();
        }
        
        await order.save();
        res.status(200).json({ success: true, message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ orderId: req.params.id });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateOrderAddress = async (req, res) => {
    const { id } = req.params; // Order ID passed in the route params
    const { shippingInfo } = req.body; // New shipping info from the request body

    try {
        // Validate input
        if (!shippingInfo || typeof shippingInfo !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shipping information provided.',
            });
        }

        // Find the order by orderId
        const order = await Order.findOne({ orderId: id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Update the shipping address
        order.shippingInfo = { ...order.shippingInfo, ...shippingInfo };
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Shipping address updated successfully.',
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update shipping address.',
            error: error.message,
        });
    }
};


module.exports = { updateOrderAddress, newOrder, getOrderDetails, getAllOrders, getMyOrders, updateOrderStatus, deleteOrder };
