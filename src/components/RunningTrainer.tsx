import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Activity, Volume2, VolumeX, SkipForward } from 'lucide-react';

interface RoutinePhase {
  fase: string;
  tiempo_inicio_min: number;
  tiempo_fin_min: number;
  velocidad_sugerida_kmh: string;
  guion_entrenador: string;
}

interface RunningRoutine {
  nivel_generado: number;
  duracion_total_minutos: number;
  estructura: RoutinePhase[];
}

const S = {
  page: { padding: '40px 24px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  header: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '12px' },
  subtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 },
  btnIcon: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '0', color: '#fff', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' },
  
  levelCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  levelTitle: { fontSize: '16px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '8px' },
  levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' },
  levelBtn: { background: '#1e293b', border: '1px solid #334155', borderRadius: '0', padding: '24px 16px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  lNum: { fontSize: '32px', fontWeight: 900, color: '#fff', margin: 0 },
  lText: { fontSize: '10px', fontWeight: 800, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: 0 },

  runScreen: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
  backBtn: { background: 'transparent', border: 'none', color: '#888', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', padding: '8px 0', transition: 'color 0.2s' },
  
  timerBox: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', padding: '40px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' as const, overflow: 'hidden' as const },
  timerStats: { display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '32px', padding: '0 16px', boxSizing: 'border-box' as const },
  statCol: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' },
  statVal: { fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 },
  statLbl: { fontSize: '10px', fontWeight: 800, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: 0 },
  
  circleWrap: { position: 'relative' as const, width: '100%', maxWidth: '280px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' },
  svg: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)', pointerEvents: 'none' as const },
  circleInner: { position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', paddingTop: '8px', zIndex: 10 },
  timeRemaining: { fontSize: '56px', fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: '-2px', margin: 0, lineHeight: 1 },
  timeTotal: { fontSize: '20px', fontWeight: 800, color: '#34d399', fontFamily: 'monospace', margin: '4px 0 0' },
  minInput: { width: '60px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#34d399', fontSize: '24px', fontWeight: 900, textAlign: 'center' as const, outline: 'none', marginBottom: '8px' },
  
  phaseInfo: { textAlign: 'center' as const, width: '100%', marginBottom: '40px' },
  phaseLabel: { fontSize: '12px', fontWeight: 800, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 8px' },
  phaseSpeed: { fontSize: '32px', fontWeight: 900, color: '#f59e0b', margin: 0 },
  
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', width: '100%' },
  ctrlBtnSm: { width: '56px', height: '56px', borderRadius: '0', background: 'transparent', border: '1px solid #333', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const },
  ctrlBtnLg: { width: '80px', height: '80px', borderRadius: '0', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(245,158,11,0.1)' },
  ctrlTextLg: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: '4px' },
  
  structureCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  sHeader: { display: 'flex', alignItems: 'center', margin: '0 0 16px', fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  sBadge: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '0', marginLeft: '12px', fontSize: '12px' },
  sList: { display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '250px', overflowY: 'auto' as const, paddingRight: '8px' },
  sItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1e293b', borderRadius: '0', borderLeft: '4px solid #334155' },
  sItemActive: { background: 'rgba(245,158,11,0.05)', borderLeft: '4px solid #f59e0b' },
  sItemTitle: { fontSize: '14px', fontWeight: 800, margin: '0 0 4px', color: '#fff' },
  sItemTime: { fontSize: '11px', fontWeight: 600, color: '#666', margin: 0 },
  sItemSpeed: { fontSize: '14px', fontWeight: 900, color: '#666' },
  sItemSpeedActive: { color: '#f59e0b' },
};

export function RunningTrainer() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [routine, setRoutine] = useState<RunningRoutine | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generateRoutine = (level: number, customTargetMins?: number): RunningRoutine => {
    const phases: RoutinePhase[] = [];
    let warmupSpeed = "", coolDownSpeed = "", intervalStrongSpeed = "", intervalRestSpeed = "", numIntervals = 3, intervalStrongMins = 1, intervalRestMins = 1;

    if (level <= 3) {
      warmupSpeed = "4.0-5.0"; coolDownSpeed = "4.0"; intervalStrongSpeed = `${6.0 + (level*0.5)} - ${7.0 + (level*0.5)}`; intervalRestSpeed = "5.0-5.5"; numIntervals = 3 + level;
    } else if (level <= 7) {
      warmupSpeed = "5.0-6.0"; coolDownSpeed = "5.0"; intervalStrongSpeed = `${9.0 + ((level-3)*1.0)} - ${10.5 + ((level-3)*1.0)}`; intervalRestSpeed = "6.0-7.0"; numIntervals = 5 + (level-3); intervalStrongMins = 2;
    } else {
      warmupSpeed = "6.0-7.0"; coolDownSpeed = "6.0"; intervalStrongSpeed = `${14.5 + ((level-8)*1.5)} - ${16.0 + ((level-8)*2.0)}`; intervalRestSpeed = "8.0-9.0"; numIntervals = 8; intervalStrongMins = 1; intervalRestMins = 2;
    }

    if (customTargetMins && customTargetMins > 10) {
      numIntervals = Math.max(1, Math.floor((customTargetMins - 10) / (intervalStrongMins + intervalRestMins)));
    }

    let min = 0;
    phases.push({ fase: "Calentamiento", tiempo_inicio_min: min, tiempo_fin_min: min + 5, velocidad_sugerida_kmh: warmupSpeed, guion_entrenador: `Iniciamos calentamiento. Velocidad ${warmupSpeed} km/h.` });
    min += 5;

    for (let i = 1; i <= numIntervals; i++) {
      phases.push({ fase: `Intervalo_Fuerte_${i}`, tiempo_inicio_min: min, tiempo_fin_min: min + intervalStrongMins, velocidad_sugerida_kmh: intervalStrongSpeed, guion_entrenador: `¡Acelera a ${intervalStrongSpeed}!` });
      min += intervalStrongMins;
      phases.push({ fase: `Recuperacion_${i}`, tiempo_inicio_min: min, tiempo_fin_min: min + intervalRestMins, velocidad_sugerida_kmh: intervalRestSpeed, guion_entrenador: `Recupera a ${intervalRestSpeed}.` });
      min += intervalRestMins;
    }
    
    phases.push({ fase: "Enfriamiento", tiempo_inicio_min: min, tiempo_fin_min: min + 5, velocidad_sugerida_kmh: coolDownSpeed, guion_entrenador: `Buen trabajo, bajamos a ${coolDownSpeed} para enfriar.` });
    min += 5;

    return { nivel_generado: level, duracion_total_minutos: min, estructura: phases };
  };

  const handleLevelSelect = (level: number) => {
    // Unlock Web Speech API para móviles
    if ('speechSynthesis' in window) {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }
    setRoutine(generateRoutine(level));
    setSelectedLevel(level); setTotalSecondsElapsed(0); setCurrentPhaseIndex(0); setIsActive(false);
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; utterance.rate = 1.1; utterance.pitch = 1.2;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes('es-ES') && (v.name.includes('Helena') || v.name.includes('Google') || v.name.includes('Female')));
    if (esVoice) utterance.voice = esVoice;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && routine) {
      interval = setInterval(() => {
        setTotalSecondsElapsed(prev => {
          const newElapsed = prev + 1;
          const currentPhase = routine.estructura[currentPhaseIndex];
          if (currentPhase && newElapsed >= currentPhase.tiempo_fin_min * 60) {
            if (currentPhaseIndex + 1 < routine.estructura.length) {
              const nextIndex = currentPhaseIndex + 1;
              setCurrentPhaseIndex(nextIndex);
              speakText(routine.estructura[nextIndex].guion_entrenador);
            } else {
              setIsActive(false);
              speakText("¡Entrenamiento completado!");
            }
          }
          return newElapsed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, routine, currentPhaseIndex, ttsEnabled]);

  const toggleTimer = () => {
    if (!isActive && totalSecondsElapsed === 0 && routine) speakText(routine.estructura[0].guion_entrenador);
    setIsActive(!isActive);
  };

  const resetTimer = () => { setIsActive(false); setTotalSecondsElapsed(0); setCurrentPhaseIndex(0); window.speechSynthesis.cancel(); };
  
  const skipToNextPhase = () => {
    if (routine && currentPhaseIndex < routine.estructura.length - 1) {
      const nextIndex = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextIndex); setTotalSecondsElapsed(routine.estructura[nextIndex].tiempo_inicio_min * 60);
      speakText(routine.estructura[nextIndex].guion_entrenador);
    }
  };

  useEffect(() => { if ('speechSynthesis' in window) window.speechSynthesis.getVoices(); }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={S.page} className="gm-run-page">
      <style>{`
        @media (max-width: 768px) {
          .gm-run-page { padding: 16px 12px !important; }
          .gm-run-header { padding: 16px !important; gap: 12px !important; flex-direction: row !important; margin-bottom: 16px !important; }
          .gm-run-title { font-size: 18px !important; }
          .gm-level-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .gm-timer-box { padding: 24px 16px !important; }
          .gm-timer-stats { margin-bottom: 24px !important; }
          .gm-controls { gap: 16px !important; }
          .gm-circle-inner-time { font-size: 42px !important; }
          .gm-circle-inner-total { font-size: 16px !important; }
        }
      `}</style>
      {/* HEADER */}
      <div style={S.header} className="gm-run-header">
        <div>
          <h2 style={S.title} className="gm-run-title"><Activity color="#f59e0b" size={28} /> Entrenador de Running</h2>
          <p style={S.subtitle}>Generador algorítmico de rutinas de intervalos con TTS.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{ ...S.btnIcon, background: ttsEnabled ? 'rgba(245,158,11,0.1)' : '#1e293b', color: ttsEnabled ? '#f59e0b' : '#666', borderColor: ttsEnabled ? 'rgba(245,158,11,0.2)' : '#334155' }} onClick={() => setTtsEnabled(!ttsEnabled)}>
            {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          {routine && (
            <button
              style={{ ...S.btnIcon, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
              onClick={() => { setRoutine(null); resetTimer(); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.35)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.15)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              title="Volver a selección de nivel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
        </div>
      </div>

      {!routine ? (
        <div style={S.levelCard}>
          <h3 style={S.levelTitle}>Selecciona tu Nivel de Condición</h3>
          <div style={S.levelGrid} className="gm-level-grid">
            {[1,2,3,4,5,6,7,8,9,10].map(level => (
              <div key={level} style={S.levelBtn} onClick={() => handleLevelSelect(level)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#1e293b'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}>
                <span style={S.lNum}>{level}</span>
                <span style={S.lText}>{level <= 3 ? "Principiante" : level <= 7 ? "Intermedio" : "Élite"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={S.runScreen}>
          <button style={S.backBtn} onClick={() => { setRoutine(null); resetTimer(); }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
            ← Volver a selección de nivel
          </button>

          <div style={S.timerBox} className="gm-timer-box">
            <div style={S.timerStats} className="gm-timer-stats">
              <div style={S.statCol}><span style={S.statVal}>{currentPhaseIndex + 1}/{routine.estructura.length}</span><span style={S.statLbl}>Fases</span></div>
              <div style={S.statCol}><span style={S.statVal}>--</span><span style={S.statLbl}>BPM</span></div>
              <div style={S.statCol}><span style={S.statVal}>{Math.ceil((currentPhaseIndex + 1)/2)}/{Math.ceil(routine.estructura.length/2)}</span><span style={S.statLbl}>Ciclos</span></div>
            </div>

            <div style={S.circleWrap}>
              {(() => {
                const currentPhase = routine.estructura[currentPhaseIndex];
                const totalSecs = routine.duracion_total_minutos * 60;
                const totalPercent = Math.min(totalSecondsElapsed / totalSecs, 1);
                const pTotalSecs = (currentPhase.tiempo_fin_min - currentPhase.tiempo_inicio_min) * 60;
                const pElapsedSecs = totalSecondsElapsed - (currentPhase.tiempo_inicio_min * 60);
                const pRemainingSecs = Math.max(pTotalSecs - pElapsedSecs, 0);
                const pPercent = Math.max(pRemainingSecs / pTotalSecs, 0);
                
                const getPhaseColor = (name: string) => {
                  const f = name.toLowerCase();
                  if (f.includes('calentamiento')) return '#22d3ee';
                  if (f.includes('intervalo_fuerte')) return '#f59e0b';
                  if (f.includes('recuperacion')) return '#60a5fa';
                  if (f.includes('enfriamiento')) return '#a78bfa';
                  return '#f59e0b';
                };
                
                return (
                  <>
                    <svg style={S.svg} viewBox="0 0 280 280">
                      <circle cx="140" cy="140" r="130" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <circle cx="140" cy="140" r="130" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 130} strokeDashoffset={(2 * Math.PI * 130) * (1 - ((totalSecondsElapsed % 60) / 60))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                      
                      <circle cx="140" cy="140" r="112" fill="none" stroke="#1e293b" strokeWidth="14" />
                      <circle cx="140" cy="140" r="112" fill="none" stroke={getPhaseColor(currentPhase?.fase || '')} strokeWidth="14" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 112} strokeDashoffset={(2 * Math.PI * 112) * (1 - pPercent)} style={{ transition: 'all 1s linear' }} />
                      
                      <circle cx="140" cy="140" r="90" fill="none" stroke="#1e293b" strokeWidth="18" />
                      <circle cx="140" cy="140" r="90" fill="none" stroke="#34d399" strokeWidth="18" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 90} strokeDashoffset={(2 * Math.PI * 90) * (1 - totalPercent)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    
                    <div style={S.circleInner}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (routine.duracion_total_minutos > 11 && selectedLevel) {
                              setRoutine(generateRoutine(selectedLevel, routine.duracion_total_minutos - 1));
                              if (isActive || totalSecondsElapsed > 0) resetTimer();
                            }
                          }}
                          style={{ background: 'transparent', border: '1px solid #334155', color: '#888', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                        >-</button>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                          <span style={{ color: '#34d399', fontSize: '24px', fontWeight: 900 }}>{routine.duracion_total_minutos}</span>
                          <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 800, marginLeft: '4px' }}>MIN</span>
                        </div>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (routine.duracion_total_minutos < 120 && selectedLevel) {
                              setRoutine(generateRoutine(selectedLevel, routine.duracion_total_minutos + 1));
                              if (isActive || totalSecondsElapsed > 0) resetTimer();
                            }
                          }}
                          style={{ background: 'transparent', border: '1px solid #334155', color: '#888', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                        >+</button>
                      </div>
                      <span style={S.timeRemaining} className="gm-circle-inner-time">{formatTime(pRemainingSecs)}</span>
                      <span style={S.timeTotal} className="gm-circle-inner-total">{formatTime(totalSecondsElapsed)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div style={S.phaseInfo}>
              <p style={S.phaseLabel}>{routine.estructura[currentPhaseIndex]?.fase.replace(/_/g, ' ')}</p>
              <p style={S.phaseSpeed}>{routine.estructura[currentPhaseIndex]?.velocidad_sugerida_kmh} <span style={{ fontSize: '14px', color: '#888' }}>km/h</span></p>
            </div>

            <div style={S.controls} className="gm-controls">
              <button style={S.ctrlBtnSm} onClick={resetTimer} onMouseEnter={e=>{e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#555'}} onMouseLeave={e=>{e.currentTarget.style.color='#888'; e.currentTarget.style.borderColor='#333'}}>Parar</button>
              <button style={S.ctrlBtnLg} onClick={toggleTimer} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                {isActive ? <><Pause size={28} /><span style={S.ctrlTextLg}>Pausa</span></> : <><Play size={28} style={{ marginLeft: '4px' }} /><span style={S.ctrlTextLg}>Iniciar</span></>}
              </button>
              <button style={S.ctrlBtnSm} onClick={skipToNextPhase} onMouseEnter={e=>{e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#555'}} onMouseLeave={e=>{e.currentTarget.style.color='#888'; e.currentTarget.style.borderColor='#333'}}><SkipForward size={20} /></button>
            </div>
          </div>

          <div style={S.structureCard}>
            <h4 style={S.sHeader}>Estructura de la Rutina <span style={S.sBadge}>{routine.duracion_total_minutos} MIN</span></h4>
            <div style={S.sList}>
              {routine.estructura.map((f, idx) => (
                <div key={idx} style={{ ...S.sItem, ...(idx === currentPhaseIndex ? S.sItemActive : {}) }}>
                  <div>
                    <p style={{ ...S.sItemTitle, color: idx === currentPhaseIndex ? '#fff' : '#888' }}>{f.fase.replace(/_/g, ' ')}</p>
                    <p style={S.sItemTime}>Min: {f.tiempo_inicio_min}:00 - {f.tiempo_fin_min}:00</p>
                  </div>
                  <span style={{ ...S.sItemSpeed, ...(idx === currentPhaseIndex ? S.sItemSpeedActive : {}) }}>{f.velocidad_sugerida_kmh} km/h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
