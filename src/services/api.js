import axios from 'axios';

// Usamos a variável de ambiente se existir, caso contrário assume /api/ (padrão local)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/', 
});

// Interceptor de Requisição: Adiciona o Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Lida com erros globais (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend disser que o usuário não está autenticado, limpa o token e redireciona
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;