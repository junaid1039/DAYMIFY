import React, { useEffect, useState } from 'react';
import './productFeedback.css'; // Make sure to create this CSS file

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const ProductFeedback = ({ productId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the feedback data based on productId
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${baseurl}/feedback/${productId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error fetching feedback');
        setFeedbacks(data.feedbacks); // Assuming data has 'feedbacks' array
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [productId]);

  // Helper function to render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-feedback">
      <h3>Product Reviews</h3>
      <div className="feedback-list">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="feedback-item">
            <div className="feedback-header">
              <div className="feedback-user">{feedback.userName}</div>
              <div className="feedback-rating">{renderStars(feedback.rating)}</div>
            </div>
            <div className="feedback-comment">{feedback.comment}</div>
            
            {/* Admin reply section */}
            {feedback.reply && (
              <div className="admin-reply">
                <p className="admin-reply-header">Admin Reply:</p>
                <p className="admin-reply-comment">{feedback.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFeedback;
