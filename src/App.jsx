import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { ImportProvider } from './context/ImportContext';

// Componentes
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import Layout from './components/Layout';

// Páginas (Verifique se estes nomes coincidem exatamente com seus arquivos em src/pages/)
import AuthPage from './pages/AuthPage';
import CatalogWrapper from './pages/CatalogWrapper'; 
import PdvWrapper from './pages/PdvWrapper';
import AdminWrapper from './pages/AdminWrapper';
import Profile from './pages/Profile';

// API
import api from './api';

// Configuração do React Query para gerenciar cache e evitar recarregamentos
const queryClient = new QueryClient();

function AppContent() {
  
  useEffect(() => {
    // Mantém o servidor Render ativo
    api.get('/categories/').catch(() => {});
  }, []);

  return (
    <Routes>
      {/* Rota de Login acessível a todos */}
      <Route path="/login" element={<AuthPage />} /> 
      
      {/* Rotas protegidas */}
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