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
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postcode: '',
    phone: '',
  });

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

  // Function to update shipping address
  const updateShippingAddress = async () => {
    try {
      const response = await fetch(`${baseurl}/ordersadd/${oid}/address`, {
        method: 'PUT',
        headers: {
          'auth-token': `${sessionStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingInfo }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shipping address');
      }

      const updatedData = await response.json();
      if (updatedData.success) {
        setOrderDetails((prev) => ({
          ...prev,
          shippingInfo: updatedData.order.shippingInfo,
        }));
        alert('Shipping address updated successfully');
      }
    } catch (error) {
      setError('Error updating shipping address: ' + error.message);
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
            setShippingInfo(data.order.shippingInfo);
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

  const handleShippingInfoChange = (event) => {
    const { name, value } = event.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        <div className="shipping-row">
          <div className="shipping-field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={shippingInfo.address}
              placeholder="Address"
              onChange={handleShippingInfoChange}
            />
          </div>
        </div>
        <div className="shipping-row">
          <div className="shipping-field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              name="city"
              value={shippingInfo.city}
              placeholder="City"
              onChange={handleShippingInfoChange}
            />
          </div>
          <div className="shipping-field">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              name="state"
              value={shippingInfo.state}
              placeholder="State"
              onChange={handleShippingInfoChange}
            />
          </div>
          <div className="shipping-field">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              name="country"
              value={shippingInfo.country}
              placeholder="Country"
              onChange={handleShippingInfoChange}
            />
          </div>
        </div>
        <div className="shipping-row">
          <div className="shipping-field">
            <label htmlFor="postcode">Postal Code</label>
            <input
              id="postcode"
              type="text"
              name="postcode"
              value={shippingInfo.postcode}
              placeholder="Postal Code"
              onChange={handleShippingInfoChange}
            />
          </div>
          <div className="shipping-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="text"
              name="phone"
              value={shippingInfo.phone}
              placeholder="Phone"
              onChange={handleShippingInfoChange}
            />
          </div>
        </div>
        <button onClick={updateShippingAddress} className="button">
          Update Address
        </button>
      </div>


      <div className="status-update">
        <h3>Order Status</h3>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="select">
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="button" onClick={updateOrderStatus}>Update Status</button>
      </div>

      <div className="print-section">
        <button onClick={handlePrintClick} className="button print-btn">Print</button>
      </div>
    </div>
  );
};

export default Orderdetails;
