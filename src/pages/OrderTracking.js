// D:\shopping\src\pages\OrderTracking.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './OrderTracking.css';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

export default function OrderTracking() {
  const params = useParams();
  const [sp] = useSearchParams();
  const orderId = useMemo(() => params.id || sp.get('id') || '', [params.id, sp]);
  const [sale, setSale] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const [sRes, shRes, elRes, rrRes] = await Promise.all([
        fetch(`${API_BASE}/api/sales/web/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/shipments/by-sale/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/returns/eligibility/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/returns/by-sale/${encodeURIComponent(orderId)}`)
      ]);
      const s = await sRes.json().catch(() => null);
      const sh = await shRes.json().catch(() => []);
      const el = await elRes.json().catch(() => null);
      const rr = await rrRes.json().catch(() => ({ rows: [] }));
      setSale(s);
      setShipments(Array.isArray(sh) ? sh : []);
      setEligibility(el);
      setRequests(Array.isArray(rr?.rows) ? rr.rows : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 20000);
    return () => clearInterval(t);
  }, [orderId]);

  const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const statusText = (s) => String(s || '').toUpperCase();

  const orderStatus = statusText(sale?.status || '');
  const isCancelled = orderStatus === 'CANCELLED';
  const stepIndex = useMemo(() => {
    const idx = ORDER_STEPS.indexOf(orderStatus || 'PLACED');
    if (idx === -1) return 0;
    return idx;
  }, [orderStatus]);

  const placedDate = sale?.created_at ? new Date(sale.created_at) : null;
  const placedDateText = placedDate ? placedDate.toLocaleString('en-IN') : '-';

  const destinationCity = sale?.shipping_address?.city || '';
  const destinationState = sale?.shipping_address?.state || '';
  const destinationPincode = sale?.shipping_address?.pincode || '';
  const destinationText =
    destinationCity || destinationState || destinationPincode
      ? [destinationCity, destinationState, destinationPincode].filter(Boolean).join(', ')
      : '-';

  const latestShipment = shipments && shipments.length > 0 ? shipments[shipments.length - 1] : null;

  const lastUpdateTime =
    latestShipment?.updated_at || latestShipment?.created_at || sale?.updated_at || sale?.created_at;
  const lastUpdateText = lastUpdateTime
    ? new Date(lastUpdateTime).toLocaleString('en-IN')
    : '-';

  return (
    <div className="ot-page">
      <Navbar />
      <div className="ot-wrap">
        <div className="ot-head">
          <div className="ot-head-main">
            <h1 className="ot-title">Track your order</h1>
            <p className="ot-subtitle">
              Live status, shipment details and return options for your purchase
            </p>
          </div>
          <div className="ot-head-side">
            <div className="ot-order-chip">Order #{orderId || 'NA'}</div>
            {lastUpdateText !== '-' && (
              <div className="ot-updated-text">Last updated: {lastUpdateText}</div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="ot-loader">
            <div className="ot-spinner" />
            <span className="ot-loader-text">Fetching your order details</span>
          </div>
        ) : !sale ? (
          <div className="ot-empty">
            <div className="ot-empty-icon" />
            <h2 className="ot-empty-title">Order not found</h2>
            <p className="ot-empty-text">
              Please check your order ID or visit the orders section in your account to pick an
              order to track.
            </p>
          </div>
        ) : (
          <>
            <div className="ot-summary-grid">
              <div className="ot-summary-card">
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Status</span>
                  <span
                    className={`ot-summary-status-pill ${
                      isCancelled ? 'ot-status-cancelled' : 'ot-status-active'
                    }`}
                  >
                    {orderStatus || 'PLACED'}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Payment</span>
                  <span className="ot-summary-value">
                    {statusText(sale?.payment_status || 'COD')}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Total payable</span>
                  <span className="ot-summary-value ot-summary-value-amount">
                    {fmt(sale?.totals?.payable ?? sale?.total)}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Placed on</span>
                  <span className="ot-summary-value">{placedDateText}</span>
                </div>
              </div>

              <div className="ot-summary-card">
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Customer</span>
                  <span className="ot-summary-value">
                    {sale?.customer_name || 'Customer'}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Mobile</span>
                  <span className="ot-summary-value">
                    {sale?.customer_mobile || '-'}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Destination</span>
                  <span className="ot-summary-value">{destinationText}</span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Contact email</span>
                  <span className="ot-summary-value">
                    {sale?.customer_email || '-'}
                  </span>
                </div>
              </div>

              <div className="ot-summary-card ot-summary-card-highlight">
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Delivery status</span>
                  <span className="ot-summary-value">
                    {isCancelled
                      ? 'This order has been cancelled'
                      : orderStatus === 'DELIVERED'
                      ? 'Delivered'
                      : 'On the way'}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Current location</span>
                  <span className="ot-summary-value">
                    {latestShipment?.current_location ||
                      latestShipment?.branch_id
                        ? `Branch #${latestShipment.branch_id}`
                        : destinationCity || '-'}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Tip</span>
                  <span className="ot-summary-value">
                    Keep SMS and WhatsApp notifications enabled for real time delivery updates.
                  </span>
                </div>
              </div>
            </div>

            <div className="ot-section">
              <div className="ot-section-head">
                <div>
                  <div className="ot-section-title">Order progress</div>
                  <div className="ot-section-subtitle">
                    Follow your order step by step from placement to delivery
                  </div>
                </div>
                {!isCancelled && (
                  <div className="ot-section-pill">
                    {orderStatus === 'DELIVERED'
                      ? 'Delivered successfully'
                      : 'We will notify you as soon as the next step is completed'}
                  </div>
                )}
                {isCancelled && (
                  <div className="ot-section-pill ot-section-pill-cancelled">
                    Order cancelled. If payment was made online, refund timelines will follow the
                    payment provider policy.
                  </div>
                )}
              </div>

              <div className={`ot-progress ${isCancelled ? 'ot-progress-cancelled' : ''}`}>
                <div className="ot-progress-line" />
                <div className="ot-steps">
                  {ORDER_STEPS.map((step, index) => {
                    const stepState =
                      isCancelled && step !== 'PLACED'
                        ? 'upcoming'
                        : index < stepIndex
                        ? 'done'
                        : index === stepIndex
                        ? 'active'
                        : 'upcoming';
                    return (
                      <div className="ot-step" key={step}>
                        <div className={`ot-step-dot ot-step-dot-${stepState}`} />
                        <div className="ot-step-label">{step}</div>
                        <div className="ot-step-caption">
                          {step === 'PLACED' && 'We have received your order'}
                          {step === 'CONFIRMED' && 'Your order has been verified'}
                          {step === 'PACKED' && 'Items are packed and ready to ship'}
                          {step === 'SHIPPED' && 'Parcel is with the courier partner'}
                          {step === 'DELIVERED' && 'Parcel has reached your address'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="ot-section">
              <div className="ot-section-head">
                <div>
                  <div className="ot-section-title">Shipments</div>
                  <div className="ot-section-subtitle">
                    Each shipment may contain one or more items in your order
                  </div>
                </div>
              </div>
              <div className="ot-shipments">
                {shipments.length === 0 ? (
                  <div className="ot-empty-inline">
                    No shipments have been created yet. Your order will be packed and shipped
                    soon.
                  </div>
                ) : (
                  shipments.map((sh) => (
                    <div className="ot-ship-card" key={sh.id}>
                      <div className="ot-ship-main">
                        <div className="ot-ship-col">
                          <span className="ot-ship-label">Shipment</span>
                          <span className="ot-ship-value">#{sh.id}</span>
                          <span className="ot-ship-meta">
                            Branch #{sh.branch_id || '-'}
                          </span>
                        </div>
                        <div className="ot-ship-col">
                          <span className="ot-ship-label">AWB</span>
                          <span className="ot-ship-value">
                            {sh.awb || '-'}
                          </span>
                          <span className="ot-ship-meta">
                            {sh.courier_name || 'Courier partner'}
                          </span>
                        </div>
                        <div className="ot-ship-col">
                          <span className="ot-ship-label">Status</span>
                          <span className="ot-ship-status">
                            {statusText(sh.status || 'CREATED')}
                          </span>
                          <span className="ot-ship-meta">
                            {sh.updated_at
                              ? `Updated on ${new Date(sh.updated_at).toLocaleString('en-IN')}`
                              : ''}
                          </span>
                        </div>
                        <div className="ot-ship-col">
                          <span className="ot-ship-label">Destination</span>
                          <span className="ot-ship-value">
                            {destinationText}
                          </span>
                          <span className="ot-ship-meta">
                            We share live updates by SMS when picked up
                          </span>
                        </div>
                      </div>
                      <div className="ot-ship-actions">
                        {sh.tracking_url ? (
                          <a
                            className="ot-btn ot-btn-ghost"
                            href={sh.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View live tracking
                          </a>
                        ) : null}
                        {sh.label_url ? (
                          <a
                            className="ot-btn ot-btn-solid"
                            href={sh.label_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download label
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ot-section">
              <div className="ot-section-head">
                <div>
                  <div className="ot-section-title">Items in your order</div>
                  <div className="ot-section-subtitle">
                    Quantity, size and price for each product in this order
                  </div>
                </div>
              </div>
              <div className="ot-items">
                {Array.isArray(sale?.items) && sale.items.length ? (
                  sale.items.map((it, idx) => (
                    <div className="ot-item" key={`${it.variant_id}-${idx}`}>
                      <div className="ot-item-thumb">
                        {it.image_url ? (
                          <img src={it.image_url} alt="" />
                        ) : (
                          <div className="ot-item-ph" />
                        )}
                      </div>
                      <div className="ot-item-main">
                        <div className="ot-item-name">
                          {it.name || `Variant #${it.variant_id}`}
                        </div>
                        <div className="ot-item-meta">
                          <span>EAN {it.ean_code || '-'}</span>
                          <span>Size {it.size || '-'}</span>
                          <span>Colour {it.colour || '-'}</span>
                        </div>
                      </div>
                      <div className="ot-item-qty">
                        <span className="ot-item-qty-label">Qty</span>
                        <span className="ot-item-qty-value">x{it.qty}</span>
                      </div>
                      <div className="ot-item-price">
                        <span className="ot-item-price-main">{fmt(it.price)}</span>
                        {it.mrp && Number(it.mrp) > 0 && (
                          <span className="ot-item-price-mrp">MRP {fmt(it.mrp)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="ot-empty-inline">No items found in this order</div>
                )}
              </div>
              <div className="ot-price-summary">
                <div className="ot-price-row">
                  <span className="ot-price-label">Items total</span>
                  <span className="ot-price-value">
                    {fmt(sale?.totals?.items_total ?? sale?.totals?.payable ?? sale?.total)}
                  </span>
                </div>
                <div className="ot-price-row">
                  <span className="ot-price-label">Shipping</span>
                  <span className="ot-price-value">
                    {fmt(sale?.totals?.shipping ?? 0)}
                  </span>
                </div>
                <div className="ot-price-row ot-price-row-strong">
                  <span className="ot-price-label">Amount paid / payable</span>
                  <span className="ot-price-value ot-price-value-strong">
                    {fmt(sale?.totals?.payable ?? sale?.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="ot-section">
              <div className="ot-section-head">
                <div>
                  <div className="ot-section-title">Returns and replacements</div>
                  <div className="ot-section-subtitle">
                    View your options if the item is damaged, incorrect or not as expected
                  </div>
                </div>
              </div>
              <div className="ot-returns">
                {eligibility?.ok ? (
                  <div className="ot-returns-actions">
                    <a
                      className="ot-btn ot-btn-solid"
                      href={`/returns?saleId=${encodeURIComponent(orderId)}&type=RETURN`}
                    >
                      Request return
                    </a>
                    <a
                      className="ot-btn ot-btn-ghost"
                      href={`/returns?saleId=${encodeURIComponent(orderId)}&type=REPLACE`}
                    >
                      Request replacement
                    </a>
                  </div>
                ) : (
                  <div className="ot-empty-inline">
                    {eligibility?.reason
                      ? `Not eligible right now: ${eligibility.reason}`
                      : 'Return eligibility details are not available for this order.'}
                  </div>
                )}
                {Array.isArray(requests) && requests.length ? (
                  <div className="ot-returns-list">
                    {requests.map((r) => (
                      <div className="ot-return-row" key={r.id}>
                        <div className="ot-return-cell">
                          <span className="ot-return-label">Type</span>
                          <span className="ot-return-value">{r.type}</span>
                        </div>
                        <div className="ot-return-cell">
                          <span className="ot-return-label">Status</span>
                          <span className="ot-return-value">
                            {statusText(r.status || '')}
                          </span>
                        </div>
                        <div className="ot-return-cell">
                          <span className="ot-return-label">Reason</span>
                          <span className="ot-return-value">
                            {r.reason || '-'}
                          </span>
                        </div>
                        <div className="ot-return-cell">
                          <span className="ot-return-label">Created on</span>
                          <span className="ot-return-value">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString('en-IN')
                              : '-'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="ot-help-box">
                  <div className="ot-help-title">Need help with this order?</div>
                  <div className="ot-help-text">
                    If you face delivery issues or product concerns, reach out to our support with
                    your order ID and we will be happy to assist.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
