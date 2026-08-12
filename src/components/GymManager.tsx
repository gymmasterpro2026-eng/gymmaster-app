import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, ArrowRight, Shield, Globe2 } from 'lucide-react';
import { dataService } from '../services/dataService';
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

  useEffect(() => {
    setAllGyms(dataService.getGyms());
    setAllProfiles(dataService.getProfiles());
  }, []);

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#D4FF00', padding: '12px', borderRadius: '0', color: '#000', display: 'flex' }}>
          <Building2 size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>Lista de Gimnasios (Tenants)</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Total aislados por Row Level Security: {allGyms.length}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {allGyms.map((gym) => {
          const gymProfiles = allProfiles.filter(p => p.gym_id === gym.id);
          const coach = gymProfiles.find(p => p.role === 'coach') || gymProfiles[0];

          return (
            <div key={gym.id} style={S.gymCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '0', border: '1px solid #334155', color: '#D4FF00', display: 'flex' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 style={S.gymTitle}>
                    {gym.name} <span style={S.planBadge}>{gym.plan}</span>
                  </h4>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', margin: '4px 0 0' }}>ID: {gym.id}</p>
                  
                  {coach && (
                    <div style={S.coachBox}>
                      <div style={S.coachLabel}>Admin / Coach:</div>
                      <div style={S.coachName}>{coach.full_name}</div>
                      <div style={S.coachEmail}>{coach.email}</div>
                    </div>
                  )}
                </div>
              </div>

              {coach && (
                <button
                  style={S.enterBtn}
                  onClick={() => onEnterGym(gym, coach)}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#000'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#fff'; }}
                >
                  Entrar al Gym <ArrowRight size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
