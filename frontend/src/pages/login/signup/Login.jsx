import React, { useState, useContext } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Myorders from "../../../components/userinfo/orders/Myorders";
import AdressBook from "../../../components/userinfo/adressbook/Adressbook";
import Pi from "../../../components/userinfo/pi/Pi";
import { Context } from "../../../context API/Contextapi";
import './login.css';
import Loader from "../../../components/loader/Loader";

const Login = () => {
    const { signup, login, handleLogout } = useContext(Context);
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        email: ""
    });
    const [activeLink, setActiveLink] = useState('userinfo');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLinkClick = (link) => {
        setActiveLink(link);
        navigate(`/${link}`);
    };

    const handleAuth = async () => {
        setIsLoading(true);
        try {
            if (state === "Login") {
                await login(formData, navigate);
            } else {
                await signup(formData, navigate);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleAuth();
        }
    };

    return (
        <div>
            {isLoading && <Loader />} {/* Full-screen loader */}
            {sessionStorage.getItem('auth-token') ? (
                <>
                    <div className="login__my-account">My Account</div>
                    <div className="login__main">
                        <div className="login__left-nav">
                            <Link
                                className={`login__link ${activeLink === 'userinfo' ? 'login__link--active' : ''}`}
                                to="userinfo"
                                onClick={() => handleLinkClick('userinfo')}>
                                <h4>Profile</h4>
                            </Link>
                            <Link
                                className={`login__link ${activeLink === 'myorders' ? 'login__link--active' : ''}`}
                                to="myorders"
                                onClick={() => handleLinkClick('myorders')}>
                                <h4>Orders</h4>
                            </Link>
                            <h4 onClick={() => handleLogout(navigate)}>Logout</h4>
                        </div>
                        <div className="login__content">
                            <Routes>
                                <Route path="userinfo" element={<Pi />} />
                                <Route path="addressbook" element={<AdressBook />} />
                                <Route path="myorders" element={<Myorders />} />
                            </Routes>
                        </div>
                    </div>
                </>
            ) : (
                <div className="login__auth-container">
                    <div
                        className="login__box"
                        onKeyDown={handleKeyDown} // Add keydown event listener here
                        tabIndex="0" // Make the div focusable to capture key events
                    >
                        <h1>{state}</h1>
                        <div className="login__fields">
                            {state === "Sign Up" && (
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={changeHandler}
                                    type="text"
                                    placeholder="Your Name"
                                />
                            )}
                            <input
                                name="email"
                                value={formData.email}
                                onChange={changeHandler}
                                type="email"
                                placeholder="Email"
                            />
                            <input
                                name="password"
                                value={formData.password}
                                onChange={changeHandler}
                                type="password"
                                placeholder="Password"
                            />
                        </div>
                        {state === "Sign Up" && (
                            <div className="login__agree">
                                <input type="checkbox" />
                                <p>By Continuing, I agree to the Terms and Privacy.</p>
                            </div>
                        )}
                        <button onClick={handleAuth} disabled={isLoading}>
                            {isLoading ? "" : "Continue"}
                        </button>
                        {state === "Sign Up" ? (
                            <p className="login__switch">
                                Already have an Account? 
                                <span onClick={() => setState("Login")}>Login</span>
                            </p>
                        ) : (
                            <p className="login__switch">
                                Create an Account? 
                                <span onClick={() => setState("Sign Up")}>Sign Up</span>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default Login;
