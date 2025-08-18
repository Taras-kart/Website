import React from 'react';
import './TandC.css';

const TandC = () => {
  return (
    <div className="tandc-page">
      <div className="tandc-bg"></div>
      <div className="tandc-container">
        <div className="tandc-hero">
          <h1>Terms and Conditions</h1>
          <div className="tc-underline"></div>
        </div>

        <div className="tc-nav">
          <a href="#intro" className="tc-chip">Introduction</a>
          <a href="#eligibility" className="tc-chip">Eligibility</a>
          <a href="#account" className="tc-chip">Account</a>
          <a href="#product" className="tc-chip">Product</a>
          <a href="#pricing" className="tc-chip">Pricing</a>
          <a href="#shipping" className="tc-chip">Shipping</a>
          <a href="#returns" className="tc-chip">Return & Refund</a>
          <a href="#ip" className="tc-chip">Intellectual Property</a>
          <a href="#law" className="tc-chip">Governing Law</a>
          <a href="#contact" className="tc-chip">Contact</a>
        </div>

        <main className="tc-content">
          <section id="intro" className="tc-section">
            <h2>1. Introduction</h2>
            <p>Welcome to Tars Kart. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
          </section>

          <section id="eligibility" className="tc-section">
            <h2>2. Eligibility</h2>
            <p>To use our services, you must be at least 18 years old or under supervision of a legal guardian.</p>
          </section>

          <section id="account" className="tc-section">
            <h2>3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account.</p>
          </section>

          <section id="product" className="tc-section">
            <h2>4. Product Information</h2>
            <p>We attempt to be as accurate as possible with product descriptions. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, or error-free.</p>
          </section>

          <section id="pricing" className="tc-section">
            <h2>5. Pricing</h2>
            <p>Prices for products are subject to change without notice. We reserve the right to modify or discontinue a product at any time.</p>
          </section>

          <section id="shipping" className="tc-section">
            <h2>6. Shipping and Delivery</h2>
            <p>We will make reasonable efforts to deliver products within the time specified. However, delays may occur due to unforeseen circumstances.</p>
          </section>

          <section id="returns" className="tc-section">
            <h2>7. Return and Refund</h2>
            <p>Products can be returned within 7 days from the date of delivery, provided they are unused and in original packaging. Refunds will be processed within 7-10 business days.</p>
          </section>

          <section id="ip" className="tc-section">
            <h2>8. Intellectual Property</h2>
            <p>All content on this site is the property of Tars Kart and protected by applicable copyright laws. No material may be copied, reproduced, or redistributed without our written permission.</p>
          </section>

          <section id="law" className="tc-section">
            <h2>9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of your country, without regard to its conflict of law provisions.</p>
          </section>

          <section id="contact" className="tc-section">
            <h2>10. Contact</h2>
            <p>For any questions regarding these Terms, you may contact our customer service team.</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TandC;
