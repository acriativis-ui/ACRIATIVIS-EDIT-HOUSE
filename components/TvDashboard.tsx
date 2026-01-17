
import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { 
  Clapperboard, 
  Clock, 
  CheckCircle2, 
  Activity, 
  TrendingUp,
  LogOut
} from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

interface TvDashboardProps {
  projects: Project[];
  editors: User[];
  onLogout: () => void;
}

const TvDashboard: React.FC<TvDashboardProps> = ({ projects, editors, onLogout }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Métricas
  const totalTarget = 45; // Meta Global
  const delivered = projects.filter(p => p.status === 'aprovado' || p.status === 'concluido').length;
  const progressPercent = Math.min((delivered / totalTarget) * 100, 100);
  
  // Dados do Gráfico
  const data = [
    { name: 'Completed', value: delivered },
    { name: 'Remaining', value: Math.max(totalTarget - delivered, 0) },
  ];
  const COLORS = ['#6366f1', '#18181b'];

  // Projetos Ativos Recentes
  const activeProjects = projects
    .filter(p => ['ativo', 'em_revisao'].includes(p.status))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-8 overflow-hidden relative font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative z-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 text-white shrink-0">
            <svg viewBox="0 0 100 100" className="w-12 h-12 fill-current">
              <path d="M20,30 Q50,70 80,30 Q95,20 80,10 Q50,40 20,10 Q5,20 20,30 Z" />
              <path d="M15,50 Q50,110 85,50 Q100,30 85,30 Q50,80 15,30 Q0,30 15,50 Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white leading-none">ACRIATIVIS</h1>
            <p className="text-xl font-bold tracking-[0.4em] text-zinc-500 mt-2 uppercase">Monitoramento</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black text-white tracking-tight font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xl font-medium text-zinc-400 uppercase tracking-widest mt-1">
            {time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Big Goals */}
        <div className="col-span-5 flex flex-col gap-8">
          {/* Main Goal Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 flex-1 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
             
             <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                <TrendingUp size={32} className="text-indigo-500" /> Meta Global do Mês
             </h2>

             <div className="relative w-80 h-80 flex items-center justify-center">
                <PieChart width={320} height={320}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={125}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-8xl font-black text-white tracking-tighter leading-none">{delivered}</span>
                    <span className="text-2xl font-bold text-zinc-500 uppercase tracking-widest mt-2">de {totalTarget}</span>
                </div>
             </div>

             <div className="mt-10 w-full bg-zinc-900 rounded-full h-4 overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
             </div>
             <p className="text-zinc-500 font-bold uppercase tracking-widest mt-4 text-sm">{Math.floor(progressPercent)}% Concluído</p>
          </div>
        </div>

        {/* Right Column: Editors & Projects */}
        <div className="col-span-7 flex flex-col gap-8">
           {/* Editor Leaderboard */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                 <Activity size={24} className="text-emerald-400" /> Performance da Equipe
              </h3>
              <div className="space-y-6">
                 {editors.map((editor, idx) => {
                    const editorDelivered = projects.filter(p => p.editorId === editor.id && p.status === 'aprovado').length;
                    const editorTarget = 15; // Meta individual fixa
                    const percent = Math.min((editorDelivered / editorTarget) * 100, 100);
                    
                    return (
                        <div key={editor.id} className="relative">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-white border border-white/5">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold text-white block leading-none">{editor.name}</span>
                                        <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Editor Sênior</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">{editorDelivered}</span>
                                    <span className="text-sm font-bold text-zinc-600"> / {editorTarget}</span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${percent >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-600'}`} 
                                    style={{ width: `${percent}%` }} 
                                />
                            </div>
                        </div>
                    )
                 })}
              </div>
           </div>

           {/* Active Projects List */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 flex-1 shadow-xl overflow-hidden">
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                 <Clapperboard size={24} className="text-orange-400" /> Na Pauta (Prioridade)
              </h3>
              <div className="space-y-4">
                 {activeProjects.map(project => (
                     <div key={project.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-2 h-12 rounded-full ${
                                project.status === 'em_revisao' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-blue-500'
                            }`} />
                            <div className="min-w-0">
                                <h4 className="text-lg font-bold text-white truncate w-64">{project.name}</h4>
                                <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">{project.client}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Deadline</div>
                                <div className="text-lg font-bold text-white flex items-center gap-2 justify-end">
                                    <Clock size={16} className="text-zinc-600" /> {new Date(project.deadline).toLocaleDateString().slice(0,5)}
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                                project.status === 'em_revisao' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                            }`}>
                                {project.status === 'em_revisao' ? 'Revisão' : 'Editando'}
                            </div>
                        </div>
                     </div>
                 ))}
                 {activeProjects.length === 0 && (
                     <div className="text-center py-10 text-zinc-600 font-bold uppercase tracking-widest">
                         Sem projetos ativos no momento
                     </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Footer / Quit */}
      <button 
        onClick={onLogout} 
        className="absolute bottom-8 right-8 flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:bg-red-600 hover:border-red-500 text-zinc-500 hover:text-white px-8 py-4 rounded-2xl transition-all duration-300 group z-50"
      >
        <span className="text-sm font-black uppercase tracking-widest group-hover:text-white">Sair do Modo TV</span>
        <LogOut size={20} />
      </button>
    </div>
  );
};

export default TvDashboard;
