import React, { useState, useRef, useEffect } from 'react';
import { FaGoogle, FaTwitter, FaGithub } from 'react-icons/fa';
import './LoginPopup.css';

const LoginPopup = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const popupRef = useRef(null);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('userId', data.id);
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('userType', data.type);
        setPopupMessage('Successfully Logged In!');
        setTimeout(() => {
          onSuccess({
            id: data.id,
            name: data.name,
            email: data.email,
            profilePic: '/images/profile-picture.webp',
            userType: data.type
          });
          setPopupMessage('');
        }, 1500);
      } else {
        setPopupMessage(data.message || 'Invalid credentials');
        setTimeout(() => setPopupMessage(''), 2000);
      }
    } catch {
      setPopupMessage('Server error');
      setTimeout(() => setPopupMessage(''), 2000);
    }
  };

  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="popup-overlay-login">
      <div className="form-container-login" ref={popupRef}>
        <p className="title-login">Login</p>
        <form className="form-login" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group-login">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group-login">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="forgot-login">
              <a href="#">Forgot Password?</a>
            </div>
          </div>
          <button className="sign-login" onClick={handleLogin}>Sign In</button>
          {popupMessage && <div className="popup-success-login">{popupMessage}</div>}
        </form>

        <div className="social-message-login">
          <div className="line-login"></div>
          <p className="message-login">Login with social accounts</p>
          <div className="line-login"></div>
        </div>

        <div className="social-icons-login">
          <button className="icon-login" aria-label="Login with Google"><FaGoogle /></button>
          <button className="icon-login" aria-label="Login with Twitter"><FaTwitter /></button>
          <button className="icon-login" aria-label="Login with GitHub"><FaGithub /></button>
        </div>

        <p className="signup-login">Don't have an account? <a href="#">Sign up</a></p>
      </div>
    </div>
  );
};

export default LoginPopup;
