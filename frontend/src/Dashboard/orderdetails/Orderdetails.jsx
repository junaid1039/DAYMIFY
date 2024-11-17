import React, { useState, useEffect, useContext } from 'react';
import './orderdetails.css';
import { RxCross2 } from "react-icons/rx";
import { Context } from '../../context API/Contextapi';

const Orderdetails = ({ onClose, oid, onStatusUpdate }) => {
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  const { countryCode } = useContext(Context);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  // Function to update order status
  const updateOrderStatus = async () => {
    try {
      const response = await fetch(`${baseurl}/updateOrderStatus/${oid}`, {
        method: 'PUT',
        headers: {
          'auth-token': `${sessionStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: orderStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedData = await response.json();
      if (updatedData.success) {
        onStatusUpdate();
        onClose();
      }
    } catch (error) {
      setError('Error updating order status: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${baseurl}/orderdetails/${oid}`, {
          method: 'GET',
          headers: {
            'auth-token': `${sessionStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrderDetails(data.order);
            setOrderStatus(data.order.orderStatus);
          } else {
            setError('Failed to fetch order details');
          }
        } else {
          setError('Failed to fetch order details');
        }
      } catch (error) {
        setError('Error fetching order details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [oid]);

  const handleStatusChange = (event) => {
    setOrderStatus(event.target.value);
  };

  const handleUpdateClick = () => {
    updateOrderStatus();
  };

  const handlePrintClick = () => {
    window.print(); // Trigger print dialog
  };

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!orderDetails) {
    return <p>No order details available.</p>;
  }

  const {
    orderId,
    dateOrdered,
    totalPrice,
    orderItems,
    shippingInfo,
    paymentInfo,
  } = orderDetails;

  const currencySymbols = {
    US: '$',
    EU: '€',
    PK: '₨',
    GB: '£',
    AE: 'د.إ',
  };
  const currencySymbol = currencySymbols[countryCode] || '$';

  return (
    <div className="container">
      <RxCross2 className="close-btn" onClick={onClose} />
      <h2>Order Details</h2>
      <div className="order-info">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Order Date:</strong> {new Date(dateOrdered).toLocaleString()}</p>
        <p><strong>Order Price:</strong> {currencySymbol}{totalPrice.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> {paymentInfo.method}</p>
        <p><strong>Payment Status:</strong> {paymentInfo.status}</p>
        <p><strong>Order Status:</strong> <span className="status">{orderStatus}</span></p>
      </div>

      <div className="order-details">
        <h3>Order Items</h3>
        {orderItems.map((item, index) => (
          <div key={index} className="o-details">
            <p><strong>Title:</strong> {item.name}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> {currencySymbol}{item.price}</p>
            <p><strong>Size:</strong> {item.size}</p>
            <p><strong>Color:</strong> {item.color}</p>
          </div>
        ))}
      </div>

      <div className="shipping-info">
        <h3>Shipping Info</h3>
        <p><strong>Name:</strong> {orderDetails.user.name}</p>
        <p><strong>Address:</strong> {`${shippingInfo.address}`}</p>
        <p><strong>City,State,Country:</strong> {`${shippingInfo.city} , ${shippingInfo.state} , ${shippingInfo.country}`}</p>
        <p><strong>Postal Code:</strong> {shippingInfo.postcode}</p>
        <p><strong>Phone:</strong> {shippingInfo.phone}</p>
      </div>

      <div className="status-update">
        <h3>Order Status</h3>
        <select value={orderStatus} onChange={handleStatusChange} className="select">
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="button" onClick={handleUpdateClick}>Update</button>
      </div>

      <div className="print-section">
        <button onClick={handlePrintClick} className="button print-btn">Print</button>
      </div>
    </div>
  );
};

export default Orderdetails;
