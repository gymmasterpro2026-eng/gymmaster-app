import React, { useState } from 'react';
import { Dumbbell, Shield, User, Code2, FolderTree, Database, RefreshCw, Building2, LogOut, LogIn, Globe2, ChevronRight, Activity, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Profile, UserRole, GymTenant } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedAlumnoId: string;
  setSelectedAlumnoId: (id: string) => void;
  alumnos: Profile[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onResetData: () => void;
  onOpenGymGenerator: () => void;
  activeGym: GymTenant | null;
  currentUser: Profile | null;
  onLogout: () => void;
}

const NavButton = ({ active, onClick, icon: Icon, label, color = "text-zinc-400" }: { active: boolean, onClick: () => void, icon: any, label: string, color?: string }) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-none text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
      active ? 'text-black bg-white shadow-md' : `text-white bg-slate-900 hover:bg-slate-800`
    }`}
  >
    <div className="flex items-center gap-3 relative z-10">
      <Icon className={`w-4 h-4 ${active ? 'text-black' : (color === 'text-zinc-400' ? 'text-white' : color)} transition-colors`} />
      <span>{label}</span>
    </div>
    {active && (
      <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white z-0" />
    )}
    {!active && (
      <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
    )}
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({
  currentRole, setCurrentRole, selectedAlumnoId, setSelectedAlumnoId, alumnos = [],
  currentTab, setCurrentTab, onResetData, onOpenGymGenerator, activeGym, currentUser, onLogout,
}) => {
  const safeAlumnos = Array.isArray(alumnos) ? alumnos : [];
  const activeAlumno = safeAlumnos.find((a) => a && a.id === selectedAlumnoId);
  const isPlanExpired = activeAlumno ? new Date(activeAlumno.plan_active_until) < new Date() : false;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string, role?: UserRole) => {
    if (role) setCurrentRole(role);
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <aside className={`w-full md:w-[280px] flex-shrink-0 flex flex-col glass-panel md:border-y-0 md:border-l-0 rounded-none relative z-50 transition-all duration-300 ${isMobileMenuOpen ? 'h-screen absolute top-0 left-0 bg-[#030303]/95 backdrop-blur-xl' : 'h-auto md:h-screen'}`}>
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 relative overflow-hidden flex justify-between items-center md:items-start md:flex-col gap-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-none blur-[80px] opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-4 cursor-pointer relative z-10" onClick={() => handleNavClick('home')}>
          <div className="bg-white p-2.5 rounded-none text-black shadow-lg">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900 leading-tight">
              GymMaster <span className="text-amber-500">PRO</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                {activeGym ? activeGym.name : 'SaaS Multi-Tenant'}
              </span>
            </div>
          </div>
        </div>

        <button 
          className="md:hidden p-2 text-white/70 hover:text-white relative z-20 bg-white/5 border border-white/10 flex items-center justify-center shrink-0" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 overflow-hidden`}>


      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 custom-scrollbar">
        
        {/* Main Nav */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest px-3 mb-3">Principal</p>
          
          <NavButton active={currentTab === 'home'} onClick={() => handleNavClick('home')} icon={currentRole === 'alumno' ? Dumbbell : User} label={currentRole === 'alumno' ? 'Mi Entrenamiento' : 'Coach & Alumnos'} />
          
          {currentRole === 'alumno' && (
            <NavButton active={currentTab === 'running'} onClick={() => handleNavClick('running')} icon={Activity} label="Trainer de Running" color="text-amber-500" />
          )}
          
          {currentRole === 'coach' && (
            <>
              <NavButton active={currentTab === 'catalog'} onClick={() => handleNavClick('catalog')} icon={Database} label="Ejercicios" color="text-blue-400" />
              <NavButton active={currentTab === 'sql'} onClick={() => handleNavClick('sql')} icon={Shield} label="SQL & RLS" color="text-amber-400" />
              <NavButton active={currentTab === 'import'} onClick={() => handleNavClick('import')} icon={Code2} label="Import Node" color="text-emerald-400" />
              <NavButton active={currentTab === 'structure'} onClick={() => handleNavClick('structure')} icon={FolderTree} label="Estructura" color="text-purple-400" />
            </>
          )}
        </div>

        {/* Global Admin Actions */}
        {currentRole === 'coach' && (
          <div className="space-y-1.5 mt-8">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-3 mb-3">Administración</p>
            <NavButton active={currentTab === 'create-gym'} onClick={() => handleNavClick('create-gym')} icon={Building2} label="Nuevo Gimnasio" />
            <NavButton active={currentTab === 'list-gyms'} onClick={() => handleNavClick('list-gyms')} icon={Globe2} label="Ver Gimnasios" />
          </div>
        )}
      </div>

      {/* Footer Area: User Profile & Context */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        
        {/* Context Switchers */}
        {(!currentUser || currentUser.role !== 'alumno') && (
          <div className="mb-4 space-y-3">
            <div className="bg-black/40 p-1 rounded-none border border-white/5 flex items-center relative">
              <button
                onClick={() => handleNavClick('home', 'coach')}
                className={`flex-1 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-1.5 ${currentRole === 'coach' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <Shield className="w-3 h-3" /> Coach
              </button>
              <button
                onClick={() => handleNavClick('home', 'alumno')}
                className={`flex-1 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-1.5 ${currentRole === 'alumno' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <User className="w-3 h-3" /> Alumno
              </button>
              
              {/* Animated Pill Background */}
              <motion.div 
                layout
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-none z-0"
                initial={false}
                animate={{ left: currentRole === 'coach' ? '4px' : '50%' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>

            {currentRole === 'alumno' && (
              <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-none border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seleccionar Alumno</span>
                <div className="relative">
                  <select
                    value={selectedAlumnoId}
                    onChange={(e) => setSelectedAlumnoId(e.target.value)}
                    className="w-full bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    {safeAlumnos.map((al) => {
                      const isExp = new Date(al.plan_active_until) < new Date();
                      return (
                        <option key={al.id} value={al.id} className="bg-[#0F0F0F] text-white">
                          {al.full_name} {isExp ? '❌ (Vencido)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className={`w-2 h-2 rounded-full ${isPlanExpired ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        <div className={`items-center justify-between bg-white/[0.03] border border-white/5 p-3 rounded-none ${currentTab !== 'home' ? 'hidden md:flex' : 'flex'}`}>
          {currentUser ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-none bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-[#D4FF00] uppercase font-bold tracking-widest">{currentUser.role}</p>
              </div>
            </div>
          ) : (
            <button onClick={onOpenGymGenerator} className="text-sm font-bold text-[#D4FF00] flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </button>
          )}

          <div className="flex items-center gap-1">
            <button onClick={onResetData} title="Restablecer Datos" className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            {currentUser && (
              <button onClick={onLogout} title="Cerrar Sesión" className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
      </div>
    </aside>
  );
};
