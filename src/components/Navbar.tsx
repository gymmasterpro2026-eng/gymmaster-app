import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell, Shield, User, Code2, FolderTree, Database,
  RefreshCw, Building2, LogOut, LogIn, Globe2, Activity, Menu, X, ChevronRight, Check, Apple
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

function NavButton({ active, onClick, icon: Icon, label, iconColor = '#64748b' }: NavButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isActiveOrHovered = active || hovered;

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
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        background: isActiveOrHovered ? '#475569' : '#f1f5f9',
        color: isActiveOrHovered ? '#ffffff' : '#0f172a',
        marginBottom: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon
          size={15}
          style={{ color: isActiveOrHovered ? '#ffffff' : iconColor, flexShrink: 0 }}
        />
        <span>{label}</span>
      </div>
      <ChevronRight
        size={12}
        style={{
          color: isActiveOrHovered ? '#ffffff' : '#0f172a',
          opacity: isActiveOrHovered ? 1 : 0.4,
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

  // ── MARCA POR COACH ──────────────────────────────────────────────────
  // Determinar qué clave de marca usar según el usuario actual:
  // - Admin Master (coach-001) → clave global 'gymmaster_brand_name'
  // - Otro coach → clave propia 'gymmaster_brand_name_{id}'
  // - Alumno → clave del coach al que pertenece 'gymmaster_brand_name_{managed_by}'
  const getBrandKey = (suffix: 'name' | 'logo') => {
    const base = suffix === 'name' ? 'gymmaster_brand_name' : 'gymmaster_brand_logo';
    if (!currentUser) return base;
    if (currentUser.id === 'coach-001') return base; // Admin Master = global
    if (currentUser.role === 'coach') return `${base}_${currentUser.id}`;
    if (currentUser.role === 'alumno' && currentUser.managed_by) return `${base}_${currentUser.managed_by}`;
    return base;
  };

  const defaultName = 'TU MEJOR VERSIÓN TE ESPERA';
  const defaultLogo = '/gymmaster-app/fitness_logo.jpg';

  const [brandName, setBrandName] = useState<string>(
    () => localStorage.getItem(getBrandKey('name')) || localStorage.getItem('gymmaster_brand_name') || defaultName
  );
  const [brandLogo, setBrandLogo] = useState<string>(
    () => localStorage.getItem(getBrandKey('logo')) || localStorage.getItem('gymmaster_brand_logo') || defaultLogo
  );
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editBrandName, setEditBrandName] = useState(brandName);
  const [editBrandLogo, setEditBrandLogo] = useState(brandLogo);
  const brandFileRef = useRef<HTMLInputElement>(null);

  const handleBrandLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setEditBrandLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrand = () => {
    setBrandName(editBrandName);
    setBrandLogo(editBrandLogo);
    // Guardar en la clave correcta según el coach
    localStorage.setItem(getBrandKey('name'), editBrandName);
    localStorage.setItem(getBrandKey('logo'), editBrandLogo);
    setShowBrandModal(false);
  };

  const getBrandParts = (name: string) => {
    const words = name.trim().split(' ');
    const accent = words.slice(-2).join(' ');
    const main = words.slice(0, -2).join(' ');
    return { main, accent };
  };
  // ─────────────────────────────────────────────────────────────────────

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
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
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
      color: '#ffffff',
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
        <div style={{ ...S.logoRow, position: 'relative' }}>
          <div style={{ ...S.logoIcon, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <img
              src={brandLogo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: brandLogo.startsWith('data:') ? 'none' : 'invert(1) brightness(2)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.logoTitle}>
              {getBrandParts(brandName).main} <span style={S.logoAccent}>{getBrandParts(brandName).accent}</span>
            </h1>
            <div style={S.logoSub}>
              <div className="nav-glow-dot" style={S.logoDot} />
              <span style={S.logoGym}>
                {activeGym ? activeGym.name : 'SaaS Multi-Tenant'}
              </span>
            </div>
          </div>
          {/* Cada coach puede editar SU PROPIA marca */}
          {currentRole === 'coach' && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditBrandName(brandName); setEditBrandLogo(brandLogo); setShowBrandModal(true); }}
              title="Editar mi marca"
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '6px', padding: '3px 6px', cursor: 'pointer',
                color: '#f59e0b', fontSize: '10px', fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: '3px',
              }}
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>

      {/* Modal editar marca */}
      {showBrandModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 900, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>
              ✏️ Editar Marca del Gimnasio
            </h2>

            {/* Logo preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                overflow: 'hidden', border: '2px solid #f59e0b',
                boxShadow: '0 0 20px rgba(245,158,11,0.3)',
              }}>
                <img
                  src={editBrandLogo}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: editBrandLogo.startsWith('data:') ? 'none' : 'invert(1) brightness(2)' }}
                />
              </div>
              <button
                onClick={() => brandFileRef.current?.click()}
                style={{
                  background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
                  color: '#f59e0b', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                📷 Cambiar Foto del Logo
              </button>
              <input ref={brandFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBrandLogoUpload} />
            </div>

            {/* Brand name input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Nombre de la Marca
              </label>
              <textarea
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
                placeholder="TU MEJOR VERSIÓN TE ESPERA"
                rows={3}
                style={{
                  width: '100%', background: '#1e293b', border: '1px solid #334155',
                  borderRadius: 8, padding: '10px 14px', color: '#fff',
                  fontSize: 14, fontWeight: 700, boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
              <p style={{ color: '#64748b', fontSize: 11, margin: '6px 0 0' }}>
                💡 Las últimas 2 palabras se muestran en amarillo.
              </p>
            </div>

            {/* Preview del nombre */}
            <div style={{
              background: '#1e293b', borderRadius: 8, padding: '10px 14px',
              marginBottom: 20, textAlign: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>
                {getBrandParts(editBrandName).main}{' '}
              </span>
              <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 14 }}>
                {getBrandParts(editBrandName).accent}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBrandModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}
              >Cancelar</button>
              <button
                onClick={handleSaveBrand}
                style={{
                  background: '#f59e0b', color: '#000', border: 'none',
                  borderRadius: 8, padding: '10px 20px', fontSize: 12,
                  fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase',
                }}
              >💾 Guardar</button>
            </div>
          </div>
        </div>
      )}

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
          <NavButton
            active={currentTab === 'diet'}
            onClick={() => handleNavClick('diet')}
            icon={Apple}
            label="Dieta y Nutrición"
            iconColor="rgba(34,197,94,0.7)"
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
              <NavButton active={currentTab === 'alumnos-cuotas'} onClick={() => handleNavClick('alumnos-cuotas')} icon={User} label="Alumnos Cuotas" iconColor="rgba(239,68,68,0.7)" />
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
        {/* Role indicator */}
        {currentUser && (
          <div style={S.roleSwitcher}>
            {currentUser.role === 'coach' ? (
              <button style={S.roleBtn(true)} onClick={() => handleNavClick('home', 'coach')}>
                <Shield size={11} /> Coach
              </button>
            ) : (
              <button style={S.roleBtn(true)} onClick={() => handleNavClick('home', 'alumno')}>
                <User size={11} /> Alumno
              </button>
            )}
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
