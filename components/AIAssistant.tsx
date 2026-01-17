
import React, { useState } from 'react';
// Added missing Target and Plus imports
import { Sparkles, Loader2, FileText, Radar, CheckCircle, ChevronRight, Target, Plus } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Opportunity } from '../types';

const AIAssistant: React.FC = () => {
  const [loadingContract, setLoadingContract] = useState(false);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [contract, setContract] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);

  const handleGenerateContract = async () => {
    setLoadingContract(true);
    try {
      const text = await geminiService.generateContract("Retrospectiva Oceano Azives 2025", "Dan Bezerra", 250);
      setContract(text || "Erro ao gerar contrato.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContract(false);
    }
  };

  const handleRadarScan = async () => {
    setLoadingRadar(true);
    try {
      const opps = await geminiService.analyzeOpportunities("Produtora de vídeo focada em retrospectivas e eventos corporativos, faturamento mensal de R$10k.");
      setOpportunities(opps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRadar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Radar Widget - Principal */}
      <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-6 z-10">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 animate-pulse">
            <Radar size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">IA Intelligence</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <h3 className="text-2xl font-black text-white">Radar de Oportunidades</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">Análise de perfil baseada nos seus melhores clientes e tendências de mercado.</p>
          </div>
        </div>
        <button 
          onClick={handleRadarScan}
          disabled={loadingRadar}
          className="mt-6 md:mt-0 bg-white text-black hover:bg-indigo-50 disabled:bg-zinc-400 text-sm font-black px-8 py-4 rounded-2xl flex items-center gap-3 shadow-2xl transition-all active:scale-95 z-10"
        >
          {loadingRadar ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loadingRadar ? 'Mapeando...' : 'Escanear Mercado'}
        </button>
      </div>

      {opportunities && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                   <Target size={16} />
                </div>
                <div className="text-[10px] font-black px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  {opp.matchScore}% Match
                </div>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{opp.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{opp.description}</p>
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                 Prosperar Alvo <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Generator Widget */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white">Gerar contrato profissional</h4>
            <p className="text-xs text-zinc-500">Documentação jurídica completa com suporte de IA</p>
          </div>
        </div>
        <button 
          onClick={handleGenerateContract}
          disabled={loadingContract}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 text-zinc-300 text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 border border-zinc-700 transition-all"
        >
          {loadingContract ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {loadingContract ? 'Redigindo...' : 'Criar Contrato'}
        </button>
      </div>

      {contract && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 max-h-64 overflow-y-auto animate-in fade-in">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-zinc-900/90 py-1 backdrop-blur-sm">
            <h5 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Rascunho de IA</h5>
            <button onClick={() => setContract(null)} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold">Descartar</button>
          </div>
          <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono">{contract}</p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
