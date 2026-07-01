import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, LayoutDashboard, Database, Upload, Image as ImageIcon, X, Camera, RotateCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ImportProducts from '../components/importProducts';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useImport } from '../context/ImportContext';
import api from '../services/api'; 

// --- COMPONENTE DE NOTIFICAÇÃO (TOAST) ---
const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, x: -50, scale: 0.9 }} 
    animate={{ opacity: 1, x: 0, scale: 1 }} 
    exit={{ opacity: 0, x: -20 }}
    className={`fixed bottom-6 left-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${type === 'error' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 dark:bg-slate-800 border-slate-700 text-white'}`}
  >
    {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
    <span className="text-sm font-bold">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 transition-opacity"><X size={16}/></button>
  </motion.div>
);

// --- HELPER DE IMAGEM ---
function ProductImage({ src }) {
  if (!src) {
    return (
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center border border-slate-200 dark:border-slate-700">
        <ImageIcon size={16} className="text-slate-400" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      className="w-10 h-10 object-cover rounded border border-slate-200 dark:border-slate-700" 
      onError={(e) => { e.target.style.display = 'none'; }} 
      alt="Produto" 
    />
  );
}

// --- MODAL DE DETALHES ---
function ProductDetailsModal({ p, isOpen, onClose, getCategoryName }) {
  if (!p) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-800">
        <DialogTitle className="mb-4 dark:text-white">Detalhes do Produto</DialogTitle>
        <div className="flex flex-col items-center gap-4">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="w-48 h-48 object-cover rounded-lg border shadow-sm" />
          ) : (
            <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <ImageIcon size={48} className="text-slate-300" />
            </div>
          )}
          <div className="w-full space-y-3 mt-4 text-sm dark:text-slate-300">
            <p><strong className="text-slate-500 dark:text-slate-400">Nome:</strong> {p.name}</p>
            <p><strong className="text-slate-500 dark:text-slate-400">SKU:</strong> {p.sku}</p>
            <p><strong className="text-slate-500 dark:text-slate-400">Preço:</strong> {p.price ? `R$ ${p.price}` : 'Não informado'}</p>
            <p><strong className="text-slate-500 dark:text-slate-400">Categoria:</strong> {getCategoryName(p.category)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- SUB-COMPONENTE EDITAR ---
function EditProduct({ p, onUpdate, onRefresh, notify }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(p.name);
  const [sku, setSku] = useState(p.sku);
  const [price, setPrice] = useState(p.price || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(p.image_url || null);
  const [removeImage, setRemoveImage] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); 
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()));
  }, []);

  useEffect(() => {
    if (open) {
      setName(p.name);
      setSku(p.sku);
      setPrice(p.price || '');
      setPreview(p.image_url || null);
      setImageFile(null);
      setRemoveImage(false);
    } else {
      stopCamera();
    }
  }, [open, p]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      notify("Erro ao acessar câmera.", "error");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
      stopCamera();
      setShowCamera(false);
    }, 'image/jpeg');
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('price', price);
    if (removeImage) formData.append('remove_image', 'true');
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.patch(`products/${p.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpdate(p.id, { name, sku, price });
      onRefresh();
      notify("Produto atualizado!");
      setOpen(false);
    } catch (e) { notify("Erro ao salvar.", "error"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <Edit size={12}/> EDITAR
        </button>
      </DialogTrigger>
      
      {showCamera ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-10 left-0 right-0 flex items-center justify-evenly p-4 bg-gradient-to-t from-black/80 to-transparent">
              <button onClick={() => { stopCamera(); setShowCamera(false); }} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white"><X size={32} /></button>
              <button onClick={capturePhoto} className="p-6 bg-white rounded-full text-black"><Camera size={32} /></button>
              {isMobile && <button onClick={() => { const m = facingMode === "user" ? "environment" : "user"; setFacingMode(m); startCamera(m); }} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white"><RotateCcw size={32} /></button>}
            </div>
        </div>
      ) : (
        <DialogContent className="p-6 max-w-sm dark:bg-slate-900 dark:border-slate-800">
          <DialogTitle className="mb-4 dark:text-white">Editar Produto</DialogTitle>
          <div className="flex flex-col items-center mb-6">
            <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files[0]; if(f) { setImageFile(f); setPreview(URL.createObjectURL(f)); }}} className="hidden" accept="image/*" />
            <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => { setPreview(null); setImageFile(null); setRemoveImage(true); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center text-slate-400 hover:text-blue-500"><Upload size={20} /></button>
                    <button onClick={() => startCamera()} className="flex flex-col items-center text-slate-400 hover:text-blue-500"><Camera size={20} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div><label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nome</label><input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border dark:border-slate-700 rounded text-sm dark:bg-slate-800 dark:text-white" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">SKU</label><input value={sku} onChange={e => setSku(e.target.value)} className="w-full p-2 border dark:border-slate-700 rounded text-sm dark:bg-slate-800 dark:text-white" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Preço</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border dark:border-slate-700 rounded text-sm dark:bg-slate-800 dark:text-white" /></div>
          </div>
          <button onClick={handleSave} className="w-full bg-blue-600 text-white p-2 rounded mt-6 font-bold text-sm hover:bg-blue-700">Salvar</button>
        </DialogContent>
      )}
    </Dialog>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function AdminDashboard({ products = [], categories = [], stats = [], pagination = { count: 0 }, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('produtos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [data, setData] = useState(products);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  const [toast, setToast] = useState(null);
  const { setProgress } = useImport(); 

  const notify = (message, type = 'success') => setToast({ message, type });

  const fetchPendingCount = useCallback(async () => {
    try { const res = await api.get("/revisao/"); setPendingCount(res.data.length || 0); } catch (e) {}
  }, []);

  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);
  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory]);
  useEffect(() => { setData(products); }, [products]);

  const validCategories = categories.filter(c => c.name && c.name.trim() !== "");
  const getCategoryName = (cat) => {
    if (!cat) return '—';
    if (typeof cat === 'object') return cat.name || cat.id;
    const found = validCategories.find(c => String(c.id) === String(cat));
    return found ? found.name : `Cat ID: ${cat}`;
  };

  const fetchData = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await api.get(`products/`, { params: { search, category: selectedCategory, page: currentPage } });
      setData(response.data.results || []);
    } catch (e) { notify("Erro ao carregar dados.", "error"); } finally { setIsSearching(false); }
  }, [search, selectedCategory, currentPage]);

  useEffect(() => { const timer = setTimeout(fetchData, 400); return () => clearTimeout(timer); }, [fetchData]);

  const handleApiRequest = async (method, endpoint, body = null) => {
    try { await api({ method, url: endpoint, data: body }); onRefreshData(); fetchPendingCount(); notify("Sucesso!"); } 
    catch (e) { notify("Erro.", "error"); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-20 dark:bg-slate-950 min-h-screen">
      
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <ProductDetailsModal p={detailsProduct} isOpen={!!detailsProduct} onClose={() => setDetailsProduct(null)} getCategoryName={getCategoryName} />
      
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-full overflow-x-auto border dark:border-slate-800">
        {[ 
          {id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard}, 
          {id: 'produtos', label: 'PRODUTOS', icon: Database}, 
          {id: 'importar', label: 'IMPORTAR', icon: Upload, showBadge: pendingCount > 0, count: pendingCount} 
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center gap-2 px-4 py-3 rounded-md text-xs font-bold transition-all flex-1 ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            <tab.icon className="h-4 w-4"/> {tab.label}
            {tab.showBadge && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">{tab.count}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 h-[350px]">
             <h3 className="font-bold text-sm mb-4 dark:text-white">Volume por Categoria</h3>
             <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.map(s => ({...s, name: getCategoryName(s.id)}))}><XAxis dataKey="name" stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} /><Bar dataKey="count" fill="#3b82f6" /></BarChart></ResponsiveContainer>
           </motion.div>
        )}

        {activeTab === 'produtos' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
             <div className="grid md:grid-cols-[1fr,auto] gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800">
                <input placeholder="Buscar..." className="p-2 border dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select className="p-2 border dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Todas</option>
                    {validCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
             </div>
             
             <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-x-auto min-h-[300px] relative">
                {isSearching ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-xs font-bold dark:text-slate-300">IMAGEM</th>
                            <th className="p-4 text-xs font-bold dark:text-slate-300">SKU</th>
                            <th className="p-4 text-xs font-bold dark:text-slate-300">NOME</th>
                            <th className="p-4 text-xs font-bold dark:text-slate-300">PREÇO</th>
                            <th className="p-4 text-xs font-bold dark:text-slate-300 text-right">AÇÕES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-700">
                        {data.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-4"><ProductImage src={p.image_url} /></td>
                            <td className="p-4 text-xs font-mono dark:text-slate-400">{p.sku}</td>
                            <td className="p-4 text-sm dark:text-slate-200">{p.name}</td>
                            <td className="p-4 text-sm dark:text-slate-200">{p.price ? `R$ ${p.price}` : '—'}</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                               <button onClick={() => setDetailsProduct(p)} className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">DETALHES</button>
                               <EditProduct p={p} onUpdate={(id, d) => setData(prev => prev.map(p => p.id === id ? {...p, ...d} : p))} onRefresh={onRefreshData} notify={notify} />
                               <button onClick={() => window.confirm("Excluir?") && handleApiRequest('DELETE', `products/${p.id}/`)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex items-center justify-between p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <span className="text-xs font-bold dark:text-slate-400">Total: {pagination.count}</span>
                      <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs border dark:border-slate-600 rounded dark:text-slate-300">Anterior</button>
                        <button disabled={currentPage >= Math.ceil(pagination.count / 10)} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs border dark:border-slate-600 rounded dark:text-slate-300">Próximo</button>
                      </div>
                    </div>
                  </>
                )}
             </div>
          </motion.div>
        )}
        
        {activeTab === 'importar' && (
            <ImportProducts 
                onRefresh={() => { onRefreshData(); fetchPendingCount(); notify("Importação processada!"); }} 
                notify={notify}
                setProgress={setProgress}
            />
        )}
      </AnimatePresence>
    </div>
  );
}