import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import './SearchResults.css';
import { useWishlist } from '../WishlistContext';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems, addToWishlist } = useWishlist();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('q');
  const userType = (localStorage.getItem('userType') || 'B2C').toUpperCase();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchResults();
  }, [query]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    if (!userId || !product?.id) return;
    try {
      const resp = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: product.id })
      });
      if (resp.ok) {
        addToWishlist(product);
      }
    } catch {}
  };

  const isInWishlist = (id) => wishlistItems.some((w) => String(w.id) === String(id));

  const offerPrice = (p) => (userType === 'B2B' ? p.final_price_b2b : p.final_price_b2c);
  const originalPrice = (p) => (userType === 'B2B' ? p.original_price_b2b : p.original_price_b2c);
  const discountPct = (p) => {
    const o = Number(originalPrice(p));
    const f = Number(offerPrice(p));
    if (!o) return 0;
    return Math.round(((o - f) / o) * 100);
  };

  return (
    <div className="sr-page">
      <Navbar />
      <FilterSidebar onFilterChange={(data) => setResults(Array.isArray(data) ? data : [])} />
      <div className="sr-page-main">
        <div className="sr-content">
          {loading ? (
            <p className="sr-status">Loading...</p>
          ) : results.length === 0 ? (
            <p className="sr-status">No products found.</p>
          ) : (
            <section className="sr-section4">
              <div className="sr-header-wrap">
                <h2 className="sr-title">
                  Search Results for: <span className="sr-highlight">{query}</span>
                </h2>
              </div>
              <div className="sr-section4-grid">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="sr-section4-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="sr-section4-img">
                      <img src={product.image_url} alt={product.product_name} />
                      <button
                        type="button"
                        className="sr-love-icon"
                        onClick={(e) => handleWishlist(e, product)}
                        aria-label="Add to wishlist"
                      >
                        {isInWishlist(product.id) ? (
                          <FaHeart style={{ color: 'gold', fontSize: 20 }} />
                        ) : (
                          <FaRegHeart style={{ color: 'gold', fontSize: 20 }} />
                        )}
                      </button>
                    </div>
                    <h4 className="sr-brand-name">{product.brand}</h4>
                    <h5 className="sr-product-name">{product.product_name}</h5>
                    <div className="sr-section4-price">
                      <span className="sr-offer-price">₹{offerPrice(product)}</span>
                      <span className="sr-original-price">₹{originalPrice(product)}</span>
                      <span className="sr-discount">({discountPct(product)}% OFF)</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
