import { useEffect, useState } from 'react';
import { Search, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../api/client';

const DEMO = {
  domains: [
    { subdomain: 'api.pnb.bank.in',      source: 'crt.sh',    status: 'Active',  shadow: false, discovered: '2h ago' },
    { subdomain: 'mobile.pnb.bank.in',   source: 'subfinder', status: 'Active',  shadow: false, discovered: '2h ago' },
    { subdomain: 'cdn-shadow.pnb.io',    source: 'subfinder', status: 'Unknown', shadow: true,  discovered: '4h ago' },
    { subdomain: 'internal.pnb.bank.in', source: 'crt.sh',    status: 'Active',  shadow: true,  discovered: '1d ago' },
    { subdomain: 'auth.pnb.bank.in',     source: 'dns',        status: 'Active',  shadow: false, discovered: '30m ago' },
  ],
  ssl: [
    { domain: 'pnb.bank.in',        issuer: 'DigiCert', expiry: '2026-09-01', grade: 'A+', tls: 'TLS 1.3', cipher: 'AES-256-GCM' },
    { domain: 'api.pnb.bank.in',    issuer: 'Let\'s Encrypt', expiry: '2025-04-14', grade: 'B', tls: 'TLS 1.2', cipher: 'RSA-2048' },
    { domain: 'mobile.pnb.bank.in', issuer: 'GeoTrust', expiry: '2025-04-03', grade: 'F', tls: 'TLS 1.1', cipher: 'RC4-128' },
    { domain: 'auth.pnb.bank.in',   issuer: 'DigiCert', expiry: '2026-12-01', grade: 'A', tls: 'TLS 1.3', cipher: 'ML-KEM-768' },
  ],
  ips: [
    { ip: '103.107.44.1',  ports: ['80','443','8080'], asn: 'AS9829 BSNL-NIB', location: 'Mumbai, IN', shadow: false },
    { ip: '103.107.44.2',  ports: ['443','22'],         asn: 'AS9829 BSNL-NIB', location: 'Delhi, IN',  shadow: false },
    { ip: '192.168.10.50', ports: ['3306','5432'],       asn: 'Private',         location: 'Internal',   shadow: true  },
    { ip: '103.21.58.10',  ports: ['443'],               asn: 'AS13335 Cloudflare', location: 'Anycast', shadow: false },
  ],
  software: [
    { product: 'nginx',     version: '1.18.0', type: 'Web Server', port: 443, vuln: true },
    { product: 'OpenSSH',   version: '7.4',    type: 'SSH',        port: 22,  vuln: true },
    { product: 'Apache',    version: '2.4.51', type: 'Web Server', port: 80,  vuln: false },
    { product: 'PostgreSQL',version: '13.4',   type: 'Database',   port: 5432,vuln: false },
    { product: 'Redis',     version: '6.2.1',  type: 'Cache',      port: 6379,vuln: false },
  ],
};

const GRADE_COLORS = { 'A+': '#10b981', A: '#10b981', B: '#f59e0b', C: '#f97316', F: '#ef4444' };

export default function Discovery() {
  const [tab, setTab] = useState('domains');
  const [data, setData] = useState(DEMO);
  const [search, setSearch] = useState('');
  const [filterShadow, setFilterShadow] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.get('/discovery').then(r => setData(r.data)).catch(() => {});
  }, []);

  const runPipeline = async () => {
    setRunning(true);
    try { await api.post('/discovery/run'); } catch {}
    setTimeout(() => setRunning(false), 3000);
  };

  const tabs = [
    { key: 'domains',  label: 'Domains' },
    { key: 'ssl',      label: 'SSL / TLS' },
    { key: 'ips',      label: 'IP / Subnets' },
    { key: 'software', label: 'Software' },
  ];

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, background: '#111827', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif' }} />
        </div>
        <button onClick={() => setFilterShadow(p => !p)} style={{
          padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: filterShadow ? 'rgba(249,115,22,0.15)' : 'transparent',
          border: `1px solid ${filterShadow ? '#f97316' : '#1e2d4a'}`, color: filterShadow ? '#f97316' : '#64748b',
        }}>Shadow IT Only</button>
        <button onClick={runPipeline} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <RefreshCw size={13} style={{ animation: running ? 'spin 0.8s linear infinite' : 'none' }} />
          {running ? 'Running…' : 'Run Pipeline'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid #1e2d4a', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === t.key ? '#1e3a5f' : 'transparent',
            border: 'none', color: tab === t.key ? '#3b82f6' : '#64748b',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
        {tab === 'domains' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['Subdomain','Source','Status','Shadow IT','Discovered'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.domains.filter(d =>
                (!filterShadow || d.shadow) &&
                d.subdomain.toLowerCase().includes(search.toLowerCase())
              ).map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono, monospace' }}>{d.subdomain}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#1e2d4a', color: '#94a3b8' }}>{d.source}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.status === 'Active' ? '#10b981' : '#64748b' }}>{d.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {d.shadow && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>Shadow IT</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>{d.discovered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'ssl' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['Domain','Issuer','Expiry','Grade','TLS','Cipher'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.ssl.filter(d => d.domain.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono, monospace' }}>{s.domain}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{s.issuer}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#e2e8f0', fontFamily: 'Space Mono, monospace' }}>{s.expiry}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800, color: GRADE_COLORS[s.grade] || '#64748b', background: `${GRADE_COLORS[s.grade]}20` }}>{s.grade}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>{s.tls}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace' }}>{s.cipher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'ips' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['IP Address','Open Ports','ASN','Location','Shadow IT','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.ips.filter(d =>
                (!filterShadow || d.shadow) && d.ip.includes(search)
              ).map((ip, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono, monospace' }}>{ip.ip}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ip.ports.map(p => <span key={p} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#1e2d4a', color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>{p}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{ip.asn}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{ip.location}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {ip.shadow && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>⚠ Shadow</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer' }}>✓ Confirm</button>
                      <button style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}>✗ False+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'software' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['Product','Version','Type','Port','Vulnerable','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.software.filter(s => s.product.toLowerCase().includes(search.toLowerCase())).map((sw, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{sw.product}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>{sw.version}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{sw.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>{sw.port}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {sw.vuln
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#ef4444' }}><AlertTriangle size={12}/> YES</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>✓ NO</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer' }}>✓ Confirm</button>
                      <button style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}>✗ False+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
