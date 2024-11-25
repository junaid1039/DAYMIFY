import React from 'react';
import './aboutus.css'; // Import the CSS file for styling

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <h1>About Us</h1>
            <p>
                Welcome to [Your Company Name]! We are dedicated to providing the best products and services to our customers. Our journey began in [Year] with a mission to [your mission statement or purpose].
            </p>
            <h2>Our Vision</h2>
            <p>
                Our vision is to be the leading provider of [industry/product] by delivering innovative solutions that meet the evolving needs of our customers.
            </p>
            <h2>Our Mission</h2>
            <p>
                We strive to [your mission details]. Our team    works tirelessly to ensure   customer satisfaction through quality products, exceptional service, and a commitment to excellence.
            </p>
            <h2>Our Values</h2>
            <ul>
                <li>Integrity</li>
                <li>Innovation</li>
                <li>Customer Focus</li>
                <li>Teamwork</li>
                <li>Sustainability</li>
            </ul>
            <h2>Meet the Team</h2>
            <div className="team">
                <div className="team-member">
                    <h3>Israr Shakir</h3>
                    <p>CEO & Founder</p>
                    <p>Jane has over 20 years of experience in the industry and is passionate about delivering quality and value to our customers.</p>
                </div>
                <div className="team-member">
                    <h3>Mansha Shakir</h3>
                    <p>Chief Technology Officer</p>
                    <p>John leads our tech team with a vision for innovation and excellence in product development.</p>
                </div>
                <div className="team-member">
                    <h3>Ali Shakir</h3>
                    <p>Marketing Director</p>
                    <p>Emily is responsible for our brand strategy and marketing efforts to ensure our message reaches the right audience.</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
