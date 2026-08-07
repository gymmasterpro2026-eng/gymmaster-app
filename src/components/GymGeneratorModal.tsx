import React, { useState } from 'react';
import { KeyRound, User, Lock, LogIn, X, Users, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { GymTenant, Profile } from '../types';

interface GymGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGymGeneratedOrLoggedIn: (gym: GymTenant, userProfile: Profile) => void;
  defaultTab?: 'create' | 'login' | 'list';
}

export const GymGeneratorModal: React.FC<GymGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGymGeneratedOrLoggedIn,
}) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Ingresa tu usuario o correo electrónico.');
      return;
    }

    const result = dataService.login(loginEmail, loginPassword);
    if (!result) {
      setLoginError('Usuario o contraseña incorrectos. Verifica tus credenciales o genera un nuevo Gym.');
      return;
    }

    onGymGeneratedOrLoggedIn(result.gym, result.profile);
    onClose();
  };

  const handleQuickLoginDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    const result = dataService.login(email, pass);
    if (result) {
      onGymGeneratedOrLoggedIn(result.gym, result.profile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-6 border-b border-[#1A1A1A] flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-[#D4FF00] p-2 rounded-xl text-black">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-zinc-400">Ingresa tus credenciales para acceder a tu tenant.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-[#1A1A1A] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 relative z-10">
          <div className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="p-3 bg-[#181818] border border-[#2F2F2F] rounded-xl flex items-center justify-between text-xs text-zinc-300">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#D4FF00]" />
                  Credenciales por defecto:
                </span>
                <span className="font-mono bg-[#111111] px-2.5 py-1 rounded border border-[#222222] text-[#D4FF00]">
                  Usuario: <strong className="text-white">gym</strong> | Clave: <strong className="text-white">12345</strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4FF00]" />
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  placeholder="gym"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4FF00]" />
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="12345"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D4FF00] text-black font-black py-3 px-4 rounded-xl hover:bg-[#c2eb00] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#D4FF00]/10"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </form>

            <div className="border-t border-[#1F1F1F] pt-4">
              <p className="text-xs text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#D4FF00]" />
                Acceso Rápido 1-Clic:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginDemo('gym', '12345')}
                  className="p-2.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#D4FF00]/40 rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#D4FF00]">
                      Coach Principal (gym / 12345)
                    </div>
                    <div className="text-[11px] text-zinc-400">Usuario: gym • Clave: 12345</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D4FF00]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginDemo('santiago.gomez@alumno.gymmaster.io', 'santi123')}
                  className="p-2.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#D4FF00]">
                      Santiago Gómez (Alumno)
                    </div>
                    <div className="text-[11px] text-zinc-500">santiago.gomez@alumno.gymmaster.io</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#D4FF00]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
