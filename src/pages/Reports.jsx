import { useState } from 'react';
import { FileText, Download, Clock, Zap, BarChart2 } from 'lucide-react';
import api from '../api/client';

const DEMO_REPORTS = [
  { id: 1, name: 'Executive Summary — Mar 2026', type: 'Executive', format: 'PDF', generated: '2h ago', size: '2.4 MB' },
  { id: 2, name: 'Weekly Scan Report — Wk 12', type: 'Scheduled', format: 'Excel', generated: '1d ago', size: '1.1 MB' },
  { id: 3, name: 'CBOM Full Dump', type: 'On-Demand', format: 'JSON', generated: '3d ago', size: '0.8 MB' },
  { id: 4, name: 'PQC Posture Assessment', type: 'On-Demand', format: 'PDF', generated: '5d ago', size: '3.2 MB' },
];

const REPORT_TYPES = [
  { icon: BarChart2, label: 'Executive Summary', desc: 'High-level KPIs, risk overview, CISO-ready', color: '#3b82f6' },
  { icon: Clock, label: 'Scheduled Report', desc: 'Auto-generated weekly/monthly delivery', color: '#8b5cf6' },
  { icon: Zap, label: 'On-Demand Report', desc: 'Generate instantly for any asset or module', color: '#f59e0b' },
];

export default function Reports() {
  const [format, setFormat] = useState('PDF');
  const [schedule, setSchedule] = useState(false);
  const [freq, setFreq] = useState('weekly');
  const [history] = useState(DEMO_REPORTS);
  const [generating, setGenerating] = useState(false);

  const generate = async (type) => {
    setGenerating(true);
    try {
      const r = await api.post('/reports/generate', { type, format });
      if (r.data.download_url) window.open(r.data.download_url);
      else alert('Report generation queued! (Demo mode)');
    } catch {
      setTimeout(() => alert(`${type} report (${format}) would download here in production.`), 800);
    } finally {
      setTimeout(() => setGenerating(false), 1500);
    }
  };

  const download = async (id) => {
    try {
      const r = await api.get(`/reports/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a'); a.href = url; a.download = `report_${id}.pdf`; a.click();
    } catch { alert('Download would start here in production.'); }
  };

  return (
    <div>
      {/* Report type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {REPORT_TYPES.map(rt => (
          <div key={rt.label} style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rt.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <rt.icon size={20} color={rt.color} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9', marginBottom: 6 }}>{rt.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>{rt.desc}</div>

            {/* Format Toggle */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {['PDF','Excel','JSON'].map(f => (
                <button key={f} onClick={() => setFormat(f)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: format === f ? rt.color : 'transparent', border: `1px solid ${format === f ? rt.color : '#1e2d4a'}`,
                  color: format === f ? '#fff' : '#64748b',
                }}>{f}</button>
              ))}
            </div>

            <button onClick={() => generate(rt.label)} disabled={generating} style={{
              width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: `linear-gradient(135deg, ${rt.color}, ${rt.color}cc)`, border: 'none', color: '#fff',
              opacity: generating ? 0.6 : 1,
            }}>{generating ? 'Generating…' : `Generate ${format} →`}</button>
          </div>
        ))}
      </div>

      {/* Scheduled settings */}
      <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e2d4a', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', flex: 1 }}>Scheduled Delivery</div>
          <button onClick={() => setSchedule(p => !p)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: schedule ? '#10b981' : '#1e2d4a', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 3, left: schedule ? 22 : 4, transition: 'left 0.2s' }} />
          </button>
        </div>
        {schedule && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['daily','weekly','monthly'].map(f => (
              <button key={f} onClick={() => setFreq(f)} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: freq === f ? 'rgba(139,92,246,0.15)' : 'transparent',
                border: `1px solid ${freq === f ? '#8b5cf6' : '#1e2d4a'}`, color: freq === f ? '#8b5cf6' : '#64748b',
                textTransform: 'capitalize',
              }}>{f}</button>
            ))}
            <button onClick={() => api.post('/reports/schedule', { frequency: freq, format }).catch(() => alert('Schedule saved! (Demo)'))} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff',
            }}>Save Schedule</button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a', fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Report History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
            {['Report Name','Type','Format','Generated','Size','Action'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {history.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #0d1525' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} color="#64748b" /> {r.name}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{r.type}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#1e2d4a', color: '#94a3b8' }}>{r.format}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{r.generated}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontFamily: 'Space Mono,monospace' }}>{r.size}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => download(r.id)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}><Download size={11}/> Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
