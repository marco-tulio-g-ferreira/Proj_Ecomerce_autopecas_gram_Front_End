import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function useThemeObserver() {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function ImportProducts({ onRefresh }) {
  const isDark = useThemeObserver();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState({ progress: 0, message: "Aguardando..." });
  const [error, setError] = useState("");
  
  const [revisoes, setRevisoes] = useState([]);
  const [loadingRevisoes, setLoadingRevisoes] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState({});

  const fileInputRef = useRef(null);

  const fetchRevisoes = async () => {
    try {
      const res = await api.get("/revisao/");
      // Ajuste: verifica se é array, se não, tenta acessar .results ou .items
      const data = Array.isArray(res.data) ? res.data : (res.data.results || res.data.items || []);
      setRevisoes(data);
    } catch (err) {
      console.error("Erro ao carregar revisões:", err);
    }
  };

  // 1. Efeito apenas para carregar a lista inicial
  useEffect(() => {
    fetchRevisoes();
  }, []);

  // 2. Efeito apenas para monitorar o progresso da tarefa
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/import/?task_id=${taskId}`);
        const data = response.data;
        
        setStatus({
          progress: data.progress || 0,
          message: data.message || "Processando..."
        });

        if (data.progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setTaskId(null);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          fetchRevisoes(); 
          if (onRefresh) setTimeout(() => onRefresh(), 500);
        }
      } catch (err) {
        clearInterval(interval);
        setUploading(false);
        setError("Erro ao verificar o progresso.");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, onRefresh]);

  const handleConfirmar = async (id, dadosCorrigidos) => {
    setLoadingConfirmacao(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/revisao/${id}/confirmar/`, dadosCorrigidos);
      setRevisoes(prev => prev.filter(item => item.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erro ao confirmar item.");
    } finally {
      setLoadingConfirmacao(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCorrigirTodos = async () => {
    setLoadingRevisoes(true);
    try {
      await Promise.all(
        revisoes.map(item => 
          api.post(`/revisao/${item.id}/confirmar/`, { preco: item.preco_tentativa })
        )
      );
      setRevisoes([]);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erro ao processar correções em lote.");
    } finally {
      setLoadingRevisoes(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    setStatus({ progress: 0, message: "Enviando arquivo..." });

    try {
      const response = await api.post("/import/", formData, {
        headers: { 'Content-Type': undefined }
      });
      
      if (response.data.task_id) {
        setTaskId(response.data.task_id);
      } else {
        throw new Error("ID de tarefa não retornado.");
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || "Erro ao iniciar upload.");
    }
  };

  return (
    <div className="space-y-8">
      {/* CARD PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-lg mx-auto p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>📊 Importar Catálogo</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Formatos aceitos: .xlsx, .csv</p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {file ? file.name : "Clique ou arraste o arquivo aqui"}
            </div>
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="space-y-2 overflow-hidden"
              >
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>{status.message}</span>
                  <span>{status.progress}%</span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <motion.div className={`h-full ${isDark ? 'bg-white' : 'bg-slate-900'}`} animate={{ width: `${status.progress}%` }} />
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-4 rounded-2xl font-bold transition-transform active:scale-[0.98] disabled:opacity-50 ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
          >
            {uploading ? "Processando..." : "🚀 Iniciar Importação"}
          </button>
        </form>
      </motion.div>

      {/* LISTA DE REVISÃO */}
      {revisoes.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`max-w-2xl mx-auto p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ⚠️ Revisão Pendente ({revisoes.length})
            </h4>
            <button 
              onClick={handleCorrigirTodos}
              disabled={loadingRevisoes}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-50`}
            >
              {loadingRevisoes ? "Processando..." : "✅ Corrigir Todos"}
            </button>
          </div>

          <div className="space-y-3">
            {revisoes.map((item) => (
              <div key={item.id} className={`p-4 rounded-xl flex items-center justify-between border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.nome_produto}</p>
                  <p className="text-xs text-red-500 font-medium">Motivo: {item.motivo}</p>
                </div>
                <button 
                  onClick={() => handleConfirmar(item.id, { preco: item.preco_tentativa })}
                  disabled={loadingConfirmacao[item.id]}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {loadingConfirmacao[item.id] ? "..." : "Confirmar"}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}