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

function statusText(s) {
  return String(s || '').toUpperCase();
}

function computeStepFromLocal(orderStatus) {
  const idx = ORDER_STEPS.indexOf(orderStatus || 'PLACED');
  if (idx === -1) return 0;
  return idx;
}

function computeStepFromShiprocketStatus(srStatus) {
  const s = statusText(srStatus);
  if (!s) return 0;
  if (s.includes('DELIVERED')) return 4;
  if (s.includes('OUT FOR DELIVERY') || s.includes('OUT_FOR_DELIVERY')) return 3;
  if (s.includes('PICKED') || s.includes('DISPATCH') || s.includes('IN TRANSIT') || s.includes('SHIPPED')) return 3;
  if (s.includes('PACKED') || s.includes('MANIFEST')) return 2;
  if (s.includes('CONFIRMED') || s.includes('PROCESSING') || s.includes('ACCEPTED') || s.includes('CREATED')) return 1;
  return 0;
}

function computeStepFromShipment(sh, srCore) {
  if (!sh && !srCore) return 0;
  const s = statusText(sh?.status || '');
  const sr = statusText(srCore?.current_status || '');
  const combined = `${s} ${sr}`.trim();
  if (!combined) {
    if (sh && sh.awb) return 2;
    return 1;
  }
  if (combined.includes('DELIVERED')) return 4;
  if (combined.includes('OUT FOR DELIVERY') || combined.includes('OUT_FOR_DELIVERY')) return 3;
  if (combined.includes('IN TRANSIT') || combined.includes('DISPATCH') || combined.includes('SHIPPED') || combined.includes('PICKED')) return 3;
  if (combined.includes('PACKED') || combined.includes('MANIFEST')) return 2;
  if (combined.includes('CONFIRMED') || combined.includes('PROCESSING') || combined.includes('ACCEPTED') || combined.includes('CREATED')) return 1;
  return 0;
}

function extractTrackingCore(raw) {
  if (!raw) return null;
  let core = raw;
  if (Array.isArray(core) && core.length) {
    const first = core[0];
    if (first && typeof first === 'object') {
      const key = Object.keys(first)[0];
      if (key && first[key] && first[key].tracking_data) {
        core = first[key].tracking_data;
      }
    }
  } else if (core.tracking_data) {
    core = core.tracking_data;
  }
  if (!core || typeof core !== 'object') return null;
  return core;
}

function buildTrackingSnapshot(raw) {
  const core = extractTrackingCore(raw);
  if (!core) {
    return {
      status: '',
      eddText: null,
      lastEventText: null,
      core: null
    };
  }
  const tracks = Array.isArray(core.shipment_track) ? core.shipment_track : [];
  const lastTrack = tracks.length ? tracks[tracks.length - 1] : null;
  const status =
    (lastTrack && lastTrack.current_status) ||
    core.current_status ||
    core.status ||
    '';
  const eddRaw =
    (lastTrack && lastTrack.edd) ||
    core.edd ||
    null;
  const lastEventRaw =
    (lastTrack && (lastTrack.date || lastTrack.pickup_date || lastTrack.updated_time_stamp)) ||
    core.updated_time_stamp ||
    core.last_status_time ||
    null;
  const edd = eddRaw ? new Date(eddRaw) : null;
  const lastEvent = lastEventRaw ? new Date(lastEventRaw) : null;
  return {
    status,
    eddText: edd && !Number.isNaN(edd.getTime())
      ? edd.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' })
      : null,
    lastEventText: lastEvent && !Number.isNaN(lastEvent.getTime())
      ? lastEvent.toLocaleString('en-IN')
      : null,
    core
  };
}

