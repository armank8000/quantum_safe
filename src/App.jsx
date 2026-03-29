import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage       from './pages/LoginPage';
import Dashboard       from './pages/Dashboard';
import AssetInventory  from './pages/AssetInventory';
import Discovery       from './pages/Discovery';
import NetworkGraph    from './pages/NetworkGraph';
import CBOM            from './pages/CBOM';
import PQCPosture      from './pages/PQCPosture';
import AIRecommendations from './pages/AIRecommendations';
import CyberRating     from './pages/CyberRating';
import AIChat          from './pages/AIChat';
import Reports         from './pages/Reports';
import PQCBadge        from './pages/PQCBadge';
import Compliance      from './pages/Compliance';

const P = ({ children }) => (
  <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/"           element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"  element={<P><Dashboard /></P>} />
        <Route path="/assets"     element={<P><AssetInventory /></P>} />
        <Route path="/discovery"  element={<P><Discovery /></P>} />
        <Route path="/network"    element={<P><NetworkGraph /></P>} />
        <Route path="/cbom"       element={<P><CBOM /></P>} />
        <Route path="/pqc"        element={<P><PQCPosture /></P>} />
        <Route path="/ai-recs"    element={<P><AIRecommendations /></P>} />
        <Route path="/rating"     element={<P><CyberRating /></P>} />
        <Route path="/chat"       element={<P><AIChat /></P>} />
        <Route path="/reports"    element={<P><Reports /></P>} />
        <Route path="/badge"      element={<P><PQCBadge /></P>} />
        <Route path="/compliance" element={<P><Compliance /></P>} />
        <Route path="*"           element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
