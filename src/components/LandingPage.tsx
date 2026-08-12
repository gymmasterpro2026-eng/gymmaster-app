import React, { useState, useEffect, useRef } from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { dataService } from '../services/dataService';
import { GymTenant, Profile } from '../types';

interface LandingPageProps {
  onEnterApp: (gym: GymTenant, userProfile: Profile) => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {x: number; y: number; vx: number; vy: number; size: number; opacity: number}[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 255, 0, ${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 255, 0, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Por favor, ingresa tu usuario.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const result = dataService.login(username, password);
      if (!result) {
        setError('Usuario o contraseña incorrectos.');
        setIsLoading(false);
        return;
      }
      onEnterApp(result.gym, result.profile);
      setIsLoading(false);
    }, 600);
  };

  const quickLogin = (user: string, pass: string) => {
    const result = dataService.login(user, pass);
    if (result) onEnterApp(result.gym, result.profile);
  };

  const S: Record<string, React.CSSProperties> = {
    root: {
      minHeight: '100vh',
      background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${(import.meta as any).env?.BASE_URL || '/gymmaster-app/'}gym_environment.png) center/cover no-repeat fixed`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    },
    canvas: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
    glow1: {
      position: 'absolute',
      top: '-20%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '600px',
      height: '400px',
      background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    glow2: {
      position: 'absolute',
      bottom: '-10%',
      right: '-10%',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    card: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '440px',
      background: 'rgba(15, 23, 42, 0.40)',
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: '0',
      padding: '48px 40px',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    },
    shine: {
      position: 'absolute',
      inset: 0,
      borderRadius: '0',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    logoWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '40px',
    },
    logoBox: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #f59e0b, #a8cc00)',
      borderRadius: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      boxShadow: '0 0 40px rgba(245,158,11,0.4), 0 8px 30px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
    },
    logoShine: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
      borderRadius: '0',
    },
    title: {
      fontSize: '36px',
      fontWeight: 900,
      color: '#ffffff',
      margin: 0,
      letterSpacing: '-1px',
      textAlign: 'center',
      lineHeight: 1.1,
    },
    accent: { color: '#D4FF00' },
    subtitle: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.7)',
      margin: '8px 0 0',
      textAlign: 'center',
      fontWeight: 600,
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    errorBox: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '0',
      padding: '12px 16px',
      color: '#fca5a5',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    errDot: {
      width: '6px', height: '6px',
      borderRadius: '0', background: '#fc8181', flexShrink: 0,
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: {
      fontSize: '11px', fontWeight: 800,
      color: '#cbd5e1',
      textTransform: 'uppercase', letterSpacing: '0.1em',
    },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: {
      position: 'absolute', left: '16px',
      color: '#334155', pointerEvents: 'none',
      display: 'flex', alignItems: 'center', zIndex: 2,
    },
    input: {
      width: '100%',
      background: '#e2e8f0',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '0',
      padding: '14px 16px 14px 46px',
      color: '#0f172a', fontSize: '14px', fontWeight: 700,
      outline: 'none', boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    },
    inputPr: {
      width: '100%',
      background: '#e2e8f0',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '0',
      padding: '14px 48px 14px 46px',
      color: '#0f172a', fontSize: '14px', fontWeight: 700,
      outline: 'none', boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    },
    eyeBtn: {
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(15, 23, 42, 0.08)', border: '1px solid rgba(15, 23, 42, 0.15)',
      borderRadius: '0', cursor: 'pointer',
      color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6px', transition: 'all 0.2s', zIndex: 5,
    },
    submitBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #f59e0b, #b8db00)',
      color: '#000000', fontWeight: 900, fontSize: '12px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      border: 'none', borderRadius: '0', padding: '16px',
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px', marginTop: '4px',
      boxShadow: '0 0 30px rgba(245,158,11,0.3)',
      transition: 'transform 0.15s, box-shadow 0.2s, filter 0.2s',
    },
    divider: {
      display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px',
    },
    divLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
    divText: {
      fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
    },
    quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    qBtn: {
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '0', padding: '12px 14px',
      cursor: 'pointer', textAlign: 'left',
      transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
      display: 'flex', flexDirection: 'column', gap: '2px',
    },
    qLabel: { fontSize: '11px', fontWeight: 800, color: '#D4FF00' },
    qSub: { fontSize: '10px', color: '#cbd5e1', fontWeight: 500 },
    footer: {
      marginTop: '32px', textAlign: 'center',
      fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, fontWeight: 600,
    },
    dot: { color: '#f59e0b', margin: '0 6px' },
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input[data-gm]::placeholder { color: #64748b !important; }
        * { box-sizing: border-box; }
      `}</style>

      <canvas ref={canvasRef} style={S.canvas} />
      <div style={S.glow1} />
      <div style={S.glow2} />

      <div style={S.card}>
        <div style={S.shine} />

        <div style={S.logoWrap}>
          <div style={S.logoBox}>
            <div style={S.logoShine} />
            <Activity size={32} color="#000" />
          </div>
          <h1 style={S.title}>
            GymMaster <span style={S.accent}>PRO</span>
          </h1>
          <p style={S.subtitle}>Gestión inteligente de entrenamientos</p>
        </div>

        <form onSubmit={handleLogin} style={S.form}>
          {error && (
            <div style={S.errorBox}>
              <div style={S.errDot} />
              {error}
            </div>
          )}

          <div style={S.fieldGroup}>
            <label style={S.label}>Usuario</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                data-gm
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="gym"
                style={S.input}
                onFocus={e => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.15)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#e2e8f0';
                }}
              />
            </div>
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>Contraseña</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                data-gm
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="12345"
                style={S.inputPr}
                onFocus={e => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.15)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#e2e8f0';
                }}
              />
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.15)'; }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ ...S.submitBtn, filter: isLoading ? 'brightness(0.85)' : 'brightness(1)' }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.35)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.2)';
            }}
          >
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Verificando...
              </>
            ) : (
              <>
                Ingresar al Sistema
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div style={S.divider}>
          <div style={S.divLine} />
          <span style={S.divText}>Acceso rápido</span>
          <div style={S.divLine} />
        </div>

        <div style={S.quickGrid}>
          <button
            type="button"
            style={S.qBtn}
            onClick={() => quickLogin('gym', '12345')}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.05)';
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={S.qLabel}>⚡ Coach Principal</span>
            <span style={S.qSub}>gym / 12345</span>
          </button>

          <button
            type="button"
            style={S.qBtn}
            onClick={() => quickLogin('santiago.gomez@alumno.gymmaster.io', 'santi123')}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{ ...S.qLabel, color: 'rgba(255,255,255,0.65)' }}>🏋️ Santiago Gómez</span>
            <span style={S.qSub}>Alumno demo</span>
          </button>
        </div>

        <p style={S.footer}>
          © 2026 GymMaster Pro
          <span style={S.dot}>•</span>
          Arquitectura RLS Estricta
          <span style={S.dot}>•</span>
          Multi-Tenant
        </p>
      </div>
    </div>
  );
}
