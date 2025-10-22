import React, { useState, useRef, useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPopup.css';
import ForgotPasswordPopup from './ForgotPasswordPopup';
import SignupPopup from './SignupPopup';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env)
    ? process.env
    : {};

const fallbackFirebase = {
  apiKey: 'AIzaSyCXytrftmbkF6IHsgpByDcpB4oUSwdJV0M',
  authDomain: 'taraskart-6e601.firebaseapp.com',
  projectId: 'taraskart-6e601',
  storageBucket: 'taraskart-6e601.appspot.com',
  messagingSenderId: '549582561307',
  appId: '1:549582561307:web:40827cc8fc2b1696b718be'
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY || fallbackFirebase.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN || fallbackFirebase.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || fallbackFirebase.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET || fallbackFirebase.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebase.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID || fallbackFirebase.appId
};

if (!getApps().length) initializeApp(firebaseConfig);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

const LoginPopup = ({ onClose, onSuccess }) => {
  const popupRef = useRef(null);
  const emailRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const canSubmit = validEmail(email) && password && !loading;

  const setMsg = (m) => {
    setPopupMessage(m);
    setTimeout(() => setPopupMessage(''), 2200);
  };

  const toUserShape = (u) => ({
    id: u.uid,
    name: u.displayName || u.email?.split('@')[0] || 'User',
    email: u.email || '',
    profilePic: u.photoURL || '/images/profile-pic.png',
    userType: 'B2C'
  });

  const handleLogin = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const u = cred.user;
      const token = await u.getIdToken();
      sessionStorage.setItem('tk_id_token', token);
      sessionStorage.setItem('userId', u.uid);
      sessionStorage.setItem('userEmail', u.email || '');
      sessionStorage.setItem('userName', u.displayName || u.email?.split('@')[0] || 'User');
      sessionStorage.setItem('userType', 'B2C');
      setPopupMessage('Successfully Logged In!');
      setTimeout(() => {
        onSuccess(toUserShape(u));
        setPopupMessage('');
      }, 900);
    } catch (e) {
      const code = String(e.code || '');
      if (code.includes('invalid-credential')) setMsg('Invalid email or password');
      else if (code.includes('too-many-requests')) setMsg('Too many attempts, try later');
      else if (code.includes('user-disabled')) setMsg('Account disabled');
      else if (code.includes('network-request-failed')) setMsg('Network error');
      else if (code.includes('invalid-api-key')) setMsg('Invalid Firebase API key');
      else setMsg('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      const token = await u.getIdToken();
      sessionStorage.setItem('tk_id_token', token);
      sessionStorage.setItem('userId', u.uid);
      sessionStorage.setItem('userEmail', u.email || '');
      sessionStorage.setItem('userName', u.displayName || u.email?.split('@')[0] || 'User');
      sessionStorage.setItem('userType', 'B2C');
      setPopupMessage('Successfully Logged In!');
      setTimeout(() => {
        onSuccess(toUserShape(u));
        setPopupMessage('');
      }, 900);
    } catch (e) {
      const code = String(e.code || '');
      if (code.includes('popup-closed-by-user')) setMsg('Popup closed');
      else if (code.includes('unauthorized-domain')) setMsg('Domain not authorized in Firebase');
      else if (code.includes('invalid-api-key')) setMsg('Invalid Firebase API key');
      else setMsg('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showForgot || showSignup) return;
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (showForgot || showSignup) return;
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
  }, [showForgot, showSignup, onClose]);

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
                autoComplete="email"
              />
            </div>
            <div className="input-wrap-login">
              <span className="i-login"><FiLock /></span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
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
            <button className="btn-google-login" onClick={loginWithGoogle}><FaGoogle /> Google</button>
          </div>
          <p className="signup-login">
            Don’t have an account?{' '}
            <button className="signup-link-login" onClick={() => setShowSignup(true)}>Sign up</button>
          </p>
        </div>
      </div>
      {showForgot && <ForgotPasswordPopup onClose={() => setShowForgot(false)} />}
      {showSignup && <SignupPopup onClose={() => setShowSignup(false)} />}
    </>
  );
};

export default LoginPopup;
