import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaHeart, FaShoppingBag, FaSearch, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';

const NavbarFinal = () => {
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const mobileNavRef = useRef(null);

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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Women', path: '/women' },
    { name: 'Men', path: '/men' },
    { name: 'Kids', path: '/kids' },
    { name: 'All Brands', path: '/brands' }
  ];

  return (
    <nav className="navbar-final">
      <div className="top-row-final">
        <div className="logo-final">
          <img src="/images/bg.jpg" alt="Logo" />
        </div>

        <div className="nav-toggle-final" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <div className="dot-grid-final">
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
                className={`nav-link-final Btn ${location.pathname === path ? 'active-final' : ''}`}
              >
                <span>{name}</span>
              </Link>
            ))}
          </div>

          <div className="search-bar-final Btn">
            <FaSearch className="search-icon-final" />
            <input type="text" placeholder="search a product" />
          </div>

          <div className="icon-buttons-final">
            <Link to="/profile" className="icon-btn profile-icon">
              <FaUser className={location.pathname === '/profile' ? 'icon-active' : 'icon-default'} />
            </Link>

            <Link to="/wishlist" className="icon-btn wishlist-icon">
              <FaHeart className={location.pathname === '/wishlist' ? 'icon-active' : 'icon-default'} />
              {wishlistItems.length > 0 && <span className="red-dot" />}
            </Link>

            <Link to="/cart" className="icon-btn cart-icon">
              <FaShoppingBag className={location.pathname === '/cart' ? 'icon-active' : 'icon-default'} />
              {cartItems.length > 0 && <span className="red-dot" />}
            </Link>
          </div>
        </div>
      </div>

      <div className="bottom-row-final mobile-only-final">
        <div className="search-bar-final Btn">
          <FaSearch className="search-icon-final" />
          <input type="text" placeholder="search a product" />
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="mobile-drawer-final" ref={mobileNavRef}>
          <div className="close-btn-final" onClick={() => setIsMobileNavOpen(false)}>
            <FaTimes />
          </div>
          <div className="nav-links-final">
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={handleNavClick}
                className={`nav-link-final Btn ${location.pathname === path ? 'active-final' : ''}`}
              >
                {name}
              </Link>
            ))}
          </div>
          <div className="icon-buttons-final">
            <Link to="/profile" className="icon-btn profile-icon">
              <FaUser className={location.pathname === '/profile' ? 'icon-active' : 'icon-default'} />
              <span>Profile</span>
            </Link>
            <Link to="/wishlist" className="icon-btn wishlist-icon">
              <FaHeart className={location.pathname === '/wishlist' ? 'icon-active' : 'icon-default'} />
              {wishlistItems.length > 0 && <span className="red-dot" />}
              <span>Wishlist</span>
            </Link>
            <Link to="/cart" className="icon-btn cart-icon">
              <FaShoppingBag className={location.pathname === '/cart' ? 'icon-active' : 'icon-default'} />
              {cartItems.length > 0 && <span className="red-dot" />}
              <span>Cart</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarFinal;
