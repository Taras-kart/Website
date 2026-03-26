import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaUser, FaHeart, FaShoppingBag, FaSearch, FaTimes, FaRegUser, FaRegHeart } from 'react-icons/fa'
import { FiShoppingBag } from 'react-icons/fi'
import './Navbar.css'
import { useWishlist } from '../WishlistContext'
import { useCart } from '../CartContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

/* ─── Text helpers (logic unchanged) ────────────────────────── */
const normalizeText = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeSuggestionToken = (str) =>
  String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()

const levenshteinDistance = (a, b) => {
  const s = normalizeSuggestionToken(a)
  const t = normalizeSuggestionToken(b)
  if (!s.length) return t.length
  if (!t.length) return s.length
  const dp = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0))
  for (let i = 0; i <= s.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= t.length; j += 1) dp[0][j] = j
  for (let i = 1; i <= s.length; i += 1)
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  return dp[s.length][t.length]
}

const buildSuggestionTokens = (products) => {
  const map = new Map()
  products.forEach((p) => {
    ;[p.product_name, p.brand, p.color].forEach((field) => {
      const norm = normalizeText(field)
      if (norm)
        norm.split(' ').forEach((w) => {
          const token = w.trim()
          if (token.length >= 3 && !map.has(token)) map.set(token, true)
        })
    })
  })
  return Array.from(map.keys())
}

const toTitleCase = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '')

const getSuggestions = (input, tokens) => {
  const q = normalizeSuggestionToken(input)
  if (!q || q.length < 2) return []
  const scored = []
  tokens.forEach((token) => {
    const norm = normalizeSuggestionToken(token)
    if (!norm) return
    let score = 999
    if (norm.startsWith(q)) score = 0
    else if (norm.includes(q)) score = 1
    else {
      const d = levenshteinDistance(norm, q)
      if (d <= 2) score = 2 + d
      else return
    }
    scored.push({ token, score })
  })
  scored.sort((a, b) => a.score - b.score || a.token.length - b.token.length)
  const unique = []
  const used = new Set()
  for (let i = 0; i < scored.length; i += 1) {
    const key = scored[i].token.toLowerCase()
    if (!used.has(key)) {
      used.add(key)
      unique.push(toTitleCase(scored[i].token))
      if (unique.length >= 8) break
    }
  }
  return unique
}

/* ─── Search bar ─────────────────────────────────────────────── */
const SearchBar = React.memo(function SearchBar({
  wrapperClassName = '',
  inputRef,
  searchTerm,
  setSearchTerm,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSearch,
  onPickSuggestion
}) {
  return (
    <div className={`search-bar-final ${wrapperClassName}`}>
      <FaSearch
        className="search-icon-final"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSearch}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch()
          if (e.key === 'Escape') setShowSuggestions(false)
        }}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
        autoComplete="off"
        spellCheck={false}
      />
      <div
        className={`nav-suggestions${showSuggestions && suggestions.length > 0 ? ' open' : ''}`}
        role="listbox"
      >
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="nav-suggestion-item"
            onMouseDown={(e) => { e.preventDefault(); onPickSuggestion(s) }}
          >
            <span className="nav-suggestion-dot" />
            <span className="nav-suggestion-text">{s}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

