import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaHeart, FaShoppingBag, FaSearch, FaTimes, FaRegUser, FaRegHeart } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';
import './Navbar.css';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const normalizeText = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/₹/g, ' ')
    .replace(/rs\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeSuggestionToken = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

const levenshteinDistance = (a, b) => {
  const s = normalizeSuggestionToken(a);
  const t = normalizeSuggestionToken(b);
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const dp = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= t.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= s.length; i += 1) {
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      const del = dp[i - 1][j] + 1;
      const ins = dp[i][j - 1] + 1;
      const sub = dp[i - 1][j - 1] + cost;
      dp[i][j] = Math.min(del, ins, sub);
    }
  }
  return dp[s.length][t.length];
};

const buildSuggestionTokens = (products) => {
  const map = new Map();
  products.forEach((p) => {
    const name = normalizeText(p.product_name);
    if (!name) return;
    const parts = name.split(' ');
    parts.forEach((w) => {
      const token = w.trim();
      if (token.length < 3) return;
      if (!map.has(token)) map.set(token, true);
    });
  });
  return Array.from(map.keys());
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getSuggestions = (input, tokens) => {
  const q = normalizeSuggestionToken(input);
  if (!q || q.length < 2) return [];
  const scored = [];
  tokens.forEach((token) => {
    const norm = normalizeSuggestionToken(token);
    if (!norm) return;
    let score = 999;
    if (norm.startsWith(q)) {
      score = 0;
    } else if (norm.includes(q)) {
      score = 1;
    } else {
      const d = levenshteinDistance(norm, q);
      if (d <= 2) score = 2 + d;
      else return;
    }
    scored.push({ token, score });
  });
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.token.length - b.token.length;
  });
  const unique = [];
  const used = new Set();
  for (let i = 0; i < scored.length; i += 1) {
    const key = scored[i].token.toLowerCase();
    if (!used.has(key)) {
      used.add(key);
      unique.push(toTitleCase(scored[i].token));
      if (unique.length >= 8) break;
    }
  }
  return unique;
};

