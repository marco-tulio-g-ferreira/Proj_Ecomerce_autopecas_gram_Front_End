import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ImportProvider } from './context/ImportContext'; // Importe aqui
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import CatalogWrapper from './pages/CatalogWrapper'; 
import PdvWrapper from "./pages/PdvWrapper";
import AdminWrapper from "./pages/AdminWrapper";
import Profile from './pages/Profile';

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} /> 
      
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<CatalogWrapper />} />
              <Route path="/perfil" element={<Profile />} />
              
              <Route path="/pdv" element={
                <RoleGuard allowedRoles={['caixa', 'admin']}>
                  <PdvWrapper />
                </RoleGuard>
              } />
              
              <Route path="/admin/*" element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminWrapper />
                </RoleGuard>
              } />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() { 
  return (
    <Router>
      <AuthProvider>
        <ImportProvider> {/* Envolvendo toda a aplicação */}
            <AppContent />
        </ImportProvider>
      </AuthProvider>
    </Router>
  );
}