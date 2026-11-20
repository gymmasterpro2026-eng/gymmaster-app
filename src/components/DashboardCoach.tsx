import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Dumbbell, Shield, Plus, CheckCircle2, AlertCircle, ChevronRight, RotateCcw, Edit2, Save, X, Upload, Trash2, Search, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { RoutineBuilder } from './RoutineBuilder';
import { EditProfileModal } from './EditProfileModal';
import { fixImageUrl } from '../utils/imageUrl';
import { WorkoutStatsCompact, WorkoutStats } from './WorkoutStats';

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
    padding: '24px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '20px',
    marginBottom: '28px'
  },
  coachAvatar: { width: '72px', height: '72px', minWidth: '72px', minHeight: '72px', objectFit: 'cover' as const, border: '2px solid #D57A30', clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)', flexShrink: 0, boxShadow: '0 0 18px rgba(213,122,48,0.28)' },
  badgeGold: { padding: '4px 10px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  title: { fontSize: '24px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#ffffff', margin: '4px 0 0', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  subtitle: { fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' },
  
  btnPrimary: { padding: '9px 14px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  btnSecondary: { padding: '9px 14px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' },
  cardLayout: {
    padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px'
  },
  alumnoAvatar: { width: '60px', height: '60px', minWidth: '60px', minHeight: '60px', objectFit: 'cover' as const, border: '2px solid #D57A30', clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)', flexShrink: 0 },
  
  inputBox: { padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  inputLbl: { fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  input: { width: '100%', fontSize: '12px', fontWeight: 700, padding: '8px 12px', boxSizing: 'border-box' as const },
  
  modal: { width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' as const, padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '16px' }
};

export const DashboardCoach: React.FC<DashboardCoachProps> = ({ coach, exercises, onRefreshData, onViewStudentProfile }) => {
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
  const [showStatsForAlumno, setShowStatsForAlumno] = useState<string | null>(null);
  const [fullStatsAlumno, setFullStatsAlumno] = useState<Profile | null>(null);
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
        <div className="titan-modal-overlay" style={{ zIndex: 9999 }} onClick={() => setFullscreenImage(null)}>
          <button className="titan-btn-armor-steel" style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px 18px', fontSize: '12px' }}>Cerrar ✕</button>
          <div className="titan-modal gm-gif-wrap" style={{ padding: '24px', maxWidth: '520px', width: '92%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', border: '1px solid rgba(213,122,48,0.45)', boxShadow: '0 24px 64px rgba(0,0,0,0.92), 0 0 32px rgba(213,122,48,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(213,122,48,0.22)' }}>
              <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '3px 10px' }}>VISTA UHD • SUPER-RESOLUCIÓN</span>
              <button className="titan-btn-armor-steel" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => setFullscreenImage(null)}>✕</button>
            </div>
            <img src={fullscreenImage} alt="Fullscreen" className="gm-exercise-gif gm-exercise-gif-lg" style={{ width: '100%', maxWidth: '420px', maxHeight: '420px', objectFit: 'contain', background: 'transparent', padding: 0, display: 'block' }} />
          </div>
        </div>
      )}

      {/* Coach Header Banner */}
      <div className="titan-armor-banner" style={S.headerBanner}>
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
              className="titan-btn-armor-copper"
              style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                padding: '4px', minWidth: 0
              }}
            >
              <Edit2 size={11} />
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="titan-badge-copper" style={coach.gym_id === 'gym-titan-001' ? { ...S.badgeGold, background: 'linear-gradient(135deg, #D57A30, #991B1B)', color: '#fff', borderColor: 'rgba(255,190,120,0.45)' } : S.badgeGold}>
                {coach.gym_id === 'gym-titan-001' ? '⭐ ADMINISTRADOR MASTER' : 'SUCURSAL COACH'}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>ID: {coach.gym_id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={S.title}>{coach.full_name}</h1>
              <button
                onClick={() => setEditingProfileTarget(coach)}
                style={{ background: 'none', border: 'none', color: '#D57A30', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}
              >
                <Edit2 size={12} /> Editar
              </button>
            </div>
            <p style={S.subtitle}>Gestión de Alumnos y Rutinas con Aislamiento RLS</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="titan-btn-sprite-idle" onClick={() => setShowAddAlumnoModal(true)}>
            <UserPlus size={16} />
            <span>Nuevo Alumno</span>
          </button>
          <button className="titan-btn-sprite-active" onClick={() => { setRoutineBuilderAlumnoId(undefined); setShowRoutineBuilder(true); }}>
            <Plus size={16} />
            <span>Crear Rutina</span>
          </button>
        </div>
      </div>

      {/* Add Alumno Modal */}
      {showAddAlumnoModal && (
        <div className="titan-modal-overlay" onClick={() => setShowAddAlumnoModal(false)}>
          <div className="titan-modal" style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#D57A30" />
                Registrar Nuevo Alumno
              </h3>
              <button className="titan-btn-armor-steel" onClick={() => setShowAddAlumnoModal(false)} style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAlumno} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Avatar Selector */}
              <div className="titan-inset-well" style={S.inputBox}>
                <label style={S.inputLbl}>Foto de Perfil del Alumno:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={newAvatarUrl} alt="Preview" style={S.alumnoAvatar} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button
                      type="button"
                      className="titan-btn-armor-steel"
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
                            border: newAvatarUrl === preset ? '2px solid #D57A30' : '1px solid rgba(148,163,184,0.28)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={S.inputLbl}>Nombre Completo:</label>
                <input className="titan-input" type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} required placeholder="Ej: Laura Ramírez" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Usuario / Email:</label>
                <input className="titan-input" type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="ej: laura_ramirez" style={S.input} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={S.inputLbl}>Contraseña:</label>
                  <button type="button" onClick={() => setNewPassword(Math.random().toString(36).slice(-8))} style={{ background: 'none', border: 'none', color: '#D57A30', fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, cursor: 'pointer' }}>GENERAR RANDOM</button>
                </div>
                <input className="titan-input" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Contraseña de ingreso" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Teléfono:</label>
                <input className="titan-input" type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder="+54 9 11 0000-0000" style={S.input} />
              </div>
              <div>
                <label style={S.inputLbl}>Género:</label>
                <select className="titan-select" value={newGender} onChange={(e) => setNewGender(e.target.value as 'male' | 'female')} style={S.input}>
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label style={S.inputLbl}>Vigencia del Plan (Desde - Hasta):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="titan-input" type="datetime-local" value={newPlanStart.slice(0, 16)} onChange={(e) => setNewPlanStart(new Date(e.target.value).toISOString())} required style={{ ...S.input, flex: 1, colorScheme: 'dark' }} />
                  <input className="titan-input" type="datetime-local" value={newPlanExpiry.slice(0, 16)} onChange={(e) => setNewPlanExpiry(new Date(e.target.value).toISOString())} required style={{ ...S.input, flex: 1, colorScheme: 'dark' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexDirection: 'column' }}>
                {createAlumnoError && (
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', padding: '10px 14px', color: '#f87171', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                    {createAlumnoError}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="titan-btn-armor-steel" onClick={() => { setShowAddAlumnoModal(false); setCreateAlumnoError(''); }} style={{ padding: '10px 16px', fontSize: '11px' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="titan-btn-armor-glow" style={{ padding: '10px 20px', fontSize: '12px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="titan-section-title" style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#D57A30" />
            Alumnos Asignados <span style={{ color: '#94A3B8', fontSize: '14px' }}>({alumnos.length})</span>
          </h2>
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D57A30', pointerEvents: 'none' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              className="titan-input"
              placeholder="Buscar por nombre o email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                fontSize: '13px',
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

            const cardClass = `titan-armor-card titan-armor-card-interactive ${
              urgency === 'critical' ? 'titan-armor-card-danger' : urgency === 'warning' ? 'titan-armor-card-warn' : isSelected ? 'titan-armor-card-active' : ''
            }`;

            return (
              <React.Fragment key={alumno.id}>
              <div className={cardClass} style={S.cardLayout}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <img src={alumno.avatar_url || AVATAR_PRESETS[0]} alt={alumno.full_name} style={S.alumnoAvatar} />
                      <button
                        onClick={() => setEditingProfileTarget(alumno)}
                        title="Editar foto y nombre"
                        className="titan-btn-armor-copper"
                        style={{
                          position: 'absolute', bottom: '-4px', right: '-4px',
                          padding: '3px', minWidth: 0
                        }}
                      >
                        <Edit2 size={10} />
                      </button>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 className="titan-section-title" style={{ margin: 0, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alumno.full_name}</h3>
                        <button
                          onClick={() => setEditingProfileTarget(alumno)}
                          title="Editar Perfil"
                          style={{ background: 'none', border: 'none', color: '#D57A30', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alumno.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div className="titan-inset-well" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', borderColor: urgency === 'critical' ? 'rgba(239,68,68,0.45)' : urgency === 'warning' ? 'rgba(245,158,11,0.45)' : 'rgba(213,122,48,0.28)', minWidth: '74px' }}>
                      <span style={{ fontSize: '8px', fontFamily: "'Chakra Petch', sans-serif", color: urgency === 'critical' ? '#FCA5A5' : urgency === 'warning' ? '#FFBD4A' : '#94A3B8', fontWeight: 700, letterSpacing: '0.08em' }}>VENCIMIENTO</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ fontSize: '19px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: urgency === 'critical' ? '#F87171' : urgency === 'warning' ? '#FFBD4A' : '#FFFFFF', lineHeight: '1' }}>{daysLeft > 0 ? daysLeft : 0}</span>
                        <span style={{ fontSize: '9px', color: urgency === 'critical' ? '#F87171' : urgency === 'warning' ? '#FFBD4A' : '#94A3B8', fontWeight: 700 }}>días</span>
                      </div>
                    </div>
                    <div className={isPlanActive ? 'titan-btn-armor-emerald' : 'titan-btn-armor-danger'} style={{ width: '32px', height: '32px', padding: 0, cursor: 'default' }}>
                      {isPlanActive ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    </div>
                    <button
                      onClick={() => handleDeleteAlumno(alumno)}
                      title="Eliminar Alumno"
                      className="titan-btn-armor-danger"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Plan Validity Box */}
                <div className="titan-inset-well" style={S.inputBox}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div>
                      <span style={S.inputLbl}>Vencimiento Plan</span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 900, color: isPlanActive ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                        {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'stretch', opacity: canAddGrace ? 1 : 0.45 }}>
                      <input
                        type="number"
                        min="1"
                        max="1"
                        disabled={!canAddGrace}
                        className="titan-input"
                        value={renewDays[alumno.id] === undefined ? 1 : renewDays[alumno.id]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          if (val > 1) val = 1;
                          if (val < 1) val = 1;
                          setRenewDays(prev => ({ ...prev, [alumno.id]: val }));
                        }}
                        style={{ width: '50px', padding: '5px 4px', fontSize: '15px', fontWeight: 900, textAlign: 'center', cursor: canAddGrace ? 'text' : 'not-allowed', borderRight: 'none' }}
                        title={!hasPaidBefore ? "El alumno debe tener al menos un pago registrado" : !canAddGrace ? "Solo se puede usar 1 vez cada 30 días" : "Días a sumar (sin registrar pago)"}
                      />
                      <button 
                        disabled={!canAddGrace}
                        className="titan-btn-armor-copper"
                        onClick={() => {
                          if (!canAddGrace) return;
                          const days = renewDays[alumno.id] === undefined ? 1 : renewDays[alumno.id];
                          if (days === 1) {
                            dataService.addGraceDays(alumno.id, days);
                            onRefreshData();
                          }
                        }} 
                        style={{ padding: '6px 12px', fontSize: '10px' }}
                        title={!hasPaidBefore ? "El alumno debe tener al menos un pago registrado" : !canAddGrace ? "Solo se puede usar 1 vez cada 30 días" : "Agregar días de gracia"}
                      >
                        <RotateCcw size={12} /> Agregar
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{...S.inputLbl, color: '#6EE7B7'}}>Cobrar Cuota</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <select
                          className="titan-select"
                          value={paymentFrequencies[alumno.id] || 'mensual'}
                          onChange={(e) => {
                            const freq = e.target.value as 'mensual' | 'semanal' | 'diario';
                            setPaymentFrequencies(prev => ({ ...prev, [alumno.id]: freq }));
                            const daysToAdd = freq === 'mensual' ? 30 : freq === 'semanal' ? 7 : 1;
                            setPaymentDates(prev => ({ ...prev, [alumno.id]: new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0] }));
                          }}
                          style={{ color: '#6EE7B7', fontSize: '10px', padding: '3px 6px' }}
                        >
                          <option value="mensual">Mensual</option>
                          <option value="semanal">Semanal</option>
                          <option value="diario">Por día</option>
                        </select>
                        <input 
                          type="date"
                          value={paymentDates[alumno.id] || new Date(Date.now() + ((paymentFrequencies[alumno.id] || 'mensual') === 'semanal' ? 7 : (paymentFrequencies[alumno.id] || 'mensual') === 'diario' ? 1 : 30) * 86400000).toISOString().split('T')[0]}
                          onChange={(e) => setPaymentDates(prev => ({ ...prev, [alumno.id]: e.target.value }))}
                          style={{ background: 'transparent', border: 'none', color: '#CBD5E1', fontSize: '11px', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
                          title="Nuevo Vencimiento"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <span style={{ background: '#070A0F', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.35)', borderRight: 'none', display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>Gs.</span>
                      <input
                        type="number"
                        min="0"
                        className="titan-input"
                        value={paymentAmounts[alumno.id] === undefined ? 150000 : paymentAmounts[alumno.id]}
                        onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [alumno.id]: parseInt(e.target.value) || 0 }))}
                        style={{ width: '76px', padding: '5px 4px', fontSize: '13px', fontWeight: 800, textAlign: 'right', borderColor: 'rgba(52,211,153,0.35)', borderRight: 'none' }}
                        title="Monto a cobrar"
                      />
                      <button className="titan-btn-armor-emerald" onClick={() => handleRegisterPayment(alumno.id)} style={{ padding: '6px 10px', fontSize: '10px' }}>
                        <CheckCircle2 size={12} /> Pagar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="titan-inset-well" style={S.inputBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={S.inputLbl}>Credenciales de Ingreso</span>
                    {editingCredsAlumnoId !== alumno.id && (
                      <button
                        onClick={() => {
                          setEditingCredsAlumnoId(alumno.id);
                          setEditCredsEmail(alumno.email);
                          setEditCredsPassword(alumno.password || '');
                        }}
                        style={{ background: 'none', border: 'none', color: '#FFBD4A', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                    )}
                  </div>

                  {editingCredsAlumnoId === alumno.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <input type="text" className="titan-input" value={editCredsEmail} onChange={(e) => setEditCredsEmail(e.target.value)} style={S.input} placeholder="Usuario / Email" />
                      <input type="text" className="titan-input" value={editCredsPassword} onChange={(e) => setEditCredsPassword(e.target.value)} style={S.input} placeholder="Contraseña" />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="titan-btn-armor-steel" onClick={() => setEditingCredsAlumnoId(null)} style={{ padding: '6px 10px', fontSize: '11px' }}>
                          <X size={14} />
                        </button>
                        <button className="titan-btn-armor-copper" onClick={() => handleSaveCredentials(alumno.id)} style={{ padding: '6px 10px', fontSize: '11px' }}>
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ color: '#94A3B8' }}>Usuario:</span>
                        <span style={{ color: '#F1F5F9' }}>{alumno.email}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ color: '#94A3B8' }}>Clave:</span>
                        <span style={{ color: '#FFBD4A' }}>{alumno.password ? '••••••••' : 'Sin asignar'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routine Info */}
                <div>
                  <span style={S.inputLbl}>Rutina Activa</span>
                  {activeRoutine ? (
                    <div className="titan-inset-well" style={{ borderLeft: '3px solid #D57A30', padding: '10px 12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <h5 className="titan-section-title" style={{ margin: '0 0 4px', fontSize: '13px', color: '#FFBD4A' }}>{activeRoutine.nombre_rutina}</h5>
                          <span style={{ fontSize: '10px', color: '#CBD5E1' }}>{activeRoutine.logs.length} ejercicios asignados</span>
                        </div>
                        <span className="titan-badge-emerald" style={{ fontSize: '9px', padding: '2px 7px' }}>EN SALA</span>
                      </div>
                    </div>
                  ) : (
                    <div className="titan-inset-well" style={{ padding: '10px', marginTop: '4px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
                      Sin rutina activa asignada
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedAlumnoForDetails(isSelected ? null : alumno.id)}
                    className="titan-btn-armor-steel"
                    style={{ ...S.btnSecondary, flex: 1, minWidth: '116px' }}
                  >
                    <span>{isSelected ? 'Ocultar' : 'Ver Registros'}</span>
                    <ChevronRight size={14} style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {onViewStudentProfile && (
                    <button
                      onClick={() => onViewStudentProfile(alumno.id)}
                      className="titan-btn-armor-glow"
                      style={{ ...S.btnSecondary, flex: 1, minWidth: '116px' }}
                      title="Ver perfil del alumno como si fueras él"
                    >
                      Perfil Alumno
                    </button>
                  )}
                  <button
                    onClick={() => setShowStatsForAlumno(showStatsForAlumno === alumno.id ? null : alumno.id)}
                    className={showStatsForAlumno === alumno.id ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'}
                    style={{ ...S.btnSecondary, padding: '9px 12px' }}
                    title="Ver estadísticas del alumno"
                  >
                    <BarChart2 size={14} />
                  </button>
                  <button
                    onClick={() => { setRoutineBuilderAlumnoId(alumno.id); setShowRoutineBuilder(!(showRoutineBuilder && routineBuilderAlumnoId === alumno.id)); }}
                    className="titan-btn-armor-copper"
                    style={S.btnPrimary}
                  >
                    + Rutina
                  </button>
                </div>
                {/* Stats compacto del alumno */}
                {showStatsForAlumno === alumno.id && (
                  <WorkoutStatsCompact
                    alumno={alumno}
                    onExpand={() => setFullStatsAlumno(alumno)}
                  />
                )}
              </div>

              {/* Panel Registros - aparece justo debajo de este card */}
              {isSelected && (
                <div className="titan-armor-card" style={{ gridColumn: '1 / -1', padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px' }}>Historial de <span style={{ color: '#FFBD4A' }}>{alumno.full_name}</span></h3>
                    <button className="titan-btn-armor-steel" onClick={() => setSelectedAlumnoForDetails(null)} style={{ padding: '6px 14px', fontSize: '11px' }}>Cerrar</button>
                  </div>
                  {selectedAlumnoRoutines.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Sin rutinas en historial.</div>
                  ) : selectedAlumnoRoutines.map((routine) => (
                    <div key={routine.id} className="titan-inset-well" style={{ marginBottom: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: 'linear-gradient(180deg, #1E242E 0%, #12161D 100%)', borderBottom: '1px solid rgba(201,111,40,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 className="titan-section-title" style={{ margin: 0, fontSize: '13px' }}>{routine.nombre_rutina}</h4>
                        <span className={routine.activa ? 'titan-badge-emerald' : 'titan-badge-steel'} style={{ fontSize: '9px', padding: '3px 8px' }}>{routine.activa ? 'EN USO' : 'ARCHIVADA'}</span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="titan-table" style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          <thead><tr style={{ fontSize: '10px' }}>
                            <th style={{ padding: '10px 14px' }}>#</th>
                            <th style={{ padding: '10px 14px' }}>Ejercicio</th>
                            <th style={{ padding: '10px 14px', textAlign: 'center' }}>Vol</th>
                            <th style={{ padding: '10px 14px', textAlign: 'center' }}>Meta KG</th>
                            <th style={{ padding: '10px 14px', textAlign: 'center' }}>Logro KG</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Hora</th>
                            <th style={{ padding: '10px 14px', textAlign: 'center' }}>Acc</th>
                          </tr></thead>
                          <tbody>{routine.logs.map((log) => (
                            <tr key={log.id}>
                              <td style={{ padding: '10px 14px' }}><span style={{ fontWeight: 900, color: '#fff', fontSize: '13px' }}>#{log.orden}</span><br/><span style={{ fontSize: '9px', color: getWeekDayColor(log.semana, log.dia), fontWeight: 800 }}>S{log.semana} {log.dia}</span></td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {log.exercise?.image_urls?.[0] && (
                                    <span className="gm-gif-wrap" onClick={() => setFullscreenImage(fixImageUrl(log.exercise!.image_urls![0]))} style={{ width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#000', border: '1px solid rgba(213,122,48,0.32)', padding: '2px', cursor: 'pointer', flexShrink: 0 }}>
                                      <img src={fixImageUrl(log.exercise.image_urls[0])} alt="" className="gm-exercise-gif" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'transparent', display: 'block' }} />
                                    </span>
                                  )}
                                  <span>{log.exercise?.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace' }}>{log.series}x{log.repeticiones}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace', color: '#94A3B8' }}>{log.peso_objetivo}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                <span onClick={() => { const v = window.prompt('Peso (KG):', log.peso_real.toString()); if (v !== null) { const n = parseFloat(v); if (!isNaN(n)) { dataService.updatePesoReal(log.id, n, routine.alumno_id); onRefreshData(); } } }} title="Clic para editar" className={log.peso_real >= log.peso_objetivo ? 'titan-badge-emerald' : 'titan-badge-steel'} style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', padding: '2px 7px' }}>{log.peso_real} KG</span>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', color: '#94A3B8' }}>{new Date(log.fecha_ultimo_cambio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                <button className="titan-btn-armor-danger" onClick={() => { if (window.confirm(`¿Eliminar "${log.exercise?.name}"?`)) { dataService.deleteRoutineLog(log.id); onRefreshData(); } }} style={{ padding: '5px', minWidth: 0 }}><Trash2 size={13} /></button>
                              </td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel Rutina Builder - aparece justo debajo de este card */}
              {showRoutineBuilder && routineBuilderAlumnoId === alumno.id && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <RoutineBuilder
                    coachId={coach.id}
                    gymId={coach.gym_id}
                    alumnos={alumnos}
                    exercises={exercises}
                    initialAlumnoId={alumno.id}
                    onRoutineCreated={() => { setShowRoutineBuilder(false); onRefreshData(); }}
                    onCancel={() => setShowRoutineBuilder(false)}
                  />
                </div>
              )}
              </React.Fragment>
            );
          }) : (
            <div className="titan-armor-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No se encontraron alumnos que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Modal Rutina Builder General */}
      {showRoutineBuilder && !routineBuilderAlumnoId && (
        <RoutineBuilder
          coachId={coach.id}
          gymId={coach.gym_id}
          alumnos={alumnos}
          exercises={exercises}
          onRoutineCreated={() => { setShowRoutineBuilder(false); onRefreshData(); }}
          onCancel={() => setShowRoutineBuilder(false)}
        />
      )}

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

      {/* 📊 Full stats modal for coach viewing an alumno */}
      {fullStatsAlumno && (
        <div className="titan-modal-overlay" style={{ zIndex: 9000, alignItems: 'flex-start', overflowY: 'auto', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
            <div className="titan-armor-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '20px' }}>
              <h2 className="titan-section-title" style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={fullStatsAlumno.avatar_url || 'https://api.dicebear.com/7.x/big-smile/svg?seed=default'} alt=""
                  style={{ width: '36px', height: '36px', objectFit: 'cover', border: '2px solid #D57A30' }} />
                Progreso de {fullStatsAlumno.full_name}
              </h2>
              <button className="titan-btn-armor-steel" onClick={() => setFullStatsAlumno(null)}
                style={{ padding: '9px 16px', fontSize: '12px' }}>
                ✕ Cerrar
              </button>
            </div>
            <WorkoutStats alumno={fullStatsAlumno} />
          </div>
        </div>
      )}
    </div>
  );
};
