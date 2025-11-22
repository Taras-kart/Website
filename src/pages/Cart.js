// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import './Cart.css';
import { FaTimes, FaCheck, FaTag, FaChevronRight } from 'react-icons/fa';
import Popup from './Popup';
import { useNavigate } from 'react-router-dom';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const Cart = () => {
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();
  const { removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscountPct, setCouponDiscountPct] = useState(0);
  const [giftWrap, setGiftWrap] = useState(false);
  const [toast, setToast] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCartItems = async () => {
      const response = await fetch(`${API_BASE}/api/cart/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
        const initialQuantities = data.reduce((acc, item) => {
          acc[item.id] = item.quantity || 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      }
    };
    if (userId) fetchCartItems();
  }, [userId]);

  const fmt = (n) => Number(n || 0).toFixed(2);

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const applyCoupon = () => {
    if (couponInput.trim().toUpperCase() === 'GOLD10') {
      setCouponDiscountPct(10);
      setToast('GOLD10 applied (10% OFF)');
    } else if (couponInput.trim().toUpperCase() === 'FREESHIP') {
      setCouponDiscountPct(0);
      setToast('FREESHIP applied');
    } else {
      setToast('Invalid coupon');
      setCouponDiscountPct(0);
    }
    setShowCoupon(false);
    setTimeout(() => setToast(''), 1500);
  };

  const handleConfirmRemove = async () => {
    if (selectedItem && userId) {
      await fetch(`${API_BASE}/api/cart/tarascart`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: selectedItem.id })
      });
      setCartItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
      removeFromCart(selectedItem.id);
      setToast('Item removed');
      setTimeout(() => setToast(''), 1600);
    }
    setShowPopup(false);
  };

  const handleQuantityChange = async (productId, value) => {
    const quantity = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
    if (userId) {
      await fetch(`${API_BASE}/api/cart/tarascart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity })
      });
      setToast('Quantity updated');
      setTimeout(() => setToast(''), 1200);
    }
  };

  const bagTotal = cartItems.reduce((total, item) => {
    const qty = quantities[item.id] || 1;
    const mrp = item.original_price_b2c || item.final_price_b2c;
    return total + Number(mrp) * qty;
  }, 0);

  const discountTotal = 0;
  const subTotalBeforeCoupon = bagTotal;
  const rawCouponDiscount = Math.floor(
    (subTotalBeforeCoupon * couponDiscountPct) / 100
  );
  const maxCouponDiscount = Math.max(0, subTotalBeforeCoupon - 1);
  const couponDiscount = Math.min(rawCouponDiscount, maxCouponDiscount);
  const subTotal = subTotalBeforeCoupon - couponDiscount;
  const freeShipThreshold = 0;
  const convenience = 0;
  const youPay = subTotal + (giftWrap ? 39 : 0);
  const toFreeShipping = 0;

  const proceedToCheckout = () => {
    if (!cartItems.length) return;
    const payload = {
      totals: {
        bagTotal,
        discountTotal,
        couponPct: couponDiscountPct,
        couponDiscount,
        convenience,
        giftWrap: giftWrap ? 39 : 0,
        payable: youPay
      },
      items: cartItems.map((item) => {
        const qty = quantities[item.id] || 1;
        return {
          variant_id: item.id,
          product_id: item.product_id || null,
          qty,
          price: Number(item.final_price_b2c),
          mrp:
            item.original_price_b2c != null
              ? Number(item.original_price_b2c)
              : Number(item.final_price_b2c),
          size: item.selected_size || '',
          colour: item.selected_color || '',
          image_url: item.image_url || null
        };
      })
    };
    sessionStorage.setItem('tk_checkout_payload', JSON.stringify(payload));
    navigate('/order/checkout');
  };

  return (
    <div className="cart-wrap">
      <Navbar />
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <img src="/images/emptyWishlist.avif" alt="Empty Cart" />
            <h2>Your Bag is empty</h2>
            <p>Add items to your bag to view them here.</p>
            <a className="btn-shop" href="/">
              Start Shopping
            </a>
          </div>
        ) : (
          <>
            {toFreeShipping > 0 ? (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      ((freeShipThreshold - toFreeShipping) / freeShipThreshold) * 100
                    )}%`
                  }}
                />
                <span>You're ₹{fmt(toFreeShipping)} away from Free Shipping</span>
              </div>
            ) : (
              <div className="progress-free">You unlocked Free Shipping</div>
            )}

            <div className="cart-grid">
              <div className="cart-left">
                <div className="cart-head">
                  <h2>My Bag</h2>
                  <span>{cartItems.length} item(s)</span>
                </div>

                {cartItems.map((item) => {
                  const qty = quantities[item.id] || 1;
                  const mrp = Number(item.original_price_b2c || item.final_price_b2c);
                  const discountPct =
                    mrp > 0
                      ? Math.round(
                          ((mrp - Number(item.final_price_b2c)) / mrp) * 100
                        )
                      : 0;

                  return (
                    <div className="cart-card" key={item.id}>
                      <button
                        className="card-remove"
                        onClick={() => handleRemoveClick(item)}
                      >
                        <FaTimes />
                      </button>

                      <div className="card-media">
                        <img src={item.image_url} alt={item.product_name} />
                      </div>

                      <div className="card-body">
                        <div className="card-top">
                          <h4 className="brand">{item.brand}</h4>
                          <p className="name">{item.product_name}</p>
                        </div>

                        <div className="card-opts">
                          <div className="opt">
                            <span>Color</span>
                            <span
                              className="color-dot"
                              style={{
                                backgroundColor: (item.selected_color || '').toLowerCase()
                              }}
                            />
                          </div>
                          <div className="opt">
                            <span>Size</span>
                            <select
                              defaultValue={item.selected_size}
                              className="select"
                            >
                              {['S', 'M', 'L', 'XL', 'XXL', 'FREE'].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="opt">
                            <span>Qty</span>
                            <select
                              value={qty}
                              className="select"
                              onChange={(e) =>
                                handleQuantityChange(item.id, e.target.value)
                              }
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="card-price">
                          <div className="now">₹{fmt(item.final_price_b2c * qty)}</div>
                          <div className="was">
                            <span className="mrp">₹{fmt(mrp * qty)}</span>
                            <span className="off">{discountPct}% OFF</span>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button
                            className="mini gold"
                            onClick={() => setShowCoupon(true)}
                          >
                            <FaTag /> Apply Coupon
                          </button>
                          <a
                            className="mini link"
                            href={`/product/${item.product_id}`}
                          >
                            View Details <FaChevronRight />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-right">
                <div className="summary">
                  <h3>Price Summary</h3>
                  <div className="sum-row">
                    <span>Bag Total</span>
                    <span>₹{fmt(bagTotal)}</span>
                  </div>
                  <div className="sum-row">
                    <span>Discount on MRP</span>
                    <span className="green">-₹{fmt(discountTotal)}</span>
                  </div>
                  <div className="sum-row">
                    <span>Sub Total</span>
                    <span>₹{fmt(subTotalBeforeCoupon)}</span>
                  </div>
                  {couponDiscountPct > 0 && (
                    <div className="sum-row">
                      <span>Coupon ({couponDiscountPct}%)</span>
                      <span className="green">-₹{fmt(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="sum-row opt-row">
                    <label className="chk">
                      <input
                        type="checkbox"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                      />
                      <span>Gift Wrap</span>
                    </label>
                    <span>{giftWrap ? '₹39.00' : '₹0.00'}</span>
                  </div>
                  <div className="sum-row">
                    <span>Convenience Charges</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="sum-row total">
                    <span>You Pay</span>
                    <span>₹{fmt(youPay)}</span>
                  </div>
                  <div className="save-note">
                    <FaCheck />
                    <span>
                      You are saving ₹{fmt(couponDiscount)} on this order
                    </span>
                  </div>
                  <button className="btn-buy" onClick={proceedToCheckout}>
                    Proceed to Buy
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky-bar">
              <div className="sb-left">
                <strong>₹{fmt(youPay)}</strong>
                <span>Payable</span>
              </div>
              <button className="sb-btn" onClick={proceedToCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}

        {showPopup && selectedItem && (
          <Popup
            image={selectedItem.image_url}
            message="Are you sure?"
            subMessage="It took you so long to find this item, wishlist instead."
            onConfirm={handleConfirmRemove}
            onCancel={() => setShowPopup(false)}
            onWishlist={() => {
              addToWishlist(selectedItem);
              setCartItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
              setShowPopup(false);
              setToast('Moved to wishlist');
              setTimeout(() => setToast(''), 1500);
            }}
          />
        )}

        {showCoupon && (
          <div className="modal-wrap" onClick={() => setShowCoupon(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h4>Apply Coupon</h4>
              <div className="preset">
                <button onClick={() => setCouponInput('GOLD10')}>GOLD10</button>
                <button onClick={() => setCouponInput('FREESHIP')}>FREESHIP</button>
              </div>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter code"
              />
              <div className="modal-actions">
                <button
                  className="btn ghost"
                  onClick={() => setShowCoupon(false)}
                >
                  Close
                </button>
                <button className="btn solid" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="modal-wrap" onClick={() => setShowSuccess(false)}>
            <div
              className="modal success"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="success-head">Order Placed Successfully</div>
              <p className="success-sub">Thank you for shopping with us.</p>
              <div className="modal-actions">
                <button
                  className="btn solid"
                  onClick={() => setShowSuccess(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {!!toast && <div className="toast">{toast}</div>}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
