import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ReturnsPage.css';

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app';
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE;
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

export default function ReturnsPage() {
  const [params] = useSearchParams();
  const initialSaleId = params.get('saleId') || '';
  const initialType = params.get('type') === 'REPLACE' ? 'REPLACE' : 'RETURN';

  const [saleId, setSaleId] = useState(initialSaleId);
  const [type, setType] = useState(initialType);
  const [eligibility, setEligibility] = useState(null);
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function fetchSale(id) {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('Order not found');
      const data = await r.json();
      setSale(data);
      const saleItems = (data?.items || []).map(i => ({
        variant_id: i.variant_id,
        name: i?.name || `Variant ${i.variant_id}`,
        qty: 0,
        reason_code: '',
        condition_note: ''
      }));
      setItems(saleItems);
    } catch {
      setSale(null);
    } finally {
      setLoading(false);
    }
  }

  async function checkEligibility(id) {
    setEligibility(null);
    if (!id) return;
    try {
      const r = await fetch(`${API_BASE}/api/returns/eligibility/${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = await r.json();
      setEligibility(data);
    } catch {
      setEligibility({ ok: false, reason: 'Unable to check eligibility' });
    }
  }

  useEffect(() => {
    if (initialSaleId) {
      fetchSale(initialSaleId);
      checkEligibility(initialSaleId);
    }
  }, [initialSaleId]);

  const canSubmit = useMemo(() => {
    const anyQty = items.some(i => Number(i.qty) > 0);
    return saleId && eligibility?.ok && anyQty && !submitting;
  }, [saleId, eligibility, items, submitting]);

  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function onSubmit() {
    try {
      setSubmitting(true);
      setMsg('');
      const payload = {
        sale_id: saleId,
        type,
        reason,
        notes,
        items: items.filter(i => Number(i.qty) > 0).map(i => ({
          variant_id: i.variant_id,
          qty: Number(i.qty),
          reason_code: i.reason_code || null,
          condition_note: i.condition_note || null
        }))
      };
      const r = await fetch(`${API_BASE}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok || !data?.ok) throw new Error(data?.reason || data?.message || 'Failed');
      setMsg('Request submitted. We’ll update you after review.');
    } catch (e) {
      setMsg(e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="returns-wrap">
      <div className="returns-head">
        <h1>Returns & Replacements</h1>
      </div>

      <div className="card">
        <div className="row">
          <label>Order ID</label>
          <div className="row-inline">
            <input
              value={saleId}
              onChange={e => setSaleId(e.target.value)}
              placeholder="Enter Order ID (UUID)"
            />
            <button
              className="btn solid"
              onClick={() => {
                fetchSale(saleId);
                checkEligibility(saleId);
              }}
              disabled={!saleId || loading}
            >
              {loading ? 'Loading…' : 'Load Order'}
            </button>
          </div>
        </div>
      </div>

      {eligibility && (
        <div className={`alert ${eligibility.ok ? 'ok' : 'err'}`}>
          {eligibility.ok ? 'Eligible for return/replacement' : `Not eligible: ${eligibility.reason || ''}`}
        </div>
      )}

      {sale && (
        <div className="card">
          <div className="row">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="RETURN">Return</option>
              <option value="REPLACE">Replace</option>
            </select>
          </div>

          <div className="items">
            <div className="items-head">
              <h3>Items</h3>
              <span className="hint">Set quantity for items you want to {type === 'REPLACE' ? 'replace' : 'return'}</span>
            </div>
            {(items || []).map((it, idx) => (
              <div key={it.variant_id} className="item-row">
                <div className="name">{it.name || `Variant ${it.variant_id}`}</div>
                <input
                  className="qty"
                  type="number"
                  min="0"
                  max="10"
                  value={it.qty}
                  onChange={e => updateItem(idx, { qty: e.target.value })}
                />
                <input
                  className="reason"
                  type="text"
                  placeholder="Reason code (optional)"
                  value={it.reason_code}
                  onChange={e => updateItem(idx, { reason_code: e.target.value })}
                />
                <input
                  className="note"
                  type="text"
                  placeholder="Condition note (optional)"
                  value={it.condition_note}
                  onChange={e => updateItem(idx, { condition_note: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="row">
            <label>Reason (summary)</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Short reason"
            />
          </div>
          <div className="row">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Extra details (optional)"
            />
          </div>

          <div className="actions">
            <button className="btn solid" disabled={!canSubmit} onClick={onSubmit}>
              {submitting ? 'Submitting…' : type === 'REPLACE' ? 'Request Replacement' : 'Request Return'}
            </button>
            {msg ? <div className="hint msg">{msg}</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}
