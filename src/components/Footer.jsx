/* ============================================
   FOOTER - Gowtham Paints
   ============================================ */

import { Link } from 'react-router-dom';
import { FaPaintRoller } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C280,100 720,0 1440,60 L1440,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <FaPaintRoller />
                </div>
                <span className="footer-logo-text">Gowtham Paints</span>
              </div>
              <p className="footer-desc">
                Premium paint and construction services in Tamil Nadu. 
                Transform your spaces with our expert team and quality materials.
              </p>
              <div className="footer-socials">
                <a href="#" className="social-link" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" className="social-link" aria-label="Instagram"><FiInstagram /></a>
                <a href="#" className="social-link" aria-label="YouTube"><FiYoutube /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <div className="footer-links">
                <Link to="/">Home</Link>
                <Link to="/booking">Book Now</Link>
                <Link to="/gallery">Gallery</Link>
                <Link to="/profile">My Account</Link>
              </div>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4>Services</h4>
              <div className="footer-links">
                <span>Interior Painting</span>
                <span>Exterior Painting</span>
                <span>Texture Painting</span>
                <span>Waterproofing</span>
                <span>Wood Polishing</span>
              </div>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h4>Contact Us</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <FiMapPin />
                  <span>Tamil Nadu, India</span>
                </div>
                <div className="contact-item">
                  <FiPhone />
                  <span>+91 95669 22196</span>
                </div>
                <div className="contact-item">
                  <FiMail />
                  <span>gowthanajith@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Gowtham Paints. All rights reserved.</p>
          <p>Built with ❤️ for beautiful spaces</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
