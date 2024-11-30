import React, { useState, useEffect, useContext } from 'react';
import './checkout.css';
import { Country, State } from 'country-state-city';
import { FaHome } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Context } from '../../context API/Contextapi';
import Stepper from '../../components/stepper/Stepper';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Checkout = ({ user }) => {
    const { getTotalCartAmount, userinfo, handleShippingSubmit } = useContext(Context);
    const [currentStep] = useState(2);

    // Load from local storage if available
    const savedShippingInfo = JSON.parse(localStorage.getItem('shippingInfo')) || {};

    const [name, setName] = useState(user?.name || savedShippingInfo.name || "");
    const [email, setEmail] = useState(user?.email || savedShippingInfo.email || "");
    const [country, setcountry] = useState(savedShippingInfo.country || "");
    const [state, setstate] = useState(savedShippingInfo.state || "");
    const [address, setAddress] = useState(savedShippingInfo.address || "");
    const [city, setCity] = useState(savedShippingInfo.city || "");
    const [postcode, setPostcode] = useState(savedShippingInfo.postcode || "");
    const [phone, setphone] = useState(savedShippingInfo.phone || "");
    const [useSavedAddress, setUseSavedAddress] = useState(!!savedShippingInfo.address);

    const [errors, setErrors] = useState({}); // For tracking errors in fields

    const saveShippingInfo = () => {
        // Validate all fields
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        if (!country.trim()) newErrors.country = "Country is required";
        if (!state.trim()) newErrors.state = "State is required";
        if (!address.trim()) newErrors.address = "Address is required";
        if (!city.trim()) newErrors.city = "City is required";
        if (!postcode.trim()) newErrors.postcode = "Postal code is required";
        if (!phone.trim()) newErrors.phone = "Phone number is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Save to local storage if no errors
            const shippingInfo = {
                name,
                email,
                country,
                state,
                address,
                city,
                postcode,
                phone
            };
            localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
            setUseSavedAddress(true); // Switch to saved address view
        }
    };

    useEffect(() => {
        const UserInfo = async () => {
            const data = await userinfo();
            setName(data.name);
            setEmail(data.email);
        };

        UserInfo();
    }, [userinfo]);

    const shippingInfo = {
        name,
        email,
        country,
        state,
        address,
        city,
        postcode,
        phone
    };

    return (
        <>
            <Stepper currentStep={currentStep} />
            <div className="checkout">
                {useSavedAddress ? (
                    <div className="saved-address-box">
                        <h4>Saved Address</h4>
                        <p>{name}</p>
                        <p>{email}</p>
                        <p>{address}</p>
                        <p>{city}, {state}, {country}</p>
                        <p>{postcode}</p>
                        <p>{phone}</p>
                        <button onClick={() => setUseSavedAddress(false)}>Edit Address</button>
                    </div>
                ) : (
                    <div className="shippingbox">
                        <h4>Shipping Address</h4>
                        <div>
                            <label>
                                Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                
                            />
                            {errors.name && <p className="error-text">{errors.name}</p>}
                        </div>
                        <div>
                            <label>
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                
                            />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>
                        <div>
                            <label>
                                Address <span className="required">*</span>
                            </label>
                            <FaHome />
                            <input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                
                            />
                            {errors.address && <p className="error-text">{errors.address}</p>}
                        </div>
                        <div>
                            <label>
                                City <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                
                            />
                            {errors.city && <p className="error-text">{errors.city}</p>}
                        </div>
                        <div>
                            <label>
                                Phone <span className="required">*</span>
                            </label>
                            <PhoneInput
                                country={country.toLowerCase()}
                                value={phone}
                                onChange={(phone) => setphone(phone)}
                               
                            />
                            {errors.phone && <p className="error-text">{errors.phone}</p>}
                        </div>
                        <div>
                            <label>
                                Postal Code <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Postal code"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value)}
                                
                            />
                            {errors.postcode && <p className="error-text">{errors.postcode}</p>}
                        </div>
                        <div>
                            <label>
                                Country <span className="required">*</span>
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setcountry(e.target.value)}
                                
                            >
                                <option value="">Select Country</option>
                                {Country.getAllCountries().map((item) => (
                                    <option key={item.isoCode} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {errors.country && <p className="error-text">{errors.country}</p>}
                        </div>
                        {country && (
                            <div>
                                <label>
                                    State <span className="required">*</span>
                                </label>
                                <select
                                    value={state}
                                    onChange={(e) => setstate(e.target.value)}
                                    
                                >
                                    <option value="">Select State</option>
                                    {State.getStatesOfCountry(
                                        Country.getAllCountries().find(c => c.name === country)?.isoCode
                                    ).map((item) => (
                                        <option key={item.isoCode} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.state && <p className="error-text">{errors.state}</p>}
                            </div>
                        )}
                        <button className="sa" onClick={saveShippingInfo}>
                            Save Address
                        </button>
                    </div>
                )}

                <div className="ch-right">
                    <div className="cartitem-total">
                        <div>
                            <div className="ct-item">
                                <p>Subtotal</p>
                                <p>${getTotalCartAmount()}</p>
                            </div>
                            <hr />
                            <div className="ct-item">
                                <p>Shipping Fee</p>
                                <p>Free</p>
                            </div>
                            <hr />
                            <div className="ct-item">
                                <h3>Total</h3>
                                <h3>${getTotalCartAmount()}</h3>
                            </div>
                        </div>
                        <Link to="payment" className="cl">
                            <button onClick={() => handleShippingSubmit(shippingInfo)}>Continue</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
