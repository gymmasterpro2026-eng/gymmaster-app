import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { dataService } from '../services/dataService';
import { GymTenant, Profile } from '../types';

interface LandingPageProps {
  onEnterApp: (gym: GymTenant, userProfile: Profile) => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, ingresa tu usuario.');
      return;
    }

    const result = dataService.login(username, password);
    if (!result) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }

    onEnterApp(result.gym, result.profile);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-[#D4FF00] selection:text-black font-sans text-white relative overflow-hidden bg-black">
      
      {/* Full-screen Background Image */}
      <div 
        className="absolute inset-0 bg-[url('/gym_bg.jpg')] bg-cover bg-center bg-no-repeat"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-10 shadow-2xl overflow-hidden relative">
          
          {/* Shine effect across the card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-white/[0.05] pointer-events-none rounded-3xl" />

          <div className="relative z-10 flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="bg-gradient-to-br from-[#D4FF00] to-[#b8db00] p-4 rounded-2xl text-black shadow-[0_0_30px_rgba(212,255,0,0.3)] mb-6 relative group cursor-default"
            >
              <Dumbbell className="w-8 h-8 stroke-[2.5] transform group-hover:rotate-12 transition-transform duration-300" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 text-center">
              GymMaster <span className="text-[#D4FF00]">PRO</span>
            </h1>
            <p className="text-sm text-zinc-400 font-medium text-center">Gestión inteligente de entrenamientos</p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium flex items-center justify-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-zinc-500 group-focus-within:text-[#D4FF00] transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-[#D4FF00]/50 focus:bg-black/60 focus:ring-4 focus:ring-[#D4FF00]/10 transition-all placeholder:text-zinc-600 font-medium"
                  placeholder="Ej. admin"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-500 group-focus-within:text-[#D4FF00] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-xl outline-none focus:border-[#D4FF00]/50 focus:bg-black/60 focus:ring-4 focus:ring-[#D4FF00]/10 transition-all placeholder:text-zinc-600 font-medium tracking-wider"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-[#D4FF00] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              onMouseEnter={() => setIsHoveringBtn(true)}
              onMouseLeave={() => setIsHoveringBtn(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#D4FF00] to-[#b8db00] text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] mt-4 flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <span className="relative z-10">Ingresar al Sistema</span>
              <motion.div
                animate={{ x: isHoveringBtn ? 5 : 0 }}
                className="relative z-10"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
            </motion.button>
          </form>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-center text-zinc-600 font-medium flex flex-col items-center gap-1"
        >
          <span>© 2026 GymMaster Pro</span>
          <span className="text-zinc-700">Arquitectura RLS Estricta • Multi-Tenant</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
