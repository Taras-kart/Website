import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const CONTACT_EMAIL = 'taraskartonline@gmail.com'
const CONTACT_PHONE = '+91-9859871234'
const COMPANY_NAME = 'Attach'
const WEBSITE = 'www.attach.co.in'

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.topSpacer} />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.subtitle}>Last updated: July 2026</p>
        </div>

        <div style={styles.content}>

          <Section title="1. Introduction">
            <p>
              Welcome to {COMPANY_NAME} ("we", "our", or "us"). We are committed to protecting
              your personal information and your right to privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our
              website <strong>{WEBSITE}</strong> or make a purchase from us.
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please
              discontinue use of our site.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, mobile number, and password when you create an account.</li>
              <li><strong>Order Information:</strong> Shipping address, billing details, and purchase history when you place an order.</li>
              <li><strong>Payment Information:</strong> Payment is processed securely through Razorpay. We do not store your card details.</li>
              <li><strong>Communications:</strong> Messages you send us through email, WhatsApp, or our contact form.</li>
              <li><strong>Device Information:</strong> IP address, browser type, and operating system for security and analytics purposes.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfil your orders</li>
              <li>Send you order confirmations, shipping updates, and delivery notifications</li>
              <li>Send transactional messages via WhatsApp (order confirmation, shipping updates, delivery confirmation)</li>
              <li>Respond to your enquiries and provide customer support</li>
              <li>Manage your account and coin wallet</li>
              <li>Prevent fraud and ensure the security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. WhatsApp Communications">
            <p>
              We use the WhatsApp Business API to send you transactional notifications. By
              providing your mobile number and placing an order, you consent to receive the
              following messages on WhatsApp:
            </p>
            <ul>
              <li><strong>Order Confirmation:</strong> Sent immediately after your order is successfully placed.</li>
              <li><strong>Shipping Notification:</strong> Sent when your order is dispatched, including your tracking number and link.</li>
              <li><strong>Delivery Confirmation:</strong> Sent when your order is marked as delivered.</li>
            </ul>
            <p>
              These are transactional messages only. We do not send promotional or marketing
              messages via WhatsApp without your explicit consent. Message and data rates from
              your mobile carrier may apply.
            </p>
            <p>
              To opt out of WhatsApp notifications, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.link}>{CONTACT_EMAIL}</a> or{' '}
              <a href={`tel:${CONTACT_PHONE}`} style={styles.link}>{CONTACT_PHONE}</a>.
            </p>
          </Section>

          <Section title="5. Sharing Your Information">
            <p>We share your information only in the following circumstances:</p>
            <ul>
              <li>
                <strong>Shipping Partners (Shiprocket):</strong> We share your name, address,
                and contact number with our logistics partner to fulfil and deliver your orders.
              </li>
              <li>
                <strong>Payment Processor (Razorpay):</strong> Payment information is processed
                directly by Razorpay under their privacy policy. We do not receive or store your
                full payment details.
              </li>
              <li>
                <strong>WhatsApp Business API (Meta):</strong> Your mobile number is used to
                send transactional notifications via Meta's WhatsApp Business API. Meta processes
                this data under their own privacy policy.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if required
                by law or in response to valid legal requests.
              </li>
            </ul>
            <p>We do not sell, rent, or trade your personal information to third parties.</p>
          </Section>

          <Section title="6. Data Storage and Security">
            <p>
              Your data is stored on secure servers hosted on Neon PostgreSQL and Vercel
              infrastructure. We implement appropriate technical and organisational measures to
              protect your personal information against unauthorised access, alteration,
              disclosure, or destruction.
            </p>
            <p>
              While we take reasonable steps to protect your information, no method of
              transmission over the internet or electronic storage is 100% secure. We cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use essential cookies and local storage to maintain your session, cart, and
              wishlist. These are necessary for the website to function correctly. We do not
              use tracking or advertising cookies.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal obligations.</li>
              <li><strong>Opt-out:</strong> Opt out of WhatsApp notifications at any time by contacting us.</li>
              <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.link}>{CONTACT_EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Our services are not directed to individuals under the age of 18. We do not
              knowingly collect personal information from children. If you believe we have
              inadvertently collected information from a minor, please contact us immediately.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              Our website may contain links to third-party websites (such as Razorpay's payment
              portal or Shiprocket's tracking page). We are not responsible for the privacy
              practices of these external sites and encourage you to review their privacy policies.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by updating the date at the top of this page. Your continued
              use of our services after changes are posted constitutes your acceptance of the
              updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or
              our data practices, please contact us:
            </p>
            <div style={styles.contactBox}>
              <div><strong>{COMPANY_NAME}</strong></div>
              <div>
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} style={styles.link}>{CONTACT_EMAIL}</a>
              </div>
              <div>
                Phone:{' '}
                <a href={`tel:${CONTACT_PHONE}`} style={styles.link}>{CONTACT_PHONE}</a>
              </div>
              <div>Website: {WEBSITE}</div>
            </div>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e5e7eb'
  },
  topSpacer: {
    height: 80
  },
  container: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '40px 20px 60px'
  },
  header: {
    borderBottom: '1px solid #222',
    paddingBottom: 24,
    marginBottom: 40
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    color: '#ffffff',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0
  },
  section: {
    borderBottom: '1px solid #1a1a1a',
    paddingBottom: 28,
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f9fafb',
    marginBottom: 12,
    marginTop: 0
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 1.75,
    color: '#d1d5db'
  },
  contactBox: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 8,
    padding: '16px 20px',
    marginTop: 12,
    lineHeight: 2,
    fontSize: 14
  },
  link: {
    color: '#ca8a04',
    textDecoration: 'none'
  }
}
