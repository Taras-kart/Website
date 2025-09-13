import React, { useState, useEffect } from 'react';
import './Wishlist.css';
import { useNavigate } from 'react-router-dom';
import WishlistPopup from './WishlistPopup';
import Navbar from './Navbar';
import Footer from './Footer';
import { useWishlist } from '../WishlistContext';
import { FaTimes } from 'react-icons/fa';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const Wishlist = () => {
  const { wishlistItems, setWishlistItems } = useWishlist();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE}/api/wishlist/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setWishlistItems(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }
  }, [userId, setWishlistItems]);

  const handleRemove = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const confirmRemove = async () => {
    try {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: selectedItem.id }),
      });
      const updatedWishlist = wishlistItems.filter((item) => item.id !== selectedItem.id);
      setWishlistItems(updatedWishlist);
    } catch {}
    finally {
      setShowPopup(false);
    }
  };

  return (
    <div className="wishlist">
      <Navbar />
      <div className="wishlist-page">
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <img src="/images/emptyWishlist.avif" alt="Empty Wishlist" />
            <h2>Your Wishlist is empty!</h2>
            <p>Save your favourite items so you don’t lose sight of them.</p>
            <button onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          <div className="wishlist-content">
            <h2 className="wishlist-title">My Wishlist</h2>
            <div className="wishlist-grid">
              {wishlistItems.map((item, index) => (
                <div key={index} className="wishlist-card">
                  <div className="wishlist-image-container">
                    <div
                      className="wishlist-image-click"
                      onClick={() => {
                        sessionStorage.setItem('selectedProduct', JSON.stringify(item));
                        window.open('/checkout', '_blank');
                      }}
                    >
                      <img src={item.image_url} alt={item.product_name} />
                    </div>
                    <span className="remove-icon" onClick={() => handleRemove(item)}>
                      <FaTimes />
                    </span>
                  </div>
                  <h4 className="wishlist-brand">{item.brand}</h4>
                  <p className="wishlist-name">{item.product_name}</p>
                  <div className="wishlist-price">
                    <span className="wishlist-offer">₹{item.final_price_b2c}</span>
                    <span className="wishlist-original">₹{item.original_price_b2c}</span>
                    <span className="wishlist-discount">
                      ({Math.round(((item.original_price_b2c - item.final_price_b2c) / item.original_price_b2c) * 100)}% OFF)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showPopup && (
          <WishlistPopup onConfirm={confirmRemove} onCancel={() => setShowPopup(false)} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
