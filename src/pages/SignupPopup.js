import React, { useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser, FiX } from 'react-icons/fi'
import { signup, storeUser } from '../services/accountApi'
import './AccountFlow.css'

export default function SignupPopup({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' })
  const [visible, setVisible] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const submit = async event => {
    event.preventDefault()
    if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !/^[6-9]\d{9}$/.test(form.mobile) || form.password.length < 6 || form.password !== form.confirm || !accepted) return setMessage('Complete all fields correctly and accept the terms')
    setBusy(true)
    try { const result=await signup({ name:form.name,email:form.email,mobile:form.mobile,password:form.password });const user=storeUser(result);onSuccess?.(user);onClose?.() } catch(reason){setMessage(reason.message||'Unable to create account')} finally{setBusy(false)}
  }
  return <div className="tara-auth-overlay"><div className="tara-auth-card tara-auth-signup"><button className="tara-auth-close" onClick={onClose}><FiX /></button><span className="tara-auth-kicker">Join Tara</span><h2>Create your account</h2><p>Save favourites, track orders and collect Tara Coins.</p><form onSubmit={submit}><AuthField icon={<FiUser />} label="Full name" value={form.name} onChange={value => set('name', value)} /><AuthField icon={<FiMail />} label="Email address" value={form.email} onChange={value => set('email', value)} type="email" /><AuthField icon={<FiPhone />} label="Mobile number" value={form.mobile} onChange={value => set('mobile', value.replace(/\D/g,'').slice(0,10))} /><AuthField icon={<FiLock />} label="Password" value={form.password} onChange={value => set('password', value)} type={visible?'text':'password'} action={<button type="button" onClick={()=>setVisible(value=>!value)}>{visible?<FiEyeOff/>:<FiEye/>}</button>} /><AuthField icon={<FiLock />} label="Confirm password" value={form.confirm} onChange={value => set('confirm', value)} type={visible?'text':'password'} /><label className="tara-auth-terms"><input type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)}/><span>I agree to the Terms and Privacy Policy</span></label>{message&&<div className="tara-auth-message">{message}</div>}<button className="tara-auth-submit" disabled={busy}>{busy?'Creating account':'Create account'}</button></form><p className="tara-auth-switch">Already registered? <button onClick={onClose}>Sign in</button></p></div></div>
}
function AuthField({icon,label,value,onChange,type='text',action}){return <label><span>{label}</span><div>{icon}<input type={type} value={value} onChange={event=>onChange(event.target.value)}/>{action}</div></label>}
