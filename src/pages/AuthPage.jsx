import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleInputChange = (e) => {
    if (error) setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        alert("Conta criada com sucesso! Você já pode fazer login.");
        setIsLogin(true);
        setLoading(false);
        return;
      }
    }

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Erro na operação. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
            <Settings size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Auto<span className="text-orange-500">Peças</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isLogin ? "Entre para acessar o sistema" : "Crie sua conta para começar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg text-center">
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5 overflow-hidden"
              >
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  required={!isLogin}
                  value={formData.name}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  placeholder="Seu nome"
                  onChange={handleInputChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
              placeholder="exemplo@email.com"
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
              placeholder="••••••••"
              onChange={handleInputChange}
            />
          </div>

          <motion.button
            whileHover={{ scale: !loading ? 1.01 : 1 }}
            whileTap={{ scale: !loading ? 0.99 : 1 }}
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-md shadow-orange-500/20 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Entrar na plataforma" : "Criar minha conta")}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-bold transition-colors"
          >
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já possui uma conta? Faça login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}