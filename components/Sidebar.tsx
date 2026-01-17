import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  DollarSign, 
  Cloud, 
  Clapperboard, // Novo ícone
  UserRound,
  LogOut
} from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const isAdmin = user.role === 'admin';

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', view: 'dashboard', roles: ['admin', 'client', 'editor'] },
    { icon: <Users size={20} />, label: 'Parceiros', view: 'clients', roles: ['admin'] },
    { icon: <UserRound size={20} />, label: 'Editores', view: 'editors', roles: ['admin'] },
    { icon: <FolderKanban size={20} />, label: 'Projetos', view: 'projects', roles: ['admin', 'client', 'editor'] },
    { icon: <DollarSign size={20} />, label: 'Financeiro', view: 'financial', roles: ['admin'] },
    { icon: <Cloud size={20} />, label: 'Arquivos', view: 'cloud', roles: ['admin', 'client'] },
    // Alterado de Pricing/Calculator para Sala de Edição/Clapperboard
    { icon: <Clapperboard size={20} />, label: 'Sala de Edição', view: 'editing_room', roles: ['admin', 'editor'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
              <path d="M20,30 Q50,70 80,30 Q95,20 80,10 Q50,40 20,10 Q5,20 20,30 Z" />
              <path d="M15,50 Q50,110 85,50 Q100,30 85,30 Q50,80 15,30 Q0,30 15,50 Z" />
            </svg>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-black text-sm tracking-tight text-white leading-none">ACRIATIVIS</span>
            <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-500 mt-1">EDIT HOUSE</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-2 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view as ViewState)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/5" />
              )}
              
              <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className={`hidden lg:block text-xs font-bold tracking-wide relative z-10 ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] hidden lg:block" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center lg:justify-start gap-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center shrink-0">
               <span className="font-bold text-xs text-white">{user.name.charAt(0)}</span>
             </div>
             <div className="hidden lg:block overflow-hidden min-w-0">
               <p className="text-xs font-bold text-white truncate">{user.name}</p>
               <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{isAdmin ? 'Admin' : user.role === 'editor' ? 'Editor' : 'Cliente'}</p>
             </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center justify-center lg:justify-start gap-3 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
          >
            <LogOut size={16} />
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;