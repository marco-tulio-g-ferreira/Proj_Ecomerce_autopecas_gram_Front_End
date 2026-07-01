import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ImportProvider } from './context/ImportContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import api from './api';

// Otimização: Lazy Loading para carregar componentes apenas quando necessário
const CatalogWrapper = lazy(() => import('./pages/CatalogWrapper'));
const PdvWrapper = lazy(() => import('./pages/PdvWrapper'));
const AdminWrapper = lazy(() => import('./pages/AdminWrapper'));
const Profile = lazy(() => import('./pages/Profile'));

// Criação do cliente de cache para o React Query
const queryClient = new QueryClient();

function AppContent() {
  
  useEffect(() => {
    // Mantém o servidor Render ativo ("Cold Start")
    api.get('/categories/').catch(() => {});
  }, []);

  return (
    // Suspense mostra um fallback enquanto o componente lazy carrega
    <Suspense fallback={<div className="loading-spinner">Carregando...</div>}>
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
    </Suspense>
  );
}

export default function App() { 
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ImportProvider>
            <AppContent />
          </ImportProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}