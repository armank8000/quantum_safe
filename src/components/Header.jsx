import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { getUser } from '../utils/authHelper';

const TITLES = {
  '/dashboard':  'Dashboard',
  '/assets':     'Asset Inventory',
  '/discovery':  'Asset Discovery',
  '/network':    'Network Graph',
  '/cbom':       'CBOM Analysis',
  '/pqc':        'PQC Posture',
  '/ai-recs':    'AI Recommendations',
  '/rating':     'Cyber Rating',
  '/chat':       'AI Chat',
  '/reports':    'Reports',
  '/badge':      'PQC Badge',
  '/compliance': 'Compliance',
};

export default function Header() {
  const loc = useLocation();
  const user = getUser();
  const title = TITLES[loc.pathname] || 'Quantum Shield';

  return (
    <header style={{
      height: 60,
      background: '#0f1623',
      borderBottom: '1px solid #1e2d4a',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between',
      position: 'fixed', top: 0, left: 220, right: 0, zIndex: 40,
    }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9', letterSpacing: '0.02em' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="#64748b" />
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444', border: '1.5px solid #0f1623'
          }}/>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', borderRadius: 20,
          background: '#1e2d4a', cursor: 'pointer'
        }}>
          <User size={14} color="#94a3b8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
