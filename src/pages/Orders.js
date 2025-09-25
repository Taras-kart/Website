import React, { useEffect, useMemo, useState } from 'react';
import './Orders.css';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const STATUS_ORDER = ['Order Placed', 'Confirmed', 'Shipped', 'Out For Delivery', 'Delivered', 'RTO', 'Cancelled'];

function normalizeStatus(s) {
  if (!s) return 'Order Placed';
  const t = String(s).toLowerCase();
  if (t.includes('deliver')) return 'Delivered';
  if (t.includes('out for')) return 'Out For Delivery';
  if (t.includes('ship')) return 'Shipped';
  if (t.includes('confirm')) return 'Confirmed';
  if (t.includes('rto')) return 'RTO';
  if (t.includes('cancel')) return 'Cancelled';
  return 'Order Placed';
}

function byStatusRank(a, b) {
  return STATUS_ORDER.indexOf(normalizeStatus(a.status)) - STATUS_ORDER.indexOf(normalizeStatus(b.status));
}

const Orders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [tracking, setTracking] = useState({});
  const [trackLoading, setTrackLoading] = useState({});
  const [error, setError] = useState('');

  const handleStartShopping = () => navigate('/');
  const handleViewProduct = (order) => navigate('/checkout', { state: { product: order } });

  const formatPrice = (v) =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
      : v;

  useEffect(() => {
  const q = new URLSearchParams();
  if (user?.email) q.set('email', user.email);
  if (user?.phone) q.set('phone', user.phone);

  setLoading(true);
  setError('');

  fetch(`${process.env.REACT_APP_API_BASE}/api/orders?${q.toString()}`)
    .then((r) => r.json())
    .then((d) => setOrders(Array.isArray(d.items) ? d.items.sort(byStatusRank) : []))
    .catch(() => {
      setOrders([]);
      setError('Could not load your orders right now.');
    })
    .finally(() => setLoading(false));
}, [user?.email, user?.phone]);

  const filtered = useMemo(() => {
    if (filter === 'All') return orders;
    return orders.filter((o) => normalizeStatus(o.status) === filter);
  }, [orders, filter]);

  const timelineFromTracking = (t) => {
    const data = t?.tracking_data || t?.data || t;
    const checkpoints =
      data?.shipment_track ||
      data?.checkpoints ||
      data?.track_activities ||
      [];
    const items = Array.isArray(checkpoints) ? checkpoints : [];
    return items.map((c, i) => ({
      id: i,
      date:
        c.date ||
        c.time ||
        c.activity_date ||
        c.created_at ||
        '',
      text:
        c.activity ||
        c.status ||
        c.message ||
        c.current_status ||
        '',
      location: c.location || c.city || c.state || '',
    }));
  };

  const fetchTracking = async (order) => {
    if (!order?.id) return;
    if (tracking[order.id]) {
      setExpanded(expanded === order.id ? null : order.id);
      return;
    }
    setTrackLoading((m) => ({ ...m, [order.id]: true }));
    setExpanded(order.id);
    try {
      const res = await fetch(`/api/orders/track/${order.id}`);
      const json = await res.json();
      setTracking((m) => ({ ...m, [order.id]: json }));
    } catch (e) {
      setTracking((m) => ({ ...m, [order.id]: { error: true } }));
    } finally {
      setTrackLoading((m) => ({ ...m, [order.id]: false }));
    }
  };

  const statusList = ['All', ...STATUS_ORDER];

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-empty-card">
          <div className="empty-orb"></div>
          <h2 className="orders-empty-title">Loading your orders…</h2>
          <p className="orders-empty-subtitle">Fetching live updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {filtered.length === 0 ? (
        <div className="orders-empty-card">
          <div className="empty-orb"></div>
          <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
          <h2 className="orders-empty-title">Feeling light? 🪶</h2>
          <p className="orders-empty-subtitle">No orders yet. Find something you love and I’ll track it here.</p>
          <button className="orders-start-button" onClick={handleStartShopping}>Start Shopping</button>
          {error ? <p className="orders-error">{error}</p> : null}
        </div>
      ) : (
        <>
          <div className="orders-topbar">
            <div className="orders-header">
              <h3>Your Orders</h3>
              <span className="orders-count">{orders.length}</span>
            </div>
            <div className="orders-actions">
              <div className="orders-filter">
                <label>Status</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {statusList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="orders-list">
            {filtered.map((order, index) => {
              const st = normalizeStatus(order.status);
              const isOpen = expanded === order.id;
              const t = tracking[order.id];
              const tl = t && !t.error ? timelineFromTracking(t) : [];
              const trackUrl =
                t?.tracking_data?.track_url ||
                t?.tracking_data?.track_url_customer ||
                t?.data?.track_url ||
                '';

              return (
                <div key={order.id || index} className={`orders-item ${isOpen ? 'open' : ''}`}>
                  <span className="orders-glow"></span>

                  <div className={`orders-badge ${st.replace(/\s/g, '').toLowerCase()}`}>
                    <FaCheckCircle />
                    <span>{st}</span>
                  </div>

                  <div className="orders-image" onClick={() => handleViewProduct(order)}>
                    <img src={order.image} alt={order.name} />
                  </div>

                  <div className="orders-info">
                    <div className="orders-row">
                      <h4 className="orders-name">{order.name}</h4>
                      <div className="orders-brand">{order.brand}</div>
                    </div>

                    <div className="orders-meta">
                      <div className="orders-price">
                        <span className="price-current">{formatPrice(order.offerPrice)}</span>
                        {order.originalPrice ? (
                          <span className="price-original">{formatPrice(order.originalPrice)}</span>
                        ) : null}
                      </div>
                      <p className="orders-date">{order.date}</p>
                    </div>

                    <div className="orders-cta">
                      <button className="btn-secondary" onClick={() => handleViewProduct(order)}>View</button>
                      <button
                        className="btn-primary"
                        onClick={() => fetchTracking(order)}
                        disabled={trackLoading[order.id]}
                      >
                        {trackLoading[order.id] ? 'Loading…' : isOpen ? 'Hide Tracking' : 'Track Shipment'}
                      </button>
                      {trackUrl ? (
                        <a className="btn-link" href={trackUrl} target="_blank" rel="noreferrer">Open Tracking</a>
                      ) : null}
                    </div>

                    {isOpen ? (
                      <div className="orders-tracking">
                        {t?.error ? (
                          <div className="orders-track-empty">
                            <p>Tracking unavailable right now.</p>
                          </div>
                        ) : tl.length === 0 && trackLoading[order.id] ? (
                          <div className="orders-track-empty"><p>Fetching tracking…</p></div>
                        ) : tl.length === 0 ? (
                          <div className="orders-track-empty"><p>No tracking events yet.</p></div>
                        ) : (
                          <ul className="timeline">
                            {tl.map((ev, i) => (
                              <li key={ev.id}>
                                <div className="dot" />
                                <div className="tl-content">
                                  <div className="tl-top">
                                    <span className="tl-text">{ev.text || 'Update'}</span>
                                    <span className="tl-date">{ev.date ? new Date(ev.date).toLocaleString('en-IN') : ''}</span>
                                  </div>
                                  {ev.location ? <div className="tl-loc">{ev.location}</div> : null}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="orders-arrow" onClick={() => fetchTracking(order)}>
                    <FaArrowRight />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
