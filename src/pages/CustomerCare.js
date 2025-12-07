// D:\shopping\src\pages\CustomerCare.js
import React from 'react';
import './CustomerCare.css';
import {
  FiPhoneCall,
  FiMail,
  FiMessageSquare,
  FiMapPin,
  FiArrowRight,
} from 'react-icons/fi';

const CustomerCare = () => {
  return (
    <div className="care-page">
      <div className="care-bg" />
      <div className="care-container">
        <header className="care-hero">
          <p className="care-eyebrow">Support & assistance</p>
          <h1>Customer Care</h1>
          <p className="care-subtitle">
            If you need any help with your orders, account or payments, our support team is available at all times.
          </p>
          <div className="care-meta">
            <span className="meta-pill primary">24/7 support</span>
            <span className="meta-pill">Average response time 2 hours</span>
          </div>
        </header>

        <section className="care-layout">
          <div className="care-list">
            <div className="care-item">
              <div className="care-item-main">
                <div className="care-icon-wrap">
                  <FiPhoneCall />
                </div>
                <div className="care-text">
                  <h2>Call us</h2>
                  <p className="care-label">Phone</p>
                  <p className="care-value">+91 81791 97108</p>
                </div>
              </div>
              <a className="care-action" href="tel:+918179197108">
                <span>Call now</span>
                <FiArrowRight />
              </a>
            </div>

            <div className="care-item">
              <div className="care-item-main">
                <div className="care-icon-wrap">
                  <FiMail />
                </div>
                <div className="care-text">
                  <h2>Email us</h2>
                  <p className="care-label">Support email</p>
                  <p className="care-value">taraskartonline@gmail.com</p>
                </div>
              </div>
              <a className="care-action" href="mailto:taraskartonline@gmail.com">
                <span>Send email</span>
                <FiArrowRight />
              </a>
            </div>

            <div className="care-item">
              <div className="care-item-main">
                <div className="care-icon-wrap">
                  <FiMessageSquare />
                </div>
                <div className="care-text">
                  <h2>Chat support</h2>
                  <p className="care-label">Instant assistance</p>
                  <p className="care-value">Use the chat bubble at the bottom right corner</p>
                </div>
              </div>
              <a className="care-action care-action-secondary" href="#chat">
                <span>Open chat</span>
                <FiArrowRight />
              </a>
            </div>

            <div className="care-item">
              <div className="care-item-main">
                <div className="care-icon-wrap">
                  <FiMapPin />
                </div>
                <div className="care-text">
                  <h2>Office address</h2>
                  <p className="care-label">Head office</p>
                  <p className="care-value">
                    Door No: 16-1-61, MG Road, Manhar Shopping mall, Vizianagaram, Andhra Pradesh, India, 535002
                  </p>
                </div>
              </div>
              <a
                className="care-action care-action-secondary"
                href="https://www.google.com/maps/search/?api=1&query=123+Tars+Kart+Lane+Fashion+City+India+123456"
                target="_blank"
                rel="noreferrer"
              >
                <span>Open in Maps</span>
                <FiArrowRight />
              </a>
            </div>
          </div>

          <aside className="care-side">
            <div className="care-side-inner">
              <h3>When to contact us</h3>
              <ul className="care-list-points">
                <li>Order status, delivery updates or returns</li>
                <li>Payment issues or refund clarifications</li>
                <li>Account or profile related queries</li>
                <li>Product information and size guidance</li>
              </ul>
              <p className="care-side-note">
                Keep your order ID handy. It helps us assist you faster.
              </p>
            </div>
          </aside>
        </section>

        <section className="care-note">
          <div className="note-overlay" />
          <div className="care-note-content">
            <h4>We value your feedback</h4>
            <p>
              Your experience with TarsKart helps us improve our service quality. If you faced an issue or have a
              suggestion, we would like to hear from you.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerCare;
