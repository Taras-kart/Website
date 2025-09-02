import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import './SearchResults.css';
import { useWishlist } from '../WishlistContext';

const API_BASE = 'http://localhost:5000';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems, toggleLike } = useWishlist();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('q');
  const userType = (localStorage.getItem('userType') || 'B2C').toUpperCase();

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
                      <div
                        className="sr-love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find(
                          (item) => item.product_name === product.product_name
                        ) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: 20 }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: 20 }} />
                        )}
                      </div>
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
