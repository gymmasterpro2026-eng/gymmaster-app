import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Dumbbell, Shield, Plus, CheckCircle2, AlertCircle, ChevronRight, RotateCcw, Edit2, Save, X, Upload, Trash2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { RoutineBuilder } from './RoutineBuilder';
import { EditProfileModal } from './EditProfileModal';
import { fixImageUrl } from '../utils/imageUrl';

interface DashboardCoachProps {
  coach: Profile;
  exercises: Exercise[];
  onRefreshData: () => void;
  onViewStudentProfile?: (alumnoId: string) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonsHomer&backgroundColor=fcd34d',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeBoy1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=SimpsonBart&skinColor=f8d25c&backgroundColor=fbbf24',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeGirl1&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonCoach&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=AnimeHero2&backgroundColor=c084fc',
];

const getWeekDayColor = (semana: number, dia: string) => {
  const distinctHues = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', // Reds to Limes
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', // Greens to Sky Blues
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', // Blues to Fuchsias
    '#ec4899', '#f43f5e', '#fb7185', '#34d399', '#2dd4bf', // Pinks to Emeralds/Teals
    '#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#f472b6', // Light Blues to Light Pinks
    '#fbbf24', '#a3e635', '#4ade80', '#60a5fa', '#f87171'  // Light Ambers to Light Reds
  ];
  
  const dayOffsets: Record<string, number> = {
    Lunes: 0, Martes: 1, Miercoles: 2, Miércoles: 2,
    Jueves: 3, Viernes: 4, Sabado: 5, Sábado: 5, Domingo: 6
  };
  
  // Avanzamos 7 colores por cada semana para no repetir la paleta hasta la 5ta semana
  const index = ((semana - 1) * 7) + (dayOffsets[dia] || 0);
  return distinctHues[index % distinctHues.length];
};

