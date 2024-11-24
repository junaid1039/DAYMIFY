const Feedback = require('../models/feedbackSchema');
const Order = require('../models/ordermodel'); // Path to your Order model

// Function to add feedback with userName from Order
const addFeedback = async (req, res) => {
  const { orderId, productId, rating, comment } = req.body;

  if (!orderId || !productId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find the order by orderId
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Extract userName from the order's shippingInfo
    const userName = order.shippingInfo.name || "anonymous";
    

    // Find or create feedback document for the product
    let feedback = await Feedback.findOne({ productId });
    if (!feedback) {
      feedback = new Feedback({ productId, feedbacks: [] });
    }

    // Add the feedback to the feedbacks array
    feedback.feedbacks.push({
      orderId,
      rating,
      comment,
      userName, // Add userName from shippingInfo
    });

    // Save the feedback document
    await feedback.save();

    return res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while submitting feedback.' });
  }
};


// User/Admin: Get feedbacks for a product by productId
const getFeedbacksByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find feedback for the given productId (which is now a number)
        const feedback = await Feedback.findOne({ productId }).populate({
            path: 'feedbacks.orderId', // populate order details for each feedback
            select: 'orderDetails', // Replace `orderDetails` with specific fields from the Order schema
        });

        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this product' });
        }

        res.status(200).json({ feedbacks: feedback.feedbacks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedbacks', error });
    }
};

// User/Admin: Get feedback for an order by orderId
const getFeedbackByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the product feedback that contains the specific orderId
        const feedback = await Feedback.findOne({
            'feedbacks.orderId': orderId // Find a feedback with the specified orderId
        });

        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this order' });
        }

        // Extract the specific feedback item for the given orderId
        const feedbackItem = feedback.feedbacks.find((item) => item.orderId.toString() === orderId);

        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback item not found for this order' });
        }

        res.status(200).json({ feedback: feedbackItem });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback', error });
    }
};

// Admin: Reply to a comment
const replyToComment = async (req, res) => {
    try {
        const { productId, feedbackId } = req.params;
        const { reply } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({ message: 'Reply cannot be empty' });
        }

        // Find the feedback document by productId
        const feedback = await Feedback.findOne({ productId });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback for the product not found' });
        }

        // Find the specific feedback item using feedbackId
        const feedbackItem = feedback.feedbacks.id(feedbackId);
        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback item not found' });
        }

        // Update the reply field
        feedbackItem.reply = reply;
        await feedback.save();

        res.status(200).json({ message: 'Reply added successfully', feedbackItem });
    } catch (error) {
        res.status(500).json({ message: 'Error replying to comment', error: error.message });
    }
};


// Admin/User: Delete a feedback
const deleteFeedback = async (req, res) => {
    try {
        const { productId, feedbackId } = req.params;

       

        // Find the document and remove the subdocument using $pull
        const feedback = await Feedback.findOneAndUpdate(
            { productId },
            { $pull: { feedbacks: { _id: feedbackId } } },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found for the given productId or feedbackId' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully', feedback });
    } catch (error) {
        console.error("Error in deleteFeedback:", error);
        res.status(500).json({ message: 'Error deleting feedback', error });
    }
};



// User: Edit a feedback
const editFeedback = async (req, res) => {
    try {
        const { productId, feedbackId } = req.params;
        const { rating, comment } = req.body;

        const feedback = await Feedback.findOne({ productId });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const feedbackItem = feedback.feedbacks.id(feedbackId);
        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback item not found' });
        }

        // Update rating and/or comment
        if (rating) feedbackItem.rating = rating;
        if (comment) feedbackItem.comment = comment;

        await feedback.save();

        res.status(200).json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Error updating feedback', error });
    }
};

// Admin: Get all feedbacks across all products
const getAllFeedbacks = async (req, res) => {
    try {
        // Fetch all feedbacks, using .lean() to return plain objects instead of Mongoose documents
        const feedbacks = await Feedback.find({}).lean();

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({ message: 'No feedbacks found' });
        }

        // Flatten the feedbacks array to include all feedbacks from all products,
        // while also keeping the productId for each feedback
        const allFeedbacks = feedbacks.flatMap(feedback => 
            feedback.feedbacks.map(feedbackItem => ({
                ...feedbackItem,  // spread existing feedback properties
                productId: feedback.productId, // add productId to each feedback item
            }))
        );

        res.status(200).json({ feedbacks: allFeedbacks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all feedbacks', error });
    }
};



module.exports = {
    getAllFeedbacks,
    addFeedback,
    getFeedbacksByProductId,
    getFeedbackByOrderId,
    replyToComment,
    deleteFeedback,
    editFeedback,
};
