import React, { useEffect, useState } from 'react'
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrders, fetchReturnsBySale, sessionUser, statusLabel } from '../services/accountApi'
import './AccountPages.css'

export default function ReturnsPage({ embedded = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const user = sessionUser()
  const userEmail = user.email || ''
  const userMobile = user.mobile || ''
  useEffect(() => {
    if (!userEmail && !userMobile) { setLoading(false); return }
    fetchOrders({ email: userEmail, mobile: userMobile }).then(async data => {
      const list = Array.isArray(data) ? data : data.items || []
      setOrders(list)
      const result = await Promise.all(list.map(order => fetchReturnsBySale(order.id).catch(() => ({ rows: [] }))))
      setRequests(result.flatMap((item, index) => (item.rows || item || []).map(row => ({ ...row, sale_id: row.sale_id || list[index].id }))))
    }).finally(() => setLoading(false))
  }, [userEmail, userMobile])
  const eligible = orders.filter(order => statusLabel(order.status) === 'Delivered')
  const body = <div className="tara-returns-panel"><div className="tara-section-head"><div><span>Returns and refunds</span><h2>Manage returns</h2></div></div>{loading ? <div className="tara-orders-loading"><i /><i /></div> : <>{params.get('saleId') && <div className="tara-return-banner">A prepaid cancellation may require refund processing. Continue with order #{params.get('saleId')}. <button onClick={() => navigate(`/returns/${params.get('saleId')}/refund`)}>Continue</button></div>}<h3 className="tara-return-heading">Eligible orders</h3>{!eligible.length ? <p className="tara-muted">Delivered orders that are within the return window will appear here.</p> : eligible.map(order => <button className="tara-return-row" key={order.id} onClick={() => navigate(`/returns/${order.id}/refund`)}><FiRefreshCw /><span><strong>Order #{order.id}</strong><small>Delivered and available for review</small></span><FiArrowRight /></button>)}<h3 className="tara-return-heading">Your requests</h3>{!requests.length ? <p className="tara-muted">You have not submitted any return requests.</p> : requests.map((request, index) => <div className="tara-return-row" key={request.id || index}><FiRefreshCw /><span><strong>Order #{request.sale_id}</strong><small>{request.status || 'Request submitted'} · {request.reason || 'Return request'}</small></span></div>)}</>}</div>
  return embedded ? body : <main className="tara-account-page tara-standalone-section">{body}</main>
}
