const Newsletter = require('../models/NewsletterSchema');

// Subscribe user to the newsletter
exports.subscribeUser = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    try {
        // Check if the email is already subscribed
        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: "Email is already subscribed." });
        }

        // Save the new subscriber
        const newSubscriber = new Newsletter({ name, email });
        await newSubscriber.save();

        res.status(201).json({ message: "Thank you for subscribing!" });
    } catch (error) {
        console.error("Error subscribing user:", error);
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
};

// Get all subscribers (admin use)
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find();
        res.status(200).json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Unsubscribe user (optional)
exports.unsubscribeUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const deletedSubscriber = await Newsletter.findOneAndDelete({ email });

        if (!deletedSubscriber) {
            return res.status(404).json({ message: "Email not found in the subscription list." });
        }

        res.status(200).json({ message: "Successfully unsubscribed." });
    } catch (error) {
        console.error("Error unsubscribing user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// Backend route to delete a subscriber by id
exports.delsubscriber = async (req, res) => {
    const { id } = req.params; // Expecting an 'id' in the body
    console.log("Here is the id", id);
    
    try {
        // Deleting the subscriber by id
        const deletedSubscriber = await Newsletter.findOneAndDelete({ _id: id }); // Use _id for MongoDB
        
        // If no subscriber found, return an error
        if (!deletedSubscriber) {
            return res.status(404).json({ error: "Subscriber not found" });
        }

        // Successful deletion response
        res.status(200).json({ message: "Subscriber deleted successfully" });
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

