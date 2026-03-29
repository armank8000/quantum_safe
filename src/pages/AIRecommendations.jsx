import { useEffect, useState } from 'react';
import api from '../api/client';

const DEMO_RECS = [
  {
    id: 1, asset: 'api.pnb.bank.in', priority: 'Critical', effort: 85,
    title: 'Upgrade RSA-2048 → ML-KEM-768',
    summary: 'Replace RSA-2048 key exchange with NIST FIPS 203 compliant ML-KEM-768.',
    code: `# nginx.conf snippet\nssl_certificate     /etc/ssl/ml-kem-cert.pem;\nssl_certificate_key /etc/ssl/ml-kem-key.pem;\nssl_protocols       TLSv1.3;\nssl_ciphers         ML-KEM-768:AES-256-GCM-SHA384;`,
    redis_cached: true,
  },
  {
    id: 2, asset: 'mobile.pnb.bank.in', priority: 'Critical', effort: 90,
    title: 'Disable RC4 / TLS 1.1',
    summary: 'RC4 is broken and TLS 1.1 is deprecated. Upgrade to TLS 1.3 immediately.',
    code: `ssl_protocols TLSv1.3;\nssl_ciphers   TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;\nssl_prefer_server_ciphers on;`,
    redis_cached: false,
  },
  {
    id: 3, asset: 'cdn.pnb.bank.in', priority: 'High', effort: 60,
    title: 'Replace ECDHE-RSA with ML-KEM Hybrid',
    summary: 'Transition to hybrid PQC + classical key exchange for forward secrecy.',
    code: `# Hybrid mode\nssl_ecdh_curve X25519MLKEM768:prime256v1;`,
    redis_cached: true,
  },
];

const GANTT_ITEMS = [
  { name: 'Inventory audit',         start: 0, end: 2,  color: '#3b82f6' },
  { name: 'ML-KEM deployment',       start: 2, end: 6,  color: '#8b5cf6' },
  { name: 'TLS 1.1 / RC4 removal',   start: 1, end: 3,  color: '#ef4444' },
  { name: 'Certificate renewal',     start: 4, end: 8,  color: '#10b981' },
  { name: 'PQC Badge issuance',       start: 6, end: 8,  color: '#f59e0b' },
  { name: 'Compliance validation',    start: 7, end: 9,  color: '#64748b' },
];

const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b' };

export default function AIRecommendations() {
  const [recs, setRecs] = useState(DEMO_RECS);
  const [tab, setTab] = useState('recs');
  const [expanded, setExpanded] = useState({});
  const [selectedAsset, setSelectedAsset] = useState('all');

  useEffect(() => {
    api.get('/ai/recommendations').then(r => setRecs(r.data.recommendations || r.data)).catch(() => {});
  }, []);

  const applyFix = async (id) => {
    try { await api.post(`/ai/recommendations/${id}/apply`); } catch {}
    alert('Fix applied! (Demo mode)');
  };

  const filtered = selectedAsset === 'all' ? recs : recs.filter(r => r.asset === selectedAsset);
  const assets = ['all', ...new Set(recs.map(r => r.asset))];

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid #1e2d4a', width: 'fit-content' }}>
        {[['recs','AI Recommendations'],['gantt','Migration Roadmap'],['agility','Crypto Agility']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === k ? '#1e3a5f' : 'transparent', border: 'none', color: tab === k ? '#3b82f6' : '#64748b',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'recs' && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} style={{
              padding: '8px 12px', borderRadius: 8, background: '#111827', border: '1px solid #1e2d4a',
              color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif',
            }}>
              {assets.map(a => <option key={a} value={a}>{a === 'all' ? 'All Assets' : a}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(rec => (
              <div key={rec.id} style={{ background: '#111827', borderRadius: 14, padding: 20, border: `1px solid ${PRIORITY_COLORS[rec.priority]}40` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${PRIORITY_COLORS[rec.priority]}20`, color: PRIORITY_COLORS[rec.priority], flexShrink: 0 }}>{rec.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono,monospace' }}>{rec.asset}</div>
                  </div>
                  {rec.redis_cached && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>Redis cached</span>}
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.6 }}>{rec.summary}</p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>EFFORT: {rec.effort}%</div>
                  <div style={{ height: 6, background: '#1e2d4a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rec.effort}%`, background: PRIORITY_COLORS[rec.priority], borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setExpanded(p => ({...p, [rec.id]: !p[rec.id]}))} style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: 'transparent', border: '1px solid #1e2d4a', color: '#64748b',
                  }}>{expanded[rec.id] ? 'Hide Code' : 'Show Code'}</button>
                  <button onClick={() => applyFix(rec.id)} style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff',
                  }}>✓ Apply Fix</button>
                </div>
                {expanded[rec.id] && (
                  <pre style={{ marginTop: 12, padding: 14, borderRadius: 8, background: '#0d1525', border: '1px solid #1e2d4a', fontSize: 11, color: '#10b981', fontFamily: 'Space Mono,monospace', overflow: 'auto' }}>
                    {rec.code}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'gantt' && (
        <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20, color: '#e2e8f0' }}>Migration Roadmap (Apr–Dec 2026)</div>
          {/* Month headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(9, 1fr)', gap: 0, marginBottom: 8 }}>
            <div />
            {MONTHS.map(m => <div key={m} style={{ fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: 700 }}>{m}</div>)}
          </div>
          {GANTT_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px repeat(9, 1fr)', gap: 0, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', paddingRight: 12 }}>{item.name}</div>
              {MONTHS.map((_, mi) => (
                <div key={mi} style={{ height: 24, background: (mi >= item.start && mi < item.end) ? item.color : 'transparent', borderRadius: mi === item.start ? '6px 0 0 6px' : mi === item.end - 1 ? '0 6px 6px 0' : 0, opacity: 0.85 }} />
              ))}
            </div>
          ))}
          {/* Today marker */}
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 12, fontFamily: 'Space Mono,monospace' }}>▲ Today: April 2026</div>
        </div>
      )}

      {tab === 'agility' && (
        <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20, color: '#e2e8f0' }}>Crypto Agility Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2d4a" strokeWidth="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" strokeWidth="12"
                  strokeDasharray={`${2*Math.PI*50*0.63} ${2*Math.PI*50}`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>63</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>/ 100</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {recs.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono,monospace' }}>{r.asset}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>{100 - r.effort}</span>
                  </div>
                  <div style={{ height: 6, background: '#1e2d4a', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${100 - r.effort}%`, background: '#8b5cf6', borderRadius: 3 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
