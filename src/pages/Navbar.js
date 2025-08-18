import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaHeart, FaShoppingBag, FaSearch, FaTimes, FaRegUser, FaRegHeart } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';
import './Navbar.css';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';

const NavbarFinal = () => {
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const mobileNavRef = useRef(null);
  const navigate = useNavigate();

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
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobileNavOpen]);

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileNavOpen(false);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileNavOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Women', path: '/women' },
    { name: 'Men', path: '/men' },
    { name: 'Kids', path: '/kids' },
    { name: 'GenZ', path: '/genz' },
    { name: 'All Brands', path: '/brands' }
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <nav className="navbar-final">
      <div className="top-row-final">
        <div className="logo-final">
          <img src="/images/bg.jpg" alt="Logo" />
        </div>

        <div className="nav-toggle-final" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <div className={`dot-grid-final ${isMobileNavOpen ? 'dots-open' : ''}`}>
            {[...Array(9)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
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
            />
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
              <span className={`icon-label ${isActive('/cart') ? 'label-active' : ''}`}>Cart</span>
            </Link>
          </div>
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
          />
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
                {name}
              </Link>
            ))}
          </div>
          <div className="icon-buttons-final mobile-icons">
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
              <span className={`icon-label ${isActive('/cart') ? 'label-active' : ''}`}>Cart</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarFinal;
