import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api from '../api/client';

const RBI_CHECKS = [
  { id: 'rbi-1', title: 'Encryption Standards Compliance', status: 'PASS', detail: 'TLS 1.3 deployed on 68% of assets. AES-256 used for data at rest.' },
  { id: 'rbi-2', title: 'Patch Management Policy', status: 'PARTIAL', detail: '14 servers running outdated OpenSSH 7.4. Patch window scheduled.' },
  { id: 'rbi-3', title: 'Certificate Lifecycle Management', status: 'FAIL', detail: '3 certificates expiring within 30 days. Immediate renewal required.' },
  { id: 'rbi-4', title: 'Network Segmentation Controls', status: 'PASS', detail: 'DMZ, internal, and external zones properly segregated.' },
  { id: 'rbi-5', title: 'Incident Response Plan', status: 'PARTIAL', detail: 'IRP documented but last tested 18 months ago. Update required.' },
  { id: 'rbi-6', title: 'Third Party Risk Assessment', status: 'PASS', detail: 'All 12 vendor APIs audited for TLS compliance.' },
  { id: 'rbi-7', title: 'Quantum-Resilient Cryptography Roadmap', status: 'PARTIAL', detail: 'Roadmap exists; migration 23% complete. Accelerate ML-KEM deployment.' },
  { id: 'rbi-8', title: 'Audit Logging & SIEM', status: 'PASS', detail: 'All critical assets logging to centralized SIEM with 90-day retention.' },
];

const CERTIN_CHECKS = [
  { id: 'ci-1', title: 'Mandatory Reporting (6h window)', status: 'PASS', detail: 'Incident reporting pipeline configured and tested.' },
  { id: 'ci-2', title: 'Log Retention (180 days)', status: 'PARTIAL', detail: 'Some systems have 90-day retention. Needs update to 180 days.' },
  { id: 'ci-3', title: 'VPN & Remote Access Security', status: 'PASS', detail: 'MFA enforced on all remote access endpoints.' },
  { id: 'ci-4', title: 'Vulnerability Assessment Frequency', status: 'PASS', detail: 'Monthly automated scans active. Quarterly penetration tests.' },
  { id: 'ci-5', title: 'Data Localisation Compliance', status: 'PASS', detail: 'All PII data stored within India geography.' },
  { id: 'ci-6', title: 'Cybersecurity Audit (Annual)', status: 'FAIL', detail: 'Annual audit overdue by 2 months. Schedule immediately.' },
];

const STATUS_COLORS = { PASS: '#10b981', PARTIAL: '#f59e0b', FAIL: '#ef4444' };

function CheckList({ items }) {
  const [open, setOpen] = useState({});
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(item => (
        <div key={item.id} style={{ background: '#0d1525', borderRadius: 10, border: `1px solid ${STATUS_COLORS[item.status]}30`, overflow: 'hidden' }}>
          <div onClick={() => setOpen(p => ({...p, [item.id]: !p[item.id]}))} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
          }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status], flexShrink: 0 }}>{item.status}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.title}</span>
            {open[item.id] ? <ChevronDown size={14} color="#64748b"/> : <ChevronRight size={14} color="#64748b"/>}
          </div>
          {open[item.id] && (
            <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6, borderTop: '1px solid #1e2d4a' }}>
              <div style={{ paddingTop: 10 }}>{item.detail}</div>
              {item.status !== 'PASS' && (
                <button onClick={() => api.post('/compliance/fix', { check_id: item.id }).catch(() => {})} style={{
                  marginTop: 10, padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#fff',
                }}>Create Fix Task</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Compliance() {
  const [tab, setTab] = useState('rbi');

  const score = (checks) => Math.round((checks.filter(c => c.status === 'PASS').length / checks.length) * 100);
  const rbiScore = score(RBI_CHECKS);
  const certinScore = score(CERTIN_CHECKS);

  const exportPDF = async (framework) => {
    try { await api.post('/compliance/export', { framework, format: 'PDF' }); }
    catch { alert(`${framework} compliance report PDF would download here in production.`); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid #1e2d4a', width: 'fit-content' }}>
        {[['rbi','RBI Framework'],['certin','CERT-In'],['summary','Summary']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === k ? '#1e3a5f' : 'transparent', border: 'none', color: tab === k ? '#3b82f6' : '#64748b',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'rbi' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>RBI Master Direction on IT — Compliance Score: <span style={{ color: '#10b981', fontWeight: 800 }}>{rbiScore}%</span></div>
            <button onClick={() => exportPDF('RBI')} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6' }}>⬇ Export PDF</button>
          </div>
          <CheckList items={RBI_CHECKS} />
        </div>
      )}

      {tab === 'certin' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>CERT-In Direction 2022 — Compliance Score: <span style={{ color: '#f59e0b', fontWeight: 800 }}>{certinScore}%</span></div>
            <button onClick={() => exportPDF('CERT-In')} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6' }}>⬇ Export PDF</button>
          </div>
          <CheckList items={CERTIN_CHECKS} />
        </div>
      )}

      {tab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'RBI', score: rbiScore, checks: RBI_CHECKS },{ label: 'CERT-In', score: certinScore, checks: CERTIN_CHECKS }].map(fw => (
            <div key={fw.label} style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 16 }}>{fw.label} Framework</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2d4a" strokeWidth="8"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke={fw.score >= 70 ? '#10b981' : '#f59e0b'} strokeWidth="8"
                      strokeDasharray={`${2*Math.PI*32*fw.score/100} ${2*Math.PI*32}`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: fw.score >= 70 ? '#10b981' : '#f59e0b' }}>{fw.score}%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['PASS','PARTIAL','FAIL'].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }}/>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{s}: {fw.checks.filter(c => c.status === s).length}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {fw.checks.filter(c => c.status !== 'PASS').map(c => (
                  <div key={c.id} style={{ padding: '8px 12px', borderRadius: 8, background: '#0d1525', border: `1px solid ${STATUS_COLORS[c.status]}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[c.status] }}>{c.status}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
