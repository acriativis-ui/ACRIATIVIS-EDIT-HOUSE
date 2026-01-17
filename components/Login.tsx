
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthSession } from '../types';
import { Loader2, Mail, Lock, Sparkles, ArrowRight, Shield, UserCircle, Users, MonitorPlay } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (session: AuthSession) => void;
}

type LoginMode = 'acriativis' | 'editor' | 'client' | 'tv';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<LoginMode>('acriativis');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const targetRole = loginMode === 'acriativis' ? 'admin' : loginMode;

      const session = await authService.login(email, password, targetRole);
      
      if (session) {
        onLoginSuccess(session);
      } else {
        setError(`Credenciais inválidas ou acesso não autorizado.`);
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    acriativis: {
      label: 'Acriativis',
      description: 'Gestão total da produtora e financeira.',
      placeholder: 'acriativis@gmail.com',
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-600/20',
      icon: <Shield size={16} />
    },
    editor: {
      label: 'Editor',
      description: 'Acesso aos projetos e fluxo de edição.',
      placeholder: 'editor@acriativis.com',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-600/20',
      icon: <UserCircle size={16} />
    },
    client: {
      label: 'Cliente',
      description: 'Acompanhe seus projetos e aprove entregas.',
      placeholder: 'cliente@exemplo.com',
      color: 'bg-green-600',
      shadow: 'shadow-green-600/20',
      icon: <Users size={16} />
    },
    tv: {
      label: 'TV Mode',
      description: 'Dashboard visual para monitoramento em tempo real.',
      placeholder: 'TVDASHBOARD',
      color: 'bg-purple-600',
      shadow: 'shadow-purple-600/20',
      icon: <MonitorPlay size={16} />
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 transition-all duration-700 rounded-full blur-[120px] ${
        loginMode === 'acriativis' ? 'bg-indigo-600/10' : 
        loginMode === 'editor' ? 'bg-blue-600/10' : 
        loginMode === 'client' ? 'bg-green-600/10' : 'bg-purple-600/10'
      }`} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className={`w-20 h-20 mb-6 transition-all duration-300 rounded-3xl flex items-center justify-center text-white shadow-2xl ${modeConfig[loginMode].color} ${modeConfig[loginMode].shadow}`}>
            <svg viewBox="0 0 100 100" className="w-14 h-14 text-white fill-current">
              <path d="M20,30 Q50,70 80,30 Q95,20 80,10 Q50,40 20,10 Q5,20 20,30 Z" />
              <path d="M15,50 Q50,110 85,50 Q100,30 85,30 Q50,80 15,30 Q0,30 15,50 Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase leading-none text-center">
            ACRIATIVIS <br/>
            <span className="text-zinc-500 text-xl tracking-[0.2em]">EDIT HOUSE</span>
          </h1>
        </div>

        <div className="bg-[#121214] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-sm">
          {/* Seletor de Modo */}
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 mb-8 overflow-x-auto scrollbar-hide">
            {(Object.keys(modeConfig) as LoginMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setLoginMode(mode);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  loginMode === mode 
                    ? `${modeConfig[mode].color} text-white shadow-lg` 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {modeConfig[mode].icon}
                <span className="hidden sm:inline">{modeConfig[mode].label}</span>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">
              {modeConfig[loginMode].label}
            </h2>
            <p className="text-zinc-500 text-xs leading-relaxed">{modeConfig[loginMode].description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                {loginMode === 'tv' ? 'Usuário TV' : 'E-mail de Acesso'}
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-zinc-700' : 'text-zinc-500 group-focus-within:text-white'}`} size={18} />
                <input 
                  type={loginMode === 'tv' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={modeConfig[loginMode].placeholder}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-zinc-700' : 'text-zinc-500 group-focus-within:text-white'}`} size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase text-center animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full ${modeConfig[loginMode].color} hover:brightness-110 disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all shadow-xl ${modeConfig[loginMode].shadow} active:scale-95`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Acessar {loginMode === 'tv' ? 'Dashboard' : 'Edit House'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50">
             <div className="flex items-center gap-2 text-zinc-600">
                <Sparkles size={14} className="text-zinc-500" />
                <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                  Powered by Acriativis Intelligence
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
