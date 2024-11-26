import React, { useContext, useState, useCallback } from 'react';
import './cart.css';
import { RiDeleteBin6Line } from "react-icons/ri";
import { LuShoppingCart } from "react-icons/lu";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { SlHandbag } from "react-icons/sl";
import { Link } from 'react-router-dom';
import { FiPhone } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import Stepper from '../../components/stepper/Stepper';
import { Context } from '../../context API/Contextapi';

// Helper function to get currency symbol based on country code
const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'US': return '$';
    case 'EU': return '€';
    case 'GB': return '£';
    case 'AE': return 'د.إ';
    case 'PK': return '₨';
    default: return '$'; // Default currency symbol
  }
};

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const Cart = () => {
  const { allproducts, countryCode, cart, applyPromoCode, removeFromCart, addToCart, getTotalCartAmount, promoCode, discount, resetPromoCode } = useContext(Context);
  const [currentStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Check if the cart is empty
  const isCartEmpty = !cart || Object.keys(cart).length === 0;
  const currencySymbol = getCurrencySymbol(countryCode);
  const totalCartAmount = getTotalCartAmount();
  const discountedTotal = totalCartAmount - discount;

  const handlePromoCodeSubmit = async () => {
    if (!promoCodeInput) {
      setPromoError('Please enter a promo code');
      return;
    }
    const result = await applyPromoCode(promoCodeInput);
    if (result.success) {
      setPromoError('');
    } else {
      setPromoError(result.message);
    }
  };

  const handleAddToCart = useCallback((productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    addToCart(productId);
    setTimeout(() => setIsUpdating(false), 500);
  }, [isUpdating, addToCart]);

  const handleRemoveFromCart = useCallback((productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    removeFromCart(productId);
    setTimeout(() => setIsUpdating(false), 500);
  }, [isUpdating, removeFromCart]);

  const handleRemovePromoCode = () => {
    resetPromoCode(); // Reset the promo code and discount
  };

  return (
    <div className="cart-page">
      <Stepper currentStep={currentStep} />

      <div className="cartitem">
        <div className="sub-cartitem">
          <div className="cartitem-cart">
            {isCartEmpty ? (
              <div className="emptycart">
                <SlHandbag />
                <h4>Your cart is Empty</h4>
                <Link to='/' className='cl'><button>Continue Shopping</button></Link>
              </div>
            ) : (
              Object.entries(cart).map(([productId, { quantity, color, size }]) => {
                const product = allproducts ? allproducts.find((p) => p.id === parseInt(productId)) : null;

                if (product) {
                  return (
                    <div className="main-format" key={productId}>
                      <div className="cartitem-format">
                        <img className='mi' src={product.images && product.images[0]} alt={product.name} />
                        <div className="dside">
                          <div className='name'>
                            <span>{product.name}</span>
                            <RxCross2 onClick={() => handleRemoveFromCart(productId)} />
                          </div>
                          <div className='details'>
                            <div className="color">
                              <span>Color: {color}</span>
                              <br />
                              <span>Size: {size}</span>
                            </div>
                            <div className="d-q">
                              <AiOutlineMinus onClick={() => handleRemoveFromCart(productId)} />
                              <span className='cartitem-quantity'>{quantity}</span>
                              <AiOutlinePlus onClick={() => handleAddToCart(productId)} />
                            </div>
                            <span className="tprice">
                              {currencySymbol}{(product.newprice * quantity).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>


          <div className="cartitem-down">
            <div className="cs">
              <div className="sub-cs">
                <h4>Customer Service</h4>
                <div className="cntct">
                  <p><FiPhone /> <a href="tel:+923021725822">+92307-2571086</a></p>
                  <p>Monday to Friday: 9am to 9pm PST</p>
                </div>
              </div>
            </div>

            <div className="ct-promoCode">
              <p>ENTER PROMO CODE</p>
              <div className="ct-promoBox">
                <input
                  type='text'
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder='Promo Code'
                />
                <button onClick={handlePromoCodeSubmit}>Submit</button>
              </div>
              {promoError && <div className="error-message">{promoError}</div>}
              {promoCode && (
                <div className="promo-applied">
                  <p>Promo Code Applied: {promoCode} - Discount: {discount}%</p>
                  <button onClick={handleRemovePromoCode}>Remove Code</button>
                </div>
              )}
            </div>

            <div className="cartitem-total">
              <div>
                <div className="ct-item">
                  <p>Subtotal</p>
                  <p>{currencySymbol}
                    {discount > 0
                      ? (totalCartAmount / (1 - discount / 100)).toFixed(0) // Recalculate original value
                      : totalCartAmount.toFixed(0)} {/* Use totalCartAmount if no discount */}</p>
                </div>
                <hr />
                {discount > 0 && (
                  <>
                    <div className="ct-item">
                      <p>Discount ({discount}%)</p>
                      <p>-{currencySymbol}{(totalCartAmount * (discount / 100)).toFixed(0)}</p>
                    </div>
                    <hr />
                  </>
                )}
                <div className="ct-item">
                  <p>Shipping Fee</p>
                  <p>Free</p>
                </div>
                <hr />
                <div className="ct-item">
                  <h3>Total</h3>
                  <h3>
                    {currencySymbol}{totalCartAmount.toFixed(0)}
                  </h3>
                </div>
              </div>
              <Link to='/cart/checkout' className='cl'>
                <button disabled={isCartEmpty || discountedTotal === 0}>
                  <LuShoppingCart /> Checkout
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
