import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Orders from './Orders';
import TandC from './TandC';
import CustomerCare from './CustomerCare';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const Profile = () => {
  const [activeSection, setActiveSection] = useState('Profile');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      fetch(`${API_BASE}/api/user/by-email/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            setUserInfo({
              profilePic: '/images/profile-pic.png',
              name: data.name,
              email: data.email,
              mobile: data.mobile
            });
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
          setUserInfo(null);
        });
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setUserInfo(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-bg-orbs"></div>
      <div className="profile-container">
        <div className="profile-left">
          <div className="profile-title">My Account</div>
          {isLoggedIn && userInfo && (
            <div className="mini-card">
              <div className="mini-avatar">
                <img src={userInfo.profilePic} alt="Profile" />
                <span className="mini-ring"></span>
              </div>
              <div className="mini-info">
                <div className="mini-name">{userInfo.name}</div>
                <div className="mini-chip">Signed in</div>
              </div>
            </div>
          )}
          <div className="profile-buttons">
            <button
              className={`profile-button ${activeSection === 'Profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('Profile')}
            >
              <span className="btn-shine"></span>
              Profile
            </button>
            <button
              className={`profile-button ${activeSection === 'Orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('Orders')}
            >
              <span className="btn-shine"></span>
              Orders
            </button>
            <button
              className={`profile-button ${activeSection === 'Terms' ? 'active' : ''}`}
              onClick={() => setActiveSection('Terms')}
            >
              <span className="btn-shine"></span>
              Terms & Conditions
            </button>
            <button
              className={`profile-button ${activeSection === 'CustomerCare' ? 'active' : ''}`}
              onClick={() => setActiveSection('CustomerCare')}
            >
              <span className="btn-shine"></span>
              Customer Care
            </button>
            {isLoggedIn && (
              <button className="profile-button danger" onClick={handleLogout}>
                <span className="btn-shine"></span>
                Logout
              </button>
            )}
          </div>
        </div>
        <div key={activeSection} className="profile-right animate-section">
          {!isLoggedIn ? (
            <div className="login-signup-panel">
              <div className="welcome-hero">
                <div className="welcome-ring"></div>
                <h2>Welcome to TARS KART</h2>
                <p>Sign in to manage your profile, orders, and more.</p>
              </div>
              <div className="login-signup-buttons">
                <button className="login-button" onClick={() => setShowLoginPopup(true)}>Login</button>
                <button className="signup-button" onClick={() => setShowSignupPopup(true)}>Signup</button>
              </div>
            </div>
          ) : (
            activeSection === 'Profile' &&
            userInfo && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="avatar-wrap">
                    <img className="profile-pic" src={userInfo.profilePic} alt="Profile" />
                    <span className="avatar-glow"></span>
                  </div>
                  <div className="user-details">
                    <h2>{userInfo.name}</h2>
                    <div className="user-chips">
                      <span className="chip">Member</span>
                      <span className="chip gold">Gold</span>
                    </div>
                  </div>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{userInfo.email}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Mobile</div>
                    <div className="info-value">{userInfo.mobile}</div>
                  </div>
                </div>
                <div className="cta-row">
                  <a href="/wishlist" className="glass-cta">View Wishlist</a>
                  <a href="/orders" className="glass-cta">Track Orders</a>
                </div>
              </div>
            )
          )}
          {activeSection === 'Orders' && isLoggedIn && (
            <div className="section-card">
              <Orders user={{ email: userInfo?.email, mobile: userInfo?.mobile }} />
            </div>
          )}
          {activeSection === 'Terms' && (
            <div className="section-card">
              <TandC />
            </div>
          )}
          {activeSection === 'CustomerCare' && (
            <div className="section-card">
              <CustomerCare />
            </div>
          )}
        </div>
      </div>
      {showLoginPopup && (
        <LoginPopup
          onClose={() => setShowLoginPopup(false)}
          onSuccess={(user) => {
            sessionStorage.setItem('userEmail', user.email);
            window.location.reload();
          }}
        />
      )}
      {showSignupPopup && (
        <SignupPopup
          onClose={() => setShowSignupPopup(false)}
          onSuccess={(user) => {
            sessionStorage.setItem('userEmail', user.email);
            window.location.reload();
          }}
        />
      )}
      <Footer />
    </div>
  );
};

export default Profile;
