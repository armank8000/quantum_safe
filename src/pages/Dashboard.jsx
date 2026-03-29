import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Shield, AlertTriangle, Clock, Lock, Activity, Cpu } from 'lucide-react';
import api from '../api/client';
import SkeletonLoader from '../components/SkeletonLoader';

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_STATS = {
  total_assets: 128, critical: 14, expiring_certs: 7,
  pqc_ready: 23, vulnerabilities: 41, quantum_days: 1826,
};
const DEMO_RISK = [
  { level: 'Critical', count: 14 }, { level: 'High', count: 27 },
  { level: 'Medium', count: 38 }, { level: 'Low', count: 49 },
];
const DEMO_TYPES = [
  { name: 'Web App', value: 48 }, { name: 'API', value: 32 },
  { name: 'Database', value: 18 }, { name: 'Server', value: 30 },
];
const DEMO_ACTIVITY = [
  { time: '09:12', event: 'TLS scan completed', target: 'pnb.bank.in', severity: 'info' },
  { time: '09:08', event: 'Weak cipher detected', target: 'api.pnb.bank.in', severity: 'high' },
  { time: '08:55', event: 'Certificate expiry alert', target: 'mobile.pnb.bank.in', severity: 'medium' },
  { time: '08:40', event: 'New subdomain found', target: 'cdn.pnb.bank.in', severity: 'info' },
  { time: '08:20', event: 'RSA-2048 flagged', target: 'auth.pnb.bank.in', severity: 'critical' },
];
const DEMO_CERTS = [
  { domain: 'pnb.bank.in', days: 92, grade: 'A+' },
  { domain: 'api.pnb.bank.in', days: 14, grade: 'B' },
  { domain: 'mobile.pnb.bank.in', days: 6, grade: 'F' },
  { domain: 'auth.pnb.bank.in', days: 180, grade: 'A' },
];
const PIE_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b'];
// ─────────────────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
}

function KPICard({ icon: Icon, label, value, sub, color = '#3b82f6', animTarget }) {
  const displayed = useCountUp(animTarget || 0);
  return (
    <div style={{
      background: '#111827', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #1e2d4a', animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
        {animTarget ? displayed.toLocaleString() : value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const SEV_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', info: '#3b82f6' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [risk, setRisk] = useState(DEMO_RISK);
  const [types, setTypes] = useState(DEMO_TYPES);
  const [activity, setActivity] = useState(DEMO_ACTIVITY);
  const [certs, setCerts] = useState(DEMO_CERTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
        ]);
        setStats(s.data);
        if (a.data.activity) setActivity(a.data.activity);
        if (a.data.risk_distribution) setRisk(a.data.risk_distribution);
        if (a.data.asset_types) setTypes(a.data.asset_types);
        if (a.data.cert_expiry) setCerts(a.data.cert_expiry);
      } catch {
        setStats(DEMO_STATS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonLoader type="kpi" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SkeletonLoader type="chart" />
        <SkeletonLoader type="chart" />
      </div>
    </div>
  );

  const s = stats || DEMO_STATS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <KPICard icon={Shield}        label="TOTAL ASSETS"        animTarget={s.total_assets}    color="#3b82f6" />
        <KPICard icon={AlertTriangle} label="CRITICAL FINDINGS"   animTarget={s.critical}        color="#ef4444" />
        <KPICard icon={Clock}         label="EXPIRING CERTS"      animTarget={s.expiring_certs}  color="#f59e0b" sub="Next 30 days" />
        <KPICard icon={Lock}          label="PQC READY ASSETS"    animTarget={s.pqc_ready}       color="#10b981" />
        <KPICard icon={Activity}      label="VULNERABILITIES"     animTarget={s.vulnerabilities} color="#f97316" />
        <KPICard icon={Cpu}           label="DAYS TO QUANTUM"     animTarget={s.quantum_days}    color="#8b5cf6" sub="2031 threat year" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Risk Bar Chart */}
        <div style={{ background: '#111827', borderRadius: 14, padding: '20px', border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Risk Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={risk}>
              <XAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0d1525', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {risk.map((_, i) => (
                  <Cell key={i} fill={['#ef4444','#f97316','#f59e0b','#10b981'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Type Pie */}
        <div style={{ background: '#111827', borderRadius: 14, padding: '20px', border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Asset Types</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={types} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {types.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {types.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{t.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Activity Feed */}
        <div style={{ background: '#111827', borderRadius: 14, padding: '20px', border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Live Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #0d1525' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: SEV_COLORS[a.severity] || '#64748b' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{a.event}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{a.target}</div>
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontFamily: 'Space Mono, monospace' }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cert Expiry */}
        <div style={{ background: '#111827', borderRadius: 14, padding: '20px', border: '1px solid #1e2d4a' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Certificate Expiry</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {certs.map((c, i) => {
              const pct = Math.min((c.days / 365) * 100, 100);
              const col = c.days < 30 ? '#ef4444' : c.days < 90 ? '#f59e0b' : '#10b981';
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.domain}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{c.days}d</span>
                  </div>
                  <div style={{ height: 6, background: '#1e2d4a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 1s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
