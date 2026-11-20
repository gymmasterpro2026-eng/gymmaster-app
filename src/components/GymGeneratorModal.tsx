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
      setLoginError('Ingresa tu usuario.');
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
    <div className="titan-modal-overlay" style={{ zIndex: 50 }}>
      <div className="titan-modal w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="titan-btn-armor-copper p-2">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="titan-section-title text-lg">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-400">Ingresa tus credenciales para acceder a tu tenant.</p>
            </div>
          </div>
          <button onClick={onClose} className="titan-btn-armor-steel p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 relative z-10 overflow-y-auto">
          <div className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="titan-inset-well p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Credenciales por defecto:
                </span>
                <span className="titan-badge-copper font-mono px-2.5 py-1">
                  Usuario: <strong className="text-white">gym</strong> | Clave: <strong className="text-white">123456</strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-titan font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  placeholder="gym"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="titan-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-titan font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="123456"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="titan-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="titan-btn-armor-glow w-full py-3 px-4 text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </form>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Acceso Rápido 1-Clic:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginDemo('gym', '123456')}
                  className="titan-btn-armor-steel p-2.5 text-left justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400">
                      Coach Principal (gym / 123456)
                    </div>
                    <div className="text-[10px] text-slate-400 normal-case">Usuario: gym • Clave: 123456</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginDemo('santiago.gomez@alumno.gymmaster.io', 'santi123')}
                  className="titan-btn-armor-steel p-2.5 text-left justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">
                      Santiago Gómez (Alumno)
                    </div>
                    <div className="text-[10px] text-slate-400 normal-case truncate max-w-[160px]">santiago.gomez@alumno...</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
