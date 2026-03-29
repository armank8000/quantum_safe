import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { X } from 'lucide-react';
import api from '../api/client';

const DEMO_PQC = {
  summary: { elite: 4, standard: 18, legacy: 62, critical: 44 },
  assets: [
    { domain: 'auth.pnb.bank.in',   score: 92, tier: 'Elite',    ml_kem: true,  ml_dsa: true,  slh_dsa: true,  team: 'Security' },
    { domain: 'pnb.bank.in',        score: 67, tier: 'Standard', ml_kem: true,  ml_dsa: false, slh_dsa: false, team: 'Web' },
    { domain: 'api.pnb.bank.in',    score: 41, tier: 'Legacy',   ml_kem: false, ml_dsa: false, slh_dsa: false, team: 'API' },
    { domain: 'mobile.pnb.bank.in', score: 12, tier: 'Critical', ml_kem: false, ml_dsa: false, slh_dsa: false, team: 'Mobile' },
    { domain: 'cdn.pnb.bank.in',    score: 55, tier: 'Legacy',   ml_kem: true,  ml_dsa: false, slh_dsa: false, team: 'Infra' },
  ],
};

const TIER_COLORS = { Elite: '#10b981', Standard: '#3b82f6', Legacy: '#f59e0b', Critical: '#ef4444' };

export default function PQCPosture() {
  const [data, setData] = useState(DEMO_PQC);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [liboqsRunning, setLiboqsRunning] = useState(false);

  useEffect(() => {
    api.get('/pqc').then(r => setData(r.data)).catch(() => {});
  }, []);

  const runLiboqs = async (domain) => {
    setLiboqsRunning(true);
    try { await api.post('/pqc/liboqs-test', { domain }); } catch {}
    setTimeout(() => setLiboqsRunning(false), 2000);
  };

  const s = data.summary;
  const tierData = [
    { tier: 'Elite', count: s.elite }, { tier: 'Standard', count: s.standard },
    { tier: 'Legacy', count: s.legacy }, { tier: 'Critical', count: s.critical },
  ];

  const filtered = data.assets.filter(a =>
    a.domain.toLowerCase().includes(search.toLowerCase()) ||
    a.tier.toLowerCase().includes(search.toLowerCase()) ||
    a.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {tierData.map(t => (
          <div key={t.tier} style={{ background: '#111827', borderRadius: 12, padding: '18px 20px', border: `1px solid ${TIER_COLORS[t.tier]}40` }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>{t.tier.toUpperCase()}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: TIER_COLORS[t.tier] }}>{t.count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Bar Chart */}
        <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Tier Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tierData}>
              <XAxis dataKey="tier" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0d1525', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {tierData.map((d, i) => <Cell key={i} fill={TIER_COLORS[d.tier]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* liboqs FIPS Panel */}
        <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>liboqs Test Results</div>
          {[
            { alg: 'ML-KEM-768',  fips: 'FIPS 203', pass: true  },
            { alg: 'ML-DSA-65',   fips: 'FIPS 204', pass: true  },
            { alg: 'SLH-DSA-128', fips: 'FIPS 205', pass: false },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #0d1525' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.pass ? '#10b981' : '#ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700, fontFamily: 'Space Mono,monospace' }}>{t.alg}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t.fips}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.pass ? '#10b981' : '#ef4444' }}>{t.pass ? 'PASS' : 'FAIL'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets, teams…"
        style={{ width: '100%', marginBottom: 12, padding: '9px 14px', borderRadius: 8, background: '#111827', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif' }} />

      {/* Table */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
            {['Domain','Tier','Score','ML-KEM','ML-DSA','SLH-DSA','Team'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={i} onClick={() => setSelected(a)} style={{ borderBottom: '1px solid #0d1525', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#162032'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono,monospace' }}>{a.domain}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${TIER_COLORS[a.tier]}20`, color: TIER_COLORS[a.tier] }}>{a.tier}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ height: 6, width: 60, background: '#1e2d4a', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${a.score}%`, background: TIER_COLORS[a.tier], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{a.score}</span>
                  </div>
                </td>
                {['ml_kem','ml_dsa','slh_dsa'].map(k => (
                  <td key={k} style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: a[k] ? '#10b981' : '#ef4444' }}>{a[k] ? '✓' : '✗'}</td>
                ))}
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{a.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 60, bottom: 0, width: 320, background: '#111827', borderLeft: '1px solid #1e2d4a', padding: 24, zIndex: 100, overflowY: 'auto', animation: 'slideIn 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>PQC Details</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Space Mono,monospace', marginBottom: 16, wordBreak: 'break-all' }}>{selected.domain}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['PQC Tier', selected.tier],['PQC Score', `${selected.score}/100`],['Team', selected.team],
              ['ML-KEM-768', selected.ml_kem ? '✓ PASS' : '✗ FAIL'],['ML-DSA-65', selected.ml_dsa ? '✓ PASS' : '✗ FAIL'],
              ['SLH-DSA-128', selected.slh_dsa ? '✓ PASS' : '✗ FAIL']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, color: v.startsWith('✓') ? '#10b981' : v.startsWith('✗') ? '#ef4444' : '#e2e8f0', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => runLiboqs(selected.domain)} disabled={liboqsRunning} style={{
            width: '100%', marginTop: 20, padding: '10px', borderRadius: 8,
            background: liboqsRunning ? '#1e2d4a' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: liboqsRunning ? 'not-allowed' : 'pointer',
          }}>{liboqsRunning ? 'Running liboqs…' : 'Run liboqs Tests'}</button>
        </div>
      )}
    </div>
  );
}
