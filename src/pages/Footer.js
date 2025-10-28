import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const POLICY_LINKS = {
  shipping: 'https://merchant.razorpay.com/policy/RYmfT0IFIA9UC6/shipping',
  terms: 'https://merchant.razorpay.com/policy/RYmfT0IFIA9UC6/terms',
  refund: 'https://merchant.razorpay.com/policy/RYmfT0IFIA9UC6/refund'
};

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSection = (index) => setOpenIndex(openIndex === index ? null : index);

  const buildPath = (section, item) => {
    const slug = encodeURIComponent(item);
    if (section === 'Categories') {
      if (/^mens?$/i.test(item)) return '/men';
      if (/^womens?$/i.test(item)) return '/women';
      if (/^kids?$/i.test(item)) return '/kids';
    }
    if (section === 'Women') return `/women?category=${slug}`;
    if (section === 'Men') return `/men?category=${slug}`;
    if (section === 'Kids') return `/kids?category=${slug}`;
    if (section === 'Brands') return '/brands';
    return '/';
  };

  const DesktopList = ({ section, items, isSocial }) => (
    <ul>
      {items.map((item, i) =>
        isSocial ? (
          <li key={i}>{item}</li>
        ) : (
          <li key={i}>
            <Link className="link-btn" to={buildPath(section, typeof item === 'string' ? item : '')}>
              {item}
            </Link>
          </li>
        )
      )}
    </ul>
  );

  const ExternalList = ({ items }) => (
    <ul>
      {items.map((it, i) => (
        <li key={i}>
          <a className="link-btn" href={it.href} target="_blank" rel="noreferrer">
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  );

  const mobileSections = [
    { title: 'Categories', items: ['Mens', 'Womens', 'Kids'], social: false },
    {
      title: 'Customer Service',
      items: ['Help Center', 'Returns & Exchanges', 'Shipping Info', 'Track Order', 'FAQs'],
      social: false
    },
    {
      title: 'Policies',
      items: [
        { href: POLICY_LINKS.shipping, label: 'Shipping Policy' },
        { href: POLICY_LINKS.terms, label: 'Terms & Conditions' },
        { href: POLICY_LINKS.refund, label: 'Cancellation & Refunds' }
      ],
      external: true
    },
    {
      title: 'Follow Us',
      items: [
        <>
          <a className="link-btn" href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF /> Facebook
          </a>
        </>,
        <>
          <a className="link-btn" href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram /> Instagram
          </a>
        </>,
        <>
          <a className="link-btn" href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter /> Twitter
          </a>
        </>,
        <>
          <a className="link-btn" href="mailto:support@tarskart.com">
            <FaEnvelope /> support@tarskart.com
          </a>
        </>,
        <>
          <a className="link-btn" href="tel:+919999999999">
            <FaPhoneAlt /> +91-XXXXXXXXXX
          </a>
        </>
      ],
      social: true
    },
    {
      title: 'Women',
      items: [
        "Women's Indianwear",
        "Women's Westernwear",
        'Bags',
        "Women's Footwear",
        "Women's Jewellery",
        'Lingerie',
        "Women's Sportswear",
        "Women's Sleep & lounge",
        "Women's Watches",
        'Fashion Accessories'
      ],
      social: false
    },
    {
      title: 'Men',
      items: [
        'Topwear',
        'Bottomwear',
        'Ethnicwear',
        "Men's Footwear",
        "Men's Accessories",
        'Innerwear & Sleepwear',
        "Men's Watches",
        'Bags & Backpacks',
        'Athleisure',
        'Sports & Fitness'
      ],
      social: false
    },
    {
      title: 'Kids',
      items: [
        'Kids Indianwear',
        'Kids Westernwear',
        'Kids Footwear',
        'Kids Jewellery',
        'Feeding',
        'Kids Sportswear',
        'Kids Sleepwear',
        'Kids Accessories',
        'Toys & Games',
        'Innerwear'
      ],
      social: false
    },
    {
      title: 'Brands',
      items: ['Jockey', 'Tasin Birds', 'Intimacy', 'Naidu hall', 'Indian flower', 'Cucumber', 'Dazzle', 'Quick dry', 'LUX'],
      social: false
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-desktop">
        <div className="footer-column">
          <h2 className="footer-title">Tars Kart</h2>
          <div className="logo-final1">
            <video autoPlay loop muted playsInline>
              <source src="/images/logo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="footer-column">
          <h3>Categories</h3>
          <DesktopList section="Categories" items={['Mens', 'Womens', 'Kids']} />
        </div>
        <div className="footer-column">
          <h3>Customer Service</h3>
          <DesktopList
            section="Customer Service"
            items={['Help Center', 'Returns & Exchanges', 'Shipping Info', 'Track Order', 'FAQs']}
          />
        </div>
        <div className="footer-column">
          <h3>Follow Us</h3>
          <ul>
            <li>
              <a className="link-btn" href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebookF /> Facebook
              </a>
            </li>
            <li>
              <a className="link-btn" href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a className="link-btn" href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter /> Twitter
              </a>
            </li>
            <li>
              <a className="link-btn" href="mailto:support@tarskart.com">
                <FaEnvelope /> support@tarskart.com
              </a>
            </li>
            <li>
              <a className="link-btn" href="tel:+919999999999">
                <FaPhoneAlt /> +91-XXXXXXXXXX
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-desktop">
        <div className="footer-column">
          <h3>Women</h3>
          <DesktopList
            section="Women"
            items={[
              "Women's Indianwear",
              "Women's Westernwear",
              'Bags',
              "Women's Footwear",
              "Women's Jewellery",
              'Lingerie',
              "Women's Sportswear",
              "Women's Sleep & lounge",
              "Women's Watches",
              'Fashion Accessories'
            ]}
          />
        </div>
        <div className="footer-column">
          <h3>Men</h3>
          <DesktopList
            section="Men"
            items={[
              'Topwear',
              'Bottomwear',
              'Ethnicwear',
              "Men's Footwear",
              "Men's Accessories",
              'Innerwear & Sleepwear',
              "Men's Watches",
              'Bags & Backpacks',
              'Athleisure',
              'Sports & Fitness'
            ]}
          />
        </div>
        <div className="footer-column">
          <h3>Kids</h3>
          <DesktopList
            section="Kids"
            items={[
              'Kids Indianwear',
              'Kids Westernwear',
              'Kids Footwear',
              'Kids Jewellery',
              'Feeding',
              'Kids Sportswear',
              'Kids Sleepwear',
              'Kids Accessories',
              'Toys & Games',
              'Innerwear'
            ]}
          />
        </div>
        <div className="footer-column">
          <h3>Brands</h3>
          <DesktopList section="Brands" items={['Jockey', 'Tasin Birds', 'Intimacy', 'Naidu hall', 'Indian flower', 'Cucumber', 'Dazzle', 'Quick dry', 'LUX']} />
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-desktop">
        <div className="footer-column">
          <h3>Policies</h3>
          <ExternalList
            items={[
              { href: POLICY_LINKS.shipping, label: 'Shipping Policy' },
              { href: POLICY_LINKS.terms, label: 'Terms & Conditions' },
              { href: POLICY_LINKS.refund, label: 'Cancellation & Refunds' }
            ]}
          />
        </div>
        <div className="footer-column footer-pay-secure">
          <h3>Secure Payments</h3>
          <div className="payments-row">
            <img src="/images/payments/visa.png" alt="Visa" />
            <img src="/images/payments/mastercard.png" alt="Mastercard" />
            <img src="/images/payments/rupay.png" alt="RuPay" />
            <img src="/images/payments/upi.png" alt="UPI" />
            <img src="/images/payments/razorpay.svg" alt="Razorpay" />
          </div>
        </div>
      </div>

      <div className="footer-mobile">
        <h2 className="footer-title">Tars Kart</h2>
        {mobileSections.map((section, index) => (
          <div className="footer-mobile-section" key={index}>
            <div className="footer-mobile-header" onClick={() => toggleSection(index)}>
              <h3>{section.title}</h3>
              <span>{openIndex === index ? '-' : '+'}</span>
            </div>
            <div className={`footer-mobile-list ${openIndex === index ? 'show' : ''}`}>
              <ul>
                {section.external
                  ? section.items.map((it, i) => (
                      <li key={i}>
                        <a className="link-btn" href={it.href} target="_blank" rel="noreferrer">
                          {it.label}
                        </a>
                      </li>
                    ))
                  : section.items.map((item, i) =>
                      section.social ? (
                        <li key={i}>{item}</li>
                      ) : (
                        <li key={i}>
                          <Link className="link-btn" to={buildPath(section.title, typeof item === 'string' ? item : '')}>
                            {item}
                          </Link>
                        </li>
                      )
                    )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <a href={POLICY_LINKS.shipping} target="_blank" rel="noreferrer">Shipping</a>
          <span>•</span>
          <a href={POLICY_LINKS.refund} target="_blank" rel="noreferrer">Cancellation & Refunds</a>
          <span>•</span>
          <a href={POLICY_LINKS.terms} target="_blank" rel="noreferrer">Terms & Conditions</a>
        </div>
        <div className="footer-bottom-right">© {new Date().getFullYear()} Tars Kart</div>
      </div>
    </footer>
  );
};

export default Footer;
