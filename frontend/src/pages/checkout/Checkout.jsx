import React, { useState, useEffect, useContext } from 'react';
import './checkout.css';
import { Country, State } from 'country-state-city'; 
import { FaHome } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Context } from '../../context API/Contextapi';
import Stepper from '../../components/stepper/Stepper'



const Checkout = ({ user }) => {
    const { getTotalCartAmount,userinfo,handleShippingSubmit } = useContext(Context);
    const [currentStep] = useState(2);
    // Load from local storage if available
    const savedShippingInfo = JSON.parse(localStorage.getItem('shippingInfo')) || {};

    const [name, setName] = useState(user?.name || ""); // Fetch from user or DB
    const [email, setEmail] = useState(user?.email || ""); // Fetch from user or DB
    const [country, setcountry] = useState(savedShippingInfo.country || "");
    const [state, setstate] = useState(savedShippingInfo.state || "");
    const [address, setAddress] = useState(savedShippingInfo.address || "");
    const [city, setCity] = useState(savedShippingInfo.city || "");
    const [postcode, setPostcode] = useState(savedShippingInfo.postcode || "");
    const [phone, setphone] = useState(savedShippingInfo.phone || "");
    const [useSavedAddress, setUseSavedAddress] = useState(!!savedShippingInfo.address); // Check if a saved address exists

    // Function to save shipping information to local storage
    const saveShippingInfo = () => {
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
    };

    // Save to local storage whenever these values change
    useEffect(() => {
        saveShippingInfo();
    }, [country, state, address, city, postcode, phone]);

    useEffect(() => {
        // Fetch user info when the component mounts
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
            {/* If saved address exists, show option to use it */}
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
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <FaHome />
                        <input
                            type="text"
                            placeholder="Address"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="City"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="tel"
                            placeholder="+923021725822"
                            required
                            value={phone}
                            onChange={(e) => setphone(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Postal code"
                            required
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            value={country}
                            required
                            onChange={(e) => setcountry(e.target.value)}
                        >
                            <option value="">Select Country</option>
                            {Country &&
                                Country.getAllCountries().map((item) => (
                                    <option key={item.isoCode} value={item.isoCode}>
                                        {item.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    {country && (
                        <div>
                            <select
                                value={state}
                                required
                                onChange={(e) => setstate(e.target.value)}
                            >
                                <option value="">Select State</option>
                                {State &&
                                    State.getStatesOfCountry(country).map((item) => (
                                        <option key={item.isoCode} value={item.isoCode}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}
                    <button className='sa' onClick={() => setUseSavedAddress(true)}>Save Address</button>
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
                    <Link to='payment' className='cl'>
                        <button onClick={()=>handleShippingSubmit(shippingInfo)} >Continue</button>
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
};

export default Checkout;
