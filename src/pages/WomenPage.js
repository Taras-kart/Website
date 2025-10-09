// src/pages/WomenPage.js
/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './WomenPage.css';
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

const WomenPage = () => {
  const [filters, setFilters] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const { addToWishlist, wishlistItems } = useWishlist();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent('Women')}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const arr = toArray(data);
        setAllProducts(arr);
        setProducts(arr);
      } catch {}
    };
    run();
  }, []);

  useEffect(() => {
    const storedProduct = localStorage.getItem('selectedProduct');
    if (storedProduct) setProduct(JSON.parse(storedProduct));
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];
    if (filters.brand) filtered = filtered.filter((p) => p.brand === filters.brand);
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) => p.final_price_b2c >= filters.priceRange.min && p.final_price_b2c <= filters.priceRange.max
      );
    }
    setProducts(filtered);
  }, [filters, allProducts]);

  useEffect(() => {
    const storedType = sessionStorage.getItem('userType');
    setUserType(storedType);
  }, []);

  const toggleLike = async (prod) => {
    const alreadyInWishlist = wishlistItems.some((item) => item.product_name === prod.product_name);
    if (alreadyInWishlist) {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: prod.id })
      });
    } else {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: prod.id })
      });
      addToWishlist(prod);
    }
  };

  const handleAddToCart = async (prod, selectedSize, selectedColor) => {
    try {
      await fetch(`${API_BASE}/api/cart/tarascart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: prod.id,
          selected_size: selectedSize,
          selected_color: selectedColor
        })
      });
    } catch {}
  };

  const handleProductClick = (prod) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
    const newTab = window.open('/checkout', '_blank');
    if (newTab) {
      newTab.onload = () => {
        try {
          newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
        } catch {}
      };
    }
  };

  return (
    <div className="women-page">
      <Navbar />
      <div className="filter-bar-class">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="women-page-main">
          <div className="women-page-content">
            <section className="mens-section1">
              <div className="mens-section1-bg">
                <img src="/images/womens-bg.jpg" alt="Womens Fashion Background" />
                <div className="mens-section1-overlay">
                  <div className="mens-section1-text">
                    <h1>Womens</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>
            <section className="womens-section4">
              <div className="womens-section4-grid">
                {toArray(products).map((prod, index) => (
                  <div
                    key={prod.id || index}
                    className="womens-section4-card"
                    onClick={() => handleProductClick(prod)}
                  >
                    <div className="womens-section4-img">
                      <img src={prod.image_url} alt={prod.product_name} />
                      <div
                        className="love-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(prod);
                        }}
                      >
                        {wishlistItems.find((item) => item.product_name === prod.product_name) ? (
                          <FaHeart style={{ color: 'yellow', fontSize: '20px' }} />
                        ) : (
                          <FaRegHeart style={{ color: 'yellow', fontSize: '20px' }} />
                        )}
                      </div>
                    </div>
                    <h4 className="brand-name">{prod.brand}</h4>
                    <h5 className="product-name">{prod.product_name}</h5>
                    <div className="womens-section4-price">
                      <span className="offer-price">
                        ₹{userType === 'B2B' ? prod.final_price_b2b : prod.final_price_b2c}
                      </span>
                      <span className="original-price">
                        ₹{userType === 'B2B' ? prod.original_price_b2b : prod.original_price_b2c}
                      </span>
                      <span className="discount">
                        (
                        {Math.round(
                          ((userType === 'B2B'
                            ? prod.original_price_b2b - prod.final_price_b2b
                            : prod.original_price_b2c - prod.final_price_b2c) /
                            (userType === 'B2B' ? prod.original_price_b2b : prod.original_price_b2c)) * 100
                        )}
                        % OFF)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="home-section6">
              <h2 className="home-section6-title">Trending Now....</h2>
              <div className="home-section6-grid">
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part1-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part1-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part1-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part2-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Lehanga...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part2-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part2-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part3-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Wedding Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part3-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part3-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part4-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Chudidars...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part4-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part4-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part5-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Gowns...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part5-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part5-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part6-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Half Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part6-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part6-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WomenPage;
*/





































import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './WomenPage.css'
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
const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/women/women20.jpeg'
const toArray = (x) => (Array.isArray(x) ? x : [])

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

export default function WomenPage() {
  const [filters, setFilters] = useState({})
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
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
        const res = await fetch(`${API_BASE}/api/products?gender=WOMEN`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const arr = toArray(data).map((p, i) => {
          const ean =
            p.ean_code ??
            p.EANCode ??
            p.ean ??
            p.barcode ??
            p.bar_code ??
            ''
          const img =
            p.image_url ||
            (ean ? cloudinaryUrlByEan(ean) : '') ||
            DEFAULT_IMG
          return {
            id: p.id ?? p.product_id ?? i + 1,
            brand: p.brand ?? p.brand_name ?? '',
            product_name: p.product_name ?? p.name ?? '',
            image_url: img,
            ean_code: ean,
            original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
            final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
            original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
            final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0
          }
        })
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

  const toggleLike = async (prod) => {
    const inList = wishlistItems.some((item) => item.product_name === prod.product_name)
    try {
      if (inList) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: prod.id })
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: prod.id })
        })
        addToWishlist(prod)
      }
    } catch {}
  }

  const handleProductClick = (prod) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(prod))
    const newTab = window.open('/checkout', '_blank')
    if (newTab) {
      newTab.onload = () => {
        try {
          newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(prod))
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
    <div className="women-page">
      <Navbar />
      <div className="filter-bar-class">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="women-page-main">
          <div className="women-page-content">
            <section className="mens-section1">
              <div className="mens-section1-bg">
                <img src="/images/womens-bg.jpg" alt="Womens Fashion Background" />
                <div className="mens-section1-overlay">
                  <div className="mens-section1-text">
                    <h1>Womens</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="womens-section4">
              <div className="section-head">
                <h2>Women’s Collection</h2>
                <div className="count">{products.length} items</div>
              </div>

              {loading ? (
                <div className="loading">Loading products…</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : !products.length ? (
                <div className="empty">No products found</div>
              ) : (
                <div className="womens-section4-grid">
                  {toArray(products).map((prod, index) => (
                    <div
                      key={prod.id || index}
                      className="womens-section4-card"
                      onClick={() => handleProductClick(prod)}
                    >
                      <div className="womens-section4-img">
                        <img
                          src={prod.image_url || DEFAULT_IMG}
                          alt={prod.product_name}
                          onError={(e) => {
                            e.currentTarget.src = prod.ean_code
                              ? cloudinaryUrlByEan(prod.ean_code)
                              : DEFAULT_IMG
                          }}
                        />
                        <div
                          className="love-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(prod)
                          }}
                        >
                          {wishlistItems.find((item) => item.product_name === prod.product_name) ? (
                            <FaHeart style={{ color: 'gold', fontSize: '20px' }} />
                          ) : (
                            <FaRegHeart style={{ color: 'gold', fontSize: '20px' }} />
                          )}
                        </div>
                      </div>
                      <h4 className="brand-name">{prod.brand}</h4>
                      <h5 className="product-name">{prod.product_name}</h5>
                      <div className="womens-section4-price">
                        <span className="offer-price">₹{Number(priceForUser(prod) || 0).toFixed(2)}</span>
                        <span className="original-price">₹{Number(mrpForUser(prod) || 0).toFixed(2)}</span>
                        <span className="discount">({discountPct(prod)}% OFF)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="home-section6">
              <h2 className="home-section6-title">Trending Now....</h2>
              <div className="home-section6-grid">
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part1-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part1-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part1-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part2-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Lehanga...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part2-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part2-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part3-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Wedding Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part3-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part3-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part4-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Chudidars...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part4-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part4-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part5-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Gowns...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part5-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part5-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part6-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Half Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part6-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part6-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
