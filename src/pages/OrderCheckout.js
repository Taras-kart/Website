import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OrderCheckout.css';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

export default function OrderCheckout() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const payload = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tk_checkout_payload') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tk_checkout_address') || '{}');
      if (saved && typeof saved === 'object') {
        setForm((f) => ({ ...f, ...saved }));
      }
    } catch {}
  }, []);

  const fmt = (n) => Number(n || 0).toFixed(2);

  const itemsCount = Array.isArray(payload?.items) ? payload.items.reduce((a, i) => a + Number(i.qty || 1), 0) : 0;
  const payable = payload?.totals?.payable || 0;

  const setF = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const isValidEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidMobile = (m) => !m || /^[0-9]{10}$/.test(String(m).replace(/\D/g, ''));
  const isValidPincode = (p) => !p || /^[0-9]{6}$/.test(String(p).replace(/\D/g, ''));
  const requiredOk = form.name && form.mobile && form.address_line1 && form.city && form.state && form.pincode;
  const formatsOk = isValidEmail(form.email) && isValidMobile(form.mobile) && isValidPincode(form.pincode);
  const canPlace = requiredOk && formatsOk && Array.isArray(payload?.items) && payload.items.length > 0 && !placing;

  const placeOrder = async () => {
    if (!canPlace) {
      setToast('Please complete the form correctly');
      setTimeout(() => setToast(''), 1500);
      return;
    }
    setPlacing(true);
    const loginEmail = sessionStorage.getItem('userEmail') || null;
    const shipping_address = {
      line1: form.address_line1,
      line2: form.address_line2,
      city: form.city,
      state: form.state,
      pincode: form.pincode
    };
    const body = {
      customer_email: form.email || null,
      customer_name: form.name || null,
      customer_mobile: form.mobile || null,
      shipping_address,
      totals: payload.totals,
      items: payload.items,
      branch_id: null,
      payment_status: 'COD',
      login_email: loginEmail
    };
    try {
      const resp = await fetch(`${API_BASE}/api/sales/web/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setOrderId(data?.id || null);
      setSuccess(true);
      sessionStorage.removeItem('tk_checkout_payload');
      localStorage.setItem('tk_checkout_address', JSON.stringify(form));
    } catch {
      setToast('Failed to place order');
      setTimeout(() => setToast(''), 1500);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page dark">
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-head">
          <h1>Checkout</h1>
          <div className="chip">{itemsCount} item(s)</div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form">
            <div className="card">
              <h3>Contact</h3>
              <div className="row2">
                <input
                  placeholder="Full Name*"
                  value={form.name}
                  onChange={(e) => setF('name', e.target.value)}
                  className={!form.name ? 'err' : ''}
                />
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setF('email', e.target.value)}
                  className={form.email && !isValidEmail(form.email) ? 'err' : ''}
                />
              </div>
              <input
                placeholder="Mobile* (10 digits)"
                value={form.mobile}
                onChange={(e) => setF('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={!isValidMobile(form.mobile) ? 'err' : ''}
              />
            </div>

            <div className="card">
              <h3>Shipping</h3>
              <input
                placeholder="Address Line 1*"
                value={form.address_line1}
                onChange={(e) => setF('address_line1', e.target.value)}
                className={!form.address_line1 ? 'err' : ''}
              />
              <input
                placeholder="Address Line 2"
                value={form.address_line2}
                onChange={(e) => setF('address_line2', e.target.value)}
              />
              <div className="row2">
                <input
                  placeholder="City*"
                  value={form.city}
                  onChange={(e) => setF('city', e.target.value)}
                  className={!form.city ? 'err' : ''}
                />
                <input
                  placeholder="State*"
                  value={form.state}
                  onChange={(e) => setF('state', e.target.value)}
                  className={!form.state ? 'err' : ''}
                />
              </div>
              <input
                placeholder="Pincode* (6 digits)"
                value={form.pincode}
                onChange={(e) => setF('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={!isValidPincode(form.pincode) ? 'err' : ''}
              />
              <div className="inline-actions">
                <a className="link" href="/cart">Back to Cart</a>
                <button
                  onClick={() => {
                    localStorage.setItem('tk_checkout_address', JSON.stringify(form));
                    setToast('Address saved');
                    setTimeout(() => setToast(''), 1200);
                  }}
                  className="ghost"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>

          <div className="checkout-summary">
            <div className="card gold">
              <h3>Order Summary</h3>
              <div className="summary">
                <div><span>Bag Total</span><span>₹{fmt(payload?.totals?.bagTotal)}</span></div>
                <div><span>Discount</span><span>-₹{fmt(payload?.totals?.discountTotal)}</span></div>
                {!!payload?.totals?.couponPct && (
                  <div><span>Coupon</span><span>-₹{fmt(payload?.totals?.couponDiscount)}</span></div>
                )}
                <div><span>Convenience</span><span>₹{fmt(payload?.totals?.convenience)}</span></div>
                {!!payload?.totals?.giftWrap && (
                  <div><span>Gift Wrap</span><span>₹{fmt(payload?.totals?.giftWrap)}</span></div>
                )}
                <div className="sep" />
                <div className="total"><span>Total</span><span>₹{fmt(payable)}</span></div>
              </div>
              <button onClick={placeOrder} disabled={!canPlace} className="cta">
                {placing ? <span className="spinner" /> : null}
                {placing ? 'Placing…' : 'Place Order (COD)'}
              </button>
              <div className="note">Secure checkout • No extra fees</div>
            </div>

            <div className="card mini">
              <h4>Need Help?</h4>
              <p>Questions about delivery or payment? Write to <a href="mailto:taraskartonline@gmail.com">taraskartonline@gmail.com</a></p>
            </div>
          </div>
        </div>

        {success && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="success-icon">✓</div>
              <h2>Order Placed</h2>
              <p>Thank you for shopping with us.</p>
              {orderId ? <div className="order-id">Order ID: #{orderId}</div> : null}
              <div className="modal-actions">
                <a className="btn ghost" href="/">Continue Shopping</a>
                <button className="btn solid" onClick={() => setSuccess(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {!!toast && <div className="toast show">{toast}</div>}
      </div>
      <Footer />
    </div>
  );
}
