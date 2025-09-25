import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './MenPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { useWishlist } from '../WishlistContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const toArray = (x) => (Array.isArray(x) ? x : []);

const MenPage = () => {
  const navigate = useNavigate();
  const { addToWishlist, wishlistItems } = useWishlist();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [userType, setUserType] = useState(null);
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent('Men')}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const arr = toArray(data);
        setAllProducts(arr);
        setProducts(arr);
      } catch {
        setAllProducts([]);
        setProducts([]);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const storedType = sessionStorage.getItem('userType');
    setUserType(storedType);
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];
    if (filters.brand) filtered = filtered.filter((p) => p.brand === filters.brand);
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          Number(p.final_price_b2c) >= filters.priceRange.min &&
          Number(p.final_price_b2c) <= filters.priceRange.max
      );
    }
    setProducts(filtered);
  }, [filters, allProducts]);

  const toggleLike = async (product) => {
    const alreadyInWishlist = wishlistItems.some((item) => item.product_name === product.product_name);
    if (alreadyInWishlist) {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: product.id })
      });
    } else {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: product.id })
      });
      addToWishlist(product);
    }
  };

  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    const newTab = window.open('/checkout', '_blank');
    if (newTab) {
      newTab.onload = () => {
        try {
          newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(product));
        } catch {}
      };
    }
  };

  return (
    <div className="men-page">
      <Navbar />
      <div className="test">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="men-page-main">
          <div className="men-page-content">
            <section className="mens-section1">
              <div className="mens-section1-bg">
                <img src="/images/up1.jpg" alt="Mens Fashion Background" />
                <div className="mens-section1-overlay">
                  <div className="mens-section1-text">
                    <h1>Mens</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section4">
              <div className="mens-section4-grid">
                {toArray(products).map((product) => (
                  <div
                    key={product.id}
                    className="mens-section4-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="mens-section4-img">
                      <img src={product.image_url} alt={product.product_name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find((item) => item.product_name === product.product_name) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: 20 }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: 20 }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.product_name}</h5>
                    <div className="mens-section4-price">
                      <span className="offer-price">
                        ₹{userType === 'B2B' ? product.final_price_b2b : product.final_price_b2c}
                      </span>
                      <span className="original-price">
                        ₹{userType === 'B2B' ? product.original_price_b2b : product.original_price_b2c}
                      </span>
                      <span className="discount">
                        (
                        {Math.round(
                          ((userType === 'B2B'
                            ? Number(product.original_price_b2b) - Number(product.final_price_b2b)
                            : Number(product.original_price_b2c) - Number(product.final_price_b2c)) /
                            (userType === 'B2B'
                              ? Number(product.original_price_b2b) || 1
                              : Number(product.original_price_b2c) || 1)) * 100
                        )}
                        % OFF)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mens-section2">
              <div className="mens-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Mens Style Background" />
                <div className="mens-section2-overlay">
                  <div className="mens-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section3">
              <div className="mens-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="mens-section3-center">
                <h2>Exclusive offers</h2>
                <div className="mens-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="mens-section3-right">
                <img src="/images/mens-part2.jpg" alt="Right Fashion" />
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MenPage;
