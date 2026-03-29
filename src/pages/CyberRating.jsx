import { useEffect, useState, useRef } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import api from '../api/client';

const DEMO = {
  overall_score: 755,
  grade: 'B+',
  factors: [
    { name: 'TLS Strength',       score: 82, weight: 25, subject: 82 },
    { name: 'PQC Readiness',      score: 18, weight: 25, subject: 18 },
    { name: 'Cert Management',    score: 71, weight: 20, subject: 71 },
    { name: 'Asset Coverage',     score: 90, weight: 15, subject: 90 },
    { name: 'Compliance',         score: 64, weight: 15, subject: 64 },
  ],
  history: [
    { url: 'pnb.bank.in',        score: 820, trend: '+12' },
    { url: 'api.pnb.bank.in',    score: 640, trend: '-5'  },
    { url: 'mobile.pnb.bank.in', score: 410, trend: '-28' },
    { url: 'auth.pnb.bank.in',   score: 910, trend: '+41' },
    { url: 'cdn.pnb.bank.in',    score: 710, trend: '+3'  },
  ],
};

function scoreColor(s) {
  if (s >= 800) return '#10b981';
  if (s >= 600) return '#f59e0b';
  return '#ef4444';
}

export default function CyberRating() {
  const [data, setData] = useState(DEMO);
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    api.get('/rating').then(r => setData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const target = data.overall_score;
    const dur = 1800;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setDisplayed(Math.floor(eased * target));
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [data.overall_score]);

  const col = scoreColor(data.overall_score);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Score Circle */}
        <div style={{ background: '#111827', borderRadius: 14, padding: 32, border: '1px solid #1e2d4a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 16 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="65" fill="none" stroke="#1e2d4a" strokeWidth="14"/>
              <circle cx="80" cy="80" r="65" fill="none" stroke={col} strokeWidth="14"
                strokeDasharray={`${2*Math.PI*65*(data.overall_score/1000)} ${2*Math.PI*65}`}
                strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dasharray 0.3s' }}/>
              {/* Pulse ring */}
              <circle cx="80" cy="80" r="65" fill="none" stroke={col} strokeWidth="3" opacity="0.3">
                <animate attributeName="r" values="65;78;65" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: col, fontFamily: 'Space Mono,monospace', lineHeight: 1 }}>{displayed}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>/ 1000</div>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: col }}>{data.grade}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Overall Cyber Rating</div>
        </div>

        {/* Radar + Factors */}
        <div style={{ background: '#111827', borderRadius: 14, padding: 24, border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Factor Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={data.factors}>
                <PolarGrid stroke="#1e2d4a" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="subject" stroke={col} fill={col} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              {data.factors.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{f.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(f.score * 10) }}>{f.score}</span>
                  </div>
                  <div style={{ height: 5, background: '#1e2d4a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.score}%`, background: scoreColor(f.score * 10), borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-URL Table */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a', fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Per-Asset Scores</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
            {['Asset','Score','Grade','Trend','Status'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.history.map((h, i) => {
              const hcol = scoreColor(h.score);
              const up = h.trend.startsWith('+');
              return (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontFamily: 'Space Mono,monospace' }}>{h.url}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: hcol }}>{h.score}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800, color: hcol, background: `${hcol}20` }}>
                      {h.score >= 800 ? 'A' : h.score >= 700 ? 'B+' : h.score >= 600 ? 'B' : h.score >= 500 ? 'C' : 'F'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: up ? '#10b981' : '#ef4444' }}>
                    {up ? '↑' : '↓'} {h.trend}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: hcol }}>{h.score >= 700 ? 'Good' : h.score >= 500 ? 'Needs Work' : 'Critical'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