const S = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  headerBanner: {
    background: 'linear-gradient(135deg, #0f172a, #1e293b, #451a03)',
    border: '1px solid #334155', padding: '24px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '20px',
    marginBottom: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
  },
  coachAvatar: { width: '72px', height: '72px', minWidth: '72px', minHeight: '72px', objectFit: 'cover' as const, border: '2px solid #f59e0b', flexShrink: 0 },
  badgeGold: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' as const },
  title: { fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '4px 0 0' },
  subtitle: { fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' },
  
  btnPrimary: { background: '#f59e0b', color: '#000000', border: 'none', padding: '10px 18px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  btnSecondary: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', padding: '10px 18px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' },
  card: (selected: boolean, urgency: 'normal' | 'warning' | 'critical'): React.CSSProperties => {
    if (urgency === 'critical') return {
      background: '#7f1d1d',
      border: '2px solid #ef4444',
      boxShadow: '0 0 18px rgba(239,68,68,0.25)',
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s'
    };
    if (urgency === 'warning') return {
      background: '#92400e',
      border: '2px solid #f59e0b',
      boxShadow: '0 0 18px rgba(245,158,11,0.20)',
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s'
    };
    return {
      background: selected ? '#64748b' : '#475569',
      border: `1px solid ${selected ? '#f59e0b' : '#64748b'}`,
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s'
    };
  },
  alumnoAvatar: { width: '60px', height: '60px', minWidth: '60px', minHeight: '60px', objectFit: 'cover' as const, border: '2px solid #f59e0b', flexShrink: 0 },
  
  inputBox: { background: '#020617', border: '1px solid #1e293b', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  inputLbl: { fontSize: '10px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' as const },
  input: { width: '100%', background: '#0f172a', color: '#ffffff', fontSize: '12px', fontWeight: 700, padding: '8px 12px', border: '1px solid #334155', outline: 'none', boxSizing: 'border-box' as const },
  
  modalOverlay: { position: 'fixed' as const, inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  modal: { background: '#0f172a', border: '1px solid #334155', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' as const, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' as const }
};

export const DashboardCoach: React.FC<DashboardCoachProps> = ({ coach, exercises, onRefreshData }) => {
  if (!coach) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>
        Sin información de perfil de entrenador.
      </div>
    );
  }

  const [showRoutineBuilder, setShowRoutineBuilder] = useState<boolean>(false);
  const [routineBuilderAlumnoId, setRoutineBuilderAlumnoId] = useState<string | undefined>(undefined);
  const [showAddAlumnoModal, setShowAddAlumnoModal] = useState<boolean>(false);
  const [selectedAlumnoForDetails, setSelectedAlumnoForDetails] = useState<string | null>(null);
  const [editingProfileTarget, setEditingProfileTarget] = useState<Profile | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDeleteAlumno = async (alumno: Profile) => {
    if (window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar a "${alumno.full_name}"?\n\nEsta acción es IRREVERSIBLE. Se borrarán todas sus rutinas, su historial de ejercicios y su acceso de Supabase para siempre.`)) {
      await dataService.deleteAlumno(alumno.id);
      onRefreshData();
    }
  };

  const [editingCredsAlumnoId, setEditingCredsAlumnoId] = useState<string | null>(null);
  const [editCredsEmail, setEditCredsEmail] = useState('');
  const [editCredsPassword, setEditCredsPassword] = useState('');
  const [createAlumnoError, setCreateAlumnoError] = useState<string>('');
  const [renewDays, setRenewDays] = useState<Record<string, number>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [paymentDates, setPaymentDates] = useState<Record<string, string>>({});
  const [paymentFrequencies, setPaymentFrequencies] = useState<Record<string, 'mensual' | 'semanal' | 'diario'>>({});
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newPlanStart, setNewPlanStart] = useState<string>(
    new Date().toISOString()
  );
  const [newPlanExpiry, setNewPlanExpiry] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString()
  );
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(AVATAR_PRESETS[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const alumnos = coach.id ? dataService.getAlumnosByCoach(coach.id) : [];
  const filteredAlumnos = alumnos.filter(a => 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setCreateAlumnoError('');
    if (!newNombre || !newEmail || !coach.id) return;

    // ── PARCHE SEGURIDAD: usuario duplicado ──────────────────────────────
    const emailNorm = newEmail.trim().toLowerCase();
    const allProfiles = dataService.getProfiles();
    const duplicate = allProfiles.find(
      (p) => p.email.trim().toLowerCase() === emailNorm
    );
    if (duplicate) {
      setCreateAlumnoError(`⚠️ Usuario no disponible, ya en uso`);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    dataService.createAlumno({
      gym_id: coach.gym_id,
      managed_by: coach.id,
      full_name: newNombre,
      email: newEmail,
      password: newPassword,
      phone: newTelefono,
      gender: newGender,
      avatar_url: newAvatarUrl,
      plan_active_from: new Date(newPlanStart).toISOString(),
      plan_active_until: new Date(newPlanExpiry).toISOString(),
    });

    setNewNombre('');
    setNewEmail('');
    setNewPassword('');
    setNewTelefono('');
    setNewGender('male');
    setNewPlanStart(new Date().toISOString());
    setNewPlanExpiry(new Date(Date.now() + 30 * 86400000).toISOString());
    setNewAvatarUrl(AVATAR_PRESETS[0]);
    setCreateAlumnoError('');
    setShowAddAlumnoModal(false);
    onRefreshData();
  };

  const handleRenewPlan = (alumnoId: string, daysToAdd: number) => {
    const newDate = new Date(Date.now() + daysToAdd * 86400000).toISOString();
    dataService.updatePlanValidity(alumnoId, newDate);
    onRefreshData();
  };

  const handleRegisterPayment = (alumnoId: string) => {
    const amount = paymentAmounts[alumnoId] || 150000;
    const freq = paymentFrequencies[alumnoId] || 'mensual';
    const daysToAdd = freq === 'mensual' ? 30 : freq === 'semanal' ? 7 : 1;
    const dateStr = paymentDates[alumnoId] || new Date(Date.now() + daysToAdd * 86400000).toISOString();
    
    dataService.registerCobro(
      alumnoId,
      coach.id,
      coach.gym_id,
      amount,
      new Date(dateStr).toISOString(),
      new Date().toISOString(),
      freq
    );
    
    setPaymentAmounts(prev => ({ ...prev, [alumnoId]: 0 }));
    setPaymentDates(prev => ({ ...prev, [alumnoId]: '' }));
    setPaymentFrequencies(prev => ({ ...prev, [alumnoId]: 'mensual' }));
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
    <div style={S.container}>
      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setFullscreenImage(null)}>
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '0', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>Cerrar ✕</button>
          <img src={fullscreenImage} alt="Fullscreen" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', objectFit: 'contain', background: '#fff', padding: '16px', borderRadius: '0' }} />
        </div>
      )}

      {/* Coach Header Banner */}
      <div style={S.headerBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={coach.avatar_url || AVATAR_PRESETS[4]}
              alt={coach.full_name}
              style={S.coachAvatar}
            />
            <button
              onClick={() => setEditingProfileTarget(coach)}
              title="Editar Mi Foto y Nombre"
              style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                background: '#f59e0b', color: '#000', border: 'none',
                borderRadius: '50%', padding: '4px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Edit2 size={12} />
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={coach.gym_id === 'gym-titan-001' ? { ...S.badgeGold, background: 'linear-gradient(135deg, #f59e0b, #dc2626)', color: '#fff' } : S.badgeGold}>
                {coach.gym_id === 'gym-titan-001' ? '⭐ ADMINISTRADOR MASTER' : 'SUCURSAL COACH'}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>ID: {coach.gym_id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={S.title}>{coach.full_name}</h1>
              <button
                onClick={() => setEditingProfileTarget(coach)}
                style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit2 size={12} /> Editar
              </button>
            </div>
            <p style={S.subtitle}>Gestión de Alumnos y Rutinas con Aislamiento RLS</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={S.btnSecondary} onClick={() => setShowAddAlumnoModal(true)}>
            <UserPlus size={16} />
            <span>Nuevo Alumno</span>
          </button>
          <button style={S.btnPrimary} onClick={() => { setRoutineBuilderAlumnoId(undefined); setShowRoutineBuilder(true); }}>
            <Plus size={16} />
            <span>Crear Rutina</span>
          </button>
        </div>
      </div>

      {/* Routine Builder Drawer */}
      {showRoutineBuilder && (
        <div style={{ marginBottom: '28px' }}>
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
      )}

      {/* Add Alumno Modal */}
      {showAddAlumnoModal && (
        <div style={S.modalOverlay} onClick={() => setShowAddAlumnoModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#f59e0b" />
                Registrar Nuevo Alumno
              </h3>
              <button onClick={() => setShowAddAlumnoModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAlumno} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Avatar Selector */}
              <div style={S.inputBox}>
                <label style={S.inputLbl}>Foto de Perfil del Alumno:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={newAvatarUrl} alt="Preview" style={S.alumnoAvatar} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={S.btnSecondary}
                    >
                      <Upload size={14} />
                      <span>Subir Foto</span>
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt={`Avatar ${idx}`}
                          onClick={() => setNewAvatarUrl(preset)}
                          style={{
                            width: '32px', height: '32px', objectFit: 'cover', cursor: 'pointer',
                            border: newAvatarUrl === preset ? '2px solid #f59e0b' : '1px solid #334155'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={S.inputLbl}>Nombre Completo:</label>
                <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} required placeholder="Ej: Laura Ramírez" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Usuario / Email:</label>
                <input type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="ej: laura_ramirez" style={S.input} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={S.inputLbl}>Contraseña:</label>
                  <button type="button" onClick={() => setNewPassword(Math.random().toString(36).slice(-8))} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>GENERAR RANDOM</button>
                </div>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Contraseña de ingreso" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Teléfono:</label>
                <input type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder="+54 9 11 0000-0000" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Género:</label>
                <select value={newGender} onChange={(e) => setNewGender(e.target.value as 'male' | 'female')} style={S.input}>
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label style={S.inputLbl}>Vigencia del Plan (Desde - Hasta):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="datetime-local" value={newPlanStart.slice(0, 16)} onChange={(e) => setNewPlanStart(new Date(e.target.value).toISOString())} required style={{ ...S.input, flex: 1 }} />
                  <input type="datetime-local" value={newPlanExpiry.slice(0, 16)} onChange={(e) => setNewPlanExpiry(new Date(e.target.value).toISOString())} required style={{ ...S.input, flex: 1 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #1e293b', flexDirection: 'column' }}>
                {createAlumnoError && (
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                    {createAlumnoError}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => { setShowAddAlumnoModal(false); setCreateAlumnoError(''); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" style={S.btnPrimary}>
                    Guardar Alumno
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alumnos List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#f59e0b" />
            Alumnos Asignados <span style={{ color: '#64748b', fontSize: '14px' }}>({alumnos.length})</span>
          </h2>
          <div style={{ position: 'relative', width: '300px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #1e293b',
                color: '#ffffff',
                padding: '10px 10px 10px 36px',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={S.grid}>
          {filteredAlumnos.length > 0 ? filteredAlumnos.map((alumno) => {
            const isPlanActive = new Date(alumno.plan_active_until) >= new Date();
            const activeRoutine = dataService.getActiveRoutineForAlumno(alumno.id);
            const isSelected = selectedAlumnoForDetails === alumno.id;
            const daysLeft = Math.ceil((new Date(alumno.plan_active_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const urgency: 'normal' | 'warning' | 'critical' =
              !isPlanActive || daysLeft <= 1 ? 'critical' :
              daysLeft <= 4 ? 'warning' : 'normal';

            const allCobros = dataService.getCobros();
            const hasPaidBefore = allCobros.some(c => c.alumno_id === alumno.id);
            const lastGrace = alumno.last_grace_date ? new Date(alumno.last_grace_date).getTime() : 0;
            const canAddGrace = hasPaidBefore && (Date.now() - lastGrace > 30 * 86400000);

            return (
              <div key={alumno.id} style={S.card(isSelected, urgency)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={alumno.avatar_url || AVATAR_PRESETS[0]} alt={alumno.full_name} style={S.alumnoAvatar} />
                      <button
                        onClick={() => setEditingProfileTarget(alumno)}
                        title="Editar foto y nombre"
                        style={{
                          position: 'absolute', bottom: '-4px', right: '-4px',
                          background: '#f59e0b', color: '#000', border: 'none',
                          borderRadius: '50%', padding: '3px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Edit2 size={10} />
                      </button>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>{alumno.full_name}</h3>
                        <button
                          onClick={() => setEditingProfileTarget(alumno)}
                          title="Editar Perfil"
                          style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '2px' }}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#ffffff' }}>{alumno.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', padding: '6px 12px', borderRadius: '4px', border: `1px solid ${urgency === 'critical' ? 'rgba(239,68,68,0.4)' : urgency === 'warning' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.05)'}`, minWidth: '80px', marginRight: '8px' }}>
                      <span style={{ fontSize: '8px', color: urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#ffffff', fontWeight: 800, letterSpacing: '0.5px' }}>VENCIMIENTO</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#ffffff', lineHeight: '1' }}>{daysLeft > 0 ? daysLeft : 0}</span>
                        <span style={{ fontSize: '9px', color: urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#ffffff', fontWeight: 800 }}>días</span>
                      </div>
                    </div>
                    <div style={{
                      width: '32px', height: '32px',
                      background: isPlanActive ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
                      border: `1px solid ${isPlanActive ? '#34d399' : '#f87171'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isPlanActive ? <CheckCircle2 size={16} color="#34d399" /> : <AlertCircle size={16} color="#f87171" />}
                    </div>
                    <button
                      onClick={() => handleDeleteAlumno(alumno)}
                      title="Eliminar Alumno"
                      style={{
                        width: '32px', height: '32px',
                        background: 'rgba(248,113,113,0.15)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        color: '#f87171',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Plan Validity Box */}
                <div style={S.inputBox}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <span style={S.inputLbl}>Vencimiento Plan</span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 900, color: isPlanActive ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                        {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.4)', opacity: canAddGrace ? 1 : 0.5 }}>
                      <input
                        type="number"
                        min="1"
                        max="1"
                        disabled={!canAddGrace}
                        value={renewDays[alumno.id] === undefined ? 1 : renewDays[alumno.id]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          if (val > 1) val = 1;
                          if (val < 1) val = 1;
                          setRenewDays(prev => ({ ...prev, [alumno.id]: val }));
                        }}
                        style={{ width: '60px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '6px 2px 6px 8px', fontSize: '18px', fontWeight: 900, textAlign: 'center', outline: 'none', cursor: canAddGrace ? 'text' : 'not-allowed' }}
                        title={!hasPaidBefore ? "El alumno debe tener al menos un pago registrado" : !canAddGrace ? "Solo se puede usar 1 vez cada 30 días" : "Días a sumar (sin registrar pago)"}
                      />
                      <button 
                        disabled={!canAddGrace}
                        onClick={() => {
                          if (!canAddGrace) return;
                          const days = renewDays[alumno.id] === undefined ? 1 : renewDays[alumno.id];
                          if (days === 1) {
                            dataService.addGraceDays(alumno.id, days);
                            onRefreshData();
                          }
                        }} 
                        style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 900, cursor: canAddGrace ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title={!hasPaidBefore ? "El alumno debe tener al menos un pago registrado" : !canAddGrace ? "Solo se puede usar 1 vez cada 30 días" : "Agregar días de gracia"}
                      >
                        <RotateCcw size={12} /> Agregar
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <div>
                      <span style={{...S.inputLbl, color: '#34d399'}}>Cobrar Cuota</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <select
                          value={paymentFrequencies[alumno.id] || 'mensual'}
                          onChange={(e) => {
                            const freq = e.target.value as 'mensual' | 'semanal' | 'diario';
                            setPaymentFrequencies(prev => ({ ...prev, [alumno.id]: freq }));
                            const daysToAdd = freq === 'mensual' ? 30 : freq === 'semanal' ? 7 : 1;
                            setPaymentDates(prev => ({ ...prev, [alumno.id]: new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0] }));
                          }}
                          style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '10px', outline: 'none', borderRadius: '4px', padding: '2px 4px' }}
                        >
                          <option value="mensual">Mensual</option>
                          <option value="semanal">Semanal</option>
                          <option value="diario">Por día</option>
                        </select>
                        <input 
                          type="date"
                          value={paymentDates[alumno.id] || new Date(Date.now() + ((paymentFrequencies[alumno.id] || 'mensual') === 'semanal' ? 7 : (paymentFrequencies[alumno.id] || 'mensual') === 'diario' ? 1 : 30) * 86400000).toISOString().split('T')[0]}
                          onChange={(e) => setPaymentDates(prev => ({ ...prev, [alumno.id]: e.target.value }))}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', outline: 'none', cursor: 'pointer' }}
                          title="Nuevo Vencimiento"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.4)' }}>
                      <span style={{ background: 'rgba(0,0,0,0.5)', color: '#10b981', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '12px', fontWeight: 900 }}>Gs.</span>
                      <input
                        type="number"
                        min="0"
                        value={paymentAmounts[alumno.id] === undefined ? 150000 : paymentAmounts[alumno.id]}
                        onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [alumno.id]: parseInt(e.target.value) || 0 }))}
                        style={{ width: '80px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '6px 2px 6px 4px', fontSize: '14px', fontWeight: 900, textAlign: 'right', outline: 'none' }}
                        title="Monto a cobrar"
                      />
                      <button onClick={() => handleRegisterPayment(alumno.id)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Pagar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credentials Box */}
                <div style={S.inputBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={S.inputLbl}>Credenciales de Ingreso</span>
                    {editingCredsAlumnoId !== alumno.id && (
                      <button
                        onClick={() => {
                          setEditingCredsAlumnoId(alumno.id);
                          setEditCredsEmail(alumno.email);
                          setEditCredsPassword(alumno.password || '');
                        }}
                        style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                    )}
                  </div>

                  {editingCredsAlumnoId === alumno.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <input type="text" value={editCredsEmail} onChange={(e) => setEditCredsEmail(e.target.value)} style={S.input} placeholder="Usuario / Email" />
                      <input type="text" value={editCredsPassword} onChange={(e) => setEditCredsPassword(e.target.value)} style={S.input} placeholder="Contraseña" />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => setEditingCredsAlumnoId(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                        <button onClick={() => handleSaveCredentials(alumno.id)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ color: '#ffffff' }}>Usuario:</span>
                        <span style={{ color: '#ffffff' }}>{alumno.email}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ color: '#ffffff' }}>Clave:</span>
                        <span style={{ color: '#f59e0b' }}>{alumno.password ? '••••••••' : 'Sin asignar'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routine Info */}
                <div>
                  <span style={S.inputLbl}>Rutina Activa</span>
                  {activeRoutine ? (
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h5 style={{ margin: '0 0 6px', fontSize: '13px', color: '#f59e0b', fontWeight: 800 }}>{activeRoutine.nombre_rutina}</h5>
                          <span style={{ fontSize: '10px', color: '#ffffff' }}>{activeRoutine.logs.length} ejercicios asignados</span>
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 6px' }}>EN SALA</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '10px', marginTop: '4px', textAlign: 'center', fontSize: '12px', color: '#ffffff' }}>
                      Sin rutina activa asignada
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => setSelectedAlumnoForDetails(isSelected ? null : alumno.id)}
                    style={{ ...S.btnSecondary, flex: 1, justifyContent: 'center' }}
                  >
                    <span>{isSelected ? 'Ocultar' : 'Ver Registros'}</span>
                    <ChevronRight size={14} style={{ transform: isSelected ? 'rotate(90deg)' : 'none' }} />
                  </button>
                  {onViewStudentProfile && (
                    <button
                      onClick={() => onViewStudentProfile(alumno.id)}
                      style={{ ...S.btnSecondary, flex: 1, justifyContent: 'center', borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}
                      title="Ver perfil del alumno como si fueras él"
                    >
                      Perfil Alumno
                    </button>
                  )}
                  <button
                    onClick={() => { setRoutineBuilderAlumnoId(alumno.id); setShowRoutineBuilder(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={S.btnPrimary}
                  >
                    + Rutina
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', color: '#94a3b8' }}>
              No se encontraron alumnos que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Selected Alumno Logs Detail */}
      {selectedAlumnoForDetails && (
        <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '24px', marginTop: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <span style={S.badgeGold}>MONITOREO DE CARGAS</span>
              <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                Historial de <span style={{ color: '#f59e0b' }}>{alumnos.find((a) => a.id === selectedAlumnoForDetails)?.full_name}</span>
              </h3>
            </div>
            <button onClick={() => setSelectedAlumnoForDetails(null)} style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '8px 16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
              Cerrar Detalle
            </button>
          </div>

          {selectedAlumnoRoutines.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Este alumno no tiene rutinas en su historial.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedAlumnoRoutines.map((routine) => (
                <div key={routine.id} style={{ background: '#020617', border: '1px solid #1e293b' }}>
                  <div style={{ padding: '16px 20px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>{routine.nombre_rutina}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Creada el {new Date(routine.created_at).toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, padding: '4px 10px', background: routine.activa ? 'rgba(16,185,129,0.15)' : '#1e293b', color: routine.activa ? '#34d399' : '#64748b', border: `1px solid ${routine.activa ? '#34d399' : '#334155'}` }}>
                      {routine.activa ? 'EN USO ACTUALMENTE' : 'ARCHIVADA'}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px', color: '#cbd5e1' }}>
                      <thead>
                        <tr style={{ background: '#090d16', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px' }}>#</th>
                          <th style={{ padding: '12px 16px' }}>Ejercicio</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Volumen</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Meta (KG)</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Logro (KG)</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actualizado</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routine.logs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '14px' }}>#{log.orden}</span>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                                  <span style={{ fontSize: '13px', color: getWeekDayColor(log.semana, log.dia), fontWeight: 900, textTransform: 'uppercase' }}>S{log.semana}</span>
                                  <span style={{ fontSize: '10px', color: getWeekDayColor(log.semana, log.dia), fontWeight: 800, textTransform: 'uppercase' }}>{log.dia}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {log.exercise?.image_urls?.[0] && (
                                <img
                                  src={fixImageUrl(log.exercise.image_urls[0])}
                                  alt="ejercicio"
                                  onClick={() => setFullscreenImage(fixImageUrl(log.exercise!.image_urls![0]))}
                                  style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px', flexShrink: 0, cursor: 'pointer' }}
                                />
                              )}
                              <span>{log.exercise?.name}</span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace' }}>{log.series} × {log.repeticiones}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{log.peso_objetivo} KG</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span
                                onClick={() => {
                                  const newVal = window.prompt(`Actualizar peso logrado para ${log.exercise?.name} (KG):`, log.peso_real.toString());
                                  if (newVal !== null) {
                                    const parsed = parseFloat(newVal);
                                    if (!isNaN(parsed)) {
                                      dataService.updatePesoReal(log.id, parsed, routine.alumno_id);
                                      onRefreshData();
                                    }
                                  }
                                }}
                                title="Hacer clic para editar el peso"
                                style={{ cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: '12px', padding: '2px 8px', background: log.peso_real >= log.peso_objetivo ? 'rgba(16,185,129,0.15)' : '#1e293b', color: log.peso_real >= log.peso_objetivo ? '#34d399' : '#cbd5e1', border: `1px solid ${log.peso_real >= log.peso_objetivo ? '#34d399' : '#334155'}` }}
                              >
                                {log.peso_real} KG
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>
                              {new Date(log.fecha_ultimo_cambio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Estás seguro de eliminar "${log.exercise?.name}" de esta rutina?`)) {
                                    dataService.deleteRoutineLog(log.id);
                                    onRefreshData();
                                  }
                                }}
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Eliminar ejercicio de la rutina"
                              >
                                <Trash2 size={14} />
                              </button>
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
        </div>
      )}

      {/* Edit Profile Modal (Photo, Name, Phone for any Profile) */}
      {editingProfileTarget && (
        <EditProfileModal
          profile={editingProfileTarget}
          onClose={() => setEditingProfileTarget(null)}
          onProfileUpdated={() => {
            setEditingProfileTarget(null);
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};
