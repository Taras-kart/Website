import React, { useEffect, useMemo, useState } from 'react';
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

const DEFAULT_IMG_BY_GENDER = {
  WOMEN: '/images/women/women20.jpeg',
  MEN: '/images/men/mens13.jpeg',
  KIDS: '/images/kids/kids-girls-frock.jpg',
  _: '/images/placeholder.jpg'
};

const detectGender = (q) => {
  const s = String(q || '').toLowerCase();
  if (/\b(women|woman|ladies|female)\b/.test(s)) return { gender: 'WOMEN', cleaned: s.replace(/\b(women|woman|ladies|female)\b/gi, '').trim() };
  if (/\b(men|man|male|gents)\b/.test(s)) return { gender: 'MEN', cleaned: s.replace(/\b(men|man|male|gents)\b/gi, '').trim() };
  if (/\b(kids|kid|children|child|boys|girls)\b/.test(s)) return { gender: 'KIDS', cleaned: s.replace(/\b(kids|kid|children|child|boys|girls)\b/gi, '').trim() };
  return { gender: '', cleaned: s.trim() };
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems, addToWishlist } = useWishlist();
  const [baseResults, setBaseResults] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('q') || '';
  const { gender, cleaned } = useMemo(() => detectGender(query), [query]);

  const userType = (localStorage.getItem('userType') || 'B2C').toUpperCase();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const url = gender
          ? `${API_BASE}/api/products?gender=${encodeURIComponent(gender)}${cleaned ? `&q=${encodeURIComponent(cleaned)}` : ''}`
          : `${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setBaseResults(arr);
          setResults(arr);
        }
      } catch {
        if (!cancelled) {
          setBaseResults([]);
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [gender, cleaned, query]);

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
      if (resp.ok) addToWishlist(product);
    } catch {}
  };

  const isInWishlist = (id) => wishlistItems.some((w) => String(w.id) === String(id));

  const offerPrice = (p) => Number(userType === 'B2B' ? p.final_price_b2b : p.final_price_b2c) || 0;
  const originalPrice = (p) => Number(userType === 'B2B' ? p.original_price_b2b : p.original_price_b2c) || 0;
  const discountPct = (p) => {
    const o = originalPrice(p);
    const f = offerPrice(p);
    if (!o) return 0;
    const pct = ((o - f) / o) * 100;
    return Math.max(0, Math.round(pct));
  };

  const getImg = (p) => p.image_url || DEFAULT_IMG_BY_GENDER[p.gender] || DEFAULT_IMG_BY_GENDER._;

  return (
    <div className="sr-page">
      <Navbar />
      <div className="sr-layout">
        <FilterSidebar
          onFilterChange={(f) => {
            let list = [...baseResults];
            if (f?.brand) list = list.filter((p) => (p.brand || '').toLowerCase() === String(f.brand).toLowerCase());
            if (f?.priceRange) {
              list = list.filter((p) => {
                const price = offerPrice(p);
                return price >= f.priceRange.min && price <= f.priceRange.max;
              });
            }
            setResults(list);
          }}
        />
        <main className="sr-main">
          {loading ? (
            <div className="sr-status-wrap"><p className="sr-status">Loading...</p></div>
          ) : results.length === 0 ? (
            <div className="sr-status-wrap"><p className="sr-status">No products found.</p></div>
          ) : (
            <section className="sr-grid-wrap">
              <div className="sr-header">
                <h2 className="sr-title">Results for <span className="sr-highlight">{query}</span></h2>
                <span className="sr-count">{results.length} items</span>
              </div>
              <div className="sr-grid">
                {results.map((product) => (
                  <article
                    key={product.id}
                    className="sr-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="sr-img-wrap">
                      <img
                        src={getImg(product)}
                        alt={product.product_name}
                        onError={(e) => {
                          const fallback = DEFAULT_IMG_BY_GENDER[product.gender] || DEFAULT_IMG_BY_GENDER._;
                          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                        }}
                      />
                      <button
                        type="button"
                        className="sr-love"
                        onClick={(e) => handleWishlist(e, product)}
                        aria-label="Add to wishlist"
                      >
                        {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      {product.gender ? <div className="sr-pill">{product.gender}</div> : null}
                    </div>
                    <div className="sr-meta">
                      <h4 className="sr-brand" title={product.brand}>{product.brand}</h4>
                      <h5 className="sr-name" title={product.product_name}>{product.product_name}</h5>
                    </div>
                    <div className="sr-price">
                      <span className="sr-offer">₹{offerPrice(product).toFixed(2)}</span>
                      <span className="sr-mrp">₹{originalPrice(product).toFixed(2)}</span>
                      <span className="sr-disc">({discountPct(product)}% OFF)</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
