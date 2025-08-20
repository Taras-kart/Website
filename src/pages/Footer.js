import React, { useState } from 'react';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleSection = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <footer className="footer">
            <div className="footer-desktop">
                <div className="footer-column">
                    <h2 className="footer-title">Tars Kart</h2>
                    <div className="logo-final1">
                        <video autoPlay loop muted playsInline>
                            <source src="/images/logo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Categories</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Mens</li>
                        <li>Womens</li>
                        <li>Kids</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Customer Service</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Help Center</li>
                        <li>Returns & Exchanges</li>
                        <li>Shipping Info</li>
                        <li>Track Order</li>
                        <li>FAQs</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Follow Us</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul className="social-icons">
                        <li><FaFacebookF /> Facebook</li>
                        <li><FaInstagram /> Instagram</li>
                        <li><FaTwitter /> Twitter</li>
                        <li><FaEnvelope /> support@tarskart.com</li>
                        <li><FaPhoneAlt /> +91-XXXXXXXXXX</li>
                    </ul>
                </div>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-desktop">
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Women</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Women's Indianwear</li>
                        <li>Women's Westernwear</li>
                        <li>Bags</li>
                        <li>Women's Footwear</li>
                        <li>Women's Jewellery</li>
                        <li>Lingerie</li>
                        <li>Women's Sportswear</li>
                        <li>Women's Sleep & lounge</li>
                        <li>Women's Watches</li>
                        <li>Fashion Accessories</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Men</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Topwear</li>
                        <li>Bottomwear</li>
                        <li>Ethnicwear</li>
                        <li>Men's Footwear</li>
                        <li>Men's Accessories</li>
                        <li>Innerwear & Sleepwear</li>
                        <li>Men's Watches</li>
                        <li>Bags & Backpacks</li>
                        <li>Athleisure</li>
                        <li>Sports & Fitness</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Kids</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Kids Indianwear</li>
                        <li>Kids Westernwear</li>
                        <li>Kids Footwear</li>
                        <li>Kids Jewellery</li>
                        <li>Feeding</li>
                        <li>Kids Sportswear</li>
                        <li>Kids Sleepwear</li>
                        <li>Kids Accessories</li>
                        <li>Toys & Games</li>
                        <li>Innerwear</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <div className="footer-heading-underline">
                        <h3>Brands</h3>
                        <div className="footer-underline">
                            <div className="line3 large3"></div>
                            <div className="line3 medium3"></div>
                            <div className="line3 small3"></div>
                        </div>
                    </div>
                    <ul>
                        <li>Jockey</li>
                        <li>Tasin Birds</li>
                        <li>Intimacy</li>
                        <li>Naidu hall</li>
                        <li>Indian flower</li>
                        <li>Cucumber</li>
                        <li>Dazzle</li>
                        <li>Quick dry</li>
                        <li>LUX</li>
                    </ul>
                </div>
            </div>

            <div className="footer-mobile">
                <h2 className="footer-title">Tars Kart</h2>
                {[
                    { title: 'Categories', items: ['Mens', 'Womens', 'Kids'] },
                    {
                        title: 'Customer Service',
                        items: ['Help Center', 'Returns & Exchanges', 'Shipping Info', 'Track Order', 'FAQs']
                    },
                    {
                        title: 'Follow Us',
                        items: [
                            <><FaFacebookF /> Facebook</>,
                            <><FaInstagram /> Instagram</>,
                            <><FaTwitter /> Twitter</>,
                            <><FaEnvelope /> support@tarskart.com</>,
                            <><FaPhone /> +91-XXXXXXXXXX</>
                        ]
                    },
                    { title: 'Women', items: ['Women\'s Indianwear', 'Women\'s Westernwear', 'Bags', 'Women\'s Footwear', 'Women\'s Jewellery', 'Lingerie', 'Women\'s Sportswear', 'Women\'s Sleep & lounge', 'Women\'s Watches', 'Fashion Accessories'] },
                    { title: 'Men', items: ['Topwear', 'Bottomwear', 'Ethnicwear', 'Men\'s Footwear', 'Men\'s Accessories', 'Innerwear & Sleepwear', 'Men\'s Watches', 'Bags & Backpacks', 'Athleisure', 'Sports & Fitness'] },
                    { title: 'Kids', items: ['Kids Indianwear', 'Kids Westernwear', 'Kids Footwear', 'Kids Jewellery', 'Feeding', 'Kids Sportswear', 'Kids Sleepwear', 'Kids Accessories', 'Toys & Games', 'Innerwear'] },
                    { title: 'Brands', items: ['Jockey', 'Tasin Birds', 'Intimacy', 'Naidu hall', 'Indian flower', 'Cucumber', 'Dazzle', 'Quick dry', 'LUX'] }
                ].map((section, index) => (
                    <div className="footer-mobile-section" key={index}>
                        <div className="footer-mobile-header" onClick={() => toggleSection(index)}>
                            <h3>{section.title}</h3>
                            <span>{openIndex === index ? '-' : '+'}</span>
                        </div>
                        <div className={`footer-mobile-list ${openIndex === index ? 'show' : ''}`}>
                            <ul>
                                {section.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
