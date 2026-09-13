import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <Loading />;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
