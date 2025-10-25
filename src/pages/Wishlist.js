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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/wishlist/${userId}`);
        const data = await res.json();
        setWishlistItems(Array.isArray(data) ? data : []);
      } catch {}
      finally {
        setIsLoading(false);
      }
    };
    run();
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
        body: JSON.stringify({ user_id: userId, product_id: selectedItem.product_id }),
      });
      const updatedWishlist = wishlistItems.filter((item) => String(item.product_id) !== String(selectedItem.product_id));
      setWishlistItems(updatedWishlist);
    } catch {}
    finally {
      setShowPopup(false);
    }
  };

  return (
    <div className="wishlist galaxy-bg">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="glow-orb"></div>
      <Navbar />
      <div className="wishlist-page">
        <header className="wishlist-hero">
          <div className="hero-content">
            <h1>My Wishlist</h1>
            <p>Save the styles you love and grab them when you’re ready.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => navigate('/')}>Continue Shopping</button>
              <button className="btn subtle" onClick={() => navigate('/cart')}>Go To Cart</button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="loader-wrap">
            <div className="loader"></div>
            <p>Fetching your favourites…</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="empty-wishlist glass">
            <img src="/images/emptyWishlist.avif" alt="Empty Wishlist" />
            <h2>Your Wishlist is empty</h2>
            <p>Tap ♥ on products to save them here. They’ll follow you across devices.</p>
            <button className="btn primary" onClick={() => navigate('/')}>Discover Products</button>
          </div>
        ) : (
          <div className="wishlist-content">
            <div className="wishlist-toolbar">
              <span>{wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}</span>
              <div className="toolbar-actions">
                <button className="chip" onClick={() => navigate('/women')}>Women</button>
                <button className="chip" onClick={() => navigate('/men')}>Men</button>
                <button className="chip" onClick={() => navigate('/kids')}>Kids</button>
              </div>
            </div>

            <div className="wishlist-grid">
              {wishlistItems.map((item, index) => (
                <div key={item.product_id ?? index} className="wishlist-card">
                  <div
                    className="wishlist-image-container"
                    onClick={() => {
                      sessionStorage.setItem('selectedProduct', JSON.stringify(item));
                      navigate('/checkout');
                    }}
                  >
                    <img src={item.image_url} alt={item.product_name} />
                    <span className="remove-icon" onClick={(e) => { e.stopPropagation(); handleRemove(item); }}>
                      <FaTimes />
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="brand-row">
                      <h4 className="wishlist-brand">{item.brand || 'Brand'}</h4>
                      <span className="pill">{item.gender || 'UNISEX'}</span>
                    </div>
                    <p className="wishlist-name" title={item.product_name}>{item.product_name}</p>

                    <div className="wishlist-price">
                      <span className="wishlist-offer">₹{Number(item.final_price_b2c || 0).toFixed(2)}</span>
                      <span className="wishlist-original">₹{Number(item.original_price_b2c || 0).toFixed(2)}</span>
                      <span className="wishlist-discount">
                        ({Math.max(0, Math.round(((item.original_price_b2c - item.final_price_b2c) / Math.max(1, item.original_price_b2c)) * 100))}% OFF)
                      </span>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          sessionStorage.setItem('selectedProduct', JSON.stringify(item));
                          navigate('/checkout');
                        }}
                      >
                        Buy Now
                      </button>
                      <button className="btn subtle" onClick={(e) => { e.stopPropagation(); navigate('/'); }}>
                        Find Similar
                      </button>
                    </div>
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
