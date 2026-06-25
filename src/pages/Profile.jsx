import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Lock, Check, X, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isPasswordMode, setIsPasswordMode] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('profile/update/', formData);
      if (updateUser) updateUser(response.data);
      setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });
    } catch (err) {
      setMessage({ text: "Erro ao atualizar perfil.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      await api.post('change-password/', { password: newPassword });
      setMessage({ text: "Senha alterada com sucesso!", type: "success" });
      setIsPasswordMode(false);
      setNewPassword("");
    } catch (err) {
      setMessage({ text: "Erro ao alterar senha.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="mb-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Meu Perfil</h2>
          <p className="text-slate-500 dark:text-slate-400">Gerencie suas credenciais e informações</p>
        </div>

        {/* Card de Informações */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
                <User size={40} />
              </div>
              <div>
                <h3 className="font-bold text-xl dark:text-white">{user?.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
              {message.text && (
                <span className={`${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'} text-sm font-bold flex items-center gap-1`}>
                  {message.type === 'success' ? <Check size={16}/> : <X size={16}/>} {message.text}
                </span>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Card de Segurança */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-500">
              <Shield size={20} />
            </div>
            <h3 className="font-bold dark:text-white text-lg">Segurança</h3>
          </div>
          
          <AnimatePresence mode="wait">
            {!isPasswordMode ? (
              <button 
                onClick={() => setIsPasswordMode(true)} 
                className="w-full text-left py-3 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-all font-medium"
              >
                Alterar senha de acesso
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Digite a nova senha" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors" onClick={handleSavePassword}>Confirmar</button>
                  <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => setIsPasswordMode(false)}>Cancelar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}