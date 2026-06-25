import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, RefreshCw, Filter, Inbox, Loader2, Image as ImageIcon, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";

// --- HELPER DE IMAGEM ---
function ProductImage({ src }) {
  const [hasError, setHasError] = useState(false);
  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <ImageIcon size={32} className="text-slate-400" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      alt="Produto" 
      className="w-full h-full object-cover"
      onError={() => setHasError(true)} 
    />
  );
}

export default function ProductCatalog({ onSelectProduct }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  // Pegando valores da URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const minStock = searchParams.get("min_stock") || "";

  // Estados locais para inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);
  const [tempMinStock, setTempMinStock] = useState(minStock);

  // Sincroniza estados locais caso a URL mude externamente
  useEffect(() => {
    setSearchInput(searchQuery);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setTempMinStock(minStock);
  }, [searchQuery, minPrice, maxPrice, minStock]);

  // Carrega categorias uma única vez
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("categories/");
        setCategories(response?.data?.results || response?.data || []);
      } catch (error) { console.error("Erro ao carregar categorias:", error); }
    };
    fetchCategories();
  }, []);

  // Carrega produtos sempre que a URL (filtros/pagina) muda
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const response = await api.get(`products/?${queryParams.toString()}`);
        
        const data = response?.data?.results || response?.data || [];
        setProducts(Array.isArray(data) ? data : [data]);
        
        setPagination({ 
          next: response?.data?.next, 
          previous: response?.data?.previous 
        });
      } catch (error) { 
        console.error("Erro ao buscar produtos:", error);
        setProducts([]); 
        setPagination({ next: null, previous: null });
      } finally { setLoading(false); }
    };

    fetchProducts();
  }, [searchParams]);

  const changePage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    
    // Atualiza parâmetros baseados nos inputs temporários
    tempMinPrice ? params.set("min_price", tempMinPrice) : params.delete("min_price");
    tempMaxPrice ? params.set("max_price", tempMaxPrice) : params.delete("max_price");
    tempMinStock ? params.set("min_stock", tempMinStock) : params.delete("min_stock");
    
    setSearchParams(params);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    // Reseta URL
    setSearchParams({});
    
    // Reseta estados locais dos inputs
    setSearchInput("");
    setTempMinPrice("");
    setTempMaxPrice("");
    setTempMinStock("");
    
    setIsFiltersOpen(false);
  };

  return (
    <div className="w-full h-full p-4 md:p-8">
      {/* Header e Busca */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setIsFiltersOpen(true)} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 transition-all text-sm font-semibold"
        >
          <Filter size={16} /> Filtros
        </button>
        
        {(selectedCategory || searchQuery || minPrice || maxPrice || minStock) && (
          <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
            <RefreshCw size={12} /> Limpar tudo
          </button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); const params = new URLSearchParams(searchParams); params.set("search", searchInput); params.set("page", "1"); setSearchParams(params); }} className="relative mb-8">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
          placeholder="Busque por nome ou SKU..." 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
        />
      </form>

      {/* Grid de Produtos */}
      <main className="w-full">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => onSelectProduct(product)}
                  className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="aspect-square w-full bg-slate-50 overflow-hidden">
                    <div className="group-hover:scale-105 transition-transform duration-300 w-full h-full">
                      <ProductImage src={product.image_url} />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-xs truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <div className="mt-2">
                      <span className="font-bold text-sm block">R$ {Number(product.price ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {(pagination.next || pagination.previous) && (
              <div className="flex items-center justify-center gap-4 mt-12 py-4">
                <button 
                  onClick={() => changePage(currentPage - 1)}
                  disabled={!pagination.previous}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pág {currentPage}</span>
                <button 
                  onClick={() => changePage(currentPage + 1)}
                  disabled={!pagination.next}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-400"><Inbox size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Nenhum produto encontrado.</p></div>
        )}
      </main>

      {/* Drawer de Filtros */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFiltersOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm z-[101] bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><SlidersHorizontal size={20}/> Filtros</h2>
                <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Categorias</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { const p = new URLSearchParams(searchParams); p.set("category", ""); setSearchParams(p); }} 
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 dark:bg-slate-800 border-transparent hover:border-slate-300"}`}
                    >Todas</button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => { const p = new URLSearchParams(searchParams); p.set("category", String(cat.id)); setSearchParams(p); }} 
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedCategory === String(cat.id) ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 dark:bg-slate-800 border-transparent hover:border-slate-300"}`}
                      >{cat.name}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Preço (R$)</label>
                  <div className="flex gap-2">
                    <input type="number" value={tempMinPrice} onChange={e => setTempMinPrice(e.target.value)} className="w-1/2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm" placeholder="Mín" />
                    <input type="number" value={tempMaxPrice} onChange={e => setTempMaxPrice(e.target.value)} className="w-1/2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm" placeholder="Máx" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Estoque Mínimo</label>
                  <input type="number" value={tempMinStock} onChange={e => setTempMinStock(e.target.value)} className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm" placeholder="Ex: 10" />
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-800 mt-4 flex gap-3">
                <button onClick={clearFilters} className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Resetar</button>
                <button onClick={applyFilters} className="flex-[2] py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md">Aplicar Filtros</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}