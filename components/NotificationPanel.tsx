import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, Check, AlertCircle, Clock, Info, CheckCircle2 } from 'lucide-react';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onMarkRead, 
  onClearAll, 
  onClose 
}) => {
  return (
    <div className="absolute top-20 right-0 md:right-8 w-full max-w-sm bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Bell size={14} className="text-indigo-400" /> Central de Alertas
        </h3>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase transition-colors"
            >
              Limpar
            </button>
          )}
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <CheckCircle2 size={20} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-white">Tudo tranquilo</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Nenhum alerta pendente</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-white/[0.02] transition-colors group relative flex gap-4 ${!n.read ? 'bg-indigo-500/[0.03]' : ''}`}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                
                <div className={`mt-1 p-2 rounded-xl h-fit shrink-0 ${
                  n.type === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                  n.type === 'warning' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {n.type === 'critical' ? <AlertCircle size={16} /> : 
                   n.type === 'warning' ? <Clock size={16} /> : 
                   <Info size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-bold leading-tight truncate pr-2 ${n.type === 'critical' ? 'text-white' : 'text-zinc-200'}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <button 
                        onClick={() => onMarkRead(n.id)}
                        className="text-zinc-600 hover:text-indigo-400 transition-colors shrink-0"
                        title="Marcar como lida"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                    {n.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;