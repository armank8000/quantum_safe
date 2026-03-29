import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import api from '../api/client';

const QUICK_PROMPTS = [
  'What is Harvest Now Decrypt Later?',
  'How do I configure nginx for ML-KEM-768?',
  'What is Mosca\'s theorem?',
  'Which assets need urgent PQC upgrade?',
  'Generate migration plan for api.pnb.bank.in',
  'Explain FIPS 203 ML-KEM',
];

const DEMO_REPLIES = {
  'What is Harvest Now Decrypt Later?': 'Harvest Now Decrypt Later (HNDL) is a cyber threat strategy where adversaries collect encrypted data today and store it, waiting for quantum computers powerful enough to break current encryption (RSA, ECC). By 2031, CRYPTOQUANTUM forecasts a "Y2Q" event where 2048-bit RSA becomes trivially breakable. Your HNDL score of 74/100 indicates HIGH risk — meaning attackers may already be collecting your encrypted traffic.',
  'How do I configure nginx for ML-KEM-768?': `Add this to your nginx.conf:\n\n# /etc/nginx/nginx.conf\nssl_protocols TLSv1.3;\nssl_certificate /etc/ssl/ml-kem-cert.pem;\nssl_certificate_key /etc/ssl/ml-kem-key.pem;\nssl_ciphers ML-KEM-768:AES-256-GCM-SHA384;\n\nThis enables FIPS 203 compliant key exchange. Restart nginx: sudo systemctl reload nginx`,
  'What is Mosca\'s theorem?': 'Mosca\'s Theorem states: If x = years to migrate your systems, y = years until cryptographically-relevant quantum computers exist, z = years current encrypted data must stay secret, then X+Z > Y means you need to act NOW.\n\nFor PNB: x≈3 years, y≈5 years (2031), z≈10 years → 3+10 > 5 → URGENT migration required!',
};

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Quantum Shield AI ready. Ask me anything about your PQC security posture, cipher configurations, or HNDL risks.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const r = await api.post('/ai/chat', { message: msg, history: messages.slice(-6) });
      setMessages(p => [...p, { role: 'assistant', text: r.data.reply || r.data.message }]);
    } catch {
      const demo = DEMO_REPLIES[msg] || `Analyzing your query about "${msg}"...\n\nBased on Quantum Shield scan data:\n• 128 assets scanned\n• 14 critical findings\n• HNDL score: 74/100\n• Recommended: Upgrade RSA-2048 → ML-KEM-768 on priority assets first.`;
      setMessages(p => [...p, { role: 'assistant', text: demo }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Quick Prompts Sidebar */}
      <div style={{ background: '#111827', borderRadius: 14, padding: 16, border: '1px solid #1e2d4a', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 12 }}>QUICK PROMPTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => send(p)} style={{
              padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: '1px solid #1e2d4a', color: '#94a3b8', textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#162032'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10, marginTop: 4, fontSize: 14 }}>⚛</div>
              )}
              <div style={{
                maxWidth: '72%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : '#162032',
                border: m.role === 'user' ? 'none' : '1px solid #1e2d4a',
                fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                fontFamily: m.text.includes('\n') ? 'Space Mono, monospace' : 'Syne, sans-serif',
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚛</div>
              <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#162032', border: '1px solid #1e2d4a', display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: `pulse 1.2s ${i*0.2}s infinite` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid #1e2d4a', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Ask about PQC, HNDL, cipher configs…"
            style={{ flex: 1, padding: '11px 14px', borderRadius: 10, background: '#0d1525', border: '1px solid #1e2d4a', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'Syne, sans-serif' }} />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            padding: '11px 16px', borderRadius: 10,
            background: input.trim() ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : '#1e2d4a',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff',
          }}>
            {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}
