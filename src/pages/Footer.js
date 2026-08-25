import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><img src="/logo1.png" alt="Tara" /><p>Quality fashion for women, men and kids, available online and across our stores.</p><div className="footer-social"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a></div></div><div className="footer-column"><h3>Quick links</h3><Link to="/">Home</Link><Link to="/women">Women</Link><Link to="/men">Men</Link><Link to="/kids">Kids</Link><Link to="/brands">Brands</Link></div><div className="footer-column"><h3>Customer care</h3><Link to="/profile">My account</Link><Link to="/track-order">Track order</Link><Link to="/returns">Returns</Link><Link to="/customer-care">Contact us</Link><Link to="/privacy-policy">Privacy policy</Link></div><div className="footer-column footer-contact"><h3>Visit Tara</h3><p><FaMapMarkerAlt />Five store locations</p><p><FaPhoneAlt />Customer support</p><Link to="/customer-care">View stores and support</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Tara Shopping Mall</span><span>All rights reserved</span></div></footer>
}
