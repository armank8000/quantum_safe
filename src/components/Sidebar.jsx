import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Server, Search, Layers, Shield,
  Star, MessageSquare, FileText, Award, CheckSquare,
  Network, Cpu, LogOut
} from 'lucide-react';
import { removeToken } from '../utils/authHelper';
import { useNavigate } from 'react-router-dom';

const NAV = [
  { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/assets',         icon: Server,          label: 'Assets' },
  { path: '/discovery',      icon: Search,          label: 'Discovery' },
  { path: '/network',        icon: Network,         label: 'Network Graph' },
  { path: '/cbom',           icon: Layers,          label: 'CBOM' },
  { path: '/pqc',            icon: Shield,          label: 'PQC Posture' },
  { path: '/ai-recs',        icon: Cpu,             label: 'AI Recs' },
  { path: '/rating',         icon: Star,            label: 'Cyber Rating' },
  { path: '/chat',           icon: MessageSquare,   label: 'AI Chat' },
  { path: '/reports',        icon: FileText,        label: 'Reports' },
  { path: '/badge',          icon: Award,           label: 'PQC Badge' },
  { path: '/compliance',     icon: CheckSquare,     label: 'Compliance' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f1623 0%, #0a0e1a 100%)',
      borderRight: '1px solid #1e2d4a',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e2d4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0
          }}>⚛</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.05em', color: '#f1f5f9' }}>QUANTUM</div>
            <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.15em', color: '#ef4444' }}>SHIELD</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, marginBottom: 2,
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            color: isActive ? '#f1f5f9' : '#64748b',
            background: isActive ? 'linear-gradient(90deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))' : 'transparent',
            borderLeft: isActive ? '2px solid #ef4444' : '2px solid transparent',
            transition: 'all 0.15s',
          })}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e2d4a' }}>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#64748b', fontSize: 13, fontWeight: 600,
        }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
