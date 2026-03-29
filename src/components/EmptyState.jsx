import { Server, Search, Shield, FileText, Award } from 'lucide-react';

const CONFIGS = {
  assets:     { icon: Server,    title: 'No Assets Found',         desc: 'Add your first asset to start scanning.' },
  discovery:  { icon: Search,    title: 'No Results',              desc: 'Run a discovery scan to find assets.' },
  pqc:        { icon: Shield,    title: 'No PQC Data',             desc: 'Run liboqs tests to populate this view.' },
  reports:    { icon: FileText,  title: 'No Reports Generated',    desc: 'Generate your first security report.' },
  badges:     { icon: Award,     title: 'No Badges Issued',        desc: 'Issue a PQC badge to a qualifying asset.' },
  default:    { icon: Server,    title: 'No Data',                 desc: 'Nothing to show here yet.' },
};

export default function EmptyState({ type = 'default', onAction, actionLabel = 'Get Started' }) {
  const { icon: Icon, title, desc } = CONFIGS[type] || CONFIGS.default;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color="#ef4444" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b', maxWidth: 280 }}>{desc}</div>
      {onAction && (
        <button onClick={onAction} style={{
          marginTop: 8, padding: '9px 20px', borderRadius: 8,
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>{actionLabel}</button>
      )}
    </div>
  );
}
