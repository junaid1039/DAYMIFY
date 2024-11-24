import React, { useState, useEffect } from 'react';
import './adminFeedback.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Icons for stars

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyData, setReplyData] = useState({});
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;


  
  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  const fetchAllFeedbacks = async () => {
    try {
      const response = await fetch(`${baseurl}/feedbacks`);
      const data = await response.json();
      setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleReplyToFeedback = async (e, feedbackId, productId) => {
    e.preventDefault();
    const reply = replyData[feedbackId];

    try {
      const response = await fetch(`${baseurl}/feedback/${productId}/${feedbackId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply }),
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        fetchAllFeedbacks();
        setReplyData((prev) => ({ ...prev, [feedbackId]: '' }));
      }
    } catch (error) {
      console.error('Error replying to feedback:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId, productId) => {
    try {
      const response = await fetch(`${baseurl}/feedback/${productId}/${feedbackId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) fetchAllFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleReplyChange = (e, feedbackId) => {
    const value = e.target.value;
    setReplyData((prev) => ({ ...prev, [feedbackId]: value }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="star-icon full" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="star-icon half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon empty" />);
      }
    }
    return stars;
  };

  return (
    <div className="admin-feedback-container">
      <h1 className="admin-feedback-title">Admin Feedback Management</h1>

      <section className="feedback-section">
        <h2 className="section-title">All Feedbacks</h2>
        <button className="refresh-button" onClick={fetchAllFeedbacks}>
          Refresh Feedbacks
        </button>
        <div className="feedback-list">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="feedback-item">
              <div className="feedback-header">
                <div className="feedback-username">
                  <span className="feedback-label">Username:</span>{' '}
                  {feedback.userName || 'Anonymous'}
                </div>
                <div className="feedback-rating">{renderStars(feedback.rating)}</div>
              </div>

              <div className="feedback-comment">
                <span className="feedback-label">Comment:</span> {feedback.comment}
              </div>

              {feedback.reply ? (
                <div className="reply-section">
                  <h4 className="reply-title">Replied:</h4>
                  <p className="reply-text">{feedback.reply}</p>
                </div>
              ) : (
                <div className="reply-section">
                  <h4 className="reply-title">Reply to this feedback</h4>
                  <textarea
                    className="reply-input"
                    placeholder="Your reply"
                    value={replyData[feedback._id] || ''}
                    onChange={(e) => handleReplyChange(e, feedback._id)}
                  />
                  <button
                    className="submit-reply-button"
                    onClick={(e) => handleReplyToFeedback(e, feedback._id, feedback.productId)}
                  >
                    Submit Reply
                  </button>
                </div>
              )}

              <div className="delete-section">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteFeedback(feedback._id, feedback.productId)}
                >
                  Delete Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminFeedback;
