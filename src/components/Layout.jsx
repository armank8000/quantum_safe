import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ marginTop: 60, padding: 24, flex: 1, minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
