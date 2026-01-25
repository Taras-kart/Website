/* src/pages/SignupPopup.js */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiEye, FiEyeOff, FiX, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi'
import { FaGoogle } from 'react-icons/fa'
import './SignupPopup.css'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

/** Keep firebase config in env when possible, fallback only if not provided */
const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined' && process.env
      ? process.env
      : {}

const fallbackFirebase = {
  apiKey: 'AIzaSyCXytrftmbkF6IHsgpByDcpB4oUSwdJV0M',
  authDomain: 'taraskart-6e601.firebaseapp.com',
  projectId: 'taraskart-6e601',
  appId: '1:549582561307:web:40827cc8fc2b1696b718be'
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY || fallbackFirebase.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN || fallbackFirebase.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || fallbackFirebase.projectId,
  appId: env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID || fallbackFirebase.appId
}

function ensureFirebase() {
  if (!getApps().length) initializeApp(firebaseConfig)
  return getAuth()
}

function persistSession(userLike = {}) {
  const id =
    userLike.id ||
    userLike._id ||
    userLike.userId ||
    userLike.customerId ||
    userLike.uid ||
    userLike.customer?.id

  const email = userLike.email || userLike.userEmail || userLike.customer?.email || ''
  const name = userLike.name || userLike.userName || userLike.customer?.name || ''
  const type = userLike.type || userLike.userType || 'B2C'

  if (id) sessionStorage.setItem('userId', String(id))
  if (email) sessionStorage.setItem('userEmail', String(email))
  if (name) sessionStorage.setItem('userName', String(name))
  if (type) sessionStorage.setItem('userType', String(type))

  // store firebase id token if provided
  if (userLike.token) sessionStorage.setItem('tk_id_token', String(userLike.token))

  // mirror in localStorage too (helps when tabs refresh)
  if (id) localStorage.setItem('userId', String(id))
  if (email) localStorage.setItem('userEmail', String(email))
  if (name) localStorage.setItem('userName', String(name))
  if (type) localStorage.setItem('userType', String(type))
  if (userLike.token) localStorage.setItem('tk_id_token', String(userLike.token))

  return { id, email, name, userType: type }
}