const NavbarFinal = () => {
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNav, setShowNav] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const mobileNavRef = useRef(null);
  const navigate = useNavigate();
  const lastY = useRef(0);
  const ticking = useRef(false);
  const suggestionAbortRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target) &&
        !event.target.closest('.nav-toggle-final')
      ) {
        setIsMobileNavOpen(false);
      }
    };
    if (isMobileNavOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.classList.remove('drawer-open');
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    lastY.current = window.scrollY || window.pageYOffset || 0;
    const threshold = 6;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        const delta = y - lastY.current;
        if (y <= 0) {
          setShowNav(true);
        } else if (Math.abs(delta) > threshold) {
          setShowNav(delta < 0);
          lastY.current = y;
        }
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setSuggestions([]);
  }, [location.pathname]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (suggestionAbortRef.current) {
        suggestionAbortRef.current.abort();
        suggestionAbortRef.current = null;
      }
      return;
    }
    if (suggestionAbortRef.current) {
      suggestionAbortRef.current.abort();
    }
    const controller = new AbortController();
    suggestionAbortRef.current = controller;
    const run = async () => {
      try {
        const url = `${API_BASE}/api/products/search?q=${encodeURIComponent(term)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        const tokens = buildSuggestionTokens(arr);
        const s = getSuggestions(term, tokens);
        setSuggestions(s);
        setShowSuggestions(s.length > 0);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    };
    run();
    return () => {
      controller.abort();
    };
  }, [searchTerm]);

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileNavOpen(false);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileNavOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (value) => {
    setSearchTerm(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setIsMobileNavOpen(false);
    setShowSuggestions(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Women', path: '/women' },
    { name: 'Men', path: '/men' },
    { name: 'Kids', path: '/kids' },
    { name: 'All Brands', path: '/brands' }
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <nav className={`navbar-final ${showNav ? '' : 'nav-hidden'}`}>
      <div className="top-row-final">
        <div className="nav-toggle-final" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <div className={`dot-grid-final ${isMobileNavOpen ? 'dots-open' : ''}`}>
            {[...Array(9)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
        </div>

        <div className="logo-final">
          <video autoPlay loop muted playsInline>
            <source src="/images/logo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="nav-right-final desktop-tab-only-final">
          <div className="nav-links-final">
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={handleNavClick}
                className={`nav-link-final Btn ${isActive(path) ? 'active-final' : ''}`}
              >
                <span>{name}</span>
              </Link>
            ))}
          </div>

          <div className="search-bar-final Btn">
            <FaSearch className="search-icon-final" onClick={handleSearch} />
            <input
              type="text"
              placeholder="search a product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="nav-suggestions">
                {suggestions.map((s) => (
                  <div
                    key={s}
                    className="nav-suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(s);
                    }}
                  >
                    <span className="nav-suggestion-dot" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="icon-buttons-final">
            <Link to="/profile" className={`icon-btn ${isActive('/profile') ? 'icon-active-btn' : ''}`}>
              <div className="icon-circle">
                {isActive('/profile') ? (
                  <FaUser className="icon icon-filled" />
                ) : (
                  <FaRegUser className="icon icon-outline" />
                )}
                <span className="inner-ring" />
              </div>
              <span className={`icon-label ${isActive('/profile') ? 'label-active' : ''}`}>Profile</span>
            </Link>

            <Link to="/wishlist" className={`icon-btn ${isActive('/wishlist') ? 'icon-active-btn' : ''}`}>
              <div className="icon-circle">
                {isActive('/wishlist') ? (
                  <FaHeart className="icon icon-filled" />
                ) : (
                  <FaRegHeart className="icon icon-outline" />
                )}
                {wishlistItems.length > 0 && <span className="red-dot1" />}
                <span className="inner-ring" />
              </div>
              <span className={`icon-label ${isActive('/wishlist') ? 'label-active' : ''}`}>Wishlist</span>
            </Link>

            <Link to="/cart" className={`icon-btn ${isActive('/cart') ? 'icon-active-btn' : ''}`}>
              <div className="icon-circle">
                {isActive('/cart') ? (
                  <FaShoppingBag className="icon icon-filled" />
                ) : (
                  <FiShoppingBag className="icon icon-outline-stroke" />
                )}
                {cartItems.length > 0 && <span className="red-dot1" />}
                <span className="inner-ring" />
              </div>
              <span className={`icon-label ${isActive('/cart') ? 'label-active' : ''}`}>Kart</span>
            </Link>
          </div>
        </div>

        <div className="mobile-top-icons">
          <Link to="/profile" className={`icon-btn ${isActive('/profile') ? 'icon-active-btn' : ''}`}>
            <div className="icon-circle">
              {isActive('/profile') ? (
                <FaUser className="icon icon-filled" />
              ) : (
                <FaRegUser className="icon icon-outline" />
              )}
              <span className="inner-ring" />
            </div>
          </Link>

          <Link to="/wishlist" className={`icon-btn ${isActive('/wishlist') ? 'icon-active-btn' : ''}`}>
            <div className="icon-circle">
              {isActive('/wishlist') ? (
                <FaHeart className="icon icon-filled" />
              ) : (
                <FaRegHeart className="icon icon-outline" />
              )}
              {wishlistItems.length > 0 && <span className="red-dot1" />}
              <span className="inner-ring" />
            </div>
          </Link>

          <Link to="/cart" className={`icon-btn ${isActive('/cart') ? 'icon-active-btn' : ''}`}>
            <div className="icon-circle">
              {isActive('/cart') ? (
                <FaShoppingBag className="icon icon-filled" />
              ) : (
                <FiShoppingBag className="icon icon-outline-stroke" />
              )}
              {cartItems.length > 0 && <span className="red-dot1" />}
              <span className="inner-ring" />
            </div>
          </Link>
        </div>
      </div>

      <div className="bottom-row-final mobile-only-final">
        <div className="search-bar-final Btn">
          <FaSearch className="search-icon-final" onClick={handleSearch} />
          <input
            type="text"
            placeholder="search a product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="nav-suggestions">
              {suggestions.map((s) => (
                <div
                  key={s}
                  className="nav-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(s);
                  }}
                >
                  <span className="nav-suggestion-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="mobile-drawer-final slide-in" ref={mobileNavRef}>
          <div className="close-btn-final" onClick={() => setIsMobileNavOpen(false)}>
            <FaTimes />
          </div>
          <div className="nav-links-final">
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={handleNavClick}
                className={`nav-link-final Btn ${isActive(path) ? 'active-final' : ''}`}
              >
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarFinal;
