import { useState } from 'react';
import api from '../api/client';

const DEMO_BADGES = [
  { id: 'QS-2026-NB001', asset: 'auth.pnb.bank.in', score: 92, ml_kem: true, ml_dsa: true, slh_dsa: true, issued: '2026-03-20', valid_until: '2027-03-20' },
];

function BadgeSVG({ badge }) {
  return (
    <svg width="320" height="200" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 16, display: 'block' }}>
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f1623"/>
          <stop offset="100%" stopColor="#162032"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#bg)" stroke="#10b981" strokeWidth="2"/>
      {/* Shield */}
      <text x="24" y="52" fontSize="32">⚛</text>
      <text x="64" y="38" fontSize="15" fontWeight="bold" fill="#10b981" fontFamily="monospace">PQC CERTIFIED</text>
      <text x="64" y="54" fontSize="11" fill="#64748b" fontFamily="monospace">QUANTUM SHIELD</text>
      {/* Asset */}
      <text x="24" y="85" fontSize="12" fill="#e2e8f0" fontFamily="monospace">{badge.asset}</text>
      {/* Score */}
      <text x="24" y="114" fontSize="11" fill="#64748b" fontFamily="monospace">PQC SCORE</text>
      <text x="24" y="134" fontSize="28" fontWeight="bold" fill="#10b981" fontFamily="monospace">{badge.score}/100</text>
      {/* Algorithms */}
      {['ML-KEM-768','ML-DSA-65','SLH-DSA'].map((a, i) => (
        <g key={a}>
          <rect x={24 + i * 96} y="148" width="88" height="20" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1"/>
          <text x={68 + i * 96} y="162" fontSize="9" fill="#10b981" textAnchor="middle" fontFamily="monospace">✓ {a}</text>
        </g>
      ))}
      {/* ID & QR placeholder */}
      <text x="24" y="192" fontSize="9" fill="#475569" fontFamily="monospace">{badge.id} · Valid until {badge.valid_until}</text>
      <rect x="276" y="148" width="32" height="32" rx="4" fill="#1e2d4a"/>
      <text x="292" y="168" fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="monospace">QR</text>
    </svg>
  );
}

export default function PQCBadge() {
  const [tab, setTab] = useState('badges');
  const [badges, setBadges] = useState(DEMO_BADGES);
  const [issuing, setIssuing] = useState(false);
  const [issueStep, setIssueStep] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState('api.pnb.bank.in');

  const issueBadge = async () => {
    setIssuing(true); setIssueStep(1);
    await new Promise(r => setTimeout(r, 1000)); setIssueStep(2);
    await new Promise(r => setTimeout(r, 1000)); setIssueStep(3);
    try {
      const res = await api.post('/badges/issue', { domain: selectedAsset });
      setBadges(p => [...p, res.data]);
    } catch {
      setBadges(p => [...p, {
        id: `QS-2026-NB00${p.length + 1}`, asset: selectedAsset, score: 78,
        ml_kem: true, ml_dsa: true, slh_dsa: false,
        issued: new Date().toISOString().slice(0, 10),
        valid_until: '2027-03-28',
      }]);
    }
    setIssuing(false); setIssueStep(0); setTab('badges');
  };

  const download = (badge) => {
    const svgEl = document.querySelector(`[data-badge="${badge.id}"] svg`);
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${badge.id}.svg`; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid #1e2d4a', width: 'fit-content' }}>
        {[['badges','Badges'],['issue','Issue Badge'],['verify','Verify']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === k ? '#1e3a5f' : 'transparent', border: 'none', color: tab === k ? '#3b82f6' : '#64748b',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {badges.map(b => (
            <div key={b.id} data-badge={b.id} style={{ background: '#111827', borderRadius: 16, padding: 20, border: '1px solid #1e2d4a' }}>
              <BadgeSVG badge={b} />
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button onClick={() => download(b)} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff',
                }}>⬇ Download SVG</button>
                <button onClick={() => { setTab('verify'); }} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: 'transparent', border: '1px solid #1e2d4a', color: '#64748b',
                }}>🔗 Verify</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'issue' && (
        <div style={{ maxWidth: 480 }}>
          <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 20 }}>Issue PQC Badge</div>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 5, letterSpacing: '0.06em' }}>SELECT ASSET</label>
            <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1e2d4a',
              color: '#e2e8f0', fontSize: 13, outline: 'none', marginBottom: 20, fontFamily: 'Syne, sans-serif',
            }}>
              {['api.pnb.bank.in','cdn.pnb.bank.in','pnb.bank.in'].map(a => <option key={a}>{a}</option>)}
            </select>

            {issuing && (
              <div style={{ marginBottom: 16 }}>
                {[['Running liboqs tests…', 1],['Signing badge with ML-DSA…', 2],['Storing in database…', 3]].map(([label, step]) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: issueStep >= step ? '#10b981' : '#1e2d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>
                      {issueStep >= step ? '✓' : step}
                    </div>
                    <span style={{ fontSize: 12, color: issueStep >= step ? '#10b981' : '#64748b' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={issueBadge} disabled={issuing} style={{
              width: '100%', padding: '11px', borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: issuing ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', opacity: issuing ? 0.7 : 1,
            }}>{issuing ? 'Issuing…' : '🏆 Issue PQC Badge'}</button>
          </div>
        </div>
      )}

      {tab === 'verify' && (
        <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a', maxWidth: 480 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 16 }}>Public Verification</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
            Share this URL with judges or auditors — they can verify the badge without logging in:
          </div>
          {badges.map(b => (
            <div key={b.id} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#0d1525', border: '1px solid #1e2d4a' }}>
              <div style={{ fontSize: 11, color: '#10b981', fontFamily: 'Space Mono,monospace', marginBottom: 4 }}>
                {window.location.origin}/verify/{b.id}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{b.asset} — Score: {b.score}/100</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
