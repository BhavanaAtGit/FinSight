import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`vs-navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">FinSight</Link> {/* Wrap logo in Link to redirect to homepage */}
      <div className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </div>
      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/features">Features</Link>
        <Link to="/about">About</Link>
        <button className="nav-cta">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
