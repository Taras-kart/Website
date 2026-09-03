import React, { useEffect, useRef, useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { login, storeUser } from '../services/accountApi'
import ForgotPasswordPopup from './ForgotPasswordPopup'
import SignupPopup from './SignupPopup'
import './AccountFlow.css'

export default function LoginPopup({ onClose, onSuccess }) {
  const navigate = useNavigate()
  const card = useRef(null)
  const [type, setType] = useState('B2C')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const close = event => { if (event.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', close)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', close) }
  }, [onClose])

  const submit = async event => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) return setMessage('Enter a valid email and password')
    setBusy(true)
    setMessage('')
    try {
      const result = await login({ email: email.trim(), password })
      const user = result.user || result
      const actualType = String(user.type || user.userType || 'B2C').toUpperCase()
      if (actualType !== type) throw new Error(`This account is registered as ${actualType}`)
      storeUser(result)
      onSuccess?.({ ...user, userType: actualType })
      onClose?.()
      if (actualType === 'B2B') navigate('/b2b-dashboard')
    } catch (reason) { setMessage(reason.message || 'Unable to sign in') } finally { setBusy(false) }
  }

  if (mode === 'forgot') return <ForgotPasswordPopup onClose={() => setMode('login')} />
  if (mode === 'signup') return <SignupPopup onClose={() => setMode('login')} onSuccess={data => { onSuccess?.(data); onClose?.() }} />
  return <div className="tara-auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.() }}><div className="tara-auth-card" ref={card}><button className="tara-auth-close" onClick={onClose}><FiX /></button><span className="tara-auth-kicker">Welcome to Attach</span><h2>Sign in to your account</h2><p>Access orders, saved styles, rewards and faster checkout.</p><div className="tara-auth-type"><button className={type === 'B2C' ? 'is-active' : ''} onClick={() => setType('B2C')}>Customer</button><button className={type === 'B2B' ? 'is-active' : ''} onClick={() => setType('B2B')}>Wholesale</button></div><form onSubmit={submit}><label><span>Email address</span><div><FiMail /><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoFocus /></div></label><label><span>Password</span><div><FiLock /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></label>{type === 'B2C' && <button type="button" className="tara-auth-link" onClick={() => setMode('forgot')}>Forgot password?</button>}{message && <div className="tara-auth-message">{message}</div>}<button className="tara-auth-submit" disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</button></form>{type === 'B2C' && <p className="tara-auth-switch">New to Attach? <button onClick={() => setMode('signup')}>Create an account</button></p>}</div></div>
}
