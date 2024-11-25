import React from 'react';
import { useNavigate } from 'react-router-dom';
import './footer.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import { TfiYoutube } from 'react-icons/tfi';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from "react-icons/fa";


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
           <Link to='newsletter' ><button>Subscribe</button></Link> 
          </div>
          <div className="f-right">
            <h5>Follow us</h5>
            <div className="social">
                <a href="https://www.facebook.com" target="_blank"><FaFacebookF /></a>
                <a href="https://www.instagram.com" target="_blank"><FaInstagram /></a>
                <a href="https://www.twitter.com" target="_blank"><FaXTwitter /></a>
                <a href="https://www.youtube.com" target="_blank"><TfiYoutube /></a>
                <a href="https://www.whatsapp.com" target="_blank"><FaWhatsapp /></a>
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