const SignupPopup = ({ onClose, onSuccess }) => {
  const popupRef = useRef(null)
  const firstInputRef = useRef(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const validateEmail = useCallback((v) => /^\S+@\S+\.\S+$/.test(v), [])
  const validateMobile = useCallback((number) => /^[6-9]\d{9}$/.test(number), [])

  const pwdScore = useCallback((v) => {
    let s = 0
    if (v.length >= 8) s++
    if (/[A-Z]/.test(v)) s++
    if (/[a-z]/.test(v)) s++
    if (/\d/.test(v)) s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    return Math.min(s, 4)
  }, [])

  const strength = useMemo(() => pwdScore(password), [password, pwdScore])
  const strengthLabel = useMemo(() => ['Too weak', 'Weak', 'Fair', 'Strong', 'Strong'][strength], [strength])
  const strengthWidth = useMemo(() => ['10%', '30%', '55%', '80%', '100%'][strength], [strength])
  const strengthColor = useMemo(() => ['#cc3333', '#e67e22', '#ffd700', '#ffd700', '#ffd700'][strength], [strength])

  const canSubmit =
    fullName.trim().length > 1 &&
    validateEmail(email) &&
    validateMobile(mobile) &&
    strength >= 3 &&
    confirmPassword === password &&
    acceptTerms &&
    !submitting

  const completeLoginFromUser = useCallback(
    async (user) => {
      const gName = user.displayName || 'User'
      const gEmail = user.email || ''
      if (!gEmail) throw new Error('No email returned by Google')

      let existing = null
      try {
        const res = await fetch(`${API_BASE}/api/auth/${encodeURIComponent(gEmail)}`)
        if (res.ok) existing = await res.json()
      } catch {
        // ignore
      }

      let created = null
      if (!existing) {
        // NOTE: Using a dummy mobile/password is not ideal, but keeping your backend contract.
        // If possible, add a dedicated endpoint like /api/auth/firebase-login (like your LoginPopup uses).
        const createRes = await fetch(`${API_BASE}/api/b2c-customers/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: gName,
            email: gEmail,
            mobile: '0000000000',
            password: 'google-oauth'
          })
        })
        created = await createRes.json()
        if (!createRes.ok) throw new Error(created?.message || 'Could not complete Google signup')
      }

      let token = ''
      try {
        token = (await user.getIdToken?.()) || ''
      } catch {
        // ignore
      }

      const baseUser = existing || created || {}
      const persisted = persistSession({
        ...baseUser,
        id: baseUser.id || baseUser._id || baseUser.userId || baseUser.customerId || user.uid,
        name: baseUser.name || gName,
        email: baseUser.email || gEmail,
        token
      })

      if (typeof onSuccess === 'function') onSuccess(persisted)
    },
    [onSuccess]
  )

  const handleSubmit = useCallback(async () => {
    setError('')
    setSuccess('')
    if (!canSubmit) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE}/api/b2c-customers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        const persisted = persistSession({
          ...(data || {}),
          name: fullName.trim(),
          email: email.trim(),
          type: (data?.type || data?.userType || 'B2C') // keep consistent
        })
        setSuccess('Signup successful')
        setTimeout(() => {
          if (typeof onSuccess === 'function') onSuccess(persisted)
        }, 900)
      } else {
        setError(data?.message || 'Signup failed')
      }
    } catch {
      setError('Something went wrong. Please try again')
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, email, fullName, mobile, onSuccess, password])

  const openLogin = useCallback(() => {
    if (typeof onClose === 'function') onClose('login')
    try {
      window.dispatchEvent(new CustomEvent('open-login'))
    } catch {
      // ignore
    }
  }, [onClose])

  const handleGoogleLogin = useCallback(async () => {
    setError('')
    try {
      const auth = ensureFirebase()
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      let result
      try {
        result = await signInWithPopup(auth, provider)
      } catch (popupErr) {
        // fallback to redirect if popup is blocked
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider)
          return
        }
        throw popupErr
      }

      await completeLoginFromUser(result.user)
    } catch (e) {
      setError(e?.message || 'Google login failed')
    }
  }, [completeLoginFromUser])

  const handleOverlayMouseDown = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        if (typeof onClose === 'function') onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // Fix for your build error:
  // "React Hook useEffect has a missing dependency: 'completeLoginFromUser'"
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const auth = ensureFirebase()
        const r = await getRedirectResult(auth)
        if (r?.user) {
          await completeLoginFromUser(r.user)
        }
      } catch (e) {
        setError(e?.message || 'Google login failed')
      }
    }
    checkRedirect()
  }, [completeLoginFromUser])

  return (
    <div className="signup-overlay" onMouseDown={handleOverlayMouseDown}>
      <div className="signup-card" ref={popupRef} role="dialog" aria-modal="true">
        <button className="close-btn" onClick={() => (typeof onClose === 'function' ? onClose() : null)} aria-label="Close">
          <FiX />
        </button>

        <div className="signup-head">
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-sub">Join Tars Kart to track orders, save items and get faster checkout</p>
        </div>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-row">
            <div className="input-wrap">
              <span className="i-icon">
                <FiUser />
              </span>
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
              <span className="i-icon">
                <FiMail />
              </span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${mobile && !validateMobile(mobile) ? 'has-error' : ''}`}>
              <span className="i-icon">
                <FiPhone />
              </span>
              <input
                type="tel"
                placeholder="Mobile Number"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="input-row">
            <div className={`input-wrap ${password && strength < 3 ? 'warn' : ''}`}>
              <span className="i-icon">
                <FiLock />
              </span>
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
              <span className="i-icon">
                <FiLock />
              </span>
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

          <button className={`submit ${canSubmit ? '' : 'disabled'}`} onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="or-row">
          <span className="line" />
          <span className="or">Or</span>
          <span className="line" />
        </div>

        <div className="social-row">
          <button className="soc-btn google" onClick={handleGoogleLogin}>
            <FaGoogle /> Continue with Google
          </button>
        </div>

        <div className="switch-row">
          Already have an account?{' '}
          <span className="switch" role="button" tabIndex={0} onClick={openLogin} onKeyDown={(e) => e.key === 'Enter' && openLogin()}>
            Login
          </span>
        </div>
      </div>
    </div>
  )
}

export default SignupPopup
