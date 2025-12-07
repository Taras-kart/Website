import React, { useState, useRef, useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPopup.css';
import ForgotPasswordPopup from './ForgotPasswordPopup';
import SignupPopup from './SignupPopup';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

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

  const toUserShape = (src) => ({
    id: src.id || src.uid,
    name: src.name || src.displayName || src.email?.split('@')[0] || 'User',
    email: src.email || '',
    profilePic: src.profilePic || src.photoURL || '/images/profile-pic.png',
    userType: src.userType || src.type || 'B2C'
  });

  const syncUserWithBackend = async (u) => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: u.uid,
          email: u.email,
          name: u.displayName || u.email?.split('@')[0] || 'User'
        })
      });
      if (!resp.ok) throw new Error('sync failed');
      const data = await resp.json();
      const user = data.user || data;

      if (data.token) {
        localStorage.setItem('userToken', data.token);
        sessionStorage.setItem('userToken', data.token);
      }

      localStorage.setItem('userId', String(user.id));
      localStorage.setItem('userEmail', user.email || u.email || '');
      localStorage.setItem('userName', user.name || u.displayName || u.email?.split('@')[0] || 'User');
      localStorage.setItem('userType', user.type || 'B2C');
      localStorage.setItem('firebaseUid', u.uid);

      sessionStorage.setItem('userId', String(user.id));
      sessionStorage.setItem('userEmail', user.email || u.email || '');
      sessionStorage.setItem('userName', user.name || u.displayName || u.email?.split('@')[0] || 'User');
      sessionStorage.setItem('userType', user.type || 'B2C');
      sessionStorage.setItem('firebaseUid', u.uid);

      return user;
    } catch (e) {
      localStorage.setItem('firebaseUid', u.uid);
      sessionStorage.setItem('firebaseUid', u.uid);
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', u.uid);
      }
      if (!sessionStorage.getItem('userId')) {
        sessionStorage.setItem('userId', u.uid);
      }
      return null;
    }
  };

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const u = cred.user;
      const token = await u.getIdToken();
      localStorage.setItem('tk_id_token', token);
      sessionStorage.setItem('tk_id_token', token);
      const backendUser = await syncUserWithBackend(u);
      setPopupMessage('Successfully Logged In!');
      setTimeout(() => {
        onSuccess(toUserShape(backendUser || u));
        setPopupMessage('');
      }, 900);
    } catch (e) {
      const code = String(e.code || e.message || '').toLowerCase();
      const shouldFallback =
        code.includes('invalid-credential') ||
        code.includes('user-not-found') ||
        code.includes('operation-not-allowed') ||
        code.includes('password_login_disabled');
      if (shouldFallback) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (response.ok) {
            const user = data.user || data;

            if (data.token) {
              localStorage.setItem('userToken', data.token);
              sessionStorage.setItem('userToken', data.token);
            }

            localStorage.setItem('userId', String(user.id));
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userType', user.type);

            sessionStorage.setItem('userId', String(user.id));
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userName', user.name);
            sessionStorage.setItem('userType', user.type);

            setPopupMessage('Successfully Logged In!');
            setTimeout(() => {
              onSuccess({
                id: user.id,
                name: user.name,
                email: user.email,
                profilePic: '/images/profile-pic.png',
                userType: user.type
              });
              setPopupMessage('');
            }, 1200);
          } else {
            setMsg(data.message || 'Invalid email or password');
          }
        } catch {
          setMsg('Server error');
        }
      } else if (code.includes('too-many-requests')) setMsg('Too many attempts, try later');
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
      localStorage.setItem('tk_id_token', token);
      sessionStorage.setItem('tk_id_token', token);
      const backendUser = await syncUserWithBackend(u);
      setPopupMessage('Successfully Logged In!');
      setTimeout(() => {
        onSuccess(toUserShape(backendUser || u));
        setPopupMessage('');
      }, 900);
    } catch (e) {
      const code = String(e.code || '').toLowerCase();
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
            Don’t have an account{' '}
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
