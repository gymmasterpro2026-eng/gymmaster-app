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
  compact?: boolean;
}

function SyncTimeText({ lastSyncTime, isSyncing }: { lastSyncTime: Date | null; isSyncing: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  if (isSyncing) return <span>En vivo</span>;
  if (!lastSyncTime) return <span>Live</span>;
  const diffSec = Math.max(0, Math.floor((now - lastSyncTime.getTime()) / 1000));
  if (diffSec < 15) return <span>Ahora</span>;
  if (diffSec < 60) return <span>Hace {diffSec}s</span>;
  return <span>Hace {Math.floor(diffSec / 60)}m</span>;
}

function NavButton({ active, onClick, label, compact = false }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={active ? 'titan-nav-btn-active' : 'titan-nav-btn-idle'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '0 18px' : '0 22px',
        minHeight: compact ? (active ? '50px' : '44px') : (active ? '64px' : '58px'),
        marginBottom: compact ? '4px' : '6px',
        cursor: 'pointer',
        color: active ? '#FFFFFF' : '#CBD5E1',
        fontSize: compact ? '13px' : '15px',
        fontWeight: active ? 700 : 500,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.02em',
        textShadow: active ? '0 0 12px rgba(255, 160, 80, 0.45)' : '0 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
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

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setSyncState(dataService.getSyncState());
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSyncClick = () => {
    dataService.syncNow();
  };

  const isDefaultBrand = !brandName || brandName.trim().toUpperCase() === defaultName;
  const isTitanGym = !activeGym || activeGym.name.toLowerCase().includes('titan');
  const displayHeadline = isDefaultBrand && isTitanGym
    ? 'TITAN'
    : brandName.trim().split(' ')[0]?.toUpperCase() || 'TITAN';
  const displaySubline = isDefaultBrand && isTitanGym
    ? 'FITNESS CENTER'
    : (activeGym?.name || brandName.trim().split(' ').slice(1).join(' ') || 'FITNESS CENTER').toUpperCase();

  const handleNavClick = (tab: string, role?: UserRole) => {
    if (role) setCurrentRole(role);
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  const S: Record<string, React.CSSProperties> = {
    aside: {
      width: '272px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#06080B',
      position: 'relative',
      zIndex: 50,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    header: {
      height: '136px',
      padding: '18px 18px 22px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    headerGlow: {
      display: 'none',
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
    },
    logoIcon: {
      width: '54px',
      height: '54px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      filter: 'drop-shadow(0 0 10px rgba(214, 123, 53, 0.35))',
    },
    logoTitle: {
      fontSize: '28px',
      fontWeight: 700,
      fontFamily: "'Chakra Petch', sans-serif",
      color: '#FFFFFF',
      margin: 0,
      letterSpacing: '0.06em',
      lineHeight: 0.95,
    },
    logoAccent: { color: '#D67B35' },
    logoSub: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '4px',
    },
    logoDot: {
      display: 'none',
    },
    logoGym: {
      fontSize: '10px',
      fontFamily: "'Chakra Petch', sans-serif",
      color: '#D67B35',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
    },
    scrollArea: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '10px 16px 6px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    section: { display: 'flex', flexDirection: 'column', gap: '2px' },
    sectionLabel: {
      fontSize: '10px',
      fontFamily: "'Chakra Petch', sans-serif",
      fontWeight: 700,
      color: '#D67B35',
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
      padding: '0 8px',
      marginBottom: '6px',
    },
    footer: {
      padding: '4px 10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flexShrink: 0,
    },
    roleSwitcher: {
      display: 'flex',
      background: 'rgba(13, 16, 21, 0.75)',
      border: '1px solid rgba(249, 115, 22, 0.25)',
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
      fontFamily: "'Chakra Petch', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      background: active ? 'linear-gradient(90deg, #F59E0B, #EA580C)' : 'transparent',
      color: active ? '#090D12' : 'rgba(255,255,255,0.45)',
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
      background: 'linear-gradient(145deg, #1A1F26 0%, #111419 100%)',
      border: '1px solid rgba(249, 115, 22, 0.25)',
      borderRadius: '0',
      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
      padding: '10px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '0',
      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
      background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(234,88,12,0.12))',
      border: '1px solid #F97316',
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
      <button className="gm-mobile-toggle" onClick={() => setIsMobileOpen(prev => !prev)}>
        {isMobileOpen ? <X color="#fff" size={24} /> : <Menu color="#fff" size={24} />}
      </button>
      <div className={`gm-mobile-overlay ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(false)} />

      <aside className={`gm-sidebar titan-sidebar-shell ${isMobileOpen ? 'open' : ''}`} style={S.aside}>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .nav-glow-dot { animation: pulse 2s infinite; }
          aside::-webkit-scrollbar { width: 4px; }
          aside::-webkit-scrollbar-thumb { background: rgba(214,123,53,0.35); border-radius: 4px; }
          
          .gm-sidebar { transition: left 0.3s ease; }
          .gm-mobile-overlay {
            display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            z-index: 40; backdrop-filter: blur(4px);
          }
          .gm-mobile-toggle {
            display: none; position: fixed; top: 14px; left: 14px; z-index: 60;
            background: linear-gradient(180deg, #D57A30, #B55B1E); border: 1px solid rgba(255,200,130,0.4); padding: 10px; cursor: pointer;
            box-shadow: 0 4px 16px rgba(213, 122, 48, 0.45);
            clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
          }
          @media (max-width: 768px) {
            .gm-sidebar { position: fixed !important; left: -280px; height: 100vh; z-index: 50; }
            .gm-sidebar.open { left: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.75); }
            .gm-mobile-overlay.open { display: block; }
            .gm-mobile-toggle { display: flex; align-items: center; justify-content: center; }
          }
        `}</style>

      {/* Header / Brand Plate 3D */}
      <div className="titan-header-plate" style={S.header} onClick={() => handleNavClick('home')}>
        <div style={{ ...S.logoRow, position: 'relative' }}>
          <div style={S.logoIcon}>
            <img
              src={brandLogo.startsWith('data:') ? brandLogo : '/gymmaster-app/titan-ui/titan-shield-emblem.png'}
              alt="Titan Emblem"
              style={{
                width: '100%',
                height: '100%',
                objectFit: brandLogo.startsWith('data:') ? 'cover' : 'contain',
                border: brandLogo.startsWith('data:') ? '1px solid #D67B35' : 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={S.logoTitle}>{displayHeadline}</h1>
            <div style={S.logoSub}>
              <span style={S.logoGym}>{displaySubline}</span>
            </div>
          </div>
          {currentRole === 'coach' && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditBrandName(brandName); setEditBrandLogo(brandLogo); setShowBrandModal(true); }}
              title="Editar mi marca"
              style={{
                position: 'absolute', top: -8, right: -6,
                background: 'rgba(13, 16, 21, 0.85)', border: '1px solid rgba(214,123,53,0.4)',
                borderRadius: '2px', padding: '2px 6px', cursor: 'pointer',
                color: '#D67B35', fontSize: '9px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700,
              }}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Modal editar marca */}
      {showBrandModal && (
        <div className="titan-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="titan-modal" style={{
            padding: 28, width: '100%', maxWidth: 420,
          }}>
            <h2 className="titan-section-title" style={{ fontSize: 16, margin: '0 0 20px' }}>
              ✏️ Editar Marca del Gimnasio
            </h2>

            {/* Logo preview */}
            <div className="titan-inset-well" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16 }}>
              <div style={{
                width: 96, height: 96,
                overflow: 'hidden', border: '2px solid #D57A30',
                boxShadow: '0 0 20px rgba(213,122,48,0.35)',
              }}>
                <img
                  src={editBrandLogo}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: editBrandLogo.startsWith('data:') ? 'none' : 'invert(1) brightness(2)' }}
                />
              </div>
              <button
                onClick={() => brandFileRef.current?.click()}
                className="titan-btn-armor-steel"
                style={{
                  padding: '8px 16px',
                  fontSize: 11,
                }}
              >
                📷 Cambiar Foto del Logo
              </button>
              <input ref={brandFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBrandLogoUpload} />
            </div>

            {/* Brand name input */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#D57A30', fontSize: 11, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Nombre de la Marca
              </label>
              <textarea
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
                placeholder="TU MEJOR VERSIÓN TE ESPERA"
                rows={3}
                className="titan-textarea"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 14, fontWeight: 700, boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
              <p style={{ color: '#94A3B8', fontSize: 11, margin: '6px 0 0' }}>
                💡 Las últimas 2 palabras se muestran en cobre/dorado.
              </p>
            </div>

            {/* Preview del nombre */}
            <div className="titan-inset-well" style={{
              padding: '10px 14px',
              marginBottom: 20, textAlign: 'center',
            }}>
              <span className="titan-section-title" style={{ color: '#fff', fontSize: 14 }}>
                {getBrandParts(editBrandName).main}{' '}
              </span>
              <span className="titan-section-title" style={{ color: '#FFBD4A', fontSize: 14 }}>
                {getBrandParts(editBrandName).accent}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBrandModal(false)}
                className="titan-btn-armor-steel"
                style={{ fontSize: 11, padding: '9px 14px' }}
              >Cancelar</button>
              <button
                onClick={handleSaveBrand}
                className="titan-btn-armor-copper"
                style={{
                  padding: '10px 20px', fontSize: 12,
                }}
              >💾 Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Nav scroll area */}
      <div style={S.scrollArea}>
        <div style={S.section}>
          {currentRole === 'coach' && <p style={S.sectionLabel}>Principal</p>}
          <NavButton
            active={currentTab === 'home'}
            onClick={() => handleNavClick('home')}
            icon={currentRole === 'alumno' ? Dumbbell : User}
            label={currentRole === 'alumno' ? 'Mi Entrenamiento' : 'Coach & Alumnos'}
            compact={currentRole === 'coach'}
          />
          {currentRole === 'coach' && (
          <NavButton
            active={currentTab === 'diet'}
            onClick={() => handleNavClick('diet')}
            icon={Apple}
            label="Dieta y Nutrición"
            compact
          />
          )}
          {currentRole === 'alumno' && (
            <NavButton
              active={currentTab === 'running'}
              onClick={() => handleNavClick('running')}
              icon={Activity}
              label="Trainer de Running"
            />
          )}
          {currentRole === 'alumno' && (
            <NavButton
              active={currentTab === 'stats'}
              onClick={() => handleNavClick('stats')}
              icon={Activity}
              label="Mi Progreso"
            />
          )}
          {currentRole === 'coach' && (
            <>
              <NavButton active={currentTab === 'catalog'} onClick={() => handleNavClick('catalog')} icon={Database} label="Ejercicios" compact />
              <NavButton active={currentTab === 'alumnos-cuotas'} onClick={() => handleNavClick('alumnos-cuotas')} icon={User} label="Alumnos Cuotas" compact />
              <NavButton active={currentTab === 'cobros'} onClick={() => handleNavClick('cobros')} icon={Database} label="Cobros" compact />
              {activeGym?.id === 'gym-titan-001' && (
                <>
                  <NavButton active={currentTab === 'sql'} onClick={() => handleNavClick('sql')} icon={Shield} label="SQL & RLS" compact />
                  <NavButton active={currentTab === 'import'} onClick={() => handleNavClick('import')} icon={Code2} label="Import Node" compact />
                  <NavButton active={currentTab === 'structure'} onClick={() => handleNavClick('structure')} icon={FolderTree} label="Estructura" compact />
                </>
              )}
            </>
          )}
        </div>

        {/* Administración — solo visible para el Admin Master (Titan Fitness Center) */}
        {currentRole === 'coach' && activeGym?.id === 'gym-titan-001' && (
          <div style={S.section}>
            <p style={S.sectionLabel}>Administración</p>
            <NavButton active={currentTab === 'create-gym'} onClick={() => handleNavClick('create-gym')} icon={Building2} label="Nuevo Gimnasio" compact />
            <NavButton active={currentTab === 'list-gyms'} onClick={() => handleNavClick('list-gyms')} icon={Globe2} label="Ver Gimnasios" compact />
          </div>
        )}

        {/* Pieza Armadura Intermedia 3D (Cobre + LED vertical rojo-naranja como en Imagen 1) */}
        {currentRole === 'alumno' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '4px', minHeight: '115px' }}>
            <img
              src="/gymmaster-app/titan-ui/sidebar-armor-divider.png"
              alt=""
              className="titan-armor-divider"
              style={{ width: '100%', height: '100%', maxHeight: '185px', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={S.footer}>
        {/* Realtime Sync Status Plate 3D */}
        <button
          type="button"
          onClick={handleSyncClick}
          title="Toca para sincronizar en tiempo real con Supabase"
          className="titan-sync-plate"
          style={{
            height: '62px',
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontFamily: "'Chakra Petch', sans-serif",
              fontWeight: 700,
              color: syncState.isSyncing ? '#FBBF24' : '#FFFFFF',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {syncState.isSyncing ? 'SINCRONIZANDO' : 'SINCRONIZADO'}
          </span>
          <div
            className="nav-glow-dot"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: syncState.isSyncing ? '#F59E0B' : '#FF2957',
              boxShadow: syncState.isSyncing
                ? '0 0 8px #F59E0B, 0 0 18px rgba(245, 158, 11, 0.7)'
                : '0 0 8px #FF2957, 0 0 18px rgba(255, 41, 87, 0.85)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '9px', color: '#64748B', fontFamily: 'monospace', marginLeft: '2px' }}>
            <SyncTimeText lastSyncTime={syncState.lastSyncTime} isSyncing={syncState.isSyncing} />
          </span>
        </button>

        {/* Barra discreta de usuario/rol en acero oscuro */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0B0E13',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 10px',
            gap: '8px',
          }}
        >
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  background: '#161A22',
                  border: '1px solid rgba(214, 123, 53, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={13} color="#D67B35" />
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <p style={{ ...S.userName, fontSize: '11px', fontWeight: 700 }}>{currentUser.full_name}</p>
                <p style={{ ...S.userRole, fontSize: '9px', color: '#D67B35' }}>{currentRole === 'coach' ? 'COACH' : 'ALUMNO'}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenGymGenerator}
              style={{ ...S.iconBtn, color: '#D67B35', fontSize: '12px', fontWeight: 700, gap: '6px', display: 'flex', alignItems: 'center' }}
            >
              <LogIn size={14} /> Iniciar Sesión
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {currentUser?.role === 'coach' && (
              <button
                type="button"
                onClick={() => handleNavClick('home', currentRole === 'coach' ? 'alumno' : 'coach')}
                className="titan-steel-btn"
                title={currentRole === 'coach' ? 'Ver como Alumno' : 'Volver a Coach'}
                style={{ padding: '4px 7px', fontSize: '9px', clipPath: 'none' }}
              >
                {currentRole === 'coach' ? 'Alumno' : 'Coach'}
              </button>
            )}
            <button
              onClick={onResetData}
              title="Restablecer Datos"
              style={S.iconBtn}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <RefreshCw size={13} color="rgba(255,255,255,0.45)" />
            </button>
            {currentUser && (
              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                style={S.iconBtn}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={13} color="#f87171" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};
