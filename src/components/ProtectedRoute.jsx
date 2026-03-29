import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/authHelper';

export default function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
