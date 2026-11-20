import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dumbbell, AlertTriangle, TimerReset, ChevronDown, Check, Save,
  Timer, Maximize2, Camera, Edit3, Pencil, Info, ShieldCheck, Zap, Play, Pause, Square, Flag, BarChart2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { EditProfileModal } from './EditProfileModal';
import { EditRoutineModal } from './EditRoutineModal';
import { fixImageUrl } from '../utils/imageUrl';
import { WorkoutStats, saveSession, WorkoutSession } from './WorkoutStats';
import trophyImg from '../assets/trophy.png';

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
  page: { padding: '24px', maxWidth: '940px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  headerBanner: {
    padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '20px',
    marginBottom: '28px'
  },
  avatarWrap: { position: 'relative' as const, width: '72px', height: '72px', flexShrink: 0, cursor: 'pointer' },
  avatarImg: { width: '100%', height: '100%', clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)', objectFit: 'cover' as const, border: '2px solid #D57A30', transition: 'all 0.2s' },
  avatarIconOverlay: { position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' },
  badgeGreen: { padding: '3px 10px', fontSize: '9px' },
  editBtn: { padding: '4px 10px', fontSize: '9px' },
  name: { fontSize: '25px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: '4px 0', letterSpacing: '0.03em', textTransform: 'uppercase' as const },
  routinePill: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const, fontSize: '11px', color: '#FFBD4A', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, letterSpacing: '0.05em' },
  editRoutineBtn: { padding: '4px 10px', fontSize: '10px' },
  
  progressBox: { padding: '14px 16px', minWidth: '175px', textAlign: 'center' as const },
  progressLblRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, marginBottom: '6px' },
  progressBar: { height: '8px', background: '#070A0F', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' as const, marginBottom: '6px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #B55B1E, #F59E0B, #FFCA64)', transition: 'width 0.5s' },
  progressText: { fontSize: '10px', color: '#94A3B8', fontWeight: 600 },

  timerBar: { position: 'sticky' as const, top: '16px', zIndex: 40, borderTop: '2px solid #D57A30', borderBottom: '2px solid #C96F28', color: '#F8FAFC', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px', marginBottom: '24px' },
  timerDisplay: { fontFamily: "'Chakra Petch', monospace", fontSize: '24px', fontWeight: 700, letterSpacing: '0.03em', color: '#FFBD4A' },
  timerInput: { width: '100px', fontFamily: "'Chakra Petch', monospace", fontSize: '22px', fontWeight: 700, textAlign: 'center' as const, padding: '4px 8px', color: '#FFBD4A' },
  timerBtns: { display: 'flex', gap: '8px', alignItems: 'center' },
  tBtn: { padding: '8px 10px' },

  dayTabs: { display: 'flex', gap: '0', overflowX: 'auto' as const, paddingBottom: '0', marginBottom: '16px', borderBottom: '2px solid #C96F28' },
  tabBtn: (active: boolean): React.CSSProperties => ({
    background: active ? 'linear-gradient(180deg, #D57A30 0%, #B55B1E 100%)' : 'linear-gradient(180deg, #242A33 0%, #161A20 100%)',
    color: active ? '#0A0D11' : '#D1D9E4',
    border: 'none',
    borderRight: '1px solid rgba(0,0,0,0.45)',
    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
    padding: '11px 20px', fontSize: '12px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, cursor: 'pointer', transition: 'all 0.2s',
  }),

  emptyState: { borderStyle: 'dashed', borderColor: 'rgba(201,111,40,0.4)', padding: '48px 24px', textAlign: 'center' as const, color: '#94A3B8', fontSize: '13px', fontWeight: 600 },
  
  cardLayout: {
    overflow: 'hidden' as const, marginBottom: '16px'
  },
  cHeader: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px', cursor: 'pointer', userSelect: 'none' as const },
  cImgWrap: { position: 'relative' as const, flexShrink: 0, background: '#000', padding: '6px', border: '1px solid rgba(213,122,48,0.28)' },
  cImg: { width: '96px', height: '96px', minWidth: '96px', minHeight: '96px', objectFit: 'contain' as const, background: 'transparent', padding: 0, flexShrink: 0, display: 'block' },
  cNumBadge: { position: 'absolute' as const, top: '-8px', left: '-8px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 },
  cEquipBadge: { padding: '2px 8px', fontSize: '9px' },
  cMuscleBadge: { padding: '2px 8px', fontSize: '9px' },
  cTitle: { fontSize: '17px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: '6px 0 2px', letterSpacing: '0.02em' },
  cMeta: { fontSize: '11px', color: '#94A3B8', fontWeight: 600, margin: 0 },
  cChevron: (expanded: boolean): React.CSSProperties => ({
    padding: '8px', transition: 'all 0.3s', transform: expanded ? 'rotate(180deg)' : 'none'
  }),

  cExpanded: { padding: '20px', borderTop: '1px solid rgba(201,111,40,0.28)', display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  coachNote: { borderLeft: '3px solid #D57A30', padding: '12px 14px', display: 'flex', gap: '12px', fontSize: '12px', color: '#E2E8F0' },
  
  weightInputBox: { borderColor: 'rgba(213,122,48,0.28)', padding: '20px' },
  wiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' as const, gap: '8px' },
  wiTitle: { fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  wiSubtitle: { fontSize: '10px', color: '#94A3B8' },
  wiCurrent: { padding: '4px 10px', fontSize: '10px' },
  
  wiControls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' as const },
  wiBtnMod: { width: '52px', height: '48px', fontSize: '13px', padding: 0 },
  wiInputWrap: { position: 'relative' as const },
  wiInput: { width: '120px', height: '56px', border: '2px solid #D57A30', color: '#FFBD4A', fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', textAlign: 'center' as const },
  wiInputLbl: { position: 'absolute' as const, right: '10px', bottom: '8px', fontSize: '10px', color: 'rgba(255,189,74,0.6)', fontWeight: 800 },
  wiSaveBtn: { padding: '0 24px', height: '56px', fontSize: '13px', flex: 1, minWidth: '140px' },

  instructBox: { padding: '16px' },
  iTitle: { fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '8px' },
  iList: { margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.6 },
  
  expiredCard: { padding: '40px 24px', textAlign: 'center' as const },
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
  const [sessionWeightHistory, setSessionWeightHistory] = useState<Record<string, { weight: number, time: number }[]>>({});
  const [showStats, setShowStats] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const workoutStartRef = useRef<number>(Date.now());

  // Confetti effect when celebration starts
  useEffect(() => {
    if (showCelebration) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#f59e0b', '#3b82f6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#f59e0b', '#3b82f6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showCelebration]);
  
  const coach = useMemo(
    () => dataService.getProfiles().find(p => p.role === 'coach'),
    [alumno.id]
  );
  const alumnosList = useMemo(
    () => dataService.getProfiles().filter(p => p.role === 'alumno'),
    [alumno.id]
  );
  const exercisesList = useMemo(
    () => (showEditRoutineModal ? dataService.getExercises() : []),
    [showEditRoutineModal]
  );

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
    
    setSessionWeightHistory(prev => {
      const hist = prev[logId] || [];
      const updated = [...hist, { weight: weightToSave, time: Date.now() }].slice(-5);
      return { ...prev, [logId]: updated };
    });

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
        <div className="titan-armor-card titan-armor-card-danger" style={S.expiredCard}>
          <AlertTriangle color="#EF4444" size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 className="titan-section-title" style={{ fontSize: '24px', margin: '0 0 12px' }}>Membresía Vencida</h2>
          <p style={{ color: '#CBD5E1', fontSize: '13px', margin: '0 0 24px' }}>Tu plan finalizó. La seguridad RLS bloquea actualizaciones hasta que renueves.</p>
          <button className="titan-btn-armor-danger" style={{ padding: '12px 24px', fontSize: '13px' }} onClick={onRefreshData}>Recargar</button>
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
  const contrastColor = isExpiringSoon ? '#FFBD4A' : '#D57A30';
  const contrastBorder = isExpiringCritical ? '#EF4444' : isExpiringSoon ? '#D57A30' : 'rgba(213,122,48,0.65)';

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
      <div style={S.headerBanner} className={`gm-header-banner titan-armor-banner ${isExpiringCritical ? 'titan-armor-card-danger' : isExpiringSoon ? 'titan-armor-card-warn' : ''}`}>
        <div className="gm-header-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          <div className="gm-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={S.avatarWrap} onClick={() => setShowEditProfileModal(true)}
              onMouseEnter={e => { const o = e.currentTarget.querySelector('.av-overlay') as HTMLElement; if(o) o.style.opacity = '1'; }}
              onMouseLeave={e => { const o = e.currentTarget.querySelector('.av-overlay') as HTMLElement; if(o) o.style.opacity = '0'; }}>
              <img src={alumno.avatar_url || 'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonsHomer&backgroundColor=fcd34d'} alt="Avatar" style={{ ...S.avatarImg, border: `2px solid ${contrastBorder}` }} />
              <div className="av-overlay" style={S.avatarIconOverlay}><Camera size={20} color={contrastColor} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="titan-badge-copper" style={S.badgeGreen}>Plan Activo ✅</span>
                <button className="titan-btn-armor-steel" style={S.editBtn} onClick={() => setShowEditProfileModal(true)}><Pencil size={10} /> Editar</button>
                {onBackToCoach && (
                  <button onClick={onBackToCoach} className="titan-btn-armor-glow" style={{ padding: '5px 12px', fontSize: '11px' }}>
                    ← Volver al Coach
                  </button>
                )}
              </div>
              <h1 style={S.name}>{alumno.full_name}</h1>
              <div style={{ ...S.routinePill, color: contrastColor }}>
                <Dumbbell size={12} /> {activeRoutine?.nombre_rutina || 'Sin rutina asignada'}
                {activeRoutine && (
                  <button className="titan-btn-armor-steel" style={S.editRoutineBtn} onClick={() => setShowEditRoutineModal(true)}><Edit3 size={10} /> Editar</button>
                )}
                {!activeRoutine && onBackToCoach && (
                  <button className="titan-btn-armor-copper" style={S.editRoutineBtn} onClick={handleCreateRoutine}>+ Crear Rutina</button>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="titan-inset-well" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 22px', minWidth: '116px' }}>
              <span style={{ fontSize: '9px', fontFamily: "'Chakra Petch', sans-serif", color: isExpiringSoon ? '#FFBD4A' : '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>Vencimiento</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '34px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: isExpiringCritical ? '#F87171' : isExpiringSoon ? '#FFBD4A' : '#FFFFFF', lineHeight: '1' }}>{daysLeft > 0 ? daysLeft : 0}</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>días</span>
              </div>
            </div>

            <div className="titan-inset-well" style={S.progressBox}>
              <div style={S.progressLblRow}>
                <span>Progreso Hoy</span>
                <span style={{ color: '#FFBD4A' }}>{progressPercent}%</span>
              </div>
              <div style={S.progressBar}>
                <div style={{ ...S.progressFill, width: `${progressPercent}%` }} />
              </div>
              <span style={S.progressText}>{completedCount} de {dayLogs.length} completados</span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width="300" height="150" style={{ display: 'none' }} />
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

      {/* Timer Flotante */}
      <div style={S.timerBar} className="gm-timer-bar titan-armor-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Timer size={20} color="#D57A30" />
          {timerMode === 'timer' && timerStatus !== 'running' ? (
            <input className="titan-input" style={S.timerInput} type="text"
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
          <button className="titan-btn-armor-steel" style={S.tBtn} onClick={handlePiP} title="Picture in Picture"><Maximize2 size={16} /></button>
          <button className="titan-btn-armor-steel" style={S.tBtn} onClick={() => { resetTimer(); setTimerMode(timerMode==='timer'?'stopwatch':'timer'); setTimerTargetMs(90000); }} title="Reiniciar / Modo"><TimerReset size={20} /></button>
          <button className="titan-btn-armor-copper" style={{ ...S.tBtn, padding: '8px 12px' }} onClick={toggleTimer}>{timerStatus === 'running' ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}</button>
          <button
            title="Terminar Entrenamiento y guardar sesión"
            className="titan-btn-armor-glow"
            style={{ 
              padding: '8px 16px', 
              fontSize: '12px', 
            }}
            onClick={() => {
              if (!activeRoutine || !activeCombo) return;
              
              const { semana: currentSemana, dia: currentDia } = activeCombo;
              const durMin = Math.round((Date.now() - workoutStartRef.current) / 60000);
              const ejercicios = dayLogs
                .filter(l => l.exercise && (l.completed_series || []).some(Boolean))
                .map(l => ({
                  exercise_id: l.exercise_id,
                  nombre: l.exercise?.name || '',
                  primary_muscles: l.exercise?.primary_muscles || [],
                  peso_real: l.peso_real || 0,
                  series: l.series,
                  repeticiones: l.repeticiones,
                  series_completadas: (l.completed_series || []).filter(Boolean).length,
                  volumen_kg: Math.round((l.peso_real || 0) * (l.completed_series || []).filter(Boolean).length * l.repeticiones),
                }));
              
              if (ejercicios.length === 0) return;

              const session: WorkoutSession = {
                id: `${alumno.id}_${Date.now()}`,
                alumno_id: alumno.id,
                fecha: new Date().toISOString(),
                semana: currentSemana,
                dia: currentDia,
                duracion_min: Math.max(1, durMin),
                ejercicios,
                total_volumen_kg: ejercicios.reduce((acc, e) => acc + e.volumen_kg, 0),
              };
              
              dataService.saveWorkoutSession(session);
              
              dayLogs.forEach(log => {
                log.completed_series = new Array(log.series).fill(false);
              });

              dataService.clearCompletedSeriesForDay(alumno.id, currentSemana, currentDia);

              const updated = dataService.getActiveRoutineForAlumno(alumno.id);
              if (updated) {
                setActiveRoutine({ ...updated, logs: [...updated.logs] });
              }
              
              workoutStartRef.current = Date.now();
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 4000);
            }}
          >
            <Flag size={14} /> Terminar
          </button>
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
                <div className="titan-inset-well" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px', 
                  borderTop: `1px solid ${dayColor.border}`, 
                  borderRight: `1px solid ${dayColor.border}`, 
                  borderBottom: `1px solid ${dayColor.border}`, 
                  borderLeft: `4px solid ${dayColor.main}`,
                  padding: '10px 16px', 
                }}>
                  <Zap size={14} color={dayColor.main} style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", color: '#CBD5E1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Enfoque:
                    </span>
                    <span style={{ fontSize: '12px', fontFamily: "'Chakra Petch', sans-serif", color: '#fff', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>
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
        <div className="titan-armor-card" style={S.emptyState}><Dumbbell size={40} style={{ margin:'0 auto 16px', opacity: 0.3, color: '#D57A30' }} />Sin rutina activa asignada.</div>
      ) : dayLogs.length === 0 ? (
        <div className="titan-armor-card" style={S.emptyState}>¡Día libre! No hay ejercicios asignados.</div>
      ) : (
        dayLogs.map((log, idx) => {
          const ex = log.exercise;
          const exp = expandedExerciseId === log.id;
          const done = log.completed_series?.every(s => s) || false;
          const catPosStr = dataService.getExerciseCatalogPosition(ex?.id);
          const dayColor = DAY_COLOR_MAP[log.dia] || DAY_COLOR_MAP['Lunes'];

          return (
            <div key={log.id} className={`titan-armor-card titan-armor-card-interactive ${exp ? 'titan-armor-card-active' : ''}`} style={{ ...S.cardLayout, borderLeftColor: dayColor.main, borderLeftWidth: '5px', borderLeftStyle: 'solid' }}>
              <div style={S.cHeader} className="gm-c-header" onClick={() => setExpandedExerciseId(exp ? null : log.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={S.cImgWrap}>
                    <img src={fixImageUrl(ex?.image_urls[0])} alt={ex?.name} style={S.cImg} className="gm-c-img gm-exercise-gif" onClick={e=>{e.stopPropagation(); if(ex?.image_urls[0]) setFullscreenImage(fixImageUrl(ex.image_urls[0]));}} />
                    <div style={{ ...S.cNumBadge, background: dayColor.main, color: '#090D12' }}>#{idx+1}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ background: dayColor.bg, color: dayColor.text, border: `1px solid ${dayColor.border}`, padding: '2px 8px', fontSize: '9px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: 'uppercase' }}>
                        Sem {log.semana || 1} • {log.dia || 'Lunes'}
                      </span>
                      <span className="titan-badge-copper" style={S.cEquipBadge}>{ex?.equipment || 'Máquina'}</span>
                      {ex?.primary_muscles?.slice(0,2).map(m => <span key={m} className="titan-badge-steel" style={S.cMuscleBadge}>{m}</span>)}
                    </div>
                    <h3 style={S.cTitle} className="gm-exercise-title">
                      {ex?.name}
                      {catPosStr && (
                        <span 
                          title={`Ejercicio Nº ${catPosStr} en la biblioteca`}
                          className="titan-badge-copper"
                          style={{
                            fontSize: '11px',
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
                    <p style={S.cMeta}>{log.series} series × {log.repeticiones} reps @ <span style={{ color: '#FFBD4A', fontWeight: 800 }}>{log.peso_real} KG</span></p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="gm-series-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', flex: 1, width: '100%' }}>
                    {Array.from({ length: log.series }).map((_, sIdx) => {
                      const d = log.completed_series?.[sIdx] || false;
                      return (
                        <div 
                          key={sIdx} 
                          className={d ? 'titan-btn-armor-emerald' : 'titan-btn-armor-steel'}
                          style={{ 
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            fontSize: '11px',
                            userSelect: 'none'
                          }} 
                          onClick={(e) => { e.stopPropagation(); handleToggleSeries(log.id, sIdx); }}
                          title={`Marcar ${sIdx+1} Serie`}
                        >
                          <span>{sIdx+1} Serie</span>
                          <div style={{ 
                            width: '15px', height: '15px', border: `1.5px solid ${d ? '#6EE7B7' : 'rgba(148,163,184,0.45)'}`, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: d ? '#34d399' : 'rgba(0,0,0,0.45)'
                          }}>
                            {d && <Check size={11} strokeWidth={4} color="#06120E" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={exp ? 'titan-btn-armor-copper' : 'titan-btn-armor-steel'} style={S.cChevron(exp)}><ChevronDown size={18} /></div>
                </div>
              </div>

              {exp && (
                <div style={S.cExpanded}>
                  {/* Cuadro de GIF Principal en Grande */}
                  {ex?.image_urls?.[0] && (
                    <div 
                      className="gm-gif-wrap titan-inset-well"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                      onClick={() => setFullscreenImage(fixImageUrl(ex.image_urls[0]))}
                      title="Toca para ver en pantalla completa"
                    >
                      <span className="titan-badge-copper" style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '4px 10px',
                        fontSize: '10px',
                        zIndex: 2
                      }}>
                        {ex?.equipment || 'PESO CORPORAL'}
                      </span>
                      <img 
                        src={fixImageUrl(ex.image_urls[0])} 
                        alt={ex?.name} 
                        className="gm-exercise-gif gm-exercise-gif-lg"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }} 
                      />
                    </div>
                  )}

                  {log.notas && (
                    <div className="titan-inset-well" style={S.coachNote}><Info size={14} color="#D57A30" style={{ flexShrink: 0, marginTop: '2px' }} /><div><strong style={{ color: '#FFBD4A' }}>Coach:</strong> {log.notas}</div></div>
                  )}

                  <div className="titan-inset-well" style={S.weightInputBox}>
                    {(() => {
                      const currentWeight = draftWeights[log.id] !== undefined ? draftWeights[log.id] : (log.peso_real || 0);
                      return (
                        <>
                          <div style={S.wiHeader}>
                            <div><div style={S.wiTitle}>Registro de Peso (KG)</div><div style={S.wiSubtitle}>Presiona Guardar para confirmar y cerrar</div></div>
                            <div className="titan-badge-emerald" style={S.wiCurrent}>Actual: {log.peso_real} KG</div>
                          </div>
                          <div style={S.wiControls} className="gm-wi-controls">
                            <button className="titan-btn-armor-steel" style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, Math.max(0, currentWeight - 5))}>-5</button>
                            <button className="titan-btn-armor-steel" style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, Math.max(0, currentWeight - 2.5))}>-2.5</button>
                            <div style={S.wiInputWrap}>
                              <input 
                                className="titan-input"
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
                            <button className="titan-btn-armor-steel" style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, currentWeight + 2.5)}>+2.5</button>
                            <button className="titan-btn-armor-steel" style={S.wiBtnMod} onClick={() => handleDraftWeightChange(log.id, currentWeight + 5)}>+5</button>
                            <button className="titan-btn-armor-copper" style={S.wiSaveBtn} onClick={() => handleSaveAndCollapse(log.id)}><Save size={18} /> Guardar</button>
                          </div>
                          
                          {sessionWeightHistory[log.id] && sessionWeightHistory[log.id].length > 0 && (
                            <div className="titan-inset-well" style={{ marginTop: '16px', padding: '12px', borderLeft: '3px solid #D57A30', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", color: '#FFBD4A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROGRESO:</span>
                              {sessionWeightHistory[log.id].map((entry, idx) => {
                                const w = typeof entry === 'number' ? entry : entry.weight;
                                const t = typeof entry === 'number' ? Date.now() : entry.time;
                                return (
                                  <div key={idx} className="titan-inset-well" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 10px' }}>
                                    <div style={{ color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'baseline' }}>
                                      <span style={{ fontSize: '15px' }}>{w}</span>
                                      <span style={{ fontSize: '9px', marginLeft: '3px', color: '#D57A30' }}>kg</span>
                                    </div>
                                    <span style={{ color: '#6EE7B7', fontSize: '10px', fontWeight: 700, marginTop: '2px' }}>
                                      {new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {ex?.instructions && ex.instructions.length > 0 && (
                    <div className="titan-inset-well" style={S.instructBox}>
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
        <div className="titan-modal-overlay" style={{ zIndex: 100 }} onClick={() => setFullscreenImage(null)}>
          <button className="titan-btn-armor-steel" style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px 18px', fontSize: '12px' }}>Cerrar ✕</button>
          <div className="titan-modal gm-gif-wrap" style={{ padding: '24px', maxWidth: '520px', width: '92%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', border: '1px solid rgba(213,122,48,0.45)', boxShadow: '0 24px 64px rgba(0,0,0,0.92), 0 0 32px rgba(213,122,48,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(213,122,48,0.22)' }}>
              <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '3px 10px' }}>VISTA UHD • SUPER-RESOLUCIÓN</span>
              <button className="titan-btn-armor-steel" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => setFullscreenImage(null)}>✕</button>
            </div>
            <img src={fullscreenImage} alt="" className="gm-exercise-gif gm-exercise-gif-lg" style={{ width: '100%', maxWidth: '420px', maxHeight: '420px', objectFit: 'contain', background: 'transparent', padding: 0, display: 'block' }} />
          </div>
        </div>
      )}

      {showEditProfileModal && <EditProfileModal profile={alumno} onClose={() => setShowEditProfileModal(false)} onProfileUpdated={() => { onRefreshData(); setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id)); }} readOnlyPlan={true} />}
      {showEditRoutineModal && activeRoutine && <EditRoutineModal routine={activeRoutine} exercises={dataService.getExercises()} onClose={() => setShowEditRoutineModal(false)} onRoutineUpdated={() => { onRefreshData(); setActiveRoutine(dataService.getActiveRoutineForAlumno(alumno.id)); }} />}

      {/* 🎉 Celebración al terminar entrenamiento */}
      {showCelebration && (
        <div className="titan-modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowCelebration(false)}>
          <div className="titan-modal" style={{
            padding: '44px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxWidth: '400px', width: '100%'
          }} onClick={e => e.stopPropagation()}>
            
            <img 
              src={trophyImg} 
              alt="Trofeo" 
              style={{ 
                width: '180px', 
                height: '180px', 
                objectFit: 'contain',
                marginBottom: '16px', 
                animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 10px 20px rgba(213,122,48,0.4))'
              }} 
            />
            
            <h2 className="titan-section-title" style={{ fontSize: '26px', color: '#FFBD4A', margin: '0 0 14px', textAlign: 'center' }}>
              ¡Entrenamiento Completado!
            </h2>
            
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5 }}>
              Sesión guardada correctamente. Podés ver tu progreso en la pestaña <strong style={{ color: '#FFBD4A' }}>Mi Progreso</strong>.
            </p>
            
            <button
              onClick={() => { setShowCelebration(false); setShowStats(true); }}
              className="titan-btn-armor-glow"
              style={{ padding: '15px 28px', fontSize: '14px', width: '100%' }}>
              Ver mis estadísticas →
            </button>
            
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '20px' }}>Toca fuera de la tarjeta para cerrar</span>
          </div>
        </div>
      )}

      {/* 📊 Panel de Estadísticas overlay */}
      {showStats && (
        <div className="titan-modal-overlay" style={{ zIndex: 150, alignItems: 'flex-start', overflowY: 'auto', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
            <div className="titan-armor-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '20px' }}>
              <h2 className="titan-section-title" style={{ fontSize: '18px', margin: 0 }}>
                📊 Mi Progreso — {alumno.full_name}
              </h2>
              <button className="titan-btn-armor-steel" onClick={() => setShowStats(false)}
                style={{ padding: '9px 16px', fontSize: '12px' }}>
                ✕ Cerrar
              </button>
            </div>
            <WorkoutStats alumno={alumno} />
          </div>
        </div>
      )}
    </div>
  );
};
