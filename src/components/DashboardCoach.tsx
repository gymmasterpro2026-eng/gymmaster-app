import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Dumbbell, Shield, Calendar, Plus, CheckCircle2, Clock, AlertCircle, FileSpreadsheet, ChevronRight, TrendingUp, Sparkles, Zap, RotateCcw, Edit2, Save, X, Upload, Camera, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { RoutineBuilder } from './RoutineBuilder';

interface DashboardCoachProps {
  coach: Profile;
  exercises: Exercise[];
  onRefreshData: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
];

export const DashboardCoach: React.FC<DashboardCoachProps> = ({ coach, exercises, onRefreshData }) => {
  if (!coach) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 font-mono">
        Sin información de perfil de entrenador.
      </div>
    );
  }

  const [showRoutineBuilder, setShowRoutineBuilder] = useState<boolean>(false);
  const [routineBuilderAlumnoId, setRoutineBuilderAlumnoId] = useState<string | undefined>(undefined);
  const [showAddAlumnoModal, setShowAddAlumnoModal] = useState<boolean>(false);
  const [selectedAlumnoForDetails, setSelectedAlumnoForDetails] = useState<string | null>(null);

  const [editingCredsAlumnoId, setEditingCredsAlumnoId] = useState<string | null>(null);
  const [editCredsEmail, setEditCredsEmail] = useState('');
  const [editCredsPassword, setEditCredsPassword] = useState('');

  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newPlanExpiry, setNewPlanExpiry] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString()
  );
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(AVATAR_PRESETS[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const alumnos = coach.id ? dataService.getAlumnosByCoach(coach.id) : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newEmail || !coach.id) return;

    dataService.createAlumno({
      gym_id: coach.gym_id,
      managed_by: coach.id,
      full_name: newNombre,
      email: newEmail,
      password: newPassword,
      phone: newTelefono,
      avatar_url: newAvatarUrl,
      plan_active_until: new Date(newPlanExpiry).toISOString(),
    });

    setNewNombre('');
    setNewEmail('');
    setNewPassword('');
    setNewTelefono('');
    setNewAvatarUrl(AVATAR_PRESETS[0]);
    setShowAddAlumnoModal(false);
    onRefreshData();
  };

  const handleRenewPlan = (alumnoId: string, daysToAdd: number) => {
    const newDate = new Date(Date.now() + daysToAdd * 86400000).toISOString();
    dataService.updatePlanValidity(alumnoId, newDate);
    onRefreshData();
  };

  const handleSaveCredentials = (alumnoId: string) => {
    dataService.updateAlumnoCredentials(alumnoId, editCredsEmail, editCredsPassword);
    setEditingCredsAlumnoId(null);
    onRefreshData();
  };

  const selectedAlumnoRoutines: RoutineWithLogs[] = selectedAlumnoForDetails
    ? dataService.getRoutinesForAlumno(selectedAlumnoForDetails)
    : [];

  return (
    <div className="space-y-8 pb-12 relative z-10">
      
      {/* Coach Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl border border-gray-200 p-8 rounded-none relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900 rounded-full blur-[100px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={coach.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={coach.full_name}
                className="w-20 h-20 rounded-none object-cover ring-2 ring-blue-900/40 shadow-[0_0_20px_rgba(30,58,138,0.2)]"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-900 p-1.5 rounded-none text-black shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-900/10 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-900/20 uppercase tracking-widest">
                  ADMINISTRADOR
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">ID: {coach.gym_id}</span>
              </div>
              <h1 className="text-3xl font-black text-black tracking-tight">
                {coach.full_name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Gestión de Alumnos y Rutinas con Aislamiento de Datos RLS</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddAlumnoModal(true)}
              className="bg-white shadow-xl border border-gray-200-hover bg-gray-50 border border-gray-200 text-black font-bold px-5 py-3 rounded-none text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-blue-900" />
              <span>Nuevo Alumno</span>
            </button>
            <button
              onClick={() => { setRoutineBuilderAlumnoId(undefined); setShowRoutineBuilder(true); }}
              className="bg-blue-900 hover:bg-blue-800 text-white font-black px-6 py-3 rounded-none text-xs shadow-[0_0_20px_rgba(30,58,138,0.2)] flex items-center gap-2 transition-all cursor-pointer uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Rutina</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Routine Builder Drawer */}
      <AnimatePresence>
        {showRoutineBuilder && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-4">
              <RoutineBuilder
                coachId={coach.id}
                gymId={coach.gym_id}
                alumnos={alumnos}
                exercises={exercises}
                initialAlumnoId={routineBuilderAlumnoId}
                onRoutineCreated={() => { setShowRoutineBuilder(false); onRefreshData(); }}
                onCancel={() => setShowRoutineBuilder(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Alumno Modal */}
      <AnimatePresence>
        {showAddAlumnoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddAlumnoModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white shadow-xl border border-gray-200 p-8 max-w-md w-full rounded-none relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <div className="bg-blue-900/10 p-2 rounded-none"><UserPlus className="w-5 h-5 text-blue-900" /></div>
                  Registrar Alumno
                </h3>
                <button onClick={() => setShowAddAlumnoModal(false)} className="text-gray-400 hover:text-black transition-colors">✕</button>
              </div>

              <form onSubmit={handleCreateAlumno} className="space-y-5">
                {/* Foto de Perfil & Upload */}
                <div className="space-y-2 bg-gray-50 border border-gray-200 p-4 rounded-none text-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                    Foto de Perfil del Alumno
                  </label>

                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={newAvatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-900/40 shadow-md"
                    />

                    <div className="flex flex-col gap-2 text-left">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-900 text-white px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5 hover:bg-blue-800 transition-all cursor-pointer shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Subir Foto del Celular / PC</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewAvatarUrl(preset)}
                            className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                              newAvatarUrl === preset ? 'border-blue-900 scale-110' : 'border-gray-300 opacity-60'
                            }`}
                          >
                            <img src={preset} alt={`P ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="URL de foto o imagen base64..."
                    className="w-full bg-white border border-gray-200 text-xs px-3 py-1.5 rounded-none outline-none focus:border-blue-900 font-mono text-gray-600 mt-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-none outline-none focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900/30 transition-all font-medium" placeholder="Ej: Laura Ramírez" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Usuario (Email o Alias)</label>
                  <input type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-none outline-none focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900/30 transition-all font-medium" placeholder="ej: juan_perez" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contraseña de Acceso</label>
                    <button type="button" onClick={() => setNewPassword(Math.random().toString(36).slice(-8))} className="text-[10px] font-bold text-blue-900 hover:underline uppercase">Generar Random</button>
                  </div>
                  <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-blue-900 px-4 py-3 rounded-none outline-none focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900/30 transition-all font-mono font-bold tracking-wider" placeholder="Contraseña segura" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
                  <input type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-none outline-none focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900/30 transition-all font-medium" placeholder="+52 55 0000 0000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Vigencia del Plan</label>
                  <input type="datetime-local" value={newPlanExpiry.slice(0, 16)} onChange={(e) => setNewPlanExpiry(new Date(e.target.value).toISOString())} required className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-none outline-none focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900/30 transition-all font-medium [color-scheme:dark]" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setShowAddAlumnoModal(false)} className="px-5 py-2.5 rounded-none text-xs font-bold text-gray-500 hover:text-black transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 rounded-none text-xs font-black text-white bg-blue-900 hover:bg-blue-800 uppercase tracking-widest transition-all shadow-md">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alumnos Directory Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 p-2 rounded-none border border-gray-200">
              <Users className="w-5 h-5 text-blue-900" />
            </div>
            <h2 className="text-xl font-black text-black">Alumnos Asignados <span className="text-gray-400 font-medium ml-2">({alumnos.length})</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alumnos.map((alumno) => {
            const isPlanActive = new Date(alumno.plan_active_until) >= new Date();
            const activeRoutine = dataService.getActiveRoutineForAlumno(alumno.id);
            const isSelected = selectedAlumnoForDetails === alumno.id;

            return (
              <motion.div
                layoutId={`card-${alumno.id}`}
                key={alumno.id}
                className={`bg-white shadow-xl border border-gray-200 p-6 rounded-none transition-all duration-300 relative overflow-hidden group ${isSelected ? 'border-blue-900/30 shadow-[0_0_30px_rgba(30,58,138,0.1)] bg-gray-100' : 'hover:border-gray-200'}`}
              >
                {/* Glow behind card if selected */}
                {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent pointer-events-none" />}

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <img src={alumno.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} alt={alumno.full_name} className="w-14 h-14 rounded-none object-cover ring-1 ring-white/10" />
                    <div>
                      <h3 className="font-bold text-black text-lg leading-tight">{alumno.full_name}</h3>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{alumno.email}</p>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${isPlanActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {isPlanActive ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                </div>

                {/* Plan Info */}
                <div className="bg-white border border-gray-200 rounded-none p-3.5 flex items-center justify-between mb-4 relative z-10 group-hover:bg-gray-100 transition-colors">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest block mb-0.5">Vencimiento Plan</span>
                    <span className={`font-mono font-bold text-sm ${isPlanActive ? 'text-black' : 'text-red-400'}`}>
                      {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <button onClick={() => handleRenewPlan(alumno.id, 30)} title="Añadir 30 días" className="bg-blue-900/10 hover:bg-blue-900/20 text-blue-900 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                    <RotateCcw className="w-3 h-3" /> +30 Días
                  </button>
                </div>

                {/* Credenciales Info */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest block">Credenciales de Ingreso</span>
                    {editingCredsAlumnoId !== alumno.id && (
                      <button 
                        onClick={() => {
                          setEditingCredsAlumnoId(alumno.id);
                          setEditCredsEmail(alumno.email);
                          setEditCredsPassword(alumno.password || '');
                        }} 
                        className="text-[10px] text-gray-500 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                    )}
                  </div>
                  
                  {editingCredsAlumnoId === alumno.id ? (
                    <div className="bg-blue-900/5 border border-blue-900/20 p-3 rounded-none flex flex-col gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-blue-900 font-bold uppercase tracking-widest">Usuario (Email)</label>
                        <input type="text" value={editCredsEmail} onChange={(e) => setEditCredsEmail(e.target.value)} className="bg-gray-100 border border-blue-900/20 rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-blue-900" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-blue-900 font-bold uppercase tracking-widest">Clave</label>
                        <input type="text" value={editCredsPassword} onChange={(e) => setEditCredsPassword(e.target.value)} className="bg-gray-100 border border-blue-900/20 rounded-none px-2.5 py-1.5 text-xs text-blue-900 font-mono focus:outline-none focus:border-blue-900" placeholder="Nueva contraseña" />
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button onClick={() => setEditingCredsAlumnoId(null)} className="p-1.5 rounded-none text-gray-500 hover:text-black bg-gray-50 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleSaveCredentials(alumno.id)} className="p-1.5 rounded-none text-black bg-blue-900 hover:bg-blue-800 transition-colors"><Save className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 p-3 rounded-none flex flex-col gap-2 group-hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold">Usuario:</span>
                        <span className="text-xs font-mono font-bold text-black truncate max-w-[150px]">{alumno.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold">Clave:</span>
                        <span className="text-xs font-mono font-bold text-blue-900">{alumno.password ? '••••••••' : 'Sin asignar'}</span>
                      </div>
                      <button 
                        onClick={() => {
                          alert(`DATOS DE ACCESO PARA ${alumno.full_name}:\n\n👤 Usuario: ${alumno.email}\n🔑 Contraseña: ${alumno.password || '(No tiene contraseña. Actualiza su perfil)'}\n\nCon estos datos el alumno puede iniciar sesión en la pantalla principal.`);
                        }}
                        className="mt-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black text-[10px] py-1.5 rounded-none font-bold uppercase tracking-widest transition-colors w-full flex items-center justify-center gap-1.5"
                      >
                        Ver Credenciales
                      </button>
                    </div>
                  )}
                </div>

                {/* Routine Info */}
                <div className="mb-6 relative z-10">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest block mb-2">Rutina Activa</span>
                  {activeRoutine ? (
                    <div className="bg-blue-900/5 border border-blue-900/10 p-3 rounded-none flex items-center justify-between">
                      <div className="truncate pr-3">
                        <span className="font-bold text-blue-900 block truncate text-sm">{activeRoutine.nombre_rutina}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{activeRoutine.logs.length} ejercicios asignados</span>
                      </div>
                      <span className="text-blue-900 text-[10px] font-black uppercase tracking-widest bg-blue-900/10 px-2 py-1 rounded-none">En Sala</span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-none text-center text-xs text-gray-400 font-medium">
                      Sin rutina activa asignada
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-10">
                  <button onClick={() => setSelectedAlumnoForDetails(isSelected ? null : alumno.id)} className={`flex-1 py-2.5 rounded-none text-xs font-bold transition-all flex items-center justify-center gap-2 ${isSelected ? 'bg-gray-100 text-black' : 'bg-transparent border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black'}`}>
                    <span>{isSelected ? 'Ocultar Detalle' : 'Ver Registros'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </button>
                  <button onClick={() => { setRoutineBuilderAlumnoId(alumno.id); setShowRoutineBuilder(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-white text-black px-4 py-2.5 rounded-none text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    + Rutina
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Alumno Logs Detail */}
      <AnimatePresence>
        {selectedAlumnoForDetails && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white shadow-xl border border-gray-200 p-8 rounded-none mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-6 mb-6 gap-4">
              <div>
                <span className="bg-blue-900/10 text-blue-900 text-[10px] font-black px-3 py-1 rounded-full border border-blue-900/20 uppercase tracking-widest">
                  Monitoreo de Cargas
                </span>
                <h3 className="text-2xl font-black text-black mt-3">
                  Registro Histórico de <span className="text-blue-900">{alumnos.find((a) => a.id === selectedAlumnoForDetails)?.full_name}</span>
                </h3>
              </div>
              <button onClick={() => setSelectedAlumnoForDetails(null)} className="text-xs font-bold text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-none transition-colors">
                Cerrar Panel
              </button>
            </div>

            {selectedAlumnoRoutines.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-medium">Este alumno no tiene rutinas creadas en su historial.</div>
            ) : (
              <div className="space-y-6">
                {selectedAlumnoRoutines.map((routine) => (
                  <div key={routine.id} className="bg-white border border-gray-200 rounded-none overflow-hidden">
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-gray-50">
                      <div>
                        <h4 className="font-bold text-black text-lg">{routine.nombre_rutina}</h4>
                        <span className="text-xs text-gray-400 font-medium">Creada el {new Date(routine.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${routine.activa ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        {routine.activa ? 'En Uso Actualmente' : 'Archivada'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                          <tr>
                            <th className="px-6 py-4">#</th>
                            <th className="px-6 py-4">Ejercicio</th>
                            <th className="px-6 py-4 text-center">Volumen</th>
                            <th className="px-6 py-4 text-center">Meta (KG)</th>
                            <th className="px-6 py-4 text-center">Logro (KG)</th>
                            <th className="px-6 py-4 text-right">Actualizado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                          {routine.logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-black text-zinc-600">{log.orden}</td>
                              <td className="px-6 py-4 text-black">{log.exercise?.name}</td>
                              <td className="px-6 py-4 text-center font-mono">{log.series} × {log.repeticiones}</td>
                              <td className="px-6 py-4 text-center font-mono text-gray-500">{log.peso_objetivo}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-none border ${log.peso_real >= log.peso_objetivo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-gray-700 border-zinc-700'}`}>
                                  {log.peso_real}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-400 font-mono text-[10px]">
                                {new Date(log.fecha_ultimo_cambio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
