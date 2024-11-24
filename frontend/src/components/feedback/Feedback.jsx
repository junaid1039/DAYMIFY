import React, { useState } from 'react';
import './Feedback.css';

const Feedback = ({ orderId, productId, onFeedbackSubmitted }) => {
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  console.log("order Id", orderId, "product Id", productId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a valid rating between 1 and 5.');
      return;
    }

    if (!comment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Send feedback data to the backend with orderId and productId in the body
      const response = await fetch(`${baseurl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, orderId, rating, comment }), // Send both orderId and productId in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      // Handle success
      setSuccess('Feedback submitted successfully!');
      setRating(0);
      setComment('');

      // Trigger the parent callback to refresh feedback data
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      setError(err.message || 'Error submitting feedback. Please try again later.');
    }
  };

  return (
    <div className="feedback-form">
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="feedback-row">
          <label htmlFor="rating" className="rating-label">Rate your Experience</label>
        </div>

        <div className="feedback-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${rating >= star ? 'filled' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <div className="feedback-row">
          <label htmlFor="comment">Please Write Comment</label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your feedback..."
          />
        </div>

        <button type="submit" className="submit-button">Submit Feedback</button>
      </form>
    </div>
  );
};

export default Feedback;
