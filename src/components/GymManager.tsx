import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, ArrowRight, Shield, Globe2, Trash2, AlertTriangle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { GymTenant, Profile } from '../types';

/* ─── Shared Styles ─── */
const S = {
  page: { padding: '32px 24px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  card: {
    background: '#111827', border: '1px solid #1e293b', borderRadius: '0',
    padding: '32px', position: 'relative' as const, overflow: 'hidden' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  glow: {
    position: 'absolute' as const, top: '-100px', right: '-100px', width: '250px', height: '250px',
    background: '#D4FF00', filter: 'blur(120px)', opacity: 0.1, borderRadius: '0', pointerEvents: 'none' as const,
  },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  iconBox: { background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '0', color: '#D4FF00', display: 'flex' },
  title: { fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 },
  subtitle: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, paddingBottom: '24px', borderBottom: '1px solid #1e293b' },
  
  form: { display: 'flex', flexDirection: 'column' as const, gap: '20px', marginTop: '24px', position: 'relative' as const, zIndex: 10 },
  fieldGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  input: {
    width: '100%', boxSizing: 'border-box' as const, background: '#121212', border: '1px solid #334155',
    borderRadius: '0', padding: '14px 16px', color: '#fff', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
  },
  
  sectionTitle: { fontSize: '14px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  
  submitBtn: {
    width: '100%', background: 'linear-gradient(135deg, #f59e0b, #a8cc00)', border: 'none',
    borderRadius: '0', padding: '16px', color: '#000', fontSize: '14px', fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(245,158,11,0.15)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    marginTop: '16px', transition: 'all 0.2s',
  },
  
  alertErr: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '12px', borderRadius: '0', fontSize: '12px', fontWeight: 600 },
  alertSucc: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '12px', borderRadius: '0', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },

  gymCard: {
    background: '#111827', border: '1px solid #1e293b', borderRadius: '0', padding: '24px',
    display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', gap: '16px',
    transition: 'all 0.2s',
  },
  gymTitle: { fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
  planBadge: { background: '#1e293b', border: '1px solid #334155', color: '#D4FF00', fontSize: '10px', padding: '2px 6px', borderRadius: '0', textTransform: 'uppercase' as const, fontFamily: 'monospace' },
  coachBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: '0', padding: '12px', marginTop: '8px' },
  coachLabel: { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, marginBottom: '4px' },
  coachName: { fontSize: '13px', fontWeight: 700, color: '#fff' },
  coachEmail: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  enterBtn: {
    width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '12px',
    borderRadius: '0', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    cursor: 'pointer', transition: 'all 0.2s',
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
      <div style={S.card}>
        <div style={S.glow} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
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
            <input style={S.input} type="text" value={gymName} onChange={e => setGymName(e.target.value)} placeholder="Sucursal Coach" required onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />
          </div>

          <div style={S.grid2}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Plan SaaS</label>
              <select style={S.input} value={plan} onChange={e => setPlan(e.target.value as any)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
                <option value="free">Free (Limitado)</option>
                <option value="pro">PRO (Recomendado)</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', marginTop: '8px' }}>
            <h3 style={S.sectionTitle}><Shield size={16} color="#f59e0b" /> Crear Entrenador Administrador</h3>
            
            <div style={S.grid2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Nombre Completo</label>
                <input style={S.input} type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required placeholder="Ej. Carlos Mendoza" onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Correo Electrónico</label>
                <input style={S.input} type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder="admin@tu-gym.com" onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />
              </div>
              <div style={{ ...S.fieldGroup, gridColumn: 'span 2' }}>
                <label style={S.label}>Contraseña Temporal</label>
                <input style={S.input} type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required placeholder="Mínimo 4 caracteres" onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />
              </div>
            </div>
          </div>

          <button type="submit" style={S.submitBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
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
    <div style={S.page}>
      {/* Modal de confirmación */}
      {confirmGym && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '2px solid #dc2626', padding: '32px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(220,38,38,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={28} color="#dc2626" />
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>¿Eliminar definitivamente?</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Estás por eliminar el gym:
            </p>
            <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: '16px', margin: '0 0 8px' }}>📍 {confirmGym.name}</p>
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
              ⚠️ Se eliminarán <strong>todos los perfiles, rutinas, ejercicios y logs</strong> de este gym de Supabase de forma permanente. Esta acción <strong>no se puede deshacer</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmGym(null)}
                style={{ flex: 1, padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
              >Cancelar</button>
              <button
                onClick={() => handleDeleteGym(confirmGym)}
                disabled={!!deletingGymId}
                style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Trash2 size={16} /> {deletingGymId ? 'Eliminando...' : 'SÍ, ELIMINAR TODO'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#D4FF00', padding: '12px', borderRadius: '0', color: '#000', display: 'flex' }}>
          <Building2 size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>Lista de Gimnasios (Tenants)</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Total aislados por Row Level Security: {allGyms.length}</p>
        </div>
      </div>
      {deleteMsg && (
        <div style={{ padding: '12px 16px', background: deleteMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${deleteMsg.startsWith('✅') ? '#22c55e' : '#dc2626'}`, color: deleteMsg.startsWith('✅') ? '#22c55e' : '#ef4444', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>{deleteMsg}</div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
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
            <div key={gym.id} style={S.gymCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '0', border: '1px solid #334155', color: isMaster ? '#f59e0b' : '#D4FF00', display: 'flex' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <h4 style={S.gymTitle}>
                      {gym.name} <span style={S.planBadge}>{gym.plan}</span>
                      {isMaster && <span style={{ ...S.planBadge, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', marginLeft: '4px' }}>MASTER</span>}
                    </h4>
                    {!isMaster && (
                      <button
                        onClick={() => setConfirmGym(gym)}
                        title="Eliminar gym definitivamente"
                        style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#ef4444', padding: '6px 8px', cursor: 'pointer', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', margin: '4px 0 0' }}>ID: {gym.id}</p>
                  
                  {coach && (
                    <div style={S.coachBox}>
                      <div style={S.coachLabel}>Admin / Coach:</div>
                      <div style={S.coachName}>{coach.full_name}</div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', fontWeight: 700 }}>USUARIO (CORREO)</label>
                          <input 
                            type="text" 
                            value={draft.email} 
                            onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, email: e.target.value } }))}
                            style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '6px', fontSize: '12px', width: '100%', outline: 'none' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', fontWeight: 700 }}>CONTRASEÑA</label>
                          <input 
                            type="text" 
                            value={draft.password} 
                            onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, password: e.target.value } }))}
                            style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '6px', fontSize: '12px', width: '100%', outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isMaster && (
                    <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginBottom: '4px' }}>VENCIMIENTO DE LA SUCURSAL:</label>
                      <input 
                        type="date"
                        value={draft.valid_until ? draft.valid_until.split('T')[0] : ''}
                        onChange={e => setDrafts(prev => ({ ...prev, [gym.id]: { ...draft, valid_until: e.target.value } }))}
                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '6px', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    style={{ marginTop: '12px', width: '100%', background: saveSuccessId === gym.id ? '#22c55e' : '#f59e0b', color: saveSuccessId === gym.id ? '#fff' : '#000', border: 'none', padding: '8px', fontWeight: 900, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
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
                      style={{ ...S.enterBtn, background: isExpired ? '#334155' : '#1e293b', color: isExpired ? '#94a3b8' : '#fff', cursor: isExpired ? 'not-allowed' : 'pointer', border: isExpired ? '1px solid #1e293b' : S.enterBtn.border }}
                      onClick={() => !isExpired && onEnterGym(gym, coach)}
                      onMouseEnter={e => { if (!isExpired) { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#000'; } }}
                      onMouseLeave={e => { if (!isExpired) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#fff'; } }}
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
