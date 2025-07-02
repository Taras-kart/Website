import React from 'react';
import './CustomerCare.css';

const CustomerCare = () => {
  return (
    <div className="care-container">
      <h1>Customer Care</h1>
      <p>If you need assistance, we’re here to help. Our customer support is available 24/7.</p>

      <div className="care-info">
        <div className="care-card">
          <h2>📞 Call Us</h2>
          <p>+91 99999 88888</p>
        </div>
        <div className="care-card">
          <h2>📧 Email Us</h2>
          <p>support@tarskart.com</p>
        </div>
        <div className="care-card">
          <h2>💬 Chat Support</h2>
          <p>Use the chat bubble at the bottom right corner</p>
        </div>
        <div className="care-card">
          <h2>📍 Office Address</h2>
          <p>123, Tars Kart Lane, Fashion City, India - 123456</p>
        </div>
      </div>

      <div className="care-note">
        <h3>We value your feedback</h3>
        <p>Your experience matters to us. Let us know how we can improve or assist you better.</p>
      </div>
    </div>
  );
};

export default CustomerCare;
