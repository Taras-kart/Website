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

const GENDER_LABELS = {
  WOMEN: 'Women',
  MEN: 'Men',
  KIDS: 'Kids'
};

const STOPWORDS = new Set([
  'for',
  'and',
  'with',
  'in',
  'the',
  'a',
  'an',
  'of',
  'to',
  'on',
  'from',
  'at',
  'by',
  'rs',
  'rupees',
  'below',
  'under',
  'upto',
  'between',
  'above',
  'over',
  'less',
  'more',
  'than',
  'price',
  'underwear',
  'underware'
]);

const detectGender = (q) => {
  const s = String(q || '').toLowerCase();
  if (/\b(women|woman|ladies|female)\b/.test(s)) return { gender: 'WOMEN', cleaned: s.replace(/\b(women|woman|ladies|female)\b/gi, '').trim() };
  if (/\b(men|man|male|gents)\b/.test(s)) return { gender: 'MEN', cleaned: s.replace(/\b(men|man|male|gents)\b/gi, '').trim() };
  if (/\b(kids|kid|children|child|boys|girls)\b/.test(s)) return { gender: 'KIDS', cleaned: s.replace(/\b(kids|kid|children|child|boys|girls)\b/gi, '').trim() };
  return { gender: '', cleaned: s.trim() };
};

const parsePriceRangeFromQuery = (raw) => {
  const original = String(raw || '');
  const s = original.toLowerCase();
  const hyphenRange = s.match(/(\d+)\s*-\s*(\d+)/);
  let priceMin = null;
  let priceMax = null;
  if (hyphenRange) {
    const n1 = parseInt(hyphenRange[1], 10);
    const n2 = parseInt(hyphenRange[2], 10);
    if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
      priceMin = Math.min(n1, n2);
      priceMax = Math.max(n1, n2);
    }
  } else {
    const numbers = s.match(/\d+/g);
    if (numbers && numbers.length) {
      const first = parseInt(numbers[0], 10);
      const second = numbers[1] ? parseInt(numbers[1], 10) : null;
      const hasUnder = /(under|below|upto|up to|less than|<|<=)/.test(s);
      const hasAbove = /(above|over|more than|>|>=)/.test(s);
      const hasBetween = /(between|from)/.test(s) && /(to|and)/.test(s);
      if (hasBetween && second != null && !Number.isNaN(second)) {
        priceMin = Math.min(first, second);
        priceMax = Math.max(first, second);
      } else if (hasUnder) {
        priceMax = first;
      } else if (hasAbove) {
        priceMin = first;
      }
    }
  }
  let cleaned = original.replace(/\b(under|below|between|upto|up to|less than|greater than|above|over|more than|price|rs|rs\.|rupees)\b/gi, ' ');
  cleaned = cleaned.replace(/\d+/g, ' ');
  cleaned = cleaned.replace(/₹/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return { priceMin, priceMax, cleanedQuery: cleaned };
};

const normalizeText = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/₹/g, ' ')
    .replace(/rs\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildTokens = (text) => {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm
    .split(' ')
    .filter((t) => t && !STOPWORDS.has(t));
};

const tokenMatchesField = (token, field) => {
  if (!token || !field) return false;
  const base = token.toLowerCase();
  const f = field.toLowerCase();
  const singular = base.endsWith('s') ? base.slice(0, -1) : base;
  if (f.includes(base)) return true;
  if (singular && f.includes(singular)) return true;
  return false;
};

const textMatchesProduct = (tokens, product) => {
  if (!tokens.length) return true;
  const fields = [
    normalizeText(product.product_name),
    normalizeText(product.brand),
    normalizeText(product.category),
    normalizeText(product.category_slug),
    normalizeText(product.gender)
  ];
  return tokens.every((t) => fields.some((f) => f && tokenMatchesField(t, f)));
};

const parseSearchQuery = (rawQuery) => {
  const { gender, cleaned } = detectGender(rawQuery);
  const { priceMin, priceMax, cleanedQuery } = parsePriceRangeFromQuery(cleaned);
  const queryText = cleanedQuery || cleaned || String(rawQuery || '').toLowerCase().trim();
  return { gender, queryText, priceMin, priceMax };
};

const buildFilterSummary = ({ gender, priceMin, priceMax }) => {
  const parts = [];
  if (gender && GENDER_LABELS[gender]) parts.push(GENDER_LABELS[gender]);
  if (priceMin != null && priceMax != null) parts.push(`₹${priceMin} - ₹${priceMax}`);
  else if (priceMin != null) parts.push(`Above ₹${priceMin}`);
  else if (priceMax != null) parts.push(`Under ₹${priceMax}`);
  if (!parts.length) return '';
  return parts.join(' • ');
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems, addToWishlist } = useWishlist();
  const [baseResults, setBaseResults] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('q') || '';
  const parsed = useMemo(() => parseSearchQuery(query), [query]);
  const { gender, queryText, priceMin, priceMax } = parsed;
  const filterSummary = useMemo(() => buildFilterSummary(parsed), [parsed]);

  const userType = (localStorage.getItem('userType') || 'B2C').toUpperCase();
  const userId = sessionStorage.getItem('userId');

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

  const applyQueryFilters = (products, currentQueryText, min, max) => {
    const tokens = buildTokens(currentQueryText);
    return products.filter((p) => {
      const price = offerPrice(p);
      if (min != null && price < min) return false;
      if (max != null && price > max) return false;
      if (!textMatchesProduct(tokens, p)) return false;
      return true;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const baseSearchTerm = queryText || query;
        const url = gender
          ? `${API_BASE}/api/products?gender=${encodeURIComponent(gender)}${baseSearchTerm ? `&q=${encodeURIComponent(baseSearchTerm)}` : ''}`
          : `${API_BASE}/api/products/search?q=${encodeURIComponent(baseSearchTerm)}`;
        const res = await fetch(url);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        if (!cancelled) {
          const refined = applyQueryFilters(arr, queryText, priceMin, priceMax);
          setBaseResults(refined);
          setResults(refined);
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
  }, [gender, query, queryText, priceMin, priceMax]);

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
            <div className="sr-status-wrap">
              <p className="sr-status">Loading...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="sr-status-wrap">
              <p className="sr-status">No products found.</p>
            </div>
          ) : (
            <section className="sr-grid-wrap">
              <div className="sr-header">
                <div>
                  <h2 className="sr-title">
                    Results for <span className="sr-highlight">{query}</span>
                  </h2>
                  {filterSummary ? <p className="sr-subtitle">{filterSummary}</p> : null}
                </div>
                <span className="sr-count">{results.length} items</span>
              </div>
              <div className="sr-grid">
                {results.map((product) => (
                  <article key={product.id} className="sr-card" onClick={() => handleProductClick(product)}>
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
                      <h4 className="sr-brand" title={product.brand}>
                        {product.brand}
                      </h4>
                      <h5 className="sr-name" title={product.product_name}>
                        {product.product_name}
                      </h5>
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
