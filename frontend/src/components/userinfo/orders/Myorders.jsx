import React, { useEffect, useState, useContext, memo } from 'react';
import './orders.css';
import { Context } from '../../../context API/Contextapi';
import Clientorderdetails from '../../clientorderdetails/Clientorderdetails';
import Feedback from '../../feedback/Feedback';

const MyOrders = () => {
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  const { myorders, countryCode } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState({}); // Tracks feedback status for orders

  const currencySymbols = {
    US: '$',
    EU: '€',
    PK: '₨',
    GB: '£',
    AE: 'د.إ',
  };
  const currencySymbol = currencySymbols[countryCode] || '$';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await myorders();
        if (!Array.isArray(data)) throw new Error('Expected data to be an array');
        setOrders(data);

        // Fetch feedback statuses for orders
        const feedbackPromises = data.map((order) =>
          fetch(`${baseurl}/feedback/order/${order._id}`)
            .then((response) => response.ok)
            .catch(() => false) // Assume no feedback on error
        );
        

        const feedbackResults = await Promise.all(feedbackPromises);
        const feedbackMap = data.reduce((acc, order, index) => {
          acc[order._id] = feedbackResults[index];
          return acc;
        }, {});

        setFeedbackStatus(feedbackMap);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [myorders, baseurl]);

  
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedOrderId(null);
  };

  const handleFeedbackSubmitted = (orderId) => {
    setFeedbackStatus((prev) => ({
      ...prev,
      [orderId]: true, // Mark feedback as submitted for the order
    }));
  };

  if (loading) return <div className="myOrders__loading">Loading orders...</div>;
  if (error) return <div className="myOrders__error">Error: {error}</div>;
  if (orders.length === 0) return <div className="myOrders__empty">No orders found.</div>;

  return (
    <div className="myOrders">
      <div className="myOrders__header">
        <h3 className="myOrders__title">Name</h3>
        <h3 className="myOrders__title">Status</h3>
        <h3 className="myOrders__title">Qty</h3>
        <h3 className="myOrders__title">Price</h3>
        <h3 className="myOrders__title">Action</h3>
      </div>
      <div className="myOrders__list">
        {orders.map((order) =>
          order.orderItems.map((item) => (
            <OrderItem
              key={item._id}
              item={item}
              orderStatus={order.orderStatus}
              currencySymbol={currencySymbol}
              onView={() => handleViewOrder(order._id)}
              isCompleted={order.orderStatus === 'Completed'}
              feedbackSubmitted={feedbackStatus[order._id]} // Pass feedback status
              orderId={order._id}
              productId={item.productId}
              onFeedbackSubmitted={() => handleFeedbackSubmitted(order._id)}
            />
          ))
        )}
      </div>

      {showDetails && (
        <div className="myOrders__detailsContainer">
          <Clientorderdetails onClose={handleCloseDetails} orderId={selectedOrderId} />
        </div>
      )}
    </div>
  );
};

const OrderItem = memo(
  ({
    item,
    orderStatus,
    currencySymbol,
    onView,
    isCompleted,
    feedbackSubmitted,
    productId,
    orderId,
    onFeedbackSubmitted,
  }) => {
    const [showFeedback, setShowFeedback] = useState(false);

    const handleToggleFeedback = () => setShowFeedback((prev) => !prev);

    return (
      <div className="myOrders__Maincontainer">
        <div className="myOrders__item">
          <div className="myOrders__field">{item.name}</div>
          <div className="myOrders__field">{orderStatus}</div>
          <div className="myOrders__field">{item.quantity}</div>
          <div className="myOrders__field">
            {currencySymbol}
            {(item.price * item.quantity).toFixed(2)}
          </div>
          <div className="myOrders__field">
            <button className="myOrders__viewButton" onClick={onView}>
              View
            </button>
          </div>
        </div>
        {isCompleted && (
          <div className="myOrders__feedback">
            {feedbackSubmitted ? (
              <p className="myOrders__feedbackProvided">Feedback has submitted.</p>
            ) : (
              <>
                <button
                  className="myOrders__toggleFeedbackButton"
                  onClick={handleToggleFeedback}
                >
                  {showFeedback ? '▲ Hide Feedback' : '▼ Give Feedback'}
                </button>
                {showFeedback && (
                  <div className="myOrders__feedbackForm">
                    <Feedback
                      orderId={orderId}
                      productId={productId}
                      onFeedbackSubmitted={onFeedbackSubmitted}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default MyOrders;
