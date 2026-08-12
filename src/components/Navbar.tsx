import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Shield, User, Code2, FolderTree, Database,
  RefreshCw, Building2, LogOut, LogIn, Globe2, Activity, Menu, X, ChevronRight, Check
} from 'lucide-react';
import { Profile, UserRole, GymTenant } from '../types';
import { dataService } from '../services/dataService';

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

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  iconColor?: string;
}

function NavButton({ active, onClick, icon: Icon, label, iconColor = 'rgba(255,255,255,0.5)' }: NavButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '0',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        background: active ? '#0f172a' : hovered ? '#94a3b8' : 'transparent',
        color: active ? '#fff' : '#0f172a',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon
          size={15}
          style={{ color: active ? '#fff' : iconColor, flexShrink: 0 }}
        />
        <span>{label}</span>
      </div>
      <ChevronRight
        size={12}
        style={{
          color: active ? '#fff' : '#0f172a',
          opacity: active || hovered ? 1 : 0,
          transform: active ? 'translateX(2px)' : 'none',
          transition: 'all 0.2s',
        }}
      />
    </button>
  );
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole, setCurrentRole, selectedAlumnoId, setSelectedAlumnoId,
  alumnos = [], currentTab, setCurrentTab, onResetData,
  onOpenGymGenerator, activeGym, currentUser, onLogout,
}) => {
  const safeAlumnos = Array.isArray(alumnos) ? alumnos : [];
  const activeAlumno = safeAlumnos.find(a => a && a.id === selectedAlumnoId);
  const isPlanExpired = activeAlumno ? new Date(activeAlumno.plan_active_until) < new Date() : false;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [syncState, setSyncState] = useState(() => dataService.getSyncState());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setSyncState(dataService.getSyncState());
    });
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleSyncClick = () => {
    dataService.syncNow();
  };

  const getTimeAgo = () => {
    if (!syncState.lastSyncTime) return 'En vivo';
    const diffSec = Math.max(0, Math.floor((now - syncState.lastSyncTime.getTime()) / 1000));
    if (diffSec < 5) return 'Ahora';
    if (diffSec < 60) return `Hace ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    return `Hace ${diffMin}m`;
  };

  const handleNavClick = (tab: string, role?: UserRole) => {
    if (role) setCurrentRole(role);
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  const S: Record<string, React.CSSProperties> = {
    aside: {
      width: '260px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#cbd5e1',
      borderRight: '1px solid #94a3b8',
      position: 'relative',
      zIndex: 50,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    header: {
      padding: '24px 20px 20px',
      borderBottom: '1px solid #94a3b8',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
    },
    headerGlow: {
      position: 'absolute',
      top: '-20px',
      right: '-20px',
      width: '80px',
      height: '80px',
      background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent)',
      pointerEvents: 'none',
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: '#fff',
      borderRadius: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 20px rgba(245,158,11,0.3)',
      flexShrink: 0,
    },
    logoTitle: {
      fontSize: '18px',
      fontWeight: 900,
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.5px',
      lineHeight: 1.1,
    },
    logoAccent: { color: '#f59e0b' },
    logoSub: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '4px',
    },
    logoDot: {
      width: '5px',
      height: '5px',
      borderRadius: '0',
      background: '#f59e0b',
    },
    logoGym: {
      fontSize: '10px',
      color: '#475569',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    scrollArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    section: { display: 'flex', flexDirection: 'column', gap: '4px' },
    sectionLabel: {
      fontSize: '10px',
      fontWeight: 700,
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '0 12px',
      marginBottom: '6px',
    },
    footer: {
      padding: '12px 12px 16px',
      borderTop: '1px solid #94a3b8',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    roleSwitcher: {
      display: 'flex',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0',
      padding: '3px',
      position: 'relative',
    },
    roleBtn: (active: boolean): React.CSSProperties => ({
      flex: 1,
      padding: '7px 0',
      borderRadius: '0',
      border: 'none',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 700,
      fontFamily: 'inherit',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      background: active ? '#f59e0b' : 'transparent',
      color: active ? '#000000' : 'rgba(255,255,255,0.4)',
      transition: 'all 0.2s ease',
      zIndex: 1,
    }),
    alumnoSelect: {
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '0',
      padding: '10px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    selectLabel: {
      fontSize: '10px',
      fontWeight: 900,
      color: '#f59e0b',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '6px',
      display: 'block',
    },
    selectRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    select: {
      background: 'transparent',
      border: 'none',
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 800,
      fontFamily: 'inherit',
      outline: 'none',
      cursor: 'pointer',
      flex: 1,
    },
    statusDot: (expired: boolean): React.CSSProperties => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: expired ? '#ef4444' : '#22c55e',
      boxShadow: expired ? '0 0 6px #ef4444' : '0 0 6px #22c55e',
      flexShrink: 0,
    }),
    userCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '0',
      padding: '10px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '0',
      background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.1))',
      border: '1px solid #f59e0b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    userName: {
      fontSize: '13px',
      fontWeight: 900,
      color: '#ffffff',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '120px',
    },
    userRole: {
      fontSize: '10px',
      fontWeight: 700,
      color: '#f59e0b',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      margin: 0,
    },
    iconBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s',
    },
  };

  return (
    <>
      <button className="gm-mobile-toggle" onClick={() => setIsMobileOpen(true)}>
        <Menu color="#fff" size={24} />
      </button>
      <div className={`gm-mobile-overlay ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(false)} />

      <aside className={`gm-sidebar ${isMobileOpen ? 'open' : ''}`} style={S.aside}>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .nav-glow-dot { animation: pulse 2s infinite; }
          aside::-webkit-scrollbar { width: 4px; }
          aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          
          .gm-sidebar { transition: left 0.3s ease; }
          .gm-mobile-overlay {
            display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            z-index: 40; backdrop-filter: blur(4px);
          }
          .gm-mobile-toggle {
            display: none; position: fixed; top: 16px; left: 16px; z-index: 60;
            background: #0f172a; border: none; padding: 10px; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); border-radius: 0;
          }
          @media (max-width: 768px) {
            .gm-sidebar { position: fixed !important; left: -260px; height: 100vh; z-index: 50; }
            .gm-sidebar.open { left: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.3); }
            .gm-mobile-overlay.open { display: block; }
            .gm-mobile-toggle { display: flex; align-items: center; justify-content: center; }
          }
        `}</style>

      {/* Header / Brand */}
      <div style={S.header} onClick={() => handleNavClick('home')}>
        <div style={S.headerGlow} />
        <div style={S.logoRow}>
          <div style={S.logoIcon}>
            <Dumbbell size={20} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={S.logoTitle}>
              GymMaster <span style={S.logoAccent}>PRO</span>
            </h1>
            <div style={S.logoSub}>
              <div className="nav-glow-dot" style={S.logoDot} />
              <span style={S.logoGym}>
                {activeGym ? activeGym.name : 'SaaS Multi-Tenant'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav scroll area */}
      <div style={S.scrollArea}>

        {/* Principal */}
        <div style={S.section}>
          <p style={S.sectionLabel}>Principal</p>
          <NavButton
            active={currentTab === 'home'}
            onClick={() => handleNavClick('home')}
            icon={currentRole === 'alumno' ? Dumbbell : User}
            label={currentRole === 'alumno' ? 'Mi Entrenamiento' : 'Coach & Alumnos'}
            iconColor="rgba(245,158,11,0.6)"
          />
          {currentRole === 'alumno' && (
            <NavButton
              active={currentTab === 'running'}
              onClick={() => handleNavClick('running')}
              icon={Activity}
              label="Trainer de Running"
              iconColor="rgba(251,191,36,0.7)"
            />
          )}
          {currentRole === 'coach' && (
            <>
              <NavButton active={currentTab === 'catalog'} onClick={() => handleNavClick('catalog')} icon={Database} label="Ejercicios" iconColor="rgba(96,165,250,0.7)" />
              {activeGym?.id === 'gym-titan-001' && (
                <>
                  <NavButton active={currentTab === 'sql'} onClick={() => handleNavClick('sql')} icon={Shield} label="SQL & RLS" iconColor="rgba(251,191,36,0.7)" />
                  <NavButton active={currentTab === 'import'} onClick={() => handleNavClick('import')} icon={Code2} label="Import Node" iconColor="rgba(52,211,153,0.7)" />
                  <NavButton active={currentTab === 'structure'} onClick={() => handleNavClick('structure')} icon={FolderTree} label="Estructura" iconColor="rgba(167,139,250,0.7)" />
                </>
              )}
            </>
          )}
        </div>

        {/* Administración — solo visible para el Admin Master (Titan Fitness Center) */}
        {currentRole === 'coach' && activeGym?.id === 'gym-titan-001' && (
          <div style={S.section}>
            <p style={S.sectionLabel}>Administración</p>
            <NavButton active={currentTab === 'create-gym'} onClick={() => handleNavClick('create-gym')} icon={Building2} label="Nuevo Gimnasio" />
            <NavButton active={currentTab === 'list-gyms'} onClick={() => handleNavClick('list-gyms')} icon={Globe2} label="Ver Gimnasios" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={S.footer}>
        {/* Role switcher */}
        {(!currentUser || currentUser.role !== 'alumno') && (
          <div style={S.roleSwitcher}>
            <button style={S.roleBtn(currentRole === 'coach')} onClick={() => handleNavClick('home', 'coach')}>
              <Shield size={11} /> Coach
            </button>
            <button style={S.roleBtn(currentRole === 'alumno')} onClick={() => handleNavClick('home', 'alumno')}>
              <User size={11} /> Alumno
            </button>
          </div>
        )}

        {/* Realtime Sync Status Button */}
        <button
          type="button"
          onClick={handleSyncClick}
          title="Toca para sincronizar en tiempo real con Supabase (APK, Web y Local)"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: syncState.isSyncing
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : '#0f172a',
            border: syncState.isSyncing
              ? '2px solid #b45309'
              : '2px solid #10b981',
            borderRadius: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: syncState.isSyncing ? '0 0 20px rgba(245,158,11,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw
              size={15}
              style={{
                color: syncState.isSyncing ? '#000000' : '#10b981',
                animation: syncState.isSyncing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: syncState.isSyncing ? '#000000' : '#10b981',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {syncState.isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZADO'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: syncState.isSyncing ? '#000000' : '#94a3b8',
                fontFamily: 'monospace',
              }}
            >
              {syncState.isSyncing ? 'En vivo' : getTimeAgo()}
            </span>
            <div
              className={syncState.isSyncing ? 'nav-glow-dot' : ''}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: syncState.isSyncing ? '#000000' : '#10b981',
                boxShadow: syncState.isSyncing ? '0 0 6px #000' : '0 0 8px #10b981',
              }}
            />
          </div>
        </button>



        {/* User card */}
        <div style={S.userCard}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              <div style={S.avatar}>
                <User size={15} color="#f59e0b" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={S.userName}>{currentUser.full_name}</p>
                <p style={S.userRole}>{currentUser.role}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenGymGenerator}
              style={{ ...S.iconBtn, color: '#f59e0b', fontSize: '13px', fontWeight: 700, gap: '6px', display: 'flex', alignItems: 'center' }}
            >
              <LogIn size={15} /> Iniciar Sesión
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={onResetData}
              title="Restablecer Datos"
              style={S.iconBtn}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <RefreshCw size={14} color="rgba(255,255,255,0.35)" />
            </button>
            {currentUser && (
              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                style={S.iconBtn}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={14} color="#f87171" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};
