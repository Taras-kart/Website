import React, { useState, useEffect } from 'react';
import './Wishlist.css';
import { useNavigate } from 'react-router-dom';
import WishlistPopup from './WishlistPopup';
import Navbar from './Navbar';
import Footer from './Footer';
import { useWishlist } from '../WishlistContext';
import { FaTimes } from 'react-icons/fa';

const Wishlist = () => {
  const product = JSON.parse(window.name || '{}');
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const confirmRemove = () => {
    removeFromWishlist(selectedItem.name);
    setShowPopup(false);
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
    window.name = JSON.stringify({
      image: item.image,
      brand: item.brand,
      name: item.name,
      offerPrice: item.offerPrice,
      originalPrice: item.originalPrice,
      selectedColor: item.selectedColor || null,
      selectedSize: item.selectedSize || null,
    });
    window.open('/checkout', '_blank');
  }}
>
  <img src={item.image} alt={item.name} />
</div>

                    <span className="remove-icon" onClick={() => handleRemove(item)}>
                      <FaTimes />
                    </span>

                  </div>
                  <h4 className="wishlist-brand">{item.brand}</h4>
                  <p className="wishlist-name">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {showPopup && (
          <WishlistPopup
            onConfirm={confirmRemove}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
