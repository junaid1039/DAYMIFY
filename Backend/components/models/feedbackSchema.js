const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  productId: {
    type: Number,  // Use Number instead of ObjectId
    required: true,
  },
  feedbacks: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
      },
      reply:{
        type:String,
        required:false,
      },
      userName: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Feedback', feedbackSchema);
