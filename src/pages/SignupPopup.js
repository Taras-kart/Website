/* global google */
import React, { useState, useEffect, useRef } from 'react';
import { FaFacebookF, FaInstagram, FaGoogle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import './SignupPopup.css';

const SignupPopup = ({ onClose, onSuccess }) => {
  const popupRef = useRef();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const validateMobile = (number) => /^[6-9]\d{9}$/.test(number);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (!validateMobile(mobile)) {
      setError('Mobile number must be 10 digits and start with 6, 7, 8, or 9');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, mobile, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Signup successful');
        setTimeout(() => {
          onSuccess({ name: fullName, email });
        }, 1500);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch {
      setError('Something went wrong. Please try again');
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      setError('Google login not available');
      return;
    }
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: async (response) => {
        const decoded = jwtDecode(response.credential);
        const name = decoded.name;
        const email = decoded.email;
        try {
          const res = await fetch('http://localhost:5000/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
          });
          const data = await res.json();
          if (res.ok) {
            onSuccess({ name: data.name, email: data.email });
          } else {
            setError(data.message || 'Google login failed');
          }
        } catch {
          setError('Google login failed');
        }
      }
    });
    google.accounts.id.prompt();
  };

  return (
    <div className="signup-overlay-signup">
      <div className="form-container-signup" ref={popupRef}>
        <p className="title-signup">Sign Up</p>
        <form className="form-signup" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group-signup">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="input-group-signup">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group-signup">
            <label>Mobile Number</label>
            <input type="tel" maxLength="10" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <div className="input-group-signup">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="input-group-signup">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          {error && <p className="error-signup">{error}</p>}
          {success && <p className="success-signup">{success}</p>}
          <button className="submit-button-signup" onClick={handleSubmit}>Register</button>
        </form>

        <div className="social-message-signup">
          <div className="line-signup"></div>
          <p className="message-signup">Or sign up with</p>
          <div className="line-signup"></div>
        </div>

        <div className="social-icons-signup">
          <button className="icon-signup" aria-label="Google" onClick={handleGoogleLogin}>
            <FaGoogle />
          </button>
          <button className="icon-signup" aria-label="Facebook">
            <FaFacebookF />
          </button>
          <button className="icon-signup" aria-label="Instagram">
            <FaInstagram />
          </button>
        </div>

        <p className="bottom-link-signup">Already have an account? <span onClick={onClose}>Login</span></p>
      </div>
    </div>
  );
};

export default SignupPopup;
