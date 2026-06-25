import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdminGuard } from './AdminGuard';
import { useImport } from '../context/ImportContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud 
} from 'lucide-react';

export default function NavigationSidebar({ 
  isOpen, 
  setIsOpen, 
  darkMode, 
  toggleTheme, 
  isMobileOpen, 
  setIsMobileOpen 
}) {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const { progress, status } = useImport();
  
  const isAdmin = user?.role === 'admin' || user?.is_superuser || user?.is_staff;

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => { 
    setIsMobileOpen(false); 
  }, [location, setIsMobileOpen]);

  const handleMobileClose = () => setIsMobileOpen(false);

  const SidebarContent = () => (
    <>
      {/* Header do Sidebar */}
      <div className={`flex items-center gap-3 px-2 mb-8 ${!isOpen && 'justify-center'}`}>
        <div className="bg-orange-500 w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0">
          <Settings size={20} />
        </div>
        {isOpen && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="m-0 text-sm font-black uppercase text-orange-500">
              Auto<span className="text-slate-900 dark:text-white">Peças</span>
            </h2>
            <span className="text-[10px] font-bold text-cyan-600">Gramense [Beta]</span>
          </div>
        )}
      </div>

      {/* Links de Navegação */}
      <nav className="flex flex-col gap-2 flex-1 overflow-hidden">
        {[ 
          { path: '/', icon: LayoutDashboard, label: 'Catálogo' }, 
          { path: '/pdv', icon: ShoppingCart, label: 'Terminal PDV' } 
        ].map((item) => (
          <Link key={item.path} to={item.path} onClick={handleMobileClose} className="no-underline text-inherit">
            <motion.div 
              whileHover={{ x: 5 }} 
              className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                location.pathname === item.path 
                ? 'bg-slate-100 dark:bg-slate-800 font-bold' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={20} className="text-slate-500 shrink-0" />
              {isOpen && <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap">{item.label}</span>}
            </motion.div>
          </Link>
        ))}

        {isAdmin && (
          <AdminGuard>
            <Link to="/admin" onClick={handleMobileClose} className="no-underline text-inherit">
              <motion.div 
                whileHover={{ x: 5 }} 
                className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                  location.pathname.startsWith('/admin') 
                  ? 'bg-slate-100 dark:bg-slate-800 font-bold' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Settings size={20} className="text-slate-500 shrink-0" />
                {isOpen && <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap">Painel Admin</span>}
              </motion.div>
            </Link>
          </AdminGuard>
        )}
      </nav>

      {/* Barra de Progresso de Importação */}
      {progress > 0 && progress < 100 && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud size={14} className="text-orange-500 animate-bounce" />
            {isOpen && (
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase truncate">
                {status || 'Importando...'}
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-orange-500" 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 0.3 }} 
            />
          </div>
        </div>
      )}

      {/* Footer do Sidebar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
        <Link to="/perfil" onClick={handleMobileClose} className="flex items-center gap-3 p-2 text-slate-500 text-xs hover:text-slate-900 dark:hover:text-white transition-colors">
          <User size={18} /> {isOpen && "Minha Conta"}
        </Link>
        <button onClick={toggleTheme} className="flex items-center gap-3 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isOpen && <span className="text-xs">{darkMode ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        <button onClick={logout} className="flex items-center gap-3 p-2 text-red-500 hover:text-red-600 transition-colors">
          <LogOut size={20} />
          {isOpen && <span className="text-xs">Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className={`fixed top-0 left-0 h-screen hidden md:flex flex-col p-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out z-[90] ${isOpen ? 'w-[280px]' : 'w-20'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-orange-500 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {isOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside 
            initial={{x: -300}} 
            animate={{x: 0}} 
            exit={{x: -300}} 
            className="fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-slate-900 z-[101] p-6 shadow-2xl md:hidden"
          >
             <button className="absolute top-4 right-4 text-slate-500" onClick={handleMobileClose}><X size={24} /></button>
             <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}