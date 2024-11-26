
import React, { useState, useEffect } from 'react';
import './adminPromoCode.css';

const AdminPromoCode = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [promoCodeToValidate, setPromoCodeToValidate] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  // Fetch promo codes on component mount
  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const response = await fetch(`${baseurl}/allCode`);
        const data = await response.json();
        if (response.ok) {
          setPromoCodes(data.promoCodes);
        } else {
          console.error('Error fetching promo codes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching promo codes:', error);
      }
    };

    fetchPromoCodes();
  }, []);

  // Create a new promo code
  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseurl}/createCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newCode,
          discount: discount,
          expirationDate: expirationDate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPromoCodes([...promoCodes, data.promoCode]); // Add new promo to state
        setNewCode('');
        setDiscount('');
        setExpirationDate('');
      } else {
        alert(data.message || 'Error creating promo code');
      }
    } catch (error) {
      alert('Error creating promo code');
      console.error(error);
    }
  };

  // Validate a promo code
  const handleValidatePromoCode = async () => {
    try {
      const response = await fetch(`${baseurl}/validateCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promoCode: promoCodeToValidate }),
      });

      const data = await response.json();
      if (response.ok) {
        setValidationMessage(`Promo code is valid! Discount: ${data.discount}%`);
      } else {
        setValidationMessage(data.message || 'Error validating promo code');
      }
    } catch (error) {
      setValidationMessage('Error validating promo code');
      console.error(error);
    }
  };

  // Delete a promo code
  const handleDeletePromoCode = async (id) => {
    try {
      const response = await fetch(`${baseurl}/delcode`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }), // Send the _id of the promo code
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPromoCodes(promoCodes.filter((promo) => promo._id !== id)); // Remove deleted promo from state
      } else {
        alert(data.message || 'Error deleting promo code');
      }
    } catch (error) {
      alert('Error deleting promo code');
      console.error(error);
    }
  };

  return (
    <div className="admin-promo-code">
      {/* Create Promo Code Form */}
      <form onSubmit={handleCreatePromoCode} className="create-form">
        <h3 className="create-form-title">Create Promo Code</h3>
        <div className="form-group create-code-group">
          <label htmlFor="code" className="create-code-label">Promo Code</label>
          <input
            type="text"
            id="code"
            className="create-code-input"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group create-discount-group">
          <label htmlFor="discount" className="create-discount-label">Discount Percentage</label>
          <input
            type="number"
            id="discount"
            className="create-discount-input"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
        </div>
        <div className="form-group create-expiration-group">
          <label htmlFor="expirationDate" className="create-expiration-label">Expiration Date</label>
          <input
            type="date"
            id="expirationDate"
            className="create-expiration-input"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="create-submit-button">Create Promo Code</button>
      </form>

      {/* Validate Promo Code Section */}
      <div className="validate-section">
        <h3 className="validate-title">Validate Promo Code</h3>
        <input
          type="text"
          className="validate-input"
          value={promoCodeToValidate}
          onChange={(e) => setPromoCodeToValidate(e.target.value)}
          placeholder="Enter promo code"
        />
        <button onClick={handleValidatePromoCode} className="validate-button">Validate</button>
        {validationMessage && <p className="validation-message">{validationMessage}</p>}
      </div>

      {/* Promo Codes List */}
      <div className="promo-codes-list">
        <h3 className="promo-codes-title">Active Promo Codes</h3>
        {promoCodes.length === 0 ? (
          <p className="no-promo-message">No active promo codes available.</p>
        ) : (
          <ul className="promo-codes-ul">
            {promoCodes.map((promo) => (
              <li key={promo._id} className="promo-code-item">
                <strong className="promo-code-text">{promo.code}</strong> - {promo.discount}% off
                <span className="promo-expiration"> (Expires on {new Date(promo.expirationDate).toLocaleDateString()})</span>
                <button
                  className="delete-button"
                  onClick={() => handleDeletePromoCode(promo._id)} // Call delete with _id
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPromoCode;
