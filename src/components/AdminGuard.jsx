import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const AdminGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return children;
};