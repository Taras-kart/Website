// Profile.js
import React, { useState } from 'react';
import './Profile.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Orders from './Orders';
import TandC from './TandC';
import CustomerCare from './CustomerCare';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('Profile');

  const [userInfo, setUserInfo] = useState({
    profilePic: '/images/profile-picture.webp',
    name: 'John Doe',
    email: 'johndoe@example.com',
  });

  const handleLogout = () => {
    setUserInfo(null);
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
            <button className={`profile-button ${activeSection === 'Terms' ? 'active' : ''}`} onClick={() => setActiveSection('Terms')}>Terms and Conditions</button>
            <button className={`profile-button ${activeSection === 'CustomerCare' ? 'active' : ''}`} onClick={() => setActiveSection('CustomerCare')}>Customer Care</button>
            <button className="profile-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="profile-right">
          {activeSection === 'Profile' && userInfo && (
            <>
              <div className="welcome-message">Welcome to TARS KART</div>
              <div className="profile-information">
                <div className="profile-header">
                  <img className="profile-pic" src={userInfo.profilePic} alt="Profile" />
                  <div className="user-details">
                    <h2>{userInfo.name}</h2>
                    <p>{userInfo.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'Orders' && (
            <Orders
              orders={[
                {
                  image: '/images/men/mens4.jpeg',
                  name: 'Jacket',
                  date: 'Delivered on June 15, 2025',
                  brand: 'Zara',
                  originalPrice: 4500,
                  offerPrice: 1999,
                },
              ]}
            />
          )}

          {activeSection === 'Terms' && <TandC />}
          {activeSection === 'CustomerCare' && <CustomerCare />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
