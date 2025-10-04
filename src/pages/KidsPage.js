/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './KidsPage.css';
import Footer from './Footer';
import FilterSidebar from './FilterSidebar';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../WishlistContext';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const toArray = (x) => (Array.isArray(x) ? x : []);

const KidsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const { addToWishlist, wishlistItems } = useWishlist();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const run = async () => {
      try {
        const boysRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent('Kids - Boys')}`);
        const girlsRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent('Kids - Girls')}`);
        const boys = boysRes.ok ? await boysRes.json() : [];
        const girls = girlsRes.ok ? await girlsRes.json() : [];
        const merged = [...toArray(boys), ...toArray(girls)];
        setAllProducts(merged);
        setProducts(merged);
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
        (p) => Number(p.final_price_b2c) >= filters.priceRange.min && Number(p.final_price_b2c) <= filters.priceRange.max
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
    <div className="kids-page">
      <Navbar />
      <div className="kids-test">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="kids-page-main">
          <div className="kids-page-content">
            <section className="kids-section1">
              <div className="kids-section1-bg">
                <img src="/images/kids-bg.jpg" alt="Kids Fashion Background" />
                <div className="kids-section1-overlay">
                  <div className="kids-section1-text">
                    <h1>Kids</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section4">
              <div className="kids-section4-grid">
                {toArray(products).map((product) => (
                  <div
                    key={product.id}
                    className="kids-section4-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="kids-section4-img">
                      <img src={product.image_url} alt={product.product_name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                      >
                        {wishlistItems.find((item) => item.product_name === product.product_name) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: 18 }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: 24 }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{product.brand}</h4>
                    <h5 className="product-name">{product.product_name}</h5>
                    <div className="kids-section4-price">
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

            <section className="kids-section2">
              <div className="kids-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Kids Style Background" />
                <div className="kids-section2-overlay">
                  <div className="kids-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section3">
              <div className="kids-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="kids-section3-center">
                <h2>Exclusive offers</h2>
                <div className="kids-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="kids-section3-right">
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

export default KidsPage;
*/




























import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './KidsPage.css'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const DEFAULT_IMG = '/images/kids/kids-girls-frock.jpg'
const toArray = (x) => (Array.isArray(x) ? x : [])

export default function KidsPage() {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({})
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { addToWishlist, wishlistItems } = useWishlist()
  const userId = sessionStorage.getItem('userId')

  useEffect(() => {
    setUserType(sessionStorage.getItem('userType'))
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=KIDS`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const arr = toArray(data).map((p, i) => ({
          id: p.id ?? p.product_id ?? i + 1,
          brand: p.brand ?? p.brand_name ?? '',
          product_name: p.product_name ?? p.name ?? '',
          image_url: p.image_url || DEFAULT_IMG,
          original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
          final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
          original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
          final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0
        }))
        if (!cancelled) {
          setAllProducts(arr)
          setProducts(arr)
        }
      } catch {
        if (!cancelled) {
          setAllProducts([])
          setProducts([])
          setError('Unable to load products')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = [...allProducts]
    if (filters.brand) list = list.filter((p) => p.brand === filters.brand)
    if (filters.priceRange) {
      list = list.filter(
        (p) =>
          (p.final_price_b2c ?? 0) >= filters.priceRange.min &&
          (p.final_price_b2c ?? 0) <= filters.priceRange.max
      )
    }
    return list
  }, [allProducts, filters])

  useEffect(() => {
    setProducts(filtered)
  }, [filtered])

  const toggleLike = async (product) => {
    const alreadyInWishlist = wishlistItems.some((item) => item.product_name === product.product_name)
    try {
      if (alreadyInWishlist) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.id })
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.id })
        })
        addToWishlist(product)
      }
    } catch {}
  }

  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product))
    const newTab = window.open('/checkout', '_blank')
    if (newTab) {
      newTab.onload = () => {
        try {
          newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(product))
        } catch {}
      }
    }
  }

  const priceForUser = (p) => (userType === 'B2B' ? p.final_price_b2b || p.final_price_b2c : p.final_price_b2c)
  const mrpForUser = (p) => (userType === 'B2B' ? p.original_price_b2b || p.original_price_b2c : p.original_price_b2c)
  const discountPct = (p) => {
    const mrp = Number(mrpForUser(p) || 0)
    const price = Number(priceForUser(p) || 0)
    if (!mrp || mrp <= 0) return 0
    const pct = ((mrp - price) / mrp) * 100
    return Math.max(0, Math.round(pct))
  }

  return (
    <div className="kids-page">
      <Navbar />
      <div className="kids-test">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="kids-page-main">
          <div className="kids-page-content">
            <section className="kids-section1">
              <div className="kids-section1-bg">
                <img src="/images/kids-bg.jpg" alt="Kids Fashion Background" />
                <div className="kids-section1-overlay">
                  <div className="kids-section1-text">
                    <h1>Kids</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section4">
              {loading ? (
                <div className="kids-notice">Loading products…</div>
              ) : error ? (
                <div className="kids-notice">{error}</div>
              ) : !products.length ? (
                <div className="kids-notice">No products found</div>
              ) : (
                <div className="kids-section4-grid">
                  {toArray(products).map((product, idx) => (
                    <div
                      key={product.id || idx}
                      className="kids-section4-card"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="kids-section4-img">
                        <img
                          src={product.image_url || DEFAULT_IMG}
                          alt={product.product_name}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMG
                          }}
                        />
                        <div
                          className="love-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(product)
                          }}
                        >
                          {wishlistItems.find((item) => item.product_name === product.product_name) ? (
                            <FaHeart style={{ color: 'yellow', fontSize: 18 }} />
                          ) : (
                            <FaRegHeart style={{ color: 'yellow', fontSize: 24 }} />
                          )}
                        </div>
                      </div>
                      <h4 className="brand-name">{product.brand}</h4>
                      <h5 className="product-name">{product.product_name}</h5>
                      <div className="kids-section4-price">
                        <span className="offer-price">₹{Number(priceForUser(product) || 0).toFixed(2)}</span>
                        <span className="original-price">₹{Number(mrpForUser(product) || 0).toFixed(2)}</span>
                        <span className="discount">({discountPct(product)}% OFF)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="kids-section2">
              <div className="kids-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Kids Style Background" />
                <div className="kids-section2-overlay">
                  <div className="kids-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section3">
              <div className="kids-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="kids-section3-center">
                <h2>Exclusive offers</h2>
                <div className="kids-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="kids-section3-right">
                <img src="/images/mens-part2.jpg" alt="Right Fashion" />
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
