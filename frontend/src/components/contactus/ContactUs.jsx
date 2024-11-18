import React, { useState } from 'react';
import './contactus.css';

const ContactUs = () => {
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${baseurl}/createquory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Form submitted successfully:', data);

                // Reset form after submission
                setFormData({
                    firstname: '',  // Changed to match form field names
                    lastname: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                });
                alert('Your query has been submitted successfully.');
            } else {
                console.error('Failed to submit form');
                alert('Failed to submit your query. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting your query. Please try again.');
        }
    };

    return (
        <div className="contact-us-container">
            <h1>Contact Us</h1>
            <div className="customer-service-info">
                <h3>Customer Service</h3>
                <p>Call: 800-441-4488</p>
                <p>Monday to Friday: 9am - 9pm EST</p>
                <p>Saturday: 10am - 9pm EST</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="name-container">
                    <input
                        type="text"
                        name="firstname"
                        placeholder="First Name"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="lastname"
                        placeholder="Last Name"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="other-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="+192222222222"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <button className='contact-s-btn' type="submit">Send</button>
            </form>
        </div>
    );
};

export default ContactUs;
