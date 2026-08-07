import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, ArrowRight, Shield, KeyRound, Globe2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { GymTenant, Profile } from '../types';

export const CreateGymView: React.FC<{ onGymCreated: (gym: GymTenant, coach: Profile) => void }> = ({ onGymCreated }) => {
  const [gymName, setGymName] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!gymName.trim()) {
      setCreateError('Por favor ingresa el nombre del gimnasio.');
      return;
    }
    if (!adminName.trim() || !adminEmail.trim()) {
      setCreateError('Por favor completa el nombre y correo del entrenador admin.');
      return;
    }
    if (!adminPassword || adminPassword.length < 4) {
      setCreateError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    try {
      const { gym, coach } = dataService.createGym(
        gymName.trim(),
        plan,
        adminName.trim(),
        adminEmail.trim(),
        adminPassword
      );

      setCreateSuccess(`¡Gimnasio "${gym.name}" generado exitosamente! Iniciando sesión...`);
      setTimeout(() => {
        onGymCreated(gym, coach);
      }, 1000);
    } catch (err) {
      setCreateError('Error al generar el gimnasio. Intenta nuevamente.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#D4FF00] rounded-full blur-[120px] opacity-10"></div>
        
        <div className="mb-6 border-b border-[#1A1A1A] pb-6 relative z-10">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#D4FF00]" />
            Generar Nuevo Gimnasio
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Crea una nueva instancia aislada con Row Level Security.
          </p>
        </div>

        <form onSubmit={handleCreateGym} className="space-y-6 relative z-10">
          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{createSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Nombre del Gimnasio / Negocio
              </label>
              <input
                type="text"
                required
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                placeholder="Ej. Titan Fitness Center"
                className="w-full bg-[#121212] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                  Plan SaaS
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="free">Free (Limitado)</option>
                  <option value="pro">PRO (Recomendado)</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4FF00]" />
              Crear Entrenador Administrador
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                  Correo Electrónico (Usuario)
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@tu-gym.com"
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-[#121212] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4FF00] to-lime-400 text-black font-black py-3.5 px-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#D4FF00]/20 mt-4"
          >
            <Globe2 className="w-5 h-5" />
            <span>Generar y Desplegar Gimnasio</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const GymListView: React.FC<{ onEnterGym: (gym: GymTenant, coach: Profile) => void }> = ({ onEnterGym }) => {
  const [allGyms, setAllGyms] = useState<GymTenant[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    setAllGyms(dataService.getGyms());
    setAllProfiles(dataService.getProfiles());
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-[#D4FF00] p-2 rounded-xl text-black">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Lista de Gimnasios (Tenants)</h2>
          <p className="text-xs text-zinc-400">Total aislados por Row Level Security: {allGyms.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allGyms.map((gym) => {
          const gymProfiles = allProfiles.filter((p) => p.gym_id === gym.id);
          const coach = gymProfiles.find((p) => p.role === 'coach') || gymProfiles[0];

          return (
            <div
              key={gym.id}
              className="p-5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl flex flex-col justify-between gap-4 transition-all hover:border-[#D4FF00]/30 shadow-lg"
            >
              <div className="flex items-start space-x-3">
                <div className="bg-[#111111] p-3 rounded-xl border border-[#222222] text-[#D4FF00]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    {gym.name}
                    <span className="text-[10px] bg-[#111111] border border-[#222222] text-[#D4FF00] font-mono px-2 py-0.5 rounded uppercase">
                      {gym.plan}
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-mono mb-2">ID: {gym.id}</p>
                  {coach && (
                    <div className="bg-[#111111] p-2 rounded-lg text-xs border border-[#222222]">
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-1">Admin / Coach:</span>
                      <div className="text-zinc-300 font-medium">{coach.full_name}</div>
                      <div className="text-zinc-500">{coach.email}</div>
                    </div>
                  )}
                </div>
              </div>

              {coach && (
                <button
                  type="button"
                  onClick={() => onEnterGym(gym, coach)}
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#D4FF00] hover:text-black text-sm font-bold text-white rounded-xl transition-all border border-[#222222] hover:border-[#D4FF00] flex items-center justify-center space-x-2"
                >
                  <span>Entrar al Gym</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