export default function OrderTracking() {
  const params = useParams();
  const [sp] = useSearchParams();
  const orderId = useMemo(() => params.id || sp.get('id') || '', [params.id, sp]);
  const [sale, setSale] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingRaw, setTrackingRaw] = useState(null);

  const fetchShiprocketTracking = async shArray => {
    const arr = Array.isArray(shArray) ? shArray : [];
    const latest = arr.length ? arr[arr.length - 1] : null;
    const trackOrderId = latest?.shiprocket_order_id || latest?.awb || '';
    if (!trackOrderId) {
      setTrackingRaw(null);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/shiprocket/track/${encodeURIComponent(trackOrderId)}`
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setTrackingRaw(data);
      } else {
        setTrackingRaw(null);
      }
    } catch {
      setTrackingRaw(null);
    }
  };

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
      const sJson = await sRes.json().catch(() => null);
      const shJson = await shRes.json().catch(() => []);
      const elJson = await elRes.json().catch(() => null);
      const rrJson = await rrRes.json().catch(() => ({ rows: [] }));
      const nextSale = sJson && sJson.sale ? { ...sJson.sale, items: sJson.items || [] } : sJson;
      const nextShipments = Array.isArray(shJson) ? shJson : [];
      setSale(nextSale);
      setShipments(nextShipments);
      setEligibility(elJson);
      setRequests(Array.isArray(rrJson?.rows) ? rrJson.rows : []);
      fetchShiprocketTracking(nextShipments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 20000);
    return () => clearInterval(t);
  }, [orderId]);

  const fmt = n => `₹${Number(n || 0).toFixed(2)}`;

  const localOrderStatus = statusText(sale?.status || 'PLACED');
  const isCancelled = localOrderStatus === 'CANCELLED';

  const trackingSnapshot = useMemo(() => buildTrackingSnapshot(trackingRaw), [trackingRaw]);

  const shiprocketStatus = statusText(trackingSnapshot.status);
  const latestShipment = shipments && shipments.length > 0 ? shipments[shipments.length - 1] : null;
  const shipmentStepIndex = computeStepFromShipment(latestShipment, trackingSnapshot.core);

  const placedDate = sale?.created_at ? new Date(sale.created_at) : null;
  const placedDateText = placedDate && !Number.isNaN(placedDate.getTime())
    ? placedDate.toLocaleString('en-IN')
    : '-';

  const destinationCity = sale?.shipping_address?.city || '';
  const destinationState = sale?.shipping_address?.state || '';
  const destinationPincode = sale?.shipping_address?.pincode || '';
  const destinationText =
    destinationCity || destinationState || destinationPincode
      ? [destinationCity, destinationState, destinationPincode].filter(Boolean).join(', ')
      : '-';

  const lastUpdateTime = useMemo(() => {
    if (trackingSnapshot.lastEventText) return trackingSnapshot.lastEventText;
    const fallbackTime =
      latestShipment?.updated_at ||
      latestShipment?.created_at ||
      sale?.updated_at ||
      sale?.created_at;
    if (!fallbackTime) return '-';
    const t = new Date(fallbackTime);
    if (Number.isNaN(t.getTime())) return '-';
    return t.toLocaleString('en-IN');
  }, [trackingSnapshot, latestShipment, sale]);

  const primaryAwb = latestShipment?.awb || '-';
  const trackingUrl = latestShipment?.tracking_url || null;

  const computedEddDate = useMemo(() => {
    if (trackingSnapshot.eddText) return null;
    const base =
      latestShipment?.created_at ||
      sale?.created_at ||
      null;
    if (!base) return null;
    const d = new Date(base);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + 5);
    return d;
  }, [trackingSnapshot.eddText, latestShipment, sale]);

  const expectedDeliveryText = useMemo(() => {
    if (trackingSnapshot.eddText) return trackingSnapshot.eddText;
    if (!computedEddDate) return 'To be updated soon';
    return computedEddDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  }, [trackingSnapshot.eddText, computedEddDate]);

  const baseLocalStep = computeStepFromLocal(localOrderStatus);
  let baseShiprocketStep = computeStepFromShiprocketStatus(shiprocketStatus);
  if (!isCancelled && trackingSnapshot.eddText && baseShiprocketStep < 3) {
    baseShiprocketStep = 3;
  }
  let effectiveStepIndex = Math.max(baseLocalStep, baseShiprocketStep, shipmentStepIndex);
  if (
    !isCancelled &&
    expectedDeliveryText &&
    expectedDeliveryText !== 'To be updated soon' &&
    effectiveStepIndex < 3
  ) {
    effectiveStepIndex = 3;
  }

  const deliveryStatusText = (() => {
    if (isCancelled) return 'This order has been cancelled';
    if (effectiveStepIndex === ORDER_STEPS.length - 1) return 'Delivered';
    if (shiprocketStatus) return shiprocketStatus;
    return 'On the way';
  })();

  const trackingEvents = useMemo(() => {
    const core = trackingSnapshot.core;
    if (!core) return [];
    const raw = Array.isArray(core.shipment_track) ? core.shipment_track : [];
    return raw
      .map(ev => {
        const rawDate = ev.updated_time_stamp || ev.pickup_date || ev.delivered_date || ev.date || '';
        const d = rawDate ? new Date(rawDate) : null;
        const dateText = d && !Number.isNaN(d.getTime()) ? d.toLocaleString('en-IN') : '';
        const loc =
          ev.destination ||
          ev.destination_city ||
          ev.city ||
          ev.origin ||
          ev.scan_location ||
          ev.scanned_location ||
          '';
        return {
          status: statusText(ev.current_status || ''),
          location: loc,
          dateText
        };
      })
      .filter(e => e.status || e.dateText || e.location);
  }, [trackingSnapshot.core]);

  return (
    <div className="ot-page">
      <Navbar />
      <div className="ot-wrap">
        <div className="ot-head">
          <div className="ot-head-main">
            <h1 className="ot-title">Track your order</h1>
            <p className="ot-subtitle">
              Live courier updates, expected delivery and return options
            </p>
          </div>
          <div className="ot-head-side">
            <div className="ot-order-chip">Order #{orderId || 'NA'}</div>
            {lastUpdateTime !== '-' && (
              <div className="ot-updated-text">Last updated {lastUpdateTime}</div>
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
            <div className="ot-top-card">
              <div className="ot-top-row-main">
                <div className="ot-top-status-pill">
                  {isCancelled ? 'CANCELLED' : shiprocketStatus || localOrderStatus || 'PLACED'}
                </div>
                <div className="ot-top-status-text">{deliveryStatusText}</div>
              </div>
              <div className="ot-top-row-grid">
                <div className="ot-top-meta-block">
                  <div className="ot-top-label">AWB NUMBER</div>
                  <div className="ot-top-value">{primaryAwb || '-'}</div>
                </div>
                <div className="ot-top-meta-block">
                  <div className="ot-top-label">EXPECTED DELIVERY</div>
                  <div className="ot-top-value">{expectedDeliveryText}</div>
                </div>
                <div className="ot-top-meta-block">
                  <div className="ot-top-label">DESTINATION</div>
                  <div className="ot-top-value">{destinationText}</div>
                </div>
                <div className="ot-top-meta-block">
                  <div className="ot-top-label">PLACED ON</div>
                  <div className="ot-top-value">{placedDateText}</div>
                </div>
              </div>
              <div className="ot-top-actions">
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ot-btn ot-btn-solid"
                  >
                    Track on courier site
                  </a>
                )}
              </div>
            </div>

            <div className="ot-summary-grid">
              <div className="ot-summary-card">
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
                  <span className="ot-summary-label">Order status</span>
                  <span
                    className={`ot-summary-status-pill ${
                      isCancelled ? 'ot-status-cancelled' : 'ot-status-active'
                    }`}
                  >
                    {localOrderStatus}
                  </span>
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
                    {deliveryStatusText}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Estimated delivery</span>
                  <span className="ot-summary-value">
                    {expectedDeliveryText}
                  </span>
                </div>
                <div className="ot-summary-row">
                  <span className="ot-summary-label">Current location</span>
                  <span className="ot-summary-value">
                    {latestShipment?.current_location
                      ? latestShipment.current_location
                      : latestShipment?.branch_id
                      ? `Branch #${latestShipment.branch_id}`
                      : destinationCity || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="ot-section">
              <div className="ot-section-head">
                <div>
                  <div className="ot-section-title">Order progress</div>
                  <div className="ot-section-subtitle">
                    Follow your parcel from placement to delivery
                  </div>
                </div>
                {!isCancelled && (
                  <div className="ot-section-pill">
                    {effectiveStepIndex === ORDER_STEPS.length - 1
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
                        : index < effectiveStepIndex
                        ? 'done'
                        : index === effectiveStepIndex
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

              {trackingEvents.length > 0 && (
                <div className="ot-tracking-timeline">
                  {trackingEvents.map((ev, idx) => (
                    <div className="ot-tracking-row" key={`${ev.dateText}-${idx}`}>
                      <div className="ot-tracking-dot" />
                      <div className="ot-tracking-content">
                        <div className="ot-tracking-status">{ev.status || 'Update'}</div>
                        {ev.location ? (
                          <div className="ot-tracking-location">{ev.location}</div>
                        ) : null}
                        {ev.dateText ? (
                          <div className="ot-tracking-date">{ev.dateText}</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  shipments.map(sh => {
                    const trackOrderId = sh.shiprocket_order_id || sh.awb || '';
                    return (
                      <div className="ot-ship-card" key={sh.id}>
                        <div className="ot-ship-main">
                          <div className="ot-ship-col">
                            <span className="ot-ship-label">Shipment</span>
                            <span className="ot-ship-value">#{sh.id}</span>
                            <span className="ot-ship-meta">
                              Branch #{sh.branch_id || '-'}
                            </span>
                            {sh.shiprocket_order_id ? (
                              <span className="ot-ship-meta">
                                Shiprocket order {sh.shiprocket_order_id}
                              </span>
                            ) : null}
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
                          {trackOrderId && (
                            <span className="ot-ship-meta">
                              Linked to Shiprocket tracking
                            </span>
                          )}
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
                    );
                  })
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
                          {it.name || it.product_name || `Variant #${it.variant_id}`}
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
                    {requests.map(r => (
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
