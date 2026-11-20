import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, ArrowRight, Shield, Globe2, Trash2, AlertTriangle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { GymTenant, Profile } from '../types';

/* ─── Shared Styles ─── */
const S = {
  page: { padding: '24px', maxWidth: '920px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  card: {
    padding: '32px', position: 'relative' as const
  },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  iconBox: { background: 'linear-gradient(135deg, rgba(213,122,48,0.22), rgba(140,62,16,0.12))', border: '1px solid rgba(213,122,48,0.45)', padding: '9px', color: '#FFBD4A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '20px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  subtitle: { fontSize: '12px', color: '#94A3B8', margin: 0, paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  
  form: { display: 'flex', flexDirection: 'column' as const, gap: '20px', marginTop: '24px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  input: {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '13px 16px', fontSize: '14px', fontFamily: 'inherit',
  },
  
  sectionTitle: { fontSize: '14px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', textTransform: 'uppercase' as const },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  
  submitBtn: {
    width: '100%', padding: '16px', fontSize: '14px', marginTop: '8px'
  },
  
  alertErr: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '12px', fontSize: '12px', fontWeight: 600 },
  alertSucc: { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#6EE7B7', padding: '12px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },

  gymCard: {
    padding: '24px',
    display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', gap: '16px',
  },
  gymTitle: { fontSize: '16px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const },
  planBadge: { fontSize: '10px', padding: '2px 7px', fontFamily: 'monospace' },
  coachBox: { padding: '12px', marginTop: '10px' },
  coachLabel: { fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase' as const, marginBottom: '4px' },
  coachName: { fontSize: '13px', fontWeight: 700, color: '#fff' },
  enterBtn: {
    width: '100%', padding: '12px', fontSize: '13px'
  }
};

/* ─── Create Gym View ─── */
export const CreateGymView: React.FC<{ onGymCreated: (gym: GymTenant, coach: Profile) => void }> = ({ onGymCreated }) => {
  const [gymName, setGymName] = useState('Sucursal Coach');
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(''); setCreateSuccess('');
    if (!gymName.trim()) return setCreateError('Ingresa el nombre del gimnasio.');
    if (!adminName.trim() || !adminEmail.trim()) return setCreateError('Completa datos del entrenador admin.');
    if (!adminPassword || adminPassword.length < 4) return setCreateError('Contraseña muy corta.');

    try {
      const { gym, coach } = dataService.createGym(gymName.trim(), plan, adminName.trim(), adminEmail.trim(), adminPassword);
      setCreateSuccess(`¡Gimnasio "${gym.name}" generado exitosamente! Iniciando sesión...`);
      setTimeout(() => onGymCreated(gym, coach), 1000);
    } catch (err) {
      setCreateError('Error al generar el gimnasio.');
    }
  };

  return (
    <div style={S.page}>
      <div className="titan-armor-card" style={S.card}>
        <div>
          <div style={S.header}>
            <div style={S.iconBox}><Building2 size={24} /></div>
            <h2 style={S.title}>Generar Nuevo Gimnasio</h2>
          </div>
          <p style={S.subtitle}>Crea una nueva instancia aislada con Row Level Security.</p>
        </div>

        <form onSubmit={handleCreateGym} style={S.form}>
          {createError && <div style={S.alertErr}>{createError}</div>}
          {createSuccess && <div style={S.alertSucc}><Sparkles size={14} /> {createSuccess}</div>}

          <div style={S.fieldGroup}>
            <label style={S.label}>Nombre del Gimnasio / Negocio</label>
            <input className="titan-input" style={S.input} type="text" value={gymName} onChange={e => setGymName(e.target.value)} placeholder="Sucursal Coach" required />
          </div>

          <div style={S.grid2}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Plan SaaS</label>
              <select className="titan-select" style={S.input} value={plan} onChange={e => setPlan(e.target.value as any)}>
                <option value="free">Free (Limitado)</option>
                <option value="pro">PRO (Recomendado)</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="titan-inset-well" style={{ padding: '20px', marginTop: '4px' }}>
            <h3 style={S.sectionTitle}><Shield size={16} color="#D57A30" /> Crear Entrenador Administrador</h3>
            
            <div style={S.grid2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Nombre Completo</label>
                <input className="titan-input" style={S.input} type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required placeholder="Ej. Carlos Mendoza" />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Usuario</label>
                <input className="titan-input" style={S.input} type="text" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder="Ej. gym" />
              </div>
              <div style={{ ...S.fieldGroup, gridColumn: 'span 2' }}>
                <label style={S.label}>Contraseña Temporal</label>
                <div style={{ position: 'relative' }}>
                  <input className="titan-input" style={{ ...S.input, paddingRight: '44px' }} type={showAdminPassword ? "text" : "password"} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required placeholder="Mínimo 4 caracteres" />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="titan-btn-armor-glow" style={S.submitBtn}>
            <Globe2 size={18} /> Generar y Desplegar Gimnasio
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── Gym List View ─── */
export const GymListView: React.FC<{ onEnterGym: (gym: GymTenant, coach: Profile) => void }> = ({ onEnterGym }) => {
  const [allGyms, setAllGyms] = useState<GymTenant[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [deletingGymId, setDeletingGymId] = useState<string | null>(null);
  const [confirmGym, setConfirmGym] = useState<GymTenant | null>(null);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { email?: string; password?: string; valid_until?: string }>>({});
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [renewDays, setRenewDays] = useState<Record<string, number>>({});


  useEffect(() => {
    setAllGyms(dataService.getGyms());
    setAllProfiles(dataService.getProfiles());
  }, []);

  const handleDeleteGym = async (gym: GymTenant) => {
    if (gym.id === 'gym-titan-001') return; // Proteger master
    setDeletingGymId(gym.id);
    setDeleteMsg('Eliminando...');
    try {
      if (supabase) {
        // 1. Obtener rutinas de este gym
        const { data: profiles } = await supabase.from('gym_profiles').select('id').eq('gym_id', gym.id);
        const profileIds = (profiles || []).map((p: any) => p.id);
        const { data: routines } = await supabase.from('gym_routines').select('id').in('alumno_id', profileIds.length ? profileIds : ['none']);
        const routineIds = (routines || []).map((r: any) => r.id);

        // 2. Borrar en cascada
        if (routineIds.length) await supabase.from('gym_routine_logs').delete().in('routine_id', routineIds);
        if (routineIds.length) await supabase.from('gym_routines').delete().in('id', routineIds);
        if (profileIds.length) await supabase.from('gym_profiles').delete().in('id', profileIds);
        await supabase.from('gym_tenants').delete().eq('id', gym.id);
      }
      // Borrar en local
      const updated = dataService.getGyms().filter(g => g.id !== gym.id);
      setAllGyms(updated);
      setAllProfiles(allProfiles.filter(p => p.gym_id !== gym.id));
      setDeleteMsg(`✅ "${gym.name}" eliminado definitivamente.`);
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (e) {
      setDeleteMsg('❌ Error al eliminar. Intenta de nuevo.');
    } finally {
      setDeletingGymId(null);
      setConfirmGym(null);
    }
  };

  return (
    <div style={{ ...S.page, maxWidth: '1200px' }}>
      {/* Modal de confirmación */}
      {confirmGym && (
        <div className="titan-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="titan-modal titan-armor-card-danger" style={{ padding: '32px', maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={28} color="#EF4444" />
              <h3 className="titan-section-title" style={{ fontSize: '18px', margin: 0 }}>¿Eliminar definitivamente?</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Estás por eliminar el gym:
            </p>
            <p style={{ color: '#FFBD4A', fontWeight: 800, fontSize: '16px', margin: '0 0 8px' }}>📍 {confirmGym.name}</p>
            <p style={{ color: '#FCA5A5', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
              ⚠️ Se eliminarán <strong>todos los perfiles, rutinas, ejercicios y logs</strong> de este gym de Supabase de forma permanente. Esta acción <strong>no se puede deshacer</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="titan-btn-armor-steel"
                onClick={() => setConfirmGym(null)}
                style={{ flex: 1, padding: '12px', fontSize: '13px' }}
              >Cancelar</button>
              <button
                className="titan-btn-armor-danger"
                onClick={() => handleDeleteGym(confirmGym)}
                disabled={!!deletingGymId}
                style={{ flex: 1, padding: '12px', fontSize: '13px' }}
              >
                <Trash2 size={16} /> {deletingGymId ? 'Eliminando...' : 'SÍ, ELIMINAR TODO'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="titan-armor-banner" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={S.iconBox}>
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="titan-section-title" style={{ fontSize: '22px', margin: 0 }}>Lista de Gimnasios (Tenants)</h2>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>Total aislados por Row Level Security: <strong style={{ color: '#FFBD4A' }}>{allGyms.length}</strong></p>
        </div>
      </div>
      {deleteMsg && (
        <div style={{ padding: '12px 16px', background: deleteMsg.startsWith('✅') ? 'rgba(16,185,129,0.12)' : 'rgba(220,38,38,0.12)', border: `1px solid ${deleteMsg.startsWith('✅') ? '#34D399' : '#EF4444'}`, color: deleteMsg.startsWith('✅') ? '#6EE7B7' : '#FCA5A5', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>{deleteMsg}</div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
        {allGyms.map((gym) => {
          const gymProfiles = allProfiles.filter(p => p.gym_id === gym.id);
          const coach = gymProfiles.find(p => p.role === 'coach') || gymProfiles[0];
          const isMaster = gym.id === 'gym-titan-001';
          const draft = drafts[gym.id] || { email: coach?.email || '', password: coach?.password || '', valid_until: gym.valid_until || '' };

          const handleSave = () => {
            if (coach) {
              dataService.updateAlumnoCredentials(coach.id, draft.email || coach.email, draft.password || '');
            }
            if (draft.valid_until) {
              const iso = new Date(draft.valid_until).toISOString();
              dataService.updateGymValidUntil(gym.id, iso);
            }
            
            // Refrescar listados
            setAllGyms(dataService.getGyms());
            setAllProfiles(dataService.getProfiles());

            setSaveSuccessId(gym.id);
            setTimeout(() => setSaveSuccessId(null), 2000);
          };

          return (
            <div key={gym.id} className="titan-armor-card titan-armor-card-interactive" style={S.gymCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={S.iconBox}>
                  <Building2 size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <h4 style={S.gymTitle}>
                      {gym.name} <span className="titan-badge-copper" style={S.planBadge}>{gym.plan}</span>
                      {isMaster && <span className="titan-badge-copper" style={{ ...S.planBadge, marginLeft: '2px' }}>MASTER</span>}
                    </h4>
                    {!isMaster && (
                      <button
                        className="titan-btn-armor-danger"
                        onClick={() => setConfirmGym(gym)}
                        title="Eliminar gym definitivamente"
                        style={{ padding: '5px 8px', fontSize: '10px', flexShrink: 0 }}
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', margin: '4px 0 0' }}>ID: {gym.id}</p>
                  
                  {coach && (
                    <div className="titan-inset-well" style={S.coachBox}>
                      <div style={S.coachLabel}>Admin / Coach:</div>
                      <div style={S.coachName}>{coach.full_name}</div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', marginBottom: '2px', fontWeight: 700 }}>USUARIO</label>
                          <input 
                            type="text" 
                            className="titan-input"
                            value={draft.email} 
                            onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, email: e.target.value } }))}
                            style={{ padding: '6px 8px', fontSize: '12px', width: '100%' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', marginBottom: '2px', fontWeight: 700 }}>CONTRASEÑA</label>
                          <input 
                            type="text" 
                            className="titan-input"
                            value={draft.password} 
                            onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, password: e.target.value } }))}
                            style={{ padding: '6px 8px', fontSize: '12px', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isMaster && (
                    <div className="titan-inset-well" style={{ marginTop: '12px', padding: '10px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", color: '#D57A30', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.06em' }}>VENCIMIENTO DE LA SUCURSAL:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="date"
                          className="titan-input"
                          value={draft.valid_until ? draft.valid_until.split('T')[0] : ''}
                          onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, valid_until: e.target.value } }))}
                          style={{ flex: 1, padding: '6px', fontSize: '12px', colorScheme: 'dark' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                          <input
                            type="number"
                            min="1"
                            className="titan-input"
                            value={renewDays[gym.id] === undefined ? 20 : renewDays[gym.id]}
                            onChange={(e) => setRenewDays(prev => ({ ...prev, [gym.id]: parseInt(e.target.value) || 0 }))}
                            style={{ width: '45px', padding: '5px 4px', fontSize: '13px', fontWeight: 900, textAlign: 'center', borderRight: 'none' }}
                            title="Días a sumar"
                          />
                          <button 
                            type="button"
                            className="titan-btn-armor-copper"
                            onClick={() => {
                              const days = renewDays[gym.id] === undefined ? 20 : renewDays[gym.id];
                              if (days > 0) {
                                const current = draft.valid_until ? new Date(draft.valid_until) : new Date();
                                const baseDate = current > new Date() ? current : new Date();
                                const next = new Date(baseDate.getTime() + days * 86400000);
                                setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, valid_until: next.toISOString() } }));
                              }
                            }} 
                            style={{ padding: '0 9px', fontSize: '11px' }}
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    className={saveSuccessId === gym.id ? 'titan-btn-armor-emerald' : 'titan-btn-armor-copper'}
                    style={{ marginTop: '12px', width: '100%', padding: '9px', fontSize: '11px' }}
                  >
                    {saveSuccessId === gym.id ? '¡GUARDADO CON ÉXITO!' : 'GUARDAR CAMBIOS DEL PERFIL'}
                  </button>
                </div>
              </div>

              {coach && (
                (() => {
                  const isExpired = !isMaster && gym.valid_until && new Date(gym.valid_until) < new Date();
                  return (
                    <button
                      className="titan-btn-armor-steel"
                      style={S.enterBtn}
                      onClick={() => !isExpired && onEnterGym(gym, coach)}
                      disabled={isExpired}
                    >
                      {isExpired ? 'ACCESO BLOQUEADO (VENCIDO)' : <>Entrar al Gym <ArrowRight size={16} /></>}
                    </button>
                  );
                })()
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
