import React, { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiChevronLeft, FiCreditCard, FiMapPin, FiPackage, FiShield } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { currentUserEmail, fetchCoinWallet, money, placeWebOrder, validateCoins } from '../services/checkoutApi'
import './OrderCheckout.css'

const emptyAddress = { name: '', email: '', mobile: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '' }

export default function OrderCheckout() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyAddress)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [placing, setPlacing] = useState(false)
  const [notice, setNotice] = useState('')
  const [successId, setSuccessId] = useState('')
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinInput, setCoinInput] = useState('')
  const [coinsApplied, setCoinsApplied] = useState(0)
  const email = currentUserEmail()
  const payload = useMemo(readCheckout, [])
  const basePayable = Number(payload?.totals?.payable || 0)
  const payable = Math.max(0, basePayable - coinsApplied)
  const count = (payload.items || []).reduce((sum, item) => sum + Number(item.qty || 1), 0)

  useEffect(() => {
    try { setForm({ ...emptyAddress, ...JSON.parse(localStorage.getItem('tk_checkout_address') || '{}'), email: JSON.parse(localStorage.getItem('tk_checkout_address') || '{}').email || email }) } catch { setForm(value => ({ ...value, email })) }
    if (email) fetchCoinWallet(email).then(data => setCoinBalance(Number(data.balance || 0))).catch(() => {})
  }, [email])

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const valid = Boolean(form.name && /^\d{10}$/.test(form.mobile) && form.address_line1 && form.city && form.state && /^\d{6}$/.test(form.pincode) && payload.items?.length)

  const applyCoins = async () => {
    const requested = Number(coinInput)
    if (!requested) return setNotice('Enter the number of coins you want to use')
    try {
      const result = await validateCoins(email, requested, basePayable)
      if (!result.ok) throw new Error(result.message || 'Coins could not be applied')
      setCoinsApplied(Number(result.coinsApplied || 0))
      setNotice(`${result.coinsApplied} coins applied`)
    } catch (reason) { setNotice(reason.message || 'Coins could not be applied') }
  }

  const place = async () => {
    if (!valid) return setNotice('Complete all required delivery details')
    setPlacing(true)
    try {
      const body = {
        customer_email: form.email || null,
        customer_name: form.name,
        customer_mobile: form.mobile,
        shipping_address: { line1: form.address_line1, line2: form.address_line2, city: form.city.trim(), state: form.state.trim(), pincode: form.pincode },
        totals: { ...payload.totals, payable },
        items: payload.items.map(item => ({ variant_id: Number(item.variant_id), product_id: item.product_id == null ? null : Number(item.product_id), qty: Number(item.qty || 1), price: Number(item.price || item.mrp || 0), mrp: Number(item.mrp || item.price || 0), size: item.size || null, colour: item.colour || null, image_url: item.image_url || null })),
        payment_status: paymentMethod === 'COD' ? 'COD' : 'PENDING',
        login_email: email || null,
        payment_method: paymentMethod,
        coins_applied: coinsApplied,
        user_email_for_coins: email || null
      }
      const result = await placeWebOrder(body)
      const saleId = result.id
      if (!saleId) throw new Error('Order reference was not returned')
      localStorage.setItem('tk_checkout_address', JSON.stringify(form))
      if (paymentMethod === 'ONLINE') return navigate('/payment', { state: { saleId } })
      sessionStorage.removeItem('tk_checkout_payload')
      setSuccessId(saleId)
    } catch (reason) { setNotice(reason.message || 'Unable to place your order') } finally { setPlacing(false) }
  }

  if (!payload.items?.length) return <main className="tara-checkout-page"><div className="tara-checkout-empty"><FiPackage /><h1>Your checkout has expired</h1><p>Return to your bag and start checkout again.</p><button onClick={() => navigate('/cart')}>Return to bag</button></div></main>
  if (successId) return <main className="tara-checkout-page"><div className="tara-order-success"><FiCheck /><span>Order confirmed</span><h1>Thank you for shopping with Tara</h1><p>Your order reference is #{successId}. We will send delivery updates to your registered contact details.</p><div><button onClick={() => navigate('/')}>Continue shopping</button><button onClick={() => navigate('/profile', { state: { openSection: 'Orders' } })}>View orders</button></div></div></main>

  return <main className="tara-checkout-page">{notice && <div className="tara-checkout-toast">{notice}</div>}<header className="tara-checkout-header"><button onClick={() => navigate('/cart')}><FiChevronLeft />Bag</button><div><span>Secure checkout</span><h1>Delivery and payment</h1></div><FiShield /></header><div className="tara-checkout-layout"><section className="tara-checkout-content"><div className="tara-checkout-card"><h2><FiMapPin />Delivery details</h2><div className="tara-form-grid"><Field label="Full name" value={form.name} onChange={value => setField('name', value)} required /><Field label="Email" value={form.email} onChange={value => setField('email', value)} type="email" /><Field label="Mobile number" value={form.mobile} onChange={value => setField('mobile', value.replace(/\D/g, '').slice(0, 10))} required /><Field label="Address line 1" value={form.address_line1} onChange={value => setField('address_line1', value)} required wide /><Field label="Address line 2" value={form.address_line2} onChange={value => setField('address_line2', value)} wide /><Field label="City" value={form.city} onChange={value => setField('city', value)} required /><Field label="State" value={form.state} onChange={value => setField('state', value)} required /><Field label="Pincode" value={form.pincode} onChange={value => setField('pincode', value.replace(/\D/g, '').slice(0, 6))} required /></div><button className="tara-save-address" onClick={() => { localStorage.setItem('tk_checkout_address', JSON.stringify(form)); setNotice('Address saved') }}>Save this address</button></div><div className="tara-checkout-card"><h2><FiCreditCard />Payment method</h2><div className="tara-payment-options"><button className={paymentMethod === 'COD' ? 'is-active' : ''} onClick={() => setPaymentMethod('COD')}><i /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></button><button className={paymentMethod === 'ONLINE' ? 'is-active' : ''} onClick={() => setPaymentMethod('ONLINE')}><i /><span><strong>UPI, card or netbanking</strong><small>Secure payment through Razorpay</small></span></button></div></div></section><aside className="tara-checkout-summary"><span>{count} items</span><h2>Order summary</h2>{(payload.items || []).slice(0, 3).map((item, index) => <div className="tara-summary-item" key={`${item.variant_id}-${index}`}><img src={item.image_url || '/images/women/women20.jpeg'} alt=""/><p><strong>{item.size || 'Selected style'}</strong><small>{item.colour || ''} · Qty {item.qty || 1}</small></p><b>{money(Number(item.price || 0) * Number(item.qty || 1))}</b></div>)}<div className="tara-summary-lines"><p><span>Bag total</span><strong>{money(payload.totals?.bagTotal)}</strong></p><p className="is-saving"><span>Discount</span><strong>-{money(payload.totals?.discountTotal)}</strong></p>{payload.totals?.giftWrap > 0 && <p><span>Gift wrapping</span><strong>{money(payload.totals.giftWrap)}</strong></p>}{coinsApplied > 0 && <p className="is-saving"><span>Coins</span><strong>-{money(coinsApplied)}</strong></p>}<p className="tara-summary-total"><span>Total</span><strong>{money(payable)}</strong></p></div>{coinBalance > 0 && <div className="tara-coins"><span>Coin wallet</span><p>{coinBalance} coins available, use up to {Math.min(coinBalance, Math.floor(basePayable * .1))}</p><div><input type="number" value={coinInput} onChange={event => { setCoinInput(event.target.value); setCoinsApplied(0) }} placeholder="Coins" /><button onClick={applyCoins}>Apply</button></div></div>}<button className="tara-place-order" disabled={!valid || placing} onClick={place}>{placing ? 'Processing' : paymentMethod === 'COD' ? `Place order · ${money(payable)}` : `Continue to pay · ${money(payable)}`}</button><small className="tara-secure-note"><FiShield />Your personal and payment details are protected</small></aside></div></main>
}

function Field({ label, value, onChange, type = 'text', required = false, wide = false }) { return <label className={wide ? 'is-wide' : ''}><span>{label}{required ? ' *' : ''}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /></label> }
function readCheckout() { try { const data=JSON.parse(sessionStorage.getItem('tk_checkout_payload')||'{}');return { ...data, items:Array.isArray(data.items)?data.items:[], totals:data.totals||{} } } catch { return { items:[], totals:{} } } }
