import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import './Cart.css';
import { FaTimes, FaCheck } from 'react-icons/fa';
import Popup from './Popup';

const Cart = () => {
  const { addToWishlist } = useWishlist();
  const { removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const fetchCartItems = async () => {
      const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
      const data = await response.json();
      setCartItems(data);
      const initialQuantities = data.reduce((acc, item) => {
        acc[item.id] = item.quantity || 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    };
    if (userId) fetchCartItems();
  }, [userId]);

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedItem && userId) {
      await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: selectedItem.id })
      });
      setCartItems(prev => prev.filter(item => item.id !== selectedItem.id));
    }
    setShowPopup(false);
  };

  const handleQuantityChange = async (productId, value) => {
    const quantity = parseInt(value);
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
    if (userId) {
      await fetch('http://localhost:5000/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity })
      });
    }
  };

  const getBagTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = quantities[item.id] || 1;
      const mrp = item.original_price_b2c || item.final_price_b2c;
      return total + mrp * qty;
    }, 0);
  };

  const getDiscountTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = quantities[item.id] || 1;
      const mrp = item.original_price_b2c || item.final_price_b2c;
      return total + (mrp - item.final_price_b2c) * qty;
    }, 0);
  };

  const getSubTotal = () => {
    return getBagTotal() - getDiscountTotal();
  };

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <img src="/images/emptyWishlist.avif" alt="Empty Cart" />
            <h2>Your Bag is empty!</h2>
            <p>Add items to your bag to view them here.</p>
          </div>
        ) : (
          <div className="filled-cart-layout">
            <h2 className="cart-title">My Bag</h2>
            <div className="cart-content">
              <div className="cart-left">
                {cartItems.map((item, index) => {
                  const qty = quantities[item.id] || 1;
                  const mrp = item.original_price_b2c || item.final_price_b2c;
                  const discount = Math.round(((mrp - item.final_price_b2c) / mrp) * 100);
                  return (
                    <div className="cart-row" key={index}>
                      <div className="remove-top" onClick={() => handleRemoveClick(item)}>
                        <FaTimes />
                      </div>
                      <div className="row-image">
                        <img src={item.image_url} alt={item.product_name} />
                      </div>
                      <div className="row-details">
                        <h4>{item.brand}</h4>
                        <p>{item.product_name}</p>
                        <div className="row-options">
                          <span>Color :</span>
                          <div
                            className="color-display"
                            style={{
                              backgroundColor: item.selected_color.toLowerCase(),
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              display: 'inline-block',
                              margin: '0 8px',
                              border: '1px solid #ccc'
                            }}
                          ></div>
                          <span>Size :</span>
                          <select defaultValue={item.selected_size} className="dropdown">
                            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <span>Quantity :</span>
                          <select
                            value={qty}
                            className="dropdown"
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div className="row-price">
                          <div className="final-price">₹{item.final_price_b2c * qty}</div>
                          <div className="original-discount">
                            <span className="original">₹{mrp * qty}</span>
                            <span className="discount">{discount}% OFF</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="cart-right">
                <h3 className="summary-heading">Price Summary</h3>
                <div className="summary-row">
                  <span>Bag Total</span>
                  <span>₹{getBagTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Discount on MRP</span>
                  <span className="discount-price">-₹{getDiscountTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Sub Total</span>
                  <span>₹{getSubTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Convenience Charges</span>
                  <span>₹50</span>
                </div>
                <div className="summary-row total-row">
                  <span>You Pay</span>
                  <span>₹{getSubTotal() + 50}</span>
                </div>
                <div className="savings-card">
                  <FaCheck className="tick-icon" />
                  <span>Yay! You are saving ₹{getDiscountTotal()} on this order</span>
                </div>
                <button className="buy-button">Proceed to Buy</button>
              </div>
            </div>
            {showPopup && selectedItem && (
              <Popup
                image={selectedItem.image_url}
                message="Are you sure?"
                subMessage="It took you so long to find this item, wishlist instead."
                onConfirm={handleConfirmRemove}
                onCancel={() => setShowPopup(false)}
                onWishlist={() => {
                  addToWishlist(selectedItem);
                  setCartItems(prev => prev.filter(item => item.id !== selectedItem.id));
                  setShowPopup(false);
                }}
              />
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
