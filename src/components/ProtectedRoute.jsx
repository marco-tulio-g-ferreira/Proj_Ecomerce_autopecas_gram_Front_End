import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Ou um spinner de carregamento

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};