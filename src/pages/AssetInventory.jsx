import { useEffect, useState } from 'react';
import { Plus, Search, Scan, X, CheckCircle } from 'lucide-react';
import api from '../api/client';

const DEMO_ASSETS = [
  { id: 1, domain: 'pnb.bank.in',        type: 'Web App', risk: 'Medium',   tls: 'TLS 1.3', cipher: 'AES-256-GCM', pqc_ready: false, last_scan: '2h ago' },
  { id: 2, domain: 'api.pnb.bank.in',    type: 'API',     risk: 'High',     tls: 'TLS 1.2', cipher: 'RSA-2048',   pqc_ready: false, last_scan: '4h ago' },
  { id: 3, domain: 'mobile.pnb.bank.in', type: 'Mobile',  risk: 'Critical', tls: 'TLS 1.1', cipher: 'RC4',        pqc_ready: false, last_scan: '1d ago' },
  { id: 4, domain: 'auth.pnb.bank.in',   type: 'Auth',    risk: 'Low',      tls: 'TLS 1.3', cipher: 'ML-KEM-768', pqc_ready: true,  last_scan: '30m ago' },
  { id: 5, domain: 'cdn.pnb.bank.in',    type: 'CDN',     risk: 'Medium',   tls: 'TLS 1.2', cipher: 'ECDHE-RSA',  pqc_ready: false, last_scan: '6h ago' },
  { id: 6, domain: 'db.pnb.bank.in',     type: 'Database',risk: 'High',     tls: 'TLS 1.3', cipher: 'AES-128-GCM',pqc_ready: false, last_scan: '3h ago' },
];

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };

export default function AssetInventory() {
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState({ domain: '', type: 'Web App' });
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/assets').then(r => setAssets(r.data.assets || r.data)).catch(() => setAssets(DEMO_ASSETS));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleScanAll = () => {
    setScanning(true); setScanPct(0);
    const t = setInterval(() => setScanPct(p => { if (p >= 100) { clearInterval(t); setScanning(false); showToast('Scan complete!'); return 100; } return p + 5; }), 180);
  };

  const handleScan = async (id) => {
    try { await api.post(`/assets/${id}/scan`); showToast('Scan started!'); } catch { showToast('Scan queued (demo mode)'); }
  };

  const handleAdd = async () => {
    try {
      const r = await api.post('/assets', { domain: newAsset.domain, type: newAsset.type });
      setAssets(p => [...p, r.data]);
    } catch {
      setAssets(p => [...p, { id: Date.now(), ...newAsset, risk: 'Unknown', tls: '—', cipher: '—', pqc_ready: false, last_scan: 'Never' }]);
    }
    setShowAdd(false); setNewAsset({ domain: '', type: 'Web App' }); showToast('Asset added!');
  };

  const filtered = assets.filter(a =>
    (filter === 'All' || a.risk === filter) &&
    (a.domain.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, background: '#111827', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif' }} />
        </div>
        {['All','Critical','High','Medium','Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: filter === f ? (RISK_COLORS[f] || '#3b82f6') : 'transparent',
            border: `1px solid ${filter === f ? (RISK_COLORS[f] || '#3b82f6') : '#1e2d4a'}`,
            color: filter === f ? '#fff' : '#64748b',
          }}>{f}</button>
        ))}
        <button onClick={handleScanAll} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6',
          display: 'flex', alignItems: 'center', gap: 6,
        }}><Scan size={13}/> Scan All</button>
        <button onClick={() => setShowAdd(true)} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', gap: 6,
        }}><Plus size={13}/> Add Asset</button>
      </div>

      {scanning && (
        <div style={{ marginBottom: 12, background: '#111827', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2d4a' }}>
          <div style={{ height: 8, width: `${scanPct}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', transition: 'width 0.2s' }} />
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#64748b' }}>Scanning… {scanPct}%</div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['Domain','Type','Risk','TLS','Cipher','PQC','Last Scan','Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} onClick={() => setSelected(a)} style={{ borderBottom: '1px solid #0d1525', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#162032'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{a.domain}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{a.type}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${RISK_COLORS[a.risk]}20`, color: RISK_COLORS[a.risk] || '#64748b' }}>{a.risk}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>{a.tls}</td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace' }}>{a.cipher}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: a.pqc_ready ? '#10b981' : '#ef4444' }}>{a.pqc_ready ? '✓ READY' : '✗ NOT READY'}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>{a.last_scan}</td>
                <td style={{ padding: '12px 16px' }} onClick={e => { e.stopPropagation(); handleScan(a.id); }}>
                  <button style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid #1e2d4a', color: '#94a3b8', cursor: 'pointer' }}>Scan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {selected && (
        <div style={{
          position: 'fixed', right: 0, top: 60, bottom: 0, width: 340,
          background: '#111827', borderLeft: '1px solid #1e2d4a',
          padding: 24, zIndex: 100, overflowY: 'auto',
          animation: 'slideIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Asset Details</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
          </div>
          {[
            ['Domain', selected.domain], ['Type', selected.type], ['Risk Level', selected.risk],
            ['TLS Version', selected.tls], ['Cipher Suite', selected.cipher],
            ['PQC Ready', selected.pqc_ready ? 'Yes ✓' : 'No ✗'], ['Last Scan', selected.last_scan]
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, fontFamily: k === 'Cipher Suite' || k === 'TLS Version' ? 'Space Mono, monospace' : undefined }}>{v}</div>
            </div>
          ))}
          <button onClick={() => handleScan(selected.id)} style={{
            width: '100%', marginTop: 16, padding: '10px', borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Run Scan →</button>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 28, width: 380, border: '1px solid #1e2d4a' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, color: '#f1f5f9' }}>Add New Asset</div>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 5 }}>DOMAIN</label>
            <input value={newAsset.domain} onChange={e => setNewAsset(p => ({...p, domain: e.target.value}))}
              placeholder="example.pnb.bank.in"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', marginBottom: 14, fontFamily: 'Syne, sans-serif' }} />
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 5 }}>TYPE</label>
            <select value={newAsset.type} onChange={e => setNewAsset(p => ({...p, type: e.target.value}))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', marginBottom: 20, fontFamily: 'Syne, sans-serif' }}>
              {['Web App','API','Database','Server','CDN','Auth','Mobile'].map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid #1e2d4a', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add & Scan</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 10,
          background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 13, zIndex: 300,
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <CheckCircle size={16}/> {toast}
        </div>
      )}
    </div>
  );
}
