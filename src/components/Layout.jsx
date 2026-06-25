import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import NavigationSidebar from './NavigationSidebar';
import { Menu } from 'lucide-react';
import { ImportProvider } from '../context/ImportContext';

export default function Layout({ children }) {
  const { darkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <ImportProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <NavigationSidebar 
          darkMode={darkMode} 
          toggleTheme={toggleTheme} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        <main 
          className={`flex-1 min-w-0 w-full h-screen overflow-y-auto transition-all duration-500
          ${isSidebarOpen ? 'md:pl-[280px]' : 'md:pl-20'}`}
        >
          {/* Botão Mobile */}
          <div className="md:hidden sticky top-0 left-0 w-full p-4 z-[80] flex items-center">
             <button 
               onClick={() => setIsMobileOpen(true)}
               className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-700 dark:text-white transition-all active:scale-95"
             >
               <Menu size={22} strokeWidth={2.5} />
             </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="p-4 md:p-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </ImportProvider>
  );
}