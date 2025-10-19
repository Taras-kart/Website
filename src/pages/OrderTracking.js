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

export default function OrderTracking() {
  const params = useParams();
  const [sp] = useSearchParams();
  const orderId = useMemo(() => params.id || sp.get('id') || '', [params.id, sp]);
  const [sale, setSale] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const [sRes, shRes] = await Promise.all([
        fetch(`${API_BASE}/api/sales/web/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/shipments/by-sale/${encodeURIComponent(orderId)}`)
      ]);
      const s = await sRes.json().catch(() => null);
      const sh = await shRes.json().catch(() => []);
      setSale(s);
      setShipments(Array.isArray(sh) ? sh : []);
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

  return (
    <div className="track-page">
      <Navbar />
      <div className="track-wrap">
        <div className="track-head">
          <h1>Track Order</h1>
          <div className="chip">#{orderId}</div>
        </div>

        {loading ? (
          <div className="track-loader">
            <div className="spin" />
            <span>Loading…</span>
          </div>
        ) : !sale ? (
          <div className="track-empty">Order not found</div>
        ) : (
          <>
            <div className="track-cards">
              <div className="card">
                <div className="kv">
                  <span>Status</span>
                  <strong className="gold">{statusText(sale?.status)}</strong>
                </div>
                <div className="kv">
                  <span>Payment</span>
                  <strong>{statusText(sale?.payment_status || 'COD')}</strong>
                </div>
                <div className="kv">
                  <span>Total</span>
                  <strong>{fmt(sale?.totals?.payable ?? sale?.total)}</strong>
                </div>
              </div>

              <div className="card">
                <div className="kv">
                  <span>Name</span>
                  <strong>{sale?.customer_name || 'Customer'}</strong>
                </div>
                <div className="kv">
                  <span>Mobile</span>
                  <strong>{sale?.customer_mobile || '-'}</strong>
                </div>
                <div className="kv">
                  <span>Pincode</span>
                  <strong>{sale?.shipping_address?.pincode || '-'}</strong>
                </div>
              </div>
            </div>

            <div className="section-title">Shipments</div>
            <div className="shipments">
              {shipments.length === 0 ? (
                <div className="track-empty">No shipments yet. Please check back shortly.</div>
              ) : (
                shipments.map((sh) => (
                  <div className="ship-card" key={sh.id}>
                    <div className="ship-row">
                      <div className="ship-kv">
                        <span>Branch</span>
                        <strong>#{sh.branch_id}</strong>
                      </div>
                      <div className="ship-kv">
                        <span>AWB</span>
                        <strong>{sh.awb || '-'}</strong>
                      </div>
                      <div className="ship-kv">
                        <span>Status</span>
                        <strong className="gold">{statusText(sh.status || 'CREATED')}</strong>
                      </div>
                    </div>
                    <div className="ship-actions">
                      {sh.tracking_url ? (
                        <a className="btn ghost" href={sh.tracking_url} target="_blank" rel="noreferrer">Track</a>
                      ) : null}
                      {sh.label_url ? (
                        <a className="btn solid" href={sh.label_url} target="_blank" rel="noreferrer">Label</a>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="section-title">Items</div>
            <div className="items">
              {Array.isArray(sale?.items) && sale.items.length ? (
                sale.items.map((it, idx) => (
                  <div className="item" key={`${it.variant_id}-${idx}`}>
                    <div className="thumb">{it.image_url ? <img src={it.image_url} alt="" /> : <div className="ph" />}</div>
                    <div className="meta">
                      <div className="name">{it.name || `Variant #${it.variant_id}`}</div>
                      <div className="bits">
                        <span>EAN {it.ean_code}</span>
                        <span>Size {it.size || '-'}</span>
                        <span>Colour {it.colour || '-'}</span>
                      </div>
                    </div>
                    <div className="qty">x{it.qty}</div>
                    <div className="price">{fmt(it.price)}</div>
                  </div>
                ))
              ) : (
                <div className="track-empty">No items</div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
