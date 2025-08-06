import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Orders from './Orders';
import TandC from './TandC';
import CustomerCare from './CustomerCare';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('Profile');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      fetch(`http://localhost:5000/api/user/${email}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            setUserInfo({
              profilePic: '/images/profile-picture.webp',
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
    // Optional: clear cart & wishlist context if needed
    window.location.href = '/';
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-left">
          <div className="profile-title">My Account</div>
          <div className="profile-buttons">
            <button className={`profile-button ${activeSection === 'Profile' ? 'active' : ''}`} onClick={() => setActiveSection('Profile')}>Profile</button>
            <button className={`profile-button ${activeSection === 'Orders' ? 'active' : ''}`} onClick={() => setActiveSection('Orders')}>Orders</button>
            <button className={`profile-button ${activeSection === 'Terms' ? 'active' : ''}`} onClick={() => setActiveSection('Terms')}>Terms & Conditions</button>
            <button className={`profile-button ${activeSection === 'CustomerCare' ? 'active' : ''}`} onClick={() => setActiveSection('CustomerCare')}>Customer Care</button>
            {isLoggedIn && <button className="profile-button" onClick={handleLogout}>Logout</button>}
          </div>
        </div>

        <div className="profile-right">
          {!isLoggedIn ? (
            <div className="login-signup-buttons">
              <button className="login-button" onClick={() => setShowLoginPopup(true)}>Login</button>
              <button className="signup-button" onClick={() => setShowSignupPopup(true)}>Signup</button>
            </div>
          ) : (
            activeSection === 'Profile' && userInfo && (
              <>
                <div className="welcome-message">Welcome to TARS KART</div>
                <div className="profile-information">
                  <div className="profile-header">
                    <img className="profile-pic" src={userInfo.profilePic} alt="Profile" />
                    <div className="user-details">
                      <h2>{userInfo.name}</h2>
                      <p>Email: {userInfo.email}</p>
                      <p>Mobile: {userInfo.mobile}</p>
                    </div>
                  </div>
                </div>
              </>
            )
          )}

          {activeSection === 'Orders' && isLoggedIn && (
            <Orders
              orders={[
                {
                  image: '/images/men/mens4.jpeg',
                  name: 'Jacket',
                  date: 'Delivered on June 15, 2025',
                  brand: 'Zara',
                  originalPrice: 4500,
                  offerPrice: 1999
                }
              ]}
            />
          )}

          {activeSection === 'Terms' && <TandC />}
          {activeSection === 'CustomerCare' && <CustomerCare />}
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
