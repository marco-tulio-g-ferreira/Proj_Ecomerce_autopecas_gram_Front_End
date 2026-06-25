import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { console.error("Erro ao processar usuário", e); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login/', { email, password });
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "E-mail ou senha incorretos." };
    }
  };

  // --- NOVA FUNÇÃO PARA ATUALIZAR O ESTADO ---
  const updateUser = (newData) => {
    // Mescla os dados novos com os dados que já existem no estado
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    // Atualiza também no localStorage para persistir após F5
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/register/', { name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Erro ao criar conta." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) return null;

  return (
    // Adicione o updateUser aqui no value
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};