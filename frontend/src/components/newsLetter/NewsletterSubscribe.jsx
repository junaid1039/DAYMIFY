import React, { useState } from "react";
import "./newLetter.css"; // Make sure your CSS file matches the naming

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const NewsletterSubscribe = () => {
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset messages
        setMessage("");
        setError("");

        // Validate input
        if (!formData.name || !formData.email) {
            setError("Please fill out both fields.");
            return;
        }

        try {
            // Make API call
            const response = await fetch(`${baseurl}/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // Success message
                setMessage(result.message || "Thank you for subscribing!");
                setFormData({ name: "", email: "" }); // Reset form
            } else {
                // Error message from the server
                setError(result.error || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error subscribing:", error);
            setError("Failed to subscribe. Please check your internet connection.");
        }
    };

    return (
        <div className="newsletter">
            <h2>Subscribe to our Newsletter</h2>
            <p>Stay updated with our latest news and offers!</p>
            <form className="newsletter__form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="newsletter__input"
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="newsletter__input"
                />
                <button type="submit" className="newsletter__button">
                    Subscribe
                </button>
            </form>
            {message && <p className="newsletter__message">{message}</p>}
            {error && <p className="newsletter__error">{error}</p>}
        </div>
    );
};

export default NewsletterSubscribe;
