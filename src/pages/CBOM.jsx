import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api/client';

const DEMO_CBOM = {
  summary: { total_ciphers: 48, weak: 12, moderate: 18, strong: 14, pqc: 4, hndl_score: 74 },
  cipher_usage: [
    { cipher: 'AES-256-GCM', count: 22, safe: true  },
    { cipher: 'RSA-2048',    count: 18, safe: false  },
    { cipher: 'ECDHE-RSA',   count: 12, safe: false  },
    { cipher: 'ML-KEM-768',  count: 4,  safe: true   },
    { cipher: 'RC4-128',     count: 3,  safe: false  },
    { cipher: 'DES',         count: 1,  safe: false  },
  ],
  key_lengths: [
    { length: '128-bit', count: 14 }, { length: '256-bit', count: 22 },
    { length: '2048-bit', count: 18 }, { length: '4096-bit', count: 4 },
  ],
  assets: [
    { domain: 'pnb.bank.in',        cipher: 'AES-256-GCM', hndl: 62, quantum_expiry: 2028, tls: 'TLS 1.3' },
    { domain: 'api.pnb.bank.in',    cipher: 'RSA-2048',    hndl: 89, quantum_expiry: 2026, tls: 'TLS 1.2' },
    { domain: 'mobile.pnb.bank.in', cipher: 'RC4-128',     hndl: 95, quantum_expiry: 2025, tls: 'TLS 1.1' },
    { domain: 'auth.pnb.bank.in',   cipher: 'ML-KEM-768',  hndl: 12, quantum_expiry: 2035, tls: 'TLS 1.3' },
    { domain: 'cdn.pnb.bank.in',    cipher: 'ECDHE-RSA',   hndl: 71, quantum_expiry: 2027, tls: 'TLS 1.2' },
  ],
};

function KPI({ label, value, color = '#3b82f6', sub }) {
  return (
    <div style={{ background: '#111827', borderRadius: 12, padding: '18px 20px', border: '1px solid #1e2d4a' }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function CBOM() {
  const [data, setData] = useState(DEMO_CBOM);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get('/cbom').then(r => setData(r.data)).catch(() => {});
  }, []);

  const handleExport = async () => {
    try {
      const r = await api.get('/cbom/export', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a'); a.href = url; a.download = 'quantum-shield-cbom.json'; a.click();
    } catch { alert('Export demo: CBOM JSON would download here'); }
  };

  const s = data.summary;

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <KPI label="TOTAL CIPHERS" value={s.total_ciphers} color="#3b82f6" />
        <KPI label="WEAK / UNSAFE" value={s.weak} color="#ef4444" />
        <KPI label="PQC READY" value={s.pqc} color="#10b981" sub="ML-KEM / ML-DSA" />
        <KPI label="HNDL RISK SCORE" value={`${s.hndl_score}/100`} color={s.hndl_score > 70 ? '#ef4444' : '#f59e0b'} sub="Harvest Now Decrypt Later" />
        <KPI label="MODERATE" value={s.moderate} color="#f59e0b" />
        <KPI label="STRONG" value={s.strong} color="#8b5cf6" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid #1e2d4a', width: 'fit-content' }}>
        {[['overview','Overview'],['assets','Per-Asset CBOM'],['pipeline','Pipeline']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === k ? '#1e3a5f' : 'transparent', border: 'none', color: tab === k ? '#3b82f6' : '#64748b',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e2d4a' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Cipher Usage</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.cipher_usage} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cipher" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Mono,monospace' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0d1525', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {data.cipher_usage.map((d, i) => <Cell key={i} fill={d.safe ? '#10b981' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e2d4a' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Key Length Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.key_lengths}>
                <XAxis dataKey="length" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0d1525', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'assets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={handleExport} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'transparent', border: '1px solid #10b981', color: '#10b981',
            }}>⬇ Export CycloneDX 1.6</button>
          </div>
          <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
                {['Domain','Primary Cipher','HNDL Score','Quantum Expiry','TLS'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.assets.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono,monospace' }}>{a.domain}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono,monospace' }}>{a.cipher}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 6, width: 80, background: '#1e2d4a', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${a.hndl}%`, background: a.hndl > 70 ? '#ef4444' : '#f59e0b', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: a.hndl > 70 ? '#ef4444' : '#f59e0b' }}>{a.hndl}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: a.quantum_expiry <= 2026 ? '#ef4444' : '#f59e0b' }}>{a.quantum_expiry}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono,monospace' }}>{a.tls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Celery Pipeline Log</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#10b981', background: '#0d1525', borderRadius: 8, padding: 16 }}>
            {['[09:12:01] Starting TLS scan pipeline…','[09:12:03] subfinder: Found 14 subdomains','[09:12:08] Scanning ciphers for 14 endpoints…',
              '[09:12:22] CBOM generated: 48 cipher entries','[09:12:25] HNDL risk scored: 74/100','[09:12:26] Pipeline complete ✓'].map((l, i) => (
              <div key={i} style={{ marginBottom: 4, opacity: 0.7 + i * 0.05 }}>{l}</div>
            ))}
          </div>
          <button style={{
            marginTop: 16, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff', cursor: 'pointer',
          }} onClick={() => api.post('/cbom/run-pipeline').catch(() => {})}>
            ▶ Run Pipeline
          </button>
        </div>
      )}
    </div>
  );
}
