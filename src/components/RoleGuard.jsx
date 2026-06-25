import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // Verifica se o usuário existe e se a role dele está na lista de permitidos
  if (!user || !allowedRoles.includes(user.role)) {
    // Redireciona para uma página inicial ou login se não tiver permissão
    return <Navigate to="/" replace />;
  }

  return children;
};