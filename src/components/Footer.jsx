import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>© {new Date().getFullYear()} FinSight. All Rights Reserved.</p>
        </div>
        <div className="footer-right">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
