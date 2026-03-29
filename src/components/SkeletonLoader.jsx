const shimmer = {
  background: 'linear-gradient(90deg, #1e2d4a 25%, #243550 50%, #1e2d4a 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 6,
};

// Add shimmer keyframe once
if (!document.getElementById('shimmer-style')) {
  const s = document.createElement('style');
  s.id = 'shimmer-style';
  s.textContent = '@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }';
  document.head.appendChild(s);
}

function Bone({ w = '100%', h = 16, mb = 8, borderRadius = 6 }) {
  return <div style={{ ...shimmer, width: w, height: h, marginBottom: mb, borderRadius }} />;
}

export default function SkeletonLoader({ type = 'table', rows = 5 }) {
  if (type === 'kpi') return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#111827', borderRadius: 12, padding: 20, border: '1px solid #1e2d4a' }}>
          <Bone w="60%" h={12} mb={12} />
          <Bone w="40%" h={28} mb={8} />
          <Bone w="50%" h={10} />
        </div>
      ))}
    </div>
  );

  if (type === 'chart') return (
    <div style={{ background: '#111827', borderRadius: 12, padding: 20, border: '1px solid #1e2d4a' }}>
      <Bone w="30%" h={18} mb={20} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {[60,90,45,110,70,95,55].map((h, i) => (
          <div key={i} style={{ ...shimmer, flex: 1, height: h, borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a' }}>
        <Bone w="25%" h={16} mb={0} />
      </div>
      <div style={{ padding: '0 20px' }}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid #0d1525' }}>
            <Bone w="22%" h={12} mb={0} />
            <Bone w="18%" h={12} mb={0} />
            <Bone w="30%" h={12} mb={0} />
            <Bone w="15%" h={12} mb={0} />
          </div>
        ))}
      </div>
    </div>
  );
}
