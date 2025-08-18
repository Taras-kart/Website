/* global google */
import React, { useState, useEffect, useRef } from 'react';
import { FaFacebookF, FaInstagram, FaGoogle } from 'react-icons/fa';
import { FiEye, FiEyeOff, FiX, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import './SignupPopup.css';

const SignupPopup = ({ onClose, onSuccess }) => {
  const popupRef = useRef();
  const firstInputRef = useRef();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const validateMobile = (number) => /^[6-9]\d{9}$/.test(number);
  const pwdScore = (v) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4);
  };

  const canSubmit =
    fullName.trim().length > 1 &&
    validateEmail(email) &&
    validateMobile(mobile) &&
    pwdScore(password) >= 3 &&
    confirmPassword === password &&
    acceptTerms &&
    !submitting;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:5000/api/b2c-customers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName.trim(), email: email.trim(), mobile: mobile.trim(), password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Signup successful');
        setTimeout(() => onSuccess({ name: fullName.trim(), email: email.trim() }), 1200);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch {
      setError('Something went wrong. Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      setError('Google login not available');
      return;
    }
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: async (resp) => {
        try {
          const decoded = jwtDecode(resp.credential || '');
          const gName = decoded?.name || '';
          const gEmail = decoded?.email || '';
          const response = await fetch('http://localhost:5000/api/b2c-customers/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: gName, email: gEmail, oauthProvider: 'google' })
          });
          const data = await response.json();
          if (response.ok) {
            onSuccess({ name: data?.name || gName, email: data?.email || gEmail });
          } else {
            setError(data?.message || 'Google login failed');
          }
        } catch {
          setError('Google login failed');
        }
      }
    });
    google.accounts.id.prompt();
  };

  const strength = pwdScore(password);
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Strong', 'Strong'][strength];
  const strengthWidth = ['10%', '30%', '55%', '80%', '100%'][strength];
  const strengthColor = ['#cc3333', '#e67e22', '#ffd277', '#ffd277', '#ffd277'][strength];

  return (
    <div className="signup-overlay">
      <div className="signup-card" ref={popupRef} role="dialog" aria-modal="true">
        <button className="close-btn" onClick={onClose} aria-label="Close"><FiX /></button>

        <div className="signup-head">
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-sub">Join Tars Kart to track orders, save items and get faster checkout</p>
        </div>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-row">
            <div className="input-wrap">
              <span className="i-icon"><FiUser /></span>
              <input
                ref={firstInputRef}
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${email && !validateEmail(email) ? 'has-error' : ''}`}>
              <span className="i-icon"><FiMail /></span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${mobile && !validateMobile(mobile) ? 'has-error' : ''}`}>
              <span className="i-icon"><FiPhone /></span>
              <input
                type="tel"
                placeholder="Mobile Number"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${password && strength < 3 ? 'warn' : ''}`}>
              <span className="i-icon"><FiLock /></span>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="strength">
              <div className="bar" style={{ width: strengthWidth, background: strengthColor }} />
              <span className="s-label">{password ? strengthLabel : ''}</span>
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${confirmPassword && confirmPassword !== password ? 'has-error' : ''}`}>
              <span className="i-icon"><FiLock /></span>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="eye" onClick={() => setShowConfirmPwd((v) => !v)}>
                {showConfirmPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <label className="terms">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>I agree to the Terms & Conditions and Privacy Policy</span>
          </label>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button
            className={`submit ${canSubmit ? '' : 'disabled'}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="or-row">
          <span className="line" />
          <span className="or">Or</span>
          <span className="line" />
        </div>

        <div className="social-row">
          <button className="soc-btn google" onClick={handleGoogleLogin}><FaGoogle /> Continue with Google</button>
          <button className="soc-icon" aria-label="Facebook"><FaFacebookF /></button>
          <button className="soc-icon" aria-label="Instagram"><FaInstagram /></button>
        </div>

        <div className="switch-row">
          Already have an account? <span className="switch" onClick={onClose}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup;
