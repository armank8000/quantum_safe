import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Loader } from 'lucide-react';
import api from '../api/client';
import { saveToken, saveUser } from '../utils/authHelper';

// DEMO fallback if backend is not connected
const DEMO = { email: 'hackathon_user@pnb.bank.in', password: 'password123' };

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      saveToken(res.data.access_token);
      saveUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      // Demo mode fallback
      if (form.email === DEMO.email && form.password === DEMO.password) {
        saveToken('demo_jwt_token_quantum_shield');
        saveUser({ name: 'Demo User', email: DEMO.email, role: 'admin' });
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.detail || 'Invalid credentials. Try demo credentials below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fill = () => setForm(DEMO);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.08) 0%, #0a0e1a 60%)',
    }}>
      {/* Grid lines decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(30,45,74,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,74,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}/>

      <div style={{
        width: 420, padding: '40px 36px', borderRadius: 20,
        background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(20px)',
        border: '1px solid #1e2d4a',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.1)',
        position: 'relative', zIndex: 1,
        animation: 'fadeIn 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
          }}>⚛</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#f1f5f9', letterSpacing: '0.06em' }}>QUANTUM SHIELD</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Post-Quantum Security Platform</div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 16,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', fontSize: 13,
          }}>{error}</div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.05em' }}>
              EMAIL
            </label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="user@pnb.bank.in"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                background: '#0d1525', border: '1px solid #1e2d4a',
                color: '#e2e8f0', fontSize: 14, outline: 'none',
                fontFamily: 'Syne, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.05em' }}>
              PASSWORD
            </label>
            <input
              type={showPw ? 'text' : 'password'} required value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
                background: '#0d1525', border: '1px solid #1e2d4a',
                color: '#e2e8f0', fontSize: 14, outline: 'none',
                fontFamily: 'Syne, sans-serif',
              }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{
              position: 'absolute', right: 12, bottom: 11,
              background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
            }}>
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: '0.04em',
          }}>
            {loading ? <><Loader size={16} className="spin" /> Signing In…</> : 'SIGN IN →'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={fill} style={{
            background: 'none', border: 'none', color: '#64748b',
            fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
          }}>
            Use demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}
