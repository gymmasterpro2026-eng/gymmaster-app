import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Zap,
  Check,
  Save,
  Timer,
  Maximize2,
  Camera,
  Edit3,
  Pencil
} from 'lucide-react';
import { Profile, RoutineWithLogs, RoutineLog } from '../types';
import { dataService } from '../services/dataService';
import { EditProfileModal } from './EditProfileModal';
import { EditRoutineModal } from './EditRoutineModal';

interface DashboardAlumnoProps {
  alumno: Profile;
  onRefreshData: () => void;
}

export const DashboardAlumno: React.FC<DashboardAlumnoProps> = ({ alumno, onRefreshData }) => {
  if (!alumno) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-zinc-500 font-mono">
        Sin información del perfil de alumno.
      </div>
    );
  }

  const [activeRoutine, setActiveRoutine] = useState<RoutineWithLogs | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showEditRoutineModal, setShowEditRoutineModal] = useState<boolean>(false);
  
  // Group available days from logs
  const availableWorkouts = React.useMemo(() => {
    if (!activeRoutine) return [];
    
    const uniqueCombos = new Map<string, { semana: number, dia: string }>();
    
    activeRoutine.logs.forEach(log => {
      // Default to semana 1 for backwards compatibility if needed
      const sem = log.semana || 1;
      const key = `${sem}-${log.dia}`;
      if (!uniqueCombos.has(key)) {
        uniqueCombos.set(key, { semana: sem, dia: log.dia });
      }
    });

    // Sort by week then day
    const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return Array.from(uniqueCombos.values()).sort((a, b) => {
      if (a.semana !== b.semana) return a.semana - b.semana;
      return DAYS_ORDER.indexOf(a.dia) - DAYS_ORDER.indexOf(b.dia);
    });
  }, [activeRoutine]);

  const [activeCombo, setActiveCombo] = useState<{ semana: number, dia: string } | null>(null);

  // Auto-select the first available combo when routine loads
  useEffect(() => {
    if (availableWorkouts.length > 0 && !activeCombo) {
      // Try to match current day
      const currentDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()];
      const todayCombo = availableWorkouts.find(w => w.dia === currentDayName);
      if (todayCombo) {
        setActiveCombo(todayCombo);
      } else {
        setActiveCombo(availableWorkouts[0]);
      }
    }
  }, [availableWorkouts, activeCombo]);
  
  // Real-time status toast messages
  const [saveStatus, setSaveStatus] = useState<{ id: string; type: 'success' | 'error'; msg: string } | null>(null);
  
  // Advanced Rest Timer State
  const [timerMode, setTimerMode] = useState<'timer' | 'stopwatch'>('timer');
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerStartAt, setTimerStartAt] = useState<number | null>(null);
  const [timerElapsedMs, setTimerElapsedMs] = useState<number>(0);
  const [timerTargetMs, setTimerTargetMs] = useState<number>(90000); // 90s default
  const [displayMs, setDisplayMs] = useState<number>(90000); // Initialize for timer
  const [selectedLogForTimer, setSelectedLogForTimer] = useState<string | null>(null);

  // PiP Refs
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Time-hack protection check
  const isPlanActive = alumno.plan_active_until ? new Date(alumno.plan_active_until) >= new Date() : false;

  useEffect(() => {
    if (alumno?.id) {
      loadRoutine();
    }
  }, [alumno?.id]);

  const loadRoutine = () => {
    if (!alumno?.id) return;
    const routine = dataService.getActiveRoutineForAlumno(alumno.id);
    setActiveRoutine(routine);
    if (routine && routine.logs.length > 0 && !expandedExerciseId) {
      setExpandedExerciseId(routine.logs[0].id);
    }
  };

  // Rest timer loop
  useEffect(() => {
    let animationFrameId: number;

    const updateTimer = () => {
      let currentMs = timerElapsedMs;
      
      if (timerStatus === 'running' && timerStartAt) {
        currentMs += Date.now() - timerStartAt;
      }
      
      let newDisplayMs = currentMs;
      if (timerMode === 'timer') {
        newDisplayMs = Math.max(0, timerTargetMs - currentMs);
        if (newDisplayMs === 0 && timerStatus === 'running') {
          setTimerStatus('idle');
          setTimerElapsedMs(0);
          setTimerStartAt(null);
        }
      }

      setDisplayMs(newDisplayMs);

      // Render to PiP Canvas if available
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#030303'; // slate-950
          ctx.fillRect(0, 0, 300, 150);
          ctx.fillStyle = '#f59e0b'; // amber-500
          ctx.font = 'bold 64px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const totalSeconds = Math.floor(newDisplayMs / 1000);
          const fractionStr = ('0' + Math.floor((newDisplayMs % 1000) / 10)).slice(-2);
          const timeString = `${Math.floor(totalSeconds / 60)}:${('0' + (totalSeconds % 60)).slice(-2)}.${fractionStr}`;
          ctx.fillText(timeString, 150, 75);
        }
      }

      if (timerStatus === 'running') {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    if (timerStatus === 'running') {
      animationFrameId = requestAnimationFrame(updateTimer);
    } else {
      updateTimer(); // Force one render when paused
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [timerStatus, timerStartAt, timerElapsedMs, timerTargetMs, timerMode]);

  const startRestTimer = (logId: string) => {
    setSelectedLogForTimer(logId);
    setTimerMode('timer');
    setTimerElapsedMs(0);
    setTimerStartAt(Date.now());
    setTimerStatus('running');
  };

  const toggleTimer = () => {
    if (timerStatus === 'running') {
      setTimerElapsedMs(prev => prev + (Date.now() - (timerStartAt || Date.now())));
      setTimerStatus('paused');
      setTimerStartAt(null);
    } else {
      setTimerStartAt(Date.now());
      setTimerStatus('running');
    }
  };

  const resetTimer = () => {
    setTimerStatus('idle');
    setTimerElapsedMs(0);
    setTimerStartAt(null);
  };

  const toggleTimerMode = () => {
    resetTimer();
    setTimerMode(prev => prev === 'timer' ? 'stopwatch' : 'timer');
    setTimerTargetMs(90000);
  };

  const handlePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && canvasRef.current) {
        const stream = canvasRef.current.captureStream(30);
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP Failed:', err);
      // fallback handling o alert if needed
    }
  };

  // OPERATIONAL CORE: Real-time update of `peso_real` by Alumno
  const handlePesoRealChange = (logId: string, newWeight: number) => {
    if (isNaN(newWeight) || newWeight < 0) return;

    // Call dataService with strict RLS and Server-Time plan check
    const result = dataService.updatePesoReal(logId, newWeight, alumno.id);

    if (result.success) {
      setSaveStatus({
        id: logId,
        type: 'success',
        msg: `✨ Peso de ${newWeight} KG guardado en tiempo real (RLS verificado)`,
      });
      loadRoutine();
    } else {
      setSaveStatus({
        id: logId,
        type: 'error',
        msg: result.message,
      });
    }

    setTimeout(() => {
      setSaveStatus(null);
    }, 4000);
  };

  const handleAdjustWeight = (logId: string, currentWeight: number, delta: number) => {
    const updated = Math.max(0, parseFloat((currentWeight + delta).toFixed(1)));
    handlePesoRealChange(logId, updated);
  };

  const handleToggleSeries = (logId: string, setIdx: number) => {
    dataService.toggleSetCompleted(logId, setIdx);
    loadRoutine();
    startRestTimer(logId);
  };

  if (!isPlanActive) {
    return (
      <div id="plan-expired-screen" className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-rose-950/80 to-slate-900 border-2 border-rose-500/40 rounded-none p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-none flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>
          <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-rose-500/30">
            Inmunidad al Time-Hack Activa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
            Membresía Vencida
          </h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed mb-6">
            Hola <span className="font-semibold text-white">{alumno.full_name}</span>. Tu plan de entrenamiento finalizó el{' '}
            <span className="font-bold text-rose-400">
              {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            . La validación en el servidor (<code className="text-amber-300 text-xs font-mono">now()</code>) bloquea la actualización de pesos.
          </p>
          <div className="bg-slate-900/80 border border-slate-800 rounded-none p-4 text-left max-w-lg mx-auto text-xs text-slate-400 space-y-2 mb-6">
            <div className="flex items-center text-amber-400 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Regla de Seguridad RLS de Anexo Cobro:</span>
            </div>
            <p>
              Aunque cambies la fecha u hora en los ajustes de tu teléfono móvil, el trigger SQL de Supabase valida el tiempo del servidor en PostgreSQL y deniega la mutación sobre <code className="text-white">routine_logs</code>.
            </p>
          </div>
          <button
            onClick={onRefreshData}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-6 py-3 rounded-none text-sm shadow-lg hover:brightness-110 transition-all inline-flex items-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Simular Renovación de Plan por Coach</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeRoutine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-none p-8 max-w-lg mx-auto">
          <Dumbbell className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-xl font-bold text-white mb-2">Sin Rutina Activa</h3>
          <p className="text-slate-400 text-sm mb-4">
            Tu Coach aún no ha activado una rutina para ti hoy. Cambia al rol de Coach arriba para crear y asignarte una nueva rutina.
          </p>
        </div>
      </div>
    );
  }

  // Calculate workout completion stats
  const dayLogs = activeRoutine.logs.filter(log => 
    (log.semana || 1) === activeCombo?.semana && log.dia === activeCombo?.dia
  );
  
  const totalExercises = dayLogs.length;
  const completedExercises = dayLogs.filter((l) =>
    l.completed_series?.every((s) => s)
  ).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div id="dashboard-alumno-root" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Alumno Mobile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-none p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Clickable Profile Avatar */}
            <div
              onClick={() => setShowEditProfileModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Cambiar Foto de Perfil"
            >
              <img
                src={alumno.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={alumno.full_name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/50 shadow-md group-hover:scale-105 transition-all"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full text-[9px]">
                <Pencil className="w-2.5 h-2.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                  Plan Activo ✅
                </span>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>Editar Foto & Datos</span>
                </button>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{alumno.full_name}</span>
              </h1>

              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-xs text-amber-400 font-semibold flex items-center">
                  <Dumbbell className="w-3.5 h-3.5 mr-1" />
                  {activeRoutine.nombre_rutina}
                </p>
                <button
                  onClick={() => setShowEditRoutineModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
                  title="Modificar ejercicios, cargas o repeticiones de la rutina"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar Rutina</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Progress Metric */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 min-w-[140px] text-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Progreso Hoy</span>
              <span className="font-bold text-amber-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {completedExercises} de {totalExercises} ejercicios completados
            </span>
          </div>
        </div>
      </div>

      {/* Hidden elements for PiP */}
      <canvas ref={canvasRef} width="300" height="150" className="hidden" />
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Floating Global Rest Timer Bar */}
      <div id="rest-timer-bar" className="sticky top-20 z-40 bg-amber-500 text-slate-950 px-4 py-3 rounded-none shadow-2xl flex items-center justify-between border border-amber-300 font-bold">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wide hidden sm:inline">
            {timerMode === 'timer' ? 'Descanso:' : 'Cronómetro:'}
          </span>
          
          {timerMode === 'timer' && timerStatus !== 'running' ? (
            <input 
              type="text" 
              className="bg-slate-950/10 font-mono text-3xl font-black w-28 text-center outline-none border border-slate-950/20 rounded-md focus:border-slate-950 focus:bg-amber-400 placeholder:text-slate-950/50" 
              value={`${Math.floor((timerTargetMs - timerElapsedMs) / 1000 / 60)}:${('0' + (Math.floor((timerTargetMs - timerElapsedMs) / 1000) % 60)).slice(-2)}`}
              onChange={(e) => {
                const parts = e.target.value.split(':');
                if (parts.length === 2) {
                  const mins = parseInt(parts[0]) || 0;
                  const secs = parseInt(parts[1]) || 0;
                  setTimerTargetMs(Math.max(0, (mins * 60 + secs) * 1000 + timerElapsedMs));
                } else if (!isNaN(parseInt(e.target.value))) {
                  setTimerTargetMs(Math.max(0, (parseInt(e.target.value) || 0) * 1000 + timerElapsedMs));
                }
              }}
            />
          ) : (
            <span className="font-mono text-3xl font-black w-32 text-center tracking-tighter">
              {`${Math.floor(displayMs / 1000 / 60)}:${('0' + (Math.floor(displayMs / 1000) % 60)).slice(-2)}.${('0' + Math.floor((displayMs % 1000) / 10)).slice(-2)}`}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePiP}
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 p-1.5 rounded-none text-xs transition-colors"
            title="Ventana Flotante (PiP)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTimerMode}
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 p-1.5 rounded-none text-xs transition-colors"
            title="Cambiar Modo"
          >
            <Timer className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTimer}
            className="bg-slate-950 text-white p-1.5 rounded-none text-xs transition-colors"
          >
            {timerStatus === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-slate-950 text-white p-1.5 rounded-none text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Toast status alert for real-time peso_real saving */}
      {saveStatus && (
        <div
          id="realtime-save-toast"
          className={`p-4 rounded-none border text-sm font-semibold flex items-center space-x-3 transition-all ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-lg shadow-emerald-900/30'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-lg'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{saveStatus.msg}</span>
        </div>
      )}

      {/* OPERATIONAL "TRAINING MODE" LIST - Optimized for Weight Room Floor Mobile Use */}
      <div className="space-y-4">
        
        {/* Dynamic Day Selector Tabs */}
        {availableWorkouts.length > 0 && (
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {availableWorkouts.map((combo) => {
              const isSelected = activeCombo?.semana === combo.semana && activeCombo?.dia === combo.dia;
              return (
                <button
                  key={`${combo.semana}-${combo.dia}`}
                  onClick={() => setActiveCombo(combo)}
                  className={`px-4 py-2 rounded-none text-xs font-bold whitespace-nowrap transition-all flex items-center border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <span className="opacity-70 font-medium mr-1.5">Sem {combo.semana}</span>
                  {combo.dia}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between px-1 mt-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Entrenamiento: {activeCombo ? `Semana ${activeCombo.semana} - ${activeCombo.dia}` : 'Sin Asignar'}
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-medium">Sincronización RLS</span>
        </div>

        {dayLogs.length === 0 ? (
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-none p-10 text-center">
             <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
             <p className="text-slate-400 text-sm font-medium">¡Día libre de entrenamiento! No hay ejercicios asignados.</p>
          </div>
        ) : (
          dayLogs.map((log, index) => {
            const isExpanded = expandedExerciseId === log.id;
            const ex = log.exercise;
          const isCompleted = log.completed_series?.every((s) => s);

          return (
            <div
              key={log.id}
              id={`exercise-card-${log.id}`}
              className={`bg-slate-900 border rounded-none transition-all duration-300 overflow-hidden ${
                isCompleted
                  ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/20'
                  : isExpanded
                  ? 'border-amber-500/60 ring-1 ring-amber-500/30 shadow-2xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header Header Bar */}
              <div
                onClick={() => setExpandedExerciseId(isExpanded ? null : log.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <img
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ex?.image_urls[0]) setFullscreenImage(ex.image_urls[0]);
                      }}
                      src={ex?.image_urls[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80'}
                      alt={ex?.name || 'Ejercicio'}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-none object-contain bg-white p-1 border border-slate-800 cursor-pointer hover:scale-105 hover:ring-2 hover:ring-amber-500 transition-all"
                    />
                    <span className="absolute -top-2 -left-2 bg-slate-950 text-amber-400 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border border-slate-800">
                      #{index + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-none border border-amber-500/20 uppercase">
                        {ex?.equipment || 'Máquina'}
                      </span>
                      {ex?.primary_muscles?.map((m) => (
                        <span key={m} className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-none uppercase">
                          {m}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                      {ex?.name || 'Ejercicio sin nombre'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Meta Coach: <span className="text-white font-bold">{log.series} series</span> ×{' '}
                      <span className="text-white font-bold">{log.repeticiones} reps</span> @{' '}
                      <span className="text-amber-400 font-bold">{log.peso_real} KG</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Current Lifted Weight Pill */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peso Levantado</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{log.peso_real} KG</span>
                  </div>

                  {/* Expand Chevron */}
                  <div className={`p-2 rounded-none bg-slate-800 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 bg-amber-500 text-slate-950' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Card Expanded Content - Touch-Friendly Inputs for Weight Room */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-slate-800/80 space-y-5 bg-slate-950/40">
                  {/* Coach Notes & Instructions */}
                  {log.notas && (
                    <div className="bg-slate-900 border border-slate-800 rounded-none p-3 flex items-start space-x-2 text-xs">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-400">Indicación del Coach: </span>
                        <span className="text-slate-300">{log.notas}</span>
                      </div>
                    </div>
                  )}

                  {/* BIG OPERATIONAL TOUCH INPUT FOR PESO_REAL */}
                  <div className="bg-slate-900 border-2 border-amber-500/40 rounded-none p-4 sm:p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          REGISTRO DE PESO LEVANTADO (KG)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Edición en tiempo real • Último cambio:{' '}
                          {new Date(log.fecha_ultimo_cambio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-none border border-emerald-500/20">
                        Actual: {log.peso_real} KG
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Big Numeric Input with Touch Controls */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                        <button
                          id={`btn-minus-5-${log.id}`}
                          onClick={() => handleAdjustWeight(log.id, log.peso_real, -5)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold w-12 h-12 rounded-none text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          id={`btn-minus-2.5-${log.id}`}
                          onClick={() => handleAdjustWeight(log.id, log.peso_real, -2.5)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold w-12 h-12 rounded-none text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          -2.5
                        </button>

                        <div className="relative">
                          <input
                            id={`input-peso-real-${log.id}`}
                            type="number"
                            step="0.5"
                            value={log.peso_real}
                            onChange={(e) => handlePesoRealChange(log.id, parseFloat(e.target.value) || 0)}
                            className="bg-slate-950 text-amber-400 font-mono font-black text-3xl w-28 h-14 text-center rounded-none border-2 border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
                          />
                          <span className="absolute right-2 bottom-1 text-[10px] font-bold text-amber-500/60 uppercase">
                            KG
                          </span>
                        </div>

                        <button
                          id={`btn-plus-2.5-${log.id}`}
                          onClick={() => handleAdjustWeight(log.id, log.peso_real, 2.5)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold w-12 h-12 rounded-none text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          +2.5
                        </button>
                        <button
                          id={`btn-plus-5-${log.id}`}
                          onClick={() => handleAdjustWeight(log.id, log.peso_real, 5)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold w-12 h-12 rounded-none text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          +5
                        </button>
                      </div>

                      {/* Quick Save Confirmation Button */}
                      <button
                        onClick={() => handlePesoRealChange(log.id, log.peso_real)}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-3 rounded-none text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Peso</span>
                      </button>
                    </div>
                  </div>

                  {/* SERIES CHECKLIST */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      SEGUIMIENTO DE SERIES DE TRABAJO
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {Array.from({ length: log.series }).map((_, sIdx) => {
                        const isSetDone = log.completed_series?.[sIdx] || false;
                        return (
                          <button
                            key={sIdx}
                            id={`series-check-${log.id}-${sIdx}`}
                            onClick={() => handleToggleSeries(log.id, sIdx)}
                            className={`p-3 rounded-none border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                              isSetDone
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span>Serie #{sIdx + 1}</span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSetDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'}`}>
                              {isSetDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exercise Instructions & GIF / Image Preview */}
                  {ex?.instructions && ex.instructions.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-none p-4 space-y-2">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
                        Instrucciones de Ejecución de la Máquina:
                      </span>
                      <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
                        {ex.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
      {/* Lightbox / Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              Cerrar ✕
            </button>
            <img 
              src={fullscreenImage} 
              alt="Ejercicio ampliado" 
              className="w-full h-auto max-h-[85vh] object-contain bg-white rounded-none p-4 shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          profile={alumno}
          onClose={() => setShowEditProfileModal(false)}
          onProfileUpdated={() => {
            onRefreshData();
            loadRoutine();
          }}
        />
      )}

      {/* Edit Routine Modal */}
      {showEditRoutineModal && activeRoutine && (
        <EditRoutineModal
          routine={activeRoutine}
          exercises={dataService.getExercises()}
          onClose={() => setShowEditRoutineModal(false)}
          onRoutineUpdated={() => {
            onRefreshData();
            loadRoutine();
          }}
        />
      )}
    </div>
  );
};
