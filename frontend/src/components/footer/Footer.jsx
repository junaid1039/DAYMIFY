import React from 'react';
import { useNavigate } from 'react-router-dom';
import './footer.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import { TfiYoutube } from 'react-icons/tfi';

const Footer = React.memo(() => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <>
      <div className="footer">
        <div className="c-footer">
          <div className="f-left">
            <h5>Customer Service</h5>
            <p>Monday to Friday: 9am - 9pm EST, Saturday: 10am - 9pm EST</p>
            <a href="tel:your-phone-number">+923072571086</a>
            <label onClick={() => navigate('/contactus')}>Contact us</label>
          </div>
          <div className="f-middle">
            <h5>NewsLetter</h5>
            <p>Receive our newsletter and discover our stories, collections, and surprises.</p>
            <button onClick={() => alert('Subscribed!')}>Subscribe</button>
          </div>
          <div className="f-right">
            <h5>Follow us</h5>
            <div className="social">
              <FaFacebookF />
              <FaInstagram />
              <FaXTwitter />
              <TfiYoutube />
            </div>
          </div>
        </div>
      </div>
      <div className="copyright">
        <img src={logo} alt="Daymify Logo" />
        <p>© DAYMIFY {year}. All rights reserved.</p>
      </div>
    </>
  );
});

export default Footer;
