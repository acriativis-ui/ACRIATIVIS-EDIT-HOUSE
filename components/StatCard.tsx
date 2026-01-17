import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  tooltip?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, tooltip, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
    >
      {/* Background Gradient Spot */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">{label}</h3>
          <div className="text-3xl font-medium text-white tracking-tight">{value}</div>
        </div>
        
        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${color} text-opacity-90 group-hover:scale-110 transition-transform duration-300`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
        </div>
      </div>

      {/* Interactive visual hint at bottom */}
      {onClick && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
          <div className="bg-zinc-900/90 backdrop-blur-md text-white text-[10px] p-3 rounded-lg border border-white/10 shadow-2xl text-center leading-relaxed">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900/90" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;