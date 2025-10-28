// D:\shopping\src\pages\TandC.js
import React from 'react';
import './TandC.css';

const TandC = () => {
  return (
    <div className="tandc-page">
      <div className="tandc-bg"></div>
      <div className="tandc-container">
        <div className="tandc-hero">
          <h1>Terms and Policies</h1>
          <div className="tc-underline"></div>
        </div>

        <div className="policy-links">
          <a className="policy-card" href="/terms#contact">
            <div className="p-icon">📞</div>
            <div className="p-text">
              <div className="p-title">Contact Us</div>
              <div className="p-url">https://taras-kart-shopping-mall.vercel.app/terms#contact</div>
            </div>
          </a>
          <a className="policy-card" href="/terms#shipping">
            <div className="p-icon">📦</div>
            <div className="p-text">
              <div className="p-title">Shipping Policy</div>
              <div className="p-url">https://taras-kart-shopping-mall.vercel.app/terms#shipping</div>
            </div>
          </a>
          <a className="policy-card" href="/terms">
            <div className="p-icon">📄</div>
            <div className="p-text">
              <div className="p-title">Terms and Conditions</div>
              <div className="p-url">https://taras-kart-shopping-mall.vercel.app/terms</div>
            </div>
          </a>
          <a className="policy-card" href="/terms#refund">
            <div className="p-icon">↩️</div>
            <div className="p-text">
              <div className="p-title">Cancellations & Refunds</div>
              <div className="p-url">https://taras-kart-shopping-mall.vercel.app/terms#refund</div>
            </div>
          </a>
        </div>

        <div className="tc-nav">
          <a href="#intro" className="tc-chip">Introduction</a>
          <a href="#eligibility" className="tc-chip">Eligibility</a>
          <a href="#account" className="tc-chip">Account</a>
          <a href="#product" className="tc-chip">Product</a>
          <a href="#pricing" className="tc-chip">Pricing</a>
          <a href="#shipping" className="tc-chip">Shipping Policy</a>
          <a href="#refund" className="tc-chip">Cancellations & Refunds</a>
          <a href="#ip" className="tc-chip">Intellectual Property</a>
          <a href="#law" className="tc-chip">Governing Law</a>
          <a href="#contact" className="tc-chip">Contact</a>
        </div>

        <main className="tc-content">
          <section id="intro" className="tc-section">
            <h2>1. Introduction</h2>
            <p>Welcome to Taras Kart. By accessing or using our website or placing an order, you agree to these Terms, the Shipping Policy, and the Cancellations & Refunds Policy contained on this page.</p>
          </section>

          <section id="eligibility" className="tc-section">
            <h2>2. Eligibility</h2>
            <p>You must be at least 18 years old, or use the site under the supervision of a parent or legal guardian.</p>
          </section>

          <section id="account" className="tc-section">
            <h2>3. Account Responsibilities</h2>
            <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
          </section>

          <section id="product" className="tc-section">
            <h2>4. Product Information</h2>
            <p>We strive for accuracy in product details. Minor variations in color, size, or packaging may occur. Images are for illustration.</p>
          </section>

          <section id="pricing" className="tc-section">
            <h2>5. Pricing and Payments</h2>
            <p>All prices are displayed in INR and inclusive of applicable taxes unless specified. We accept Cash on Delivery and online payments via UPI, Cards, and Netbanking processed securely through Razorpay.</p>
          </section>

          <section id="shipping" className="tc-section">
            <h2>6. Shipping Policy</h2>
            <p>Orders are processed within 1–2 business days after payment confirmation or order placement for COD. Dispatch timelines may vary during peak periods or due to stock availability.</p>
            <p>Estimated delivery time is 2–7 business days for metro cities and 5–10 business days for other locations. Delivery times are estimates and not guaranteed.</p>
            <p>We ship across India through reliable courier partners. Shipping charges, if any, are shown at checkout before payment.</p>
            <p>Once shipped, you will receive a tracking link via email or SMS. If the package is undeliverable due to an incorrect address or repeated delivery attempts, it may be returned. Re-shipping can be arranged at the buyer’s cost.</p>
            <p>Damaged or tampered parcels should be refused at delivery and reported to us within 24 hours with photos.</p>
          </section>

          <section id="refund" className="tc-section">
            <h2>7. Cancellations and Refunds</h2>
            <p>Orders can be cancelled before dispatch by contacting us with your order ID. If already dispatched, cancellation is not guaranteed.</p>
            <p>Returns are accepted within 7 days of delivery for unused, unwashed items in original packaging with all tags intact. Items that are used, damaged, or missing tags are not eligible.</p>
            <p>Non-returnable items include perishable goods, intimate wear, gift cards, and items marked as final sale.</p>
            <p>For return initiation, email or WhatsApp us with your order ID, reason, and photos. On approval, we will arrange pickup where available or share the return address. Return shipping fees may apply if the reason is not due to our error.</p>
            <p>Refunds for prepaid orders are issued to the original payment method within 5–10 business days after quality check. COD refunds are processed to your bank/UPI details shared during the return process within 5–10 business days after quality check.</p>
            <p>Exchanges are subject to stock availability. If the requested item is not available, a refund will be issued instead.</p>
          </section>

          <section id="ip" className="tc-section">
            <h2>8. Intellectual Property</h2>
            <p>All site content is the property of Taras Kart. You may not copy, reproduce, or distribute content without prior written permission.</p>
          </section>

          <section id="law" className="tc-section">
            <h2>9. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Bangalore, Karnataka.</p>
          </section>

          <section id="contact" className="tc-section">
            <h2>10. Contact Us</h2>
            <p>Taras Kart</p>
            <p>Email: <a className="tc-link" href="mailto:taraskartonline@gmail.com">taraskartonline@gmail.com</a></p>
            <p>Customer Support: Mon–Sat, 10:00 AM–6:00 PM IST</p>
            <p>For order issues, include your Order ID and photos (if applicable) for faster resolution.</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TandC;
