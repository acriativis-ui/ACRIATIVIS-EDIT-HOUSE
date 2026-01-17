import React, { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Award, Edit2, Check, X, TrendingUp } from 'lucide-react';

type GoalType = 'monthly' | 'weekly';

interface RevenueGoalProps {
  currentRevenue: number;
}

const RevenueGoal: React.FC<RevenueGoalProps> = ({ currentRevenue }) => {
  const [goalType, setGoalType] = useState<GoalType>('monthly');
  const [isEditing, setIsEditing] = useState(false);
  
  const [monthlyGoal, setMonthlyGoal] = useState(10000);
  const [weeklyGoal, setWeeklyGoal] = useState(2500);
  const [tempGoal, setTempGoal] = useState(0);

  const currentGoal = goalType === 'monthly' ? monthlyGoal : weeklyGoal;
  const displayedRevenue = goalType === 'monthly' ? currentRevenue : currentRevenue * 0.25;

  const data = [
    { name: 'Completed', value: displayedRevenue },
    { name: 'Remaining', value: Math.max(currentGoal - displayedRevenue, 0) },
  ];
  
  const COLORS = ['#6366f1', '#18181b']; // Indigo-500 vs Zinc-900

  const handleEditClick = () => {
    setTempGoal(currentGoal);
    setIsEditing(true);
  };

  const handleSaveGoal = () => {
    if (goalType === 'monthly') setMonthlyGoal(tempGoal);
    else setWeeklyGoal(tempGoal);
    setIsEditing(false);
  };

  const progressPercent = Math.min((displayedRevenue / currentGoal) * 100, 100);

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
             <TrendingUp size={18} />
          </div>
          <div>
             <h3 className="font-bold text-white text-sm">Target Financeiro</h3>
             <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Performance</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setGoalType('monthly')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${
              goalType === 'monthly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Mês
          </button>
          <button 
            onClick={() => setGoalType('weekly')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${
              goalType === 'weekly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 relative z-10 gap-6">
        <div className="relative h-56 w-56 flex items-center justify-center">
            <PieChart width={224} height={224}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                cornerRadius={8}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Atingido</span>
            <span className="text-4xl font-black text-white tracking-tighter">
              {Math.floor(progressPercent)}<span className="text-base text-zinc-500 ml-1">%</span>
            </span>
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-xl p-5 border border-white/5">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meta Definida</span>
              {!isEditing ? (
                <button onClick={handleEditClick} className="text-zinc-600 hover:text-indigo-400 transition-colors">
                  <Edit2 size={12} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveGoal} className="text-green-500"><Check size={14} /></button>
                  <button onClick={() => setIsEditing(false)} className="text-red-500"><X size={14} /></button>
                </div>
              )}
           </div>

           {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-500">R$</span>
                <input 
                  type="number" 
                  autoFocus
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  className="bg-black border border-zinc-700 text-white text-lg font-bold w-full rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                 <h4 className="text-2xl font-bold text-white tracking-tight">R$ {currentGoal.toLocaleString('pt-BR')}</h4>
                 <span className="text-xs text-zinc-500 font-mono">BRL</span>
              </div>
            )}
           
           <div className="mt-2 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueGoal;