import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Dumbbell, Shield, Plus, CheckCircle2, AlertCircle, ChevronRight, RotateCcw, Edit2, Save, X, Upload, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { RoutineBuilder } from './RoutineBuilder';
import { EditProfileModal } from './EditProfileModal';

interface DashboardCoachProps {
  coach: Profile;
  exercises: Exercise[];
  onRefreshData: () => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonsHomer&backgroundColor=fcd34d',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeBoy1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=SimpsonBart&skinColor=f8d25c&backgroundColor=fbbf24',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeGirl1&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonCoach&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=AnimeHero2&backgroundColor=c084fc',
];

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
  card: (selected: boolean): React.CSSProperties => ({
    background: selected ? '#1e293b' : '#0f172a',
    border: `1px solid ${selected ? '#f59e0b' : '#1e293b'}`,
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s'
  }),
  alumnoAvatar: { width: '60px', height: '60px', minWidth: '60px', minHeight: '60px', objectFit: 'cover' as const, border: '2px solid #f59e0b', flexShrink: 0 },
  
  inputBox: { background: '#020617', border: '1px solid #1e293b', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  inputLbl: { fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const },
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

  const handleDeleteAlumno = async (alumno: Profile) => {
    if (window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar a "${alumno.full_name}"?\n\nEsta acción es IRREVERSIBLE. Se borrarán todas sus rutinas, su historial de ejercicios y su acceso de Supabase para siempre.`)) {
      await dataService.deleteAlumno(alumno.id);
      onRefreshData();
    }
  };

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
    <div style={S.container}>
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
                <label style={S.inputLbl}>Vigencia del Plan:</label>
                <input type="datetime-local" value={newPlanExpiry.slice(0, 16)} onChange={(e) => setNewPlanExpiry(new Date(e.target.value).toISOString())} required style={S.input} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                <button type="button" onClick={() => setShowAddAlumnoModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={S.btnPrimary}>
                  Guardar Alumno
                </button>
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
        </div>

        <div style={S.grid}>
          {alumnos.map((alumno) => {
            const isPlanActive = new Date(alumno.plan_active_until) >= new Date();
            const activeRoutine = dataService.getActiveRoutineForAlumno(alumno.id);
            const isSelected = selectedAlumnoForDetails === alumno.id;

            return (
              <div key={alumno.id} style={S.card(isSelected)}>
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
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>{alumno.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={S.inputLbl}>Vencimiento Plan</span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 900, color: isPlanActive ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                        {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <button onClick={() => handleRenewPlan(alumno.id, 30)} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 10px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCcw size={12} /> +30 Días
                    </button>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#64748b' }}>Usuario:</span>
                        <span style={{ color: '#ffffff', fontWeight: 800, fontFamily: 'monospace' }}>{alumno.email}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#64748b' }}>Clave:</span>
                        <span style={{ color: '#f59e0b', fontWeight: 800, fontFamily: 'monospace' }}>{alumno.password ? '••••••••' : 'Sin asignar'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routine Info */}
                <div>
                  <span style={S.inputLbl}>Rutina Activa</span>
                  {activeRoutine ? (
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: '#f59e0b' }}>{activeRoutine.nombre_rutina}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{activeRoutine.logs.length} ejercicios asignados</span>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 6px' }}>EN SALA</span>
                    </div>
                  ) : (
                    <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '10px', marginTop: '4px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
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
                  <button
                    onClick={() => { setRoutineBuilderAlumnoId(alumno.id); setShowRoutineBuilder(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={S.btnPrimary}
                  >
                    + Rutina
                  </button>
                </div>
              </div>
            );
          })}
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
                        </tr>
                      </thead>
                      <tbody>
                        {routine.logs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 900, color: '#f59e0b' }}>#{log.orden}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#ffffff' }}>{log.exercise?.name}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace' }}>{log.series} × {log.repeticiones}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{log.peso_objetivo} KG</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '12px', padding: '2px 8px', background: log.peso_real >= log.peso_objetivo ? 'rgba(16,185,129,0.15)' : '#1e293b', color: log.peso_real >= log.peso_objetivo ? '#34d399' : '#cbd5e1', border: `1px solid ${log.peso_real >= log.peso_objetivo ? '#34d399' : '#334155'}` }}>
                                {log.peso_real} KG
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>
                              {new Date(log.fecha_ultimo_cambio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
