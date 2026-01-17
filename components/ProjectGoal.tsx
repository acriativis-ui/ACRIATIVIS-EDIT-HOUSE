import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Target, Video, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ProjectGoalProps {
  currentCount: number;
  targetCount: number;
  role: 'admin' | 'editor';
}

const ProjectGoal: React.FC<ProjectGoalProps> = ({ currentCount, targetCount, role }) => {
  const remaining = Math.max(targetCount - currentCount, 0);
  const progressPercent = Math.min((currentCount / targetCount) * 100, 100);

  const data = [
    { name: 'Completed', value: currentCount },
    { name: 'Remaining', value: remaining },
  ];
  
  // Cores: Cyan para progresso, Zinc Dark para fundo
  const COLORS = ['#06b6d4', '#18181b']; 

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden h-full">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
             <Video size={18} />
          </div>
          <div>
             <h3 className="font-bold text-white text-sm">Meta de Entregas</h3>
             <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{role === 'admin' ? 'Meta Global (45)' : 'Minha Meta (15)'}</p>
          </div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            {new Date().toLocaleString('pt-BR', { month: 'long' })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 relative z-10 gap-4">
        <div className="relative h-48 w-48 flex items-center justify-center">
            <PieChart width={192} height={192}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                cornerRadius={8}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
            <span className="text-3xl font-black text-white tracking-tighter">
              {currentCount} <span className="text-sm text-zinc-500 font-medium">/ {targetCount}</span>
            </span>
            <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-1">Entregues</span>
          </div>
        </div>

        <div className="w-full bg-zinc-900/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Faltam</span>
              <span className="text-xl font-bold text-white">{remaining}</span>
           </div>
           
           <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Performance</span>
              <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm">
                 <TrendingUp size={14} /> {Math.floor(progressPercent)}%
              </div>
           </div>
        </div>
        
        {remaining === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black px-4 py-2 rounded-full font-bold text-xs uppercase shadow-xl animate-in zoom-in">
                Meta Batida! 🚀
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectGoal;