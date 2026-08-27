import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell, AlertTriangle, RotateCcw, ChevronDown, Check, Save,
  Timer, Maximize2, Camera, Edit3, Pencil, Info, ShieldCheck, Zap, Play, Pause, Square
} from 'lucide-react';
import { Profile, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { EditProfileModal } from './EditProfileModal';
import { EditRoutineModal } from './EditRoutineModal';
import { fixImageUrl } from '../utils/imageUrl';

const DAY_COLOR_MAP: Record<string, { main: string; border: string; bg: string; text: string }> = {
  'Lunes':     { main: '#f59e0b', border: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.08)', text: '#fbbf24' },
  'Martes':    { main: '#06b6d4', border: 'rgba(6, 182, 212, 0.45)',  bg: 'rgba(6, 182, 212, 0.08)',  text: '#38bdf8' },
  'Miércoles': { main: '#10b981', border: 'rgba(16, 185, 129, 0.45)', bg: 'rgba(16, 185, 129, 0.08)', text: '#34d399' },
  'Jueves':    { main: '#a855f7', border: 'rgba(168, 85, 247, 0.45)', bg: 'rgba(168, 85, 247, 0.08)', text: '#c084fc' },
  'Viernes':   { main: '#f43f5e', border: 'rgba(244, 63, 94, 0.45)',  bg: 'rgba(244, 63, 94, 0.08)',  text: '#fb7185' },
  'Sábado':    { main: '#f97316', border: 'rgba(249, 115, 22, 0.45)',  bg: 'rgba(249, 115, 22, 0.08)',  text: '#fb923c' },
  'Domingo':   { main: '#6366f1', border: 'rgba(99, 102, 241, 0.45)', bg: 'rgba(99, 102, 241, 0.08)', text: '#818cf8' },
};

interface DashboardAlumnoProps {
  alumno: Profile;
  onRefreshData: () => void;
  onBackToCoach?: () => void;
}

const S = {
  page: { padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  headerBanner: {
    background: 'linear-gradient(135deg, #0f172a, #121212)', border: '1px solid #1e293b',
    borderRadius: '0', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative' as const, overflow: 'hidden' as const,
    marginBottom: '32px'
  },
  glow: { position: 'absolute' as const, top: '-50px', right: '-50px', width: '200px', height: '200px', background: '#f59e0b', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' as const },
  avatarWrap: { position: 'relative' as const, width: '72px', height: '72px', flexShrink: 0, cursor: 'pointer' },
  avatarImg: { width: '100%', height: '100%', borderRadius: '0', objectFit: 'cover' as const, border: '2px solid rgba(245,158,11,0.3)', transition: 'all 0.2s' },
  avatarIconOverlay: { position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' },
  badgeGreen: { background: '#065f46', color: '#34d399', border: '1px solid #059669', padding: '2px 8px', borderRadius: '0', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  editBtn: { background: '#1e293b', color: '#ffffff', border: '1px solid #334155', padding: '2px 8px', borderRadius: '0', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' },
  name: { fontSize: '24px', fontWeight: 900, color: '#fff', margin: '4px 0', letterSpacing: '-0.5px' },
  routinePill: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f59e0b', fontWeight: 700 },
  editRoutineBtn: { background: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '4px 10px', borderRadius: '0', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' },
  
  progressBox: { background: 'rgba(0,0,0,0.5)', border: '1px solid #334155', borderRadius: '0', padding: '16px', minWidth: '160px', textAlign: 'center' as const },
  progressLblRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '6px' },
  progressBar: { height: '8px', background: '#1e293b', borderRadius: '0', overflow: 'hidden' as const, marginBottom: '6px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #f59e0b, #a8cc00)', transition: 'width 0.5s' },
  progressText: { fontSize: '10px', color: '#666', fontWeight: 600 },

  timerBar: { position: 'sticky' as const, top: '16px', zIndex: 40, background: 'rgba(245,158,11,0.95)', backdropFilter: 'blur(10px)', color: '#000', padding: '12px 20px', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' },
  timerDisplay: { fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' },
  timerInput: { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0', color: '#000', fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, width: '100px', textAlign: 'center' as const, outline: 'none' },
  timerBtns: { display: 'flex', gap: '8px' },
  tBtn: { background: '#000', color: '#f59e0b', border: 'none', padding: '8px', borderRadius: '0', display: 'flex', cursor: 'pointer' },

  dayTabs: { display: 'flex', gap: '8px', overflowX: 'auto' as const, paddingBottom: '8px', marginBottom: '16px' },
  tabBtn: (active: boolean): React.CSSProperties => ({
    background: active ? '#f59e0b' : '#1e293b', color: active ? '#000' : '#888', border: `1px solid ${active ? '#f59e0b' : '#334155'}`,
    padding: '10px 16px', borderRadius: '0', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' as const, cursor: 'pointer', transition: 'all 0.2s'
  }),

  emptyState: { background: 'rgba(255,255,255,0.02)', border: '2px dashed #334155', borderRadius: '0', padding: '48px 24px', textAlign: 'center' as const, color: '#666', fontSize: '13px', fontWeight: 600 },
  
  card: (expanded: boolean, completed: boolean): React.CSSProperties => ({
    background: completed ? 'rgba(16,185,129,0.05)' : '#0f172a',
    border: `1px solid ${completed ? 'rgba(16,185,129,0.2)' : expanded ? 'rgba(245,158,11,0.3)' : '#1e293b'}`,
    borderRadius: '0', overflow: 'hidden' as const, marginBottom: '16px', transition: 'all 0.3s'
  }),
  cHeader: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px', cursor: 'pointer', userSelect: 'none' as const },
  cImgWrap: { position: 'relative' as const, flexShrink: 0 },
  cImg: { width: '105px', height: '105px', minWidth: '105px', minHeight: '105px', borderRadius: '0', objectFit: 'contain' as const, background: '#fff', padding: '6px', flexShrink: 0 },
  cNumBadge: { position: 'absolute' as const, top: '-8px', left: '-8px', background: '#000', color: '#f59e0b', width: '24px', height: '24px', borderRadius: '0', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 },
  cEquipBadge: { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '0', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const },
  cMuscleBadge: { background: '#1e293b', color: '#888', padding: '2px 8px', borderRadius: '0', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const },
  cTitle: { fontSize: '16px', fontWeight: 900, color: '#fff', margin: '6px 0 2px' },
  cMeta: { fontSize: '11px', color: '#666', fontWeight: 600, margin: 0 },
  cChevron: (expanded: boolean): React.CSSProperties => ({
    background: expanded ? '#f59e0b' : '#1e293b', color: expanded ? '#000' : '#fff', padding: '8px', borderRadius: '0', transition: 'all 0.3s', transform: expanded ? 'rotate(180deg)' : 'none'
  }),

  cExpanded: { padding: '0 20px 20px', borderTop: '1px solid #1e293b', marginTop: '4px', paddingTop: '20px', display: 'flex', flexDirection: 'column' as const, gap: '24px' },
  coachNote: { background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '0', padding: '12px', display: 'flex', gap: '12px', fontSize: '11px', color: '#ccc' },
  
  weightInputBox: { background: '#000', border: '2px solid rgba(245,158,11,0.2)', borderRadius: '0', padding: '20px', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' },
  wiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  wiTitle: { fontSize: '10px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  wiSubtitle: { fontSize: '9px', color: '#666' },
  wiCurrent: { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: '0', fontSize: '10px', fontWeight: 800 },
  
  wiControls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' as const },
  wiBtnMod: { width: '48px', height: '48px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '0', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.1s' },
  wiInputWrap: { position: 'relative' as const },
  wiInput: { width: '120px', height: '56px', background: '#0f172a', border: '2px solid #f59e0b', borderRadius: '0', color: '#f59e0b', fontSize: '28px', fontWeight: 900, fontFamily: 'monospace', textAlign: 'center' as const, outline: 'none' },
  wiInputLbl: { position: 'absolute' as const, right: '12px', bottom: '8px', fontSize: '10px', color: 'rgba(245,158,11,0.5)', fontWeight: 800 },
  wiSaveBtn: { background: '#f59e0b', color: '#000', border: 'none', borderRadius: '0', padding: '0 24px', height: '56px', fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'uppercase' as const, flex: 1, minWidth: '140px', justifyContent: 'center' },

  seriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' },
  seriesBtn: (done: boolean): React.CSSProperties => ({
    background: done ? 'rgba(16,185,129,0.1)' : '#1e293b', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : '#334155'}`, color: done ? '#34d399' : '#888',
    padding: '12px', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
  }),
  seriesCheck: (done: boolean): React.CSSProperties => ({ width: '20px', height: '20px', borderRadius: '0', border: `1px solid ${done ? '#34d399' : '#333'}`, background: done ? '#34d399' : 'transparent', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }),

  instructBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: '0', padding: '16px' },
  iTitle: { fontSize: '10px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' },
  iList: { margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#888', lineHeight: 1.5 },
  
  expiredCard: { background: '#1A0505', border: '1px solid #ff4444', borderRadius: '0', padding: '40px 24px', textAlign: 'center' as const, boxShadow: '0 20px 40px rgba(255,0,0,0.1)' },
};

export const DashboardAlumno: React.FC<DashboardAlumnoProps> = ({ alumno, onRefreshData, onBackToCoach }) => {
  // NOTE: No early return before hooks (React rules of hooks)
  const [activeRoutine, setActiveRoutine] = useState<RoutineWithLogs | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditRoutineModal, setShowEditRoutineModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ id: string; type: 'success' | 'error'; msg: string } | null>(null);
  const [draftWeights, setDraftWeights] = useState<Record<string, number>>({});
  
  const coach = dataService.getProfiles().find(p => p.role === 'coach');
  const alumnosList = dataService.getProfiles().filter(p => p.role === 'alumno');
  const exercisesList = dataService.getExercises();

  const handleCreateRoutine = () => {
    if (!coach) return;
    const newRoutine = dataService.createRoutine({
      alumno_id: alumno.id,
      coach_id: coach.id,
      gym_id: coach.gym_id,
      nombre_rutina: 'Plan de Entrenamiento Mensual',
      activa: true,
    }, []);
    setActiveRoutine(newRoutine);
    setShowEditRoutineModal(true);
    onRefreshData();
  };
  
  // Timer State
  const [timerMode, setTimerMode] = useState<'timer' | 'stopwatch'>('timer');
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerStartAt, setTimerStartAt] = useState<number | null>(null);
  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [timerTargetMs, setTimerTargetMs] = useState(90000);
  const [displayMs, setDisplayMs] = useState(90000);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isPlanActive = alumno?.plan_active_until ? new Date(alumno.plan_active_until) >= new Date() : false;

  const availableWorkouts = React.useMemo(() => {
    if (!activeRoutine) return [];
    const unique = new Map<string, { semana: number, dia: string, muscles: string[] }>();
    activeRoutine.logs.forEach(l => { 
      const sem = l.semana || 1; 
      const key = `${sem}-${l.dia}`;
      if (!unique.has(key)) {
        unique.set(key, { semana: sem, dia: l.dia, muscles: [] });
      }
      const item = unique.get(key)!;
      if (l.exercise?.primary_muscles) {
        l.exercise.primary_muscles.forEach(m => {
          if (!item.muscles.includes(m)) item.muscles.push(m);
        });
      }
    });
    const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return Array.from(unique.values()).sort((a,b) => a.semana !== b.semana ? a.semana - b.semana : order.indexOf(a.dia) - order.indexOf(b.dia));
  }, [activeRoutine]);

  const [activeCombo, setActiveCombo] = useState<{ semana: number, dia: string } | null>(null);

  useEffect(() => {
    if (alumno?.id) {
      const routine = dataService.getActiveRoutineForAlumno(alumno.id);
      setActiveRoutine(routine);
      if (routine && routine.logs.length > 0 && !expandedExerciseId) setExpandedExerciseId(routine.logs[0].id);
    }
  }, [alumno?.id]);

  useEffect(() => {
    if (availableWorkouts.length > 0 && !activeCombo) {
      const today = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()];
      setActiveCombo(availableWorkouts.find(w => w.dia === today) || availableWorkouts[0]);
    }
  }, [availableWorkouts, activeCombo]);

  // Timer loop
  useEffect(() => {
    let animId: number;
    const updateTimer = () => {
      let currentMs = timerElapsedMs;
      if (timerStatus === 'running' && timerStartAt) currentMs += Date.now() - timerStartAt;
      let newDisp = currentMs;
      if (timerMode === 'timer') {
        newDisp = Math.max(0, timerTargetMs - currentMs);
        if (newDisp === 0 && timerStatus === 'running') { setTimerStatus('idle'); setTimerElapsedMs(0); setTimerStartAt(null); }
      }
      setDisplayMs(newDisp);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,300,150);
          ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 64px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
          const ts = Math.floor(newDisp / 1000);
          ctx.fillText(`${Math.floor(ts/60)}:${('0'+(ts%60)).slice(-2)}.${('0'+Math.floor((newDisp%1000)/10)).slice(-2)}`, 150, 75);
        }
      }
      if (timerStatus === 'running') animId = requestAnimationFrame(updateTimer);
    };
    if (timerStatus === 'running') animId = requestAnimationFrame(updateTimer); else updateTimer();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [timerStatus, timerStartAt, timerElapsedMs, timerTargetMs, timerMode]);

  const toggleTimer = () => {
    if (timerStatus === 'running') { setTimerElapsedMs(p => p + (Date.now() - (timerStartAt || Date.now()))); setTimerStatus('paused'); setTimerStartAt(null); }
    else { setTimerStartAt(Date.now()); setTimerStatus('running'); }
  };
  const resetTimer = () => { setTimerStatus('idle'); setTimerElapsedMs(0); setTimerStartAt(null); };

  const handlePiP = async () => {
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else if (videoRef.current && canvasRef.current) {
      videoRef.current.srcObject = canvasRef.current.captureStream(30);
      await videoRef.current.play(); await videoRef.current.requestPictureInPicture();
    }
  };

  const handleDraftWeightChange = (logId: string, val: string | number) => {
    if (typeof val === 'string') {
      const clean = val.replace(/^0+(?=\d)/, ''); // Elimina ceros a la izquierda (ej. "01" -> "1")
      if (clean === '') {
        setDraftWeights((prev) => ({ ...prev, [logId]: 0 }));
        return;
      }
      const num = parseFloat(clean);
      setDraftWeights((prev) => ({ ...prev, [logId]: isNaN(num) ? 0 : Math.max(0, num) }));
    } else {
      const safeVal = Math.max(0, isNaN(val) ? 0 : val);
      setDraftWeights((prev) => ({ ...prev, [logId]: safeVal }));
    }
  };

  const handlePesoRealChange = (logId: string, w: number) => {
    if (isNaN(w) || w < 0) return;
    const r = dataService.updatePesoReal(logId, w, alumno.id);
    setSaveStatus({ id: logId, type: r.success ? 'success' : 'error', msg: r.success ? `✨ Peso guardado (${w}KG)` : r.message });
    if (r.success) { setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id)); }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSaveAndCollapse = (logId: string) => {
    const log = activeRoutine?.logs.find((l) => l.id === logId);
    const weightToSave = draftWeights[logId] !== undefined ? draftWeights[logId] : (log?.peso_real || 0);
    handlePesoRealChange(logId, weightToSave);
    // Cierra automáticamente la pestaña / acordeón del ejercicio
    setExpandedExerciseId(null);
  };

  const handleToggleSeries = (logId: string, sIdx: number) => {
    dataService.toggleSetCompleted(logId, sIdx);
    setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id));
    setTimerMode('timer'); setTimerElapsedMs(0); setTimerStartAt(Date.now()); setTimerStatus('running');
  };

  if (!alumno) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Sin información del perfil.</div>;
  }

  if (!isPlanActive) {
    return (
      <div style={S.page}>
        <div style={S.expiredCard}>
          <AlertTriangle color="#ff4444" size={48} style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, margin: '0 0 12px' }}>Membresía Vencida</h2>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>Tu plan finalizó. La seguridad RLS bloquea actualizaciones hasta que renueves.</p>
          <button style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer' }} onClick={onRefreshData}>Recargar</button>
        </div>
      </div>
    );
  }

  const dayLogs = activeRoutine ? activeRoutine.logs.filter(l => (l.semana||1) === activeCombo?.semana && l.dia === activeCombo?.dia) : [];
  const completedCount = dayLogs.filter(l => l.completed_series?.every(s=>s)).length;
  const progressPercent = dayLogs.length > 0 ? Math.round((completedCount / dayLogs.length) * 100) : 0;

  const daysLeft = Math.ceil((new Date(alumno.plan_active_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 4;
  const isExpiringCritical = daysLeft <= 1;
  const bannerBg = isExpiringCritical ? '#ef4444' : isExpiringSoon ? '#f59e0b' : 'linear-gradient(135deg, #0f172a, #121212)';
  const contrastColor = isExpiringSoon ? '#ffffff' : '#f59e0b';
  const contrastBorder = isExpiringSoon ? 'rgba(255,255,255,0.5)' : 'rgba(245,158,11,0.3)';

  return (
    <div style={S.page} className="gm-dashboard-page">
      <style>{`
        @media (max-width: 768px) {
          .gm-dashboard-page { padding: 12px 12px 80px 12px !important; }
          .gm-header-banner { padding: 16px !important; margin-bottom: 24px !important; }
          .gm-header-content { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .gm-avatar-row { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 12px !important; }
          .gm-timer-bar { 
            top: 70px !important; 
            padding: 8px 12px !important; 
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 12px !important;
          }
          .gm-series-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .gm-series-grid > div { padding: 8px !important; font-size: 10px !important; }
          .gm-exercise-title { font-size: 14px !important; }
          .gm-wi-controls { flex-wrap: wrap !important; }
          .gm-c-header { padding: 12px !important; gap: 8px !important; }
          .gm-c-img { width: 80px !important; height: 80px !important; min-width: 80px !important; min-height: 80px !important; }
        }
      `}</style>
      {/* Banner Superior */}
      <div style={{ ...S.headerBanner, background: bannerBg, borderColor: isExpiringSoon ? 'transparent' : '#1e293b' }} className="gm-header-banner">
        {!isExpiringSoon && <div style={S.glow} />}
        <div className="gm-header-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          <div className="gm-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={S.avatarWrap} onClick={() => setShowEditProfileModal(true)}
              onMouseEnter={e => { const o = e.currentTarget.querySelector('.av-overlay') as HTMLElement; if(o) o.style.opacity = '1'; }}
              onMouseLeave={e => { const o = e.currentTarget.querySelector('.av-overlay') as HTMLElement; if(o) o.style.opacity = '0'; }}>
              <img src={alumno.avatar_url || 'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonsHomer&backgroundColor=fcd34d'} alt="Avatar" style={{ ...S.avatarImg, border: `2px solid ${contrastBorder}` }} />
              <div className="av-overlay" style={S.avatarIconOverlay}><Camera size={20} color={contrastColor} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={S.badgeGreen}>Plan Activo ✅</span>
                <button style={{ ...S.editBtn }} onClick={() => setShowEditProfileModal(true)}><Pencil size={10} /> Editar</button>
                {onBackToCoach && (
                  <button onClick={onBackToCoach} style={{ ...S.editBtn, background: '#1d4ed8', color: '#ffffff', borderColor: '#2563eb' }}>
                    ← Volver al Coach
                  </button>
                )}
              </div>
              <h1 style={S.name}>{alumno.full_name}</h1>
              <div style={{ ...S.routinePill, color: contrastColor }}>
                <Dumbbell size={12} /> {activeRoutine?.nombre_rutina || 'Sin rutina asignada'}
                {activeRoutine && (
                  <button style={{ ...S.editRoutineBtn, color: contrastColor, background: isExpiringSoon ? 'rgba(0,0,0,0.15)' : '#1e293b', borderColor: isExpiringSoon ? 'rgba(0,0,0,0.2)' : '#334155' }} onClick={() => setShowEditRoutineModal(true)}><Edit3 size={10} /> Editar</button>
                )}
                {!activeRoutine && onBackToCoach && (
                  <button style={{ ...S.editRoutineBtn, color: contrastColor, background: isExpiringSoon ? 'rgba(0,0,0,0.15)' : '#1e293b', borderColor: isExpiringSoon ? 'rgba(0,0,0,0.2)' : '#334155' }} onClick={handleCreateRoutine}>+ Crear Rutina</button>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isExpiringSoon ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: '4px', border: `1px solid ${isExpiringSoon ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`, minWidth: '120px' }}>
              <span style={{ fontSize: '9px', color: isExpiringSoon ? '#ffffff' : '#64748b', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em', marginBottom: '8px' }}>Vencimiento</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: isExpiringSoon ? '#ffffff' : '#f8fafc', lineHeight: '1' }}>{daysLeft > 0 ? daysLeft : 0}</span>
                <span style={{ fontSize: '11px', color: isExpiringSoon ? 'rgba(255,255,255,0.8)' : '#64748b', fontWeight: 800 }}>días</span>
              </div>
            </div>

            <div style={{ ...S.progressBox, background: isExpiringSoon ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)', borderColor: isExpiringSoon ? 'rgba(255,255,255,0.2)' : '#334155' }}>
              <div style={{ ...S.progressLblRow, color: isExpiringSoon ? 'rgba(255,255,255,0.9)' : '#888' }}>
                <span>Progreso Hoy</span>
                <span style={{ color: contrastColor }}>{progressPercent}%</span>
              </div>
              <div style={{ ...S.progressBar, background: isExpiringSoon ? 'rgba(0,0,0,0.2)' : '#1e293b' }}>
                <div style={{ ...S.progressFill, background: isExpiringSoon ? '#ffffff' : 'linear-gradient(90deg, #f59e0b, #a8cc00)', width: `${progressPercent}%` }} />
              </div>
              <span style={{ ...S.progressText, color: isExpiringSoon ? 'rgba(255,255,255,0.7)' : '#666' }}>{completedCount} de {dayLogs.length} completados</span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width="300" height="150" style={{ display: 'none' }} />
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

      {/* Timer Flotante */}
      <div style={S.timerBar} className="gm-timer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Timer size={20} />
          {timerMode === 'timer' && timerStatus !== 'running' ? (
            <input style={S.timerInput} type="text"
              value={`${Math.floor((timerTargetMs - timerElapsedMs) / 60000)}:${('0' + Math.floor((timerTargetMs - timerElapsedMs) / 1000 % 60)).slice(-2)}`}
              onChange={e => {
                const p = e.target.value.split(':');
                if (p.length === 2) setTimerTargetMs(Math.max(0, ((parseInt(p[0])||0)*60 + (parseInt(p[1])||0))*1000 + timerElapsedMs));
              }}
            />
          ) : (
            <span style={S.timerDisplay}>
              {`${Math.floor(displayMs/60000)}:${('0'+Math.floor(displayMs/1000%60)).slice(-2)}.${('0'+Math.floor(displayMs%1000/10)).slice(-2)}`}
            </span>
          )}
        </div>
        <div style={S.timerBtns}>
          <button style={S.tBtn} onClick={handlePiP}><Maximize2 size={16} /></button>
          <button style={S.tBtn} onClick={() => { resetTimer(); setTimerMode(timerMode==='timer'?'stopwatch':'timer'); setTimerTargetMs(90000); }}><RotateCcw size={16} /></button>
          <button style={{ ...S.tBtn, background: '#f59e0b', color: '#000' }} onClick={toggleTimer}>{timerStatus === 'running' ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}</button>
        </div>
      </div>

      {saveStatus && (
        <div style={{ background: saveStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveStatus.type === 'success' ? '#34d399' : '#f87171'}`, color: saveStatus.type === 'success' ? '#34d399' : '#f87171', padding: '12px', borderRadius: '0', marginBottom: '24px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saveStatus.msg}
        </div>
      )}

      {/* Días Selector */}
      {availableWorkouts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={S.dayTabs}>
            {availableWorkouts.map(c => (
              <button key={`${c.semana}-${c.dia}`} style={S.tabBtn(activeCombo?.semana === c.semana && activeCombo?.dia === c.dia)} onClick={() => setActiveCombo(c)}>
                <span style={{ opacity: 0.6, marginRight: '4px' }}>Sem {c.semana}</span> {c.dia}
              </button>
            ))}
          </div>
          
          {(() => {
            const currentWorkout = availableWorkouts.find(w => w.semana === activeCombo?.semana && w.dia === activeCombo?.dia);
            if (currentWorkout?.muscles && currentWorkout.muscles.length > 0) {
              const dayColor = DAY_COLOR_MAP[currentWorkout.dia] || DAY_COLOR_MAP['Lunes'];
              return (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px', 
                  background: '#000000', 
                  border: `1px solid ${dayColor.border}`, 
                  borderLeft: `4px solid ${dayColor.main}`,
                  padding: '10px 16px', 
                  borderRadius: '0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                  <Zap size={14} color={dayColor.main} style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#fff', opacity: 0.8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Enfoque:
                    </span>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>
                      {currentWorkout.muscles.join(' • ')}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Lista de Ejercicios */}
      {!activeRoutine ? (
        <div style={S.emptyState}><Dumbbell size={40} style={{ margin:'0 auto 16px', opacity: 0.2 }} />Sin rutina activa asignada.</div>
      ) : dayLogs.length === 0 ? (
        <div style={S.emptyState}>¡Día libre! No hay ejercicios asignados.</div>
      ) : (
        dayLogs.map((log, idx) => {
          const ex = log.exercise;
          const exp = expandedExerciseId === log.id;
          const done = log.completed_series?.every(s => s) || false;
          const allExercises = dataService.getExercises();
          const catIdx = ex?.id ? allExercises.findIndex(e => e.id === ex.id) : -1;
          const catPosStr = catIdx >= 0 ? `${catIdx + 1}/${allExercises.length}` : null;
          const dayColor = DAY_COLOR_MAP[log.dia] || DAY_COLOR_MAP['Lunes'];

          return (
            <div key={log.id} style={{ ...S.card(exp, done), borderLeft: `5px solid ${dayColor.main}` }}>
              <div style={S.cHeader} className="gm-c-header" onClick={() => setExpandedExerciseId(exp ? null : log.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={S.cImgWrap}>
                    <img src={fixImageUrl(ex?.image_urls[0])} alt={ex?.name} style={S.cImg} className="gm-c-img" onClick={e=>{e.stopPropagation(); if(ex?.image_urls[0]) setFullscreenImage(fixImageUrl(ex.image_urls[0]));}} />
                    <div style={{ ...S.cNumBadge, background: dayColor.main, color: '#090d16', fontWeight: 900 }}>#{idx+1}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ background: dayColor.bg, color: dayColor.text, border: `1px solid ${dayColor.border}`, padding: '2px 8px', borderRadius: '0', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>
                        Sem {log.semana || 1} • {log.dia || 'Lunes'}
                      </span>
                      <span style={S.cEquipBadge}>{ex?.equipment || 'Máquina'}</span>
                      {ex?.primary_muscles?.slice(0,2).map(m => <span key={m} style={S.cMuscleBadge}>{m}</span>)}
                    </div>
                    <h3 style={S.cTitle} className="gm-exercise-title">
                      {ex?.name}
                      {catPosStr && (
                        <span 
                          title={`Ejercicio #${catIdx + 1} de ${allExercises.length} en la biblioteca`}
                          style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#f59e0b',
                            background: 'rgba(245,158,11,0.15)',
                            border: '1px solid rgba(245,158,11,0.35)',
                            padding: '2px 8px',
                            marginLeft: '8px',
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            fontFamily: 'monospace'
                          }}
                        >
                          Nº {catPosStr}
                        </span>
                      )}
                    </h3>
                    <p style={S.cMeta}>{log.series} series × {log.repeticiones} reps @ <span style={{ color: '#f59e0b', fontWeight: 800 }}>{log.peso_real} KG</span></p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="gm-series-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', flex: 1, width: '100%' }}>
                    {Array.from({ length: log.series }).map((_, sIdx) => {
                      const d = log.completed_series?.[sIdx] || false;
                      return (
                        <div 
                          key={sIdx} 
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', transition: 'all 0.2s', 
                            background: d ? 'rgba(16,185,129,0.15)' : '#1e293b', 
                            border: `1px solid ${d ? '#34d399' : '#334155'}`, 
                            padding: '8px 12px',
                            color: d ? '#34d399' : '#94a3b8',
                            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                            userSelect: 'none'
                          }} 
                          onClick={(e) => { e.stopPropagation(); handleToggleSeries(log.id, sIdx); }}
                          title={`Marcar ${sIdx+1} Serie`}
                        >
                          {sIdx+1} Serie
                          <div style={{ 
                            width: '16px', height: '16px', border: `2px solid ${d ? '#34d399' : '#475569'}`, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: d ? '#34d399' : 'transparent'
                          }}>
                            {d && <Check size={12} strokeWidth={4} color="#000" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={S.cChevron(exp)}><ChevronDown size={20} /></div>
                </div>
              </div>

              {exp && (
                <div style={S.cExpanded}>
                  {/* Cuadro de GIF Principal en Grande */}
                  {ex?.image_urls?.[0] && (
                    <div 
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxSizing: 'border-box',
                        border: '1px solid #334155',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                      onClick={() => setFullscreenImage(fixImageUrl(ex.image_urls[0]))}
                      title="Toca para ver en pantalla completa"
                    >
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#1e293b',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                        padding: '4px 10px',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        zIndex: 2
                      }}>
                        {ex?.equipment || 'PESO CORPORAL'}
                      </span>
                      <img 
                        src={fixImageUrl(ex.image_urls[0])} 
                        alt={ex?.name} 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }} 
                      />
                    </div>
                  )}

                  {log.notas && (
                    <div style={S.coachNote}><Info size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} /><div><strong style={{ color: '#f59e0b' }}>Coach:</strong> {log.notas}</div></div>
                  )}

                  <div style={S.weightInputBox}>
                    {(() => {
                      const currentWeight = draftWeights[log.id] !== undefined ? draftWeights[log.id] : (log.peso_real || 0);
                      return (
                        <>
                          <div style={S.wiHeader}>
                            <div><div style={S.wiTitle}>Registro de Peso (KG)</div><div style={S.wiSubtitle}>Presiona Guardar para confirmar y cerrar</div></div>
                            <div style={S.wiCurrent}>Actual: {log.peso_real} KG</div>
                          </div>
                          <div style={S.wiControls} className="gm-wi-controls">
                            <button style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, Math.max(0, currentWeight - 5))} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='none'}>-5</button>
                            <button style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, Math.max(0, currentWeight - 2.5))} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='none'}>-2.5</button>
                            <div style={S.wiInputWrap}>
                              <input 
                                style={S.wiInput} 
                                type="number" 
                                step="0.5" 
                                min="0"
                                placeholder="0"
                                value={currentWeight === 0 ? '' : currentWeight} 
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleDraftWeightChange(log.id, e.target.value)} 
                              />
                              <span style={S.wiInputLbl}>KG</span>
                            </div>
                            <button style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, currentWeight + 2.5)} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='none'}>+2.5</button>
                            <button style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, currentWeight + 5)} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='none'}>+5</button>
                            <button style={S.wiSaveBtn} onClick={() => handleSaveAndCollapse(log.id)} onMouseDown={e=>e.currentTarget.style.transform='scale(0.98)'} onMouseUp={e=>e.currentTarget.style.transform='none'}><Save size={18} /> Guardar</button>
                          </div>
                        </>
                      );
                    })()}
                  </div>


                  {ex?.instructions && ex.instructions.length > 0 && (
                    <div style={S.instructBox}>
                      <div style={S.iTitle}>Instrucciones de Ejecución</div>
                      <ol style={S.iList}>{ex.instructions.map((step, i) => <li key={i} style={{ marginBottom: '4px' }}>{step}</li>)}</ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {fullscreenImage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setFullscreenImage(null)}>
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '0', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>Cerrar ✕</button>
          <img src={fullscreenImage} alt="" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', objectFit: 'contain', background: '#fff', padding: '16px', borderRadius: '0' }} />
        </div>
      )}

      {showEditProfileModal && <EditProfileModal profile={alumno} onClose={() => setShowEditProfileModal(false)} onProfileUpdated={() => { onRefreshData(); setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id)); }} readOnlyPlan={true} />}
      {showEditRoutineModal && activeRoutine && <EditRoutineModal routine={activeRoutine} exercises={dataService.getExercises()} onClose={() => setShowEditRoutineModal(false)} onRoutineUpdated={() => { onRefreshData(); setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id)); }} />}
    </div>
  );
};
