import React from 'react';
import './CustomerCare.css';
import { FiPhoneCall, FiMail, FiMessageSquare, FiMapPin, FiArrowRight } from 'react-icons/fi';

const CustomerCare = () => {
  return (
    <div className="care-page">
      <div className="care-bg"></div>
      <div className="care-container">
        <div className="care-hero">
          <h1>Customer Care</h1>
          <p>If you need assistance, we’re here to help. Our customer support is available 24/7.</p>
          <div className="care-chips">
            <span className="chip gold">24/7 Support</span>
            <span className="chip">Avg response ~2h</span>
          </div>
        </div>

        <div className="care-grid">
          <div className="care-card">
            <div className="card-icon"><FiPhoneCall /></div>
            <h2>Call Us</h2>
            <p className="muted">+91 99999 88888</p>
            <a className="care-cta" href="tel:+919999988888">
              Call Now <FiArrowRight />
            </a>
          </div>

          <div className="care-card">
            <div className="card-icon"><FiMail /></div>
            <h2>Email Us</h2>
            <p className="muted">support@tarskart.com</p>
            <a className="care-cta" href="mailto:support@tarskart.com">
              Email Now <FiArrowRight />
            </a>
          </div>

          <div className="care-card">
            <div className="card-icon"><FiMessageSquare /></div>
            <h2>Chat Support</h2>
            <p className="muted">Use the chat bubble at the bottom right corner</p>
            <a className="care-cta" href="#">
              Open Chat <FiArrowRight />
            </a>
          </div>

          <div className="care-card">
            <div className="card-icon"><FiMapPin /></div>
            <h2>Office Address</h2>
            <p className="muted">123, Tars Kart Lane, Fashion City, India - 123456</p>
            <a
              className="care-cta"
              href="https://www.google.com/maps/search/?api=1&query=123+Tars+Kart+Lane+Fashion+City+India+123456"
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps <FiArrowRight />
            </a>
          </div>
        </div>

        <div className="care-note">
          <div className="note-glow"></div>
          <h3>We value your feedback</h3>
          <p>Your experience matters to us. Let us know how we can improve or assist you better.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;
