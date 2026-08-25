import React, { useEffect, useState } from 'react'
import { FiCheck, FiCreditCard, FiLock, FiRefreshCw, FiSmartphone } from 'react-icons/fi'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../services/api'
import './PaymentPage.css'

async function post(paths, payload) {
  let failure
  for (const path of paths) {
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => ({}))
      if (response.ok) return data
      failure = new Error(data.message || `Request failed (${response.status})`)
    } catch (reason) { failure = reason }
  }
  throw failure || new Error('Payment request failed')
}

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const saleId = location.state?.saleId || params.get('sale_id')
  const [method, setMethod] = useState('ONLINE_UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => { if (!saleId) setError('The order reference is missing. Return to checkout and try again.') }, [saleId])

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('The secure payment window could not be loaded'))
    document.body.appendChild(script)
  })

  const pay = async () => {
    setError('')
    setLoading(true)
    try {
      const info = await post([`${API_BASE}/api/razorpay/payments/create-order`], { sale_id: saleId })
      setOrderId(info.order_id || '')
      await loadRazorpay()
      const allowed = method === 'ONLINE_UPI' ? { upi: 1, card: 0, netbanking: 0, wallet: 0 } : method === 'ONLINE_CARD' ? { upi: 0, card: 1, netbanking: 0, wallet: 0 } : { upi: 0, card: 0, netbanking: 1, wallet: 0 }
      const instance = new window.Razorpay({
        key: info.key_id,
        amount: info.amount,
        currency: info.currency,
        order_id: info.order_id,
        name: "Tara's Kart",
        description: 'Order payment',
        prefill: { name: sessionStorage.getItem('userName') || '', email: sessionStorage.getItem('userEmail') || '', contact: '' },
        theme: { color: '#56362d' },
        method: allowed,
        handler: async response => {
          try {
            const result = await post([`${API_BASE}/api/razorpay/payments/verify`], { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature })
            if (!result.ok) throw new Error('Payment verification failed')
            await post([`${API_BASE}/api/sales/web/set-payment-status`, `${API_BASE}/sales/web/set-payment-status`], { sale_id: saleId, status: 'PAID' }).catch(() => {})
            sessionStorage.removeItem('tk_checkout_payload')
            setSuccess(true)
          } catch (reason) { setError(reason.message || 'Payment verification failed') }
          setLoading(false)
        },
        modal: { ondismiss: () => { setLoading(false); setError('Payment was cancelled before completion') } }
      })
      instance.open()
    } catch (reason) { setError(reason.message || 'Unable to start payment'); setLoading(false) }
  }

  if (success) return <main className="tara-payment-page"><div className="tara-payment-success"><FiCheck /><span>Payment successful</span><h1>Your order is confirmed</h1><p>Thank you for shopping with Tara. Your payment reference is {orderId || saleId}.</p><div><button onClick={() => navigate('/')}>Continue shopping</button><button onClick={() => navigate('/profile', { state: { openSection: 'Orders' } })}>View orders</button></div></div></main>

  return <main className="tara-payment-page"><header><FiLock /><span>Secure payment</span><h1>Choose how you want to pay</h1><p>Your transaction is completed inside Razorpay’s protected payment window.</p></header><section className="tara-payment-shell"><div className="tara-payment-methods"><Method icon={<FiSmartphone />} title="UPI" text="Google Pay, PhonePe, Paytm and other UPI apps" active={method === 'ONLINE_UPI'} onClick={() => setMethod('ONLINE_UPI')} /><Method icon={<FiCreditCard />} title="Credit or debit card" text="Visa, Mastercard, RuPay and supported cards" active={method === 'ONLINE_CARD'} onClick={() => setMethod('ONLINE_CARD')} /><Method icon={<FiRefreshCw />} title="Netbanking" text="Pay directly through your supported bank" active={method === 'ONLINE_NETBANKING'} onClick={() => setMethod('ONLINE_NETBANKING')} /></div><aside><span>Order reference</span><strong>#{String(saleId || '').slice(0, 12)}</strong><p><FiLock />Razorpay secured checkout</p>{error && <div className="tara-payment-error">{error}</div>}<button disabled={!saleId || loading} onClick={pay}>{loading ? 'Opening secure payment' : 'Proceed securely'}</button><button className="tara-payment-back" onClick={() => navigate('/checkout')}>Return to checkout</button><small>We never store your card, UPI PIN or bank credentials.</small></aside></section></main>
}

function Method({ icon, title, text, active, onClick }) { return <button className={active ? 'is-active' : ''} onClick={onClick}><i>{icon}</i><span><strong>{title}</strong><small>{text}</small></span><em /></button> }
