import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../CartContext';
import './Cart.css';
import { useWishlist } from '../WishlistContext';
import { FaTimes, FaCheck } from 'react-icons/fa';
import Popup from './Popup';

const Cart = () => {
  const { addToWishlist } = useWishlist();
  const { cartItems, removeFromCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState(
    cartItems.reduce((acc, item, idx) => {
      acc[item.name] = item.quantity || 1;
      return acc;
    }, {})
  );

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const handleConfirmRemove = () => {
    if (selectedItem) removeFromCart(selectedItem.name);
    setShowPopup(false);
  };

  const getBagTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = quantities[item.name] || 1;
      return total + (item.originalPrice || item.offerPrice) * qty;
    }, 0);
  };

  const getDiscountTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = quantities[item.name] || 1;
      const original = item.originalPrice || item.offerPrice;
      return total + (original - item.offerPrice) * qty;
    }, 0);
  };

  const getSubTotal = () => {
    return getBagTotal() - getDiscountTotal();
  };

  const handleQuantityChange = (itemName, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemName]: parseInt(value)
    }));
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
                {cartItems.map((item, index) => (
                  <div className="cart-row" key={index}>
                    <div className="remove-top" onClick={() => handleRemoveClick(item)}>
                      <FaTimes />
                    </div>
                    <div className="row-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="row-details">
                      <h4>{item.brand}</h4>
                      <p>{item.name}</p>
                      <div className="row-options">
                        <span>Size :</span>
                        <select defaultValue={item.selectedSize} className="dropdown">
                          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <span>Quantity :</span>
                        <select
                          value={quantities[item.name]}
                          className="dropdown"
                          onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="row-price">
                        <div className="final-price">₹{item.offerPrice * (quantities[item.name] || 1)}</div>
                        <div className="original-discount">
                          <span className="original">₹{(item.originalPrice || item.offerPrice) * (quantities[item.name] || 1)}</span>
                          <span className="discount">60% OFF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                image={selectedItem.image}
                message="Are you sure?"
                subMessage="It took you so long to find this item, wishlist instead."
                onConfirm={handleConfirmRemove}
                onCancel={() => setShowPopup(false)}
                onWishlist={() => {
                  addToWishlist(selectedItem);
                  removeFromCart(selectedItem.name);
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