/* ─── Main component ─────────────────────────────────────────── */
const NavbarFinal = () => {
  const { wishlistItems } = useWishlist()
  const { cartItems }     = useCart()

  const [userType, setUserType] = useState(() => {
    if (typeof window === 'undefined') return 'B2C'
    return sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
  })

  useEffect(() => {
    const syncUserType = () => {
      if (typeof window === 'undefined') return
      const storedType = sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
      if (storedType !== userType) setUserType(storedType)
    }
    window.addEventListener('storage', syncUserType)
    const interval = setInterval(syncUserType, 500)
    return () => {
      window.removeEventListener('storage', syncUserType)
      clearInterval(interval)
    }
  }, [userType])

  const isB2B = String(userType).toUpperCase() === 'B2B'

  // eslint-disable-next-line no-unused-vars
  const homePath = isB2B ? '/b2b-dashboard' : '/'

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [searchTerm,      setSearchTerm]      = useState('')
  const [showNav,         setShowNav]         = useState(true)
  const [suggestions,     setSuggestions]     = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const location           = useLocation()
  const navigate           = useNavigate()
  const mobileNavRef       = useRef(null)
  const lastY              = useRef(0)
  const ticking            = useRef(false)
  const suggestionAbortRef = useRef(null)
  const desktopInputRef    = useRef(null)
  const mobileInputRef     = useRef(null)

  const navLinks = useMemo(() => {
    if (isB2B) {
      return [
        { name: 'Dashboard', path: '/b2b-dashboard' },
        { name: 'Contact Us', path: '/customer-care' }
      ]
    }
    return [
      { name: 'Home',       path: '/' },
      { name: 'Women',      path: '/women' },
      { name: 'Men',        path: '/men' },
      { name: 'Kids',       path: '/kids' },
      { name: 'Contact Us', path: '/customer-care' }
    ]
  }, [isB2B])

  const isActive = (p) => location.pathname === p

  /* drawer + body lock */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target) &&
        !e.target.closest('.nav-toggle-final')
      ) setIsMobileNavOpen(false)
    }
    if (isMobileNavOpen) {
      document.addEventListener('click', handleOutsideClick)
      document.body.classList.add('drawer-open')
    } else {
      document.body.classList.remove('drawer-open')
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      document.body.classList.remove('drawer-open')
    }
  }, [isMobileNavOpen])

  /* scroll hide */
  useEffect(() => {
    lastY.current = window.scrollY || 0
    const threshold = 6
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const delta = y - lastY.current
        if (y <= 0) setShowNav(true)
        else if (Math.abs(delta) > threshold) { setShowNav(delta < 0); lastY.current = y }
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* clear suggestions on route change */
  useEffect(() => {
    setShowSuggestions(false)
    setSuggestions([])
  }, [location.pathname])

  /* suggestion fetch */
  useEffect(() => {
    const term = searchTerm.trim()
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      if (suggestionAbortRef.current) { suggestionAbortRef.current.abort(); suggestionAbortRef.current = null }
      return
    }
    if (suggestionAbortRef.current) suggestionAbortRef.current.abort()
    const controller = new AbortController()
    suggestionAbortRef.current = controller
    const run = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        const data = await res.json()
        const s    = getSuggestions(term, buildSuggestionTokens(Array.isArray(data) ? data : []))
        setSuggestions(s)
        setShowSuggestions(true)
      } catch {
        if (!controller.signal.aborted) { setSuggestions([]); setShowSuggestions(false) }
      }
    }
    run()
    return () => controller.abort()
  }, [searchTerm])

  /* close suggestions on outside click */
  useEffect(() => {
    const onDown = (e) => {
      if (!e.target.closest('.search-bar-final') && !e.target.closest('.nav-suggestions'))
        setShowSuggestions(false)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [])

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileNavOpen(false)
  }

  const handleSearch = () => {
    const v = searchTerm.trim()
    if (v) {
      navigate(`/search?q=${encodeURIComponent(v)}`)
      setIsMobileNavOpen(false)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (value) => {
    setSearchTerm(value)
    navigate(`/search?q=${encodeURIComponent(value)}`)
    setIsMobileNavOpen(false)
    setShowSuggestions(false)
  }

  return (
    <nav className={`navbar-final${showNav ? '' : ' nav-hidden'}`}>

      {/* ════════ DESKTOP ════════ */}
      <div className="desktop-only-final">
        <div className="nb-row nb-row--top">
          <div className="nb-gif-wrap">
            <img src="/loader-bg.gif" alt="" aria-hidden="true" className="nb-gif" />
          </div>

          <div className="nb-logo-center">
            <Link to={homePath} onClick={handleNavClick}>
              <img src="/logo1.png" alt="Taras Kart" className="nb-logo-img" />
            </Link>
          </div>

          <div className="nb-icons-right">
            <div className="icon-buttons-final">
              <Link to="/profile" className={`icon-btn${isActive('/profile') ? ' icon-active-btn' : ''}`}>
                <div className="icon-circle">
                  {isActive('/profile') ? <FaUser className="icon icon-filled" /> : <FaRegUser className="icon icon-outline" />}
                  {isActive('/profile') && <span className="inner-ring" />}
                </div>
                <span className={`icon-label${isActive('/profile') ? ' label-active' : ''}`}>Profile</span>
              </Link>

              {!isB2B && (
                <>
                  <Link to="/wishlist" className={`icon-btn${isActive('/wishlist') ? ' icon-active-btn' : ''}`}>
                    <div className="icon-circle">
                      {isActive('/wishlist') ? <FaHeart className="icon icon-filled" /> : <FaRegHeart className="icon icon-outline" />}
                      {wishlistItems.length > 0 && <span className="red-dot1" />}
                      {isActive('/wishlist') && <span className="inner-ring" />}
                    </div>
                    <span className={`icon-label${isActive('/wishlist') ? ' label-active' : ''}`}>Wishlist</span>
                  </Link>

                  <Link to="/cart" className={`icon-btn${isActive('/cart') ? ' icon-active-btn' : ''}`}>
                    <div className="icon-circle">
                      {isActive('/cart') ? <FaShoppingBag className="icon icon-filled" /> : <FiShoppingBag className="icon icon-outline-stroke" />}
                      {cartItems.length > 0 && <span className="red-dot1" />}
                      {isActive('/cart') && <span className="inner-ring" />}
                    </div>
                    <span className={`icon-label${isActive('/cart') ? ' label-active' : ''}`}>Kart</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="nb-divider" aria-hidden="true" />

        <div className="nb-row nb-row--bottom">
          {/* SEARCH HIDDEN FOR B2B */}
          <div className="nb-search-wrap">
            {!isB2B && (
              <SearchBar
                wrapperClassName="search-desktop-light"
                inputRef={desktopInputRef}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                onSearch={handleSearch}
                onPickSuggestion={handleSuggestionClick}
              />
            )}
          </div>

          <div className="nb-links-center">
            <div className="nav-links-final nav-links-desktop-final">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  to={path}
                  onClick={handleNavClick}
                  className={`nav-link-final${isActive(path) ? ' active-final' : ''}`}
                >
                  <span>{name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="nb-search-wrap" aria-hidden="true" />
        </div>
      </div>

      {/* ════════ MOBILE ════════ */}
      <div className="mobile-only-final">
        <div className="top-row-final">
          <div className="nb-mob-gif-wrap">
            <img src="/loader-bg.gif" alt="" aria-hidden="true" className="nb-mob-gif" />
          </div>

          <div className="nb-mob-logo-wrap">
            <Link to={homePath} onClick={handleNavClick}>
              <img src="/logo1.png" alt="Taras Kart" className="nb-mobile-logo" />
            </Link>
          </div>

          <div className="nb-mob-toggle-wrap">
            <button
              type="button"
              className="nav-toggle-final"
              aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <div className={`dot-grid-final${isMobileNavOpen ? ' dots-open' : ''}`}>
                {[...Array(9)].map((_, i) => <span key={i} />)}
              </div>
            </button>
          </div>
        </div>

        {/* SEARCH HIDDEN FOR B2B */}
        {!isB2B && (
          <div className="bottom-row-final">
            <SearchBar
              inputRef={mobileInputRef}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onSearch={handleSearch}
              onPickSuggestion={handleSuggestionClick}
            />
          </div>
        )}

        {isMobileNavOpen && (
          <div className="mobile-drawer-final slide-in" ref={mobileNavRef}>
            <div className="nb-drawer-topbar">
              <button
                type="button"
                className="close-btn-final"
                aria-label="Close menu"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <nav className="nb-drawer-nav">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  to={path}
                  onClick={handleNavClick}
                  className={`nb-drawer-link${isActive(path) ? ' nb-drawer-link--active' : ''}`}
                >
                  <span className="nb-drawer-link-dot" aria-hidden="true" />
                  <span>{name}</span>
                </Link>
              ))}
            </nav>

            <div className="nb-drawer-sep" aria-hidden="true" />

            <div className="nb-drawer-footer">
              <Link to="/profile" className="nb-drawer-footer-row" onClick={handleNavClick}>
                <FaRegUser />
                <span>Profile</span>
              </Link>

              {!isB2B && (
                <>
                  <Link to="/wishlist" className="nb-drawer-footer-row" onClick={handleNavClick}>
                    <FaRegHeart />
                    <span>
                      Wishlist
                      {wishlistItems.length > 0 && (
                        <span className="nb-drawer-count">{wishlistItems.length}</span>
                      )}
                    </span>
                  </Link>
                  <Link to="/cart" className="nb-drawer-footer-row" onClick={handleNavClick}>
                    <FiShoppingBag />
                    <span>
                      Cart
                      {cartItems.length > 0 && (
                        <span className="nb-drawer-count">{cartItems.length}</span>
                      )}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarFinal