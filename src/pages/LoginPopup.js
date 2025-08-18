// src/components/LoginPopup.js
import React, { useState, useRef, useEffect } from 'react';
import { FaGoogle, FaTwitter, FaGithub } from 'react-icons/fa';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPopup.css';
import ForgotPasswordPopup from './ForgotPasswordPopup';

const LoginPopup = ({ onClose, onSuccess }) => {
  const popupRef = useRef(null);
  const emailRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const canSubmit = validEmail(email) && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
            profilePic: '/images/profile-pic.png',
            userType: data.type
          });
          setPopupMessage('');
        }, 1200);
      } else {
        setPopupMessage(data.message || 'Invalid credentials');
        setTimeout(() => setPopupMessage(''), 2000);
      }
    } catch {
      setPopupMessage('Server error');
      setTimeout(() => setPopupMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showForgot) return;
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (showForgot) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handleLogin();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    emailRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showForgot]);

  return (
    <>
      <div className="popup-overlay-login">
        <div className="form-container-login" ref={popupRef} role="dialog" aria-modal="true">
          <button className="close-login" onClick={onClose} aria-label="Close"><FiX /></button>
          <div className="head-login">
            <p className="title-login">Welcome back</p>
            <p className="sub-login">Sign in to continue to Tars Kart</p>
          </div>
          <form className="form-login" onSubmit={(e) => e.preventDefault()}>
            <div className={`input-wrap-login ${email && !validEmail(email) ? 'has-error' : ''}`}>
              <span className="i-login"><FiMail /></span>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="input-wrap-login">
              <span className="i-login"><FiLock /></span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button type="button" className="eye-login" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="row-login">
              <button type="button" className="forgot-login-btn" onClick={() => setShowForgot(true)}>Forgot Password?</button>
            </div>

            <button
              className={`sign-login ${canSubmit ? '' : 'disabled'}`}
              onClick={handleLogin}
              disabled={!canSubmit}
            >
              {loading ? <span className="spinner-login" /> : 'Sign In'}
            </button>

            {popupMessage && (
              <div className={`popup-msg-login ${popupMessage.toLowerCase().includes('success') ? 'ok' : 'err'}`}>
                {popupMessage}
              </div>
            )}
          </form>

          <div className="social-message-login">
            <div className="line-login"></div>
            <p className="message-login">Or continue with</p>
            <div className="line-login"></div>
          </div>

          <div className="social-grid-login">
            <button className="btn-google-login"><FaGoogle /> Google</button>
            <button className="icon-login" aria-label="Twitter"><FaTwitter /></button>
            <button className="icon-login" aria-label="GitHub"><FaGithub /></button>
          </div>

          <p className="signup-login">Don’t have an account? <a href="#">Sign up</a></p>
        </div>
      </div>

      {showForgot && <ForgotPasswordPopup onClose={() => setShowForgot(false)} />}
    </>
  );
};

export default LoginPopup;
