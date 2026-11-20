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
  page: { padding: '24px 20px', maxWidth: '940px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  header: { padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' },
  title: { fontSize: '23px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  subtitle: { fontSize: '12px', color: '#94A3B8', margin: 0 },
  btnIcon: { padding: '10px', cursor: 'pointer', display: 'flex' },
  
  levelCard: { padding: '28px' },
  levelTitle: { fontSize: '15px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 22px', display: 'flex', alignItems: 'center', gap: '8px' },
  levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))', gap: '12px' },
  levelBtn: { padding: '20px 14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '6px' },
  lNum: { fontSize: '30px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#FFBD4A', margin: 0 },
  lText: { fontSize: '10px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#CBD5E1', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: 0 },

  runScreen: { display: 'flex', flexDirection: 'column' as const, gap: '22px' },
  backBtn: { padding: '8px 14px', fontSize: '11px', alignSelf: 'flex-start' },
  
  timerBox: { padding: '32px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', position: 'relative' as const },
  timerStats: { display: 'flex', justifyContent: 'space-around', width: '100%', marginBottom: '28px', padding: '14px 16px', boxSizing: 'border-box' as const },
  statCol: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' },
  statVal: { fontSize: '20px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: 0 },
  statLbl: { fontSize: '10px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: 0 },
  
  circleWrap: { position: 'relative' as const, width: '100%', maxWidth: '280px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' },
  svg: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)', pointerEvents: 'none' as const },
  circleInner: { position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', paddingTop: '8px', zIndex: 10 },
  timeRemaining: { fontSize: '54px', fontWeight: 700, color: '#fff', fontFamily: "'Chakra Petch', monospace", letterSpacing: '-1px', margin: 0, lineHeight: 1 },
  timeTotal: { fontSize: '18px', fontWeight: 700, color: '#D57A30', fontFamily: "'Chakra Petch', monospace", margin: '4px 0 0' },
  
  phaseInfo: { textAlign: 'center' as const, width: '100%', marginBottom: '28px' },
  phaseLabel: { fontSize: '12px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: '0 0 8px' },
  phaseSpeed: { fontSize: '30px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#FFBD4A', margin: 0 },
  
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', width: '100%' },
  ctrlBtnSm: { width: '56px', height: '56px', fontSize: '10px', padding: 0 },
  ctrlBtnLg: { width: '82px', height: '82px', flexDirection: 'column' as const, padding: 0 },
  ctrlTextLg: { fontSize: '10px', fontWeight: 800, fontFamily: "'Chakra Petch', sans-serif", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: '4px' },
  
  structureCard: { padding: '24px' },
  sHeader: { display: 'flex', alignItems: 'center', margin: '0 0 16px', fontSize: '13px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  sBadge: { padding: '2px 8px', marginLeft: '12px', fontSize: '11px' },
  sList: { display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '260px', overflowY: 'auto' as const, paddingRight: '8px' },
  sItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderLeft: '4px solid #47505E' },
  sItemActive: { borderColor: 'rgba(213,122,48,0.65)', borderLeft: '4px solid #D57A30', boxShadow: '0 0 16px rgba(213,122,48,0.18), inset 0 3px 12px rgba(0,0,0,0.88)' },
  sItemTitle: { fontSize: '14px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, margin: '0 0 4px', color: '#fff' },
  sItemTime: { fontSize: '11px', fontWeight: 600, color: '#94A3B8', margin: 0 },
  sItemSpeed: { fontSize: '14px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#94A3B8' },
  sItemSpeedActive: { color: '#FFBD4A' },
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
      <div style={S.header} className="gm-run-header titan-armor-banner">
        <div>
          <h2 style={S.title} className="gm-run-title"><Activity color="#D57A30" size={26} /> Entrenador de Running</h2>
          <p style={S.subtitle}>Generador algorítmico de rutinas de intervalos con TTS.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className={ttsEnabled ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'} style={S.btnIcon} onClick={() => setTtsEnabled(!ttsEnabled)} title={ttsEnabled ? 'Voz activada' : 'Voz desactivada'}>
            {ttsEnabled ? <Volume2 size={20} color="#FFBD4A" /> : <VolumeX size={20} />}
          </button>
          {routine && (
            <button
              className="titan-btn-armor-steel"
              style={S.btnIcon}
              onClick={() => { setRoutine(null); resetTimer(); }}
              title="Volver a selección de nivel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
        </div>
      </div>

      {!routine ? (
        <div className="titan-armor-card" style={S.levelCard}>
          <h3 style={S.levelTitle}>Selecciona tu Nivel de Condición</h3>
          <div style={S.levelGrid} className="gm-level-grid">
            {[1,2,3,4,5,6,7,8,9,10].map(level => (
              <button key={level} type="button" className="titan-btn-armor-steel" style={S.levelBtn} onClick={() => handleLevelSelect(level)}>
                <span style={S.lNum}>{level}</span>
                <span style={S.lText}>{level <= 3 ? "Principiante" : level <= 7 ? "Intermedio" : "Élite"}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={S.runScreen}>
          <button className="titan-btn-armor-steel" style={S.backBtn} onClick={() => { setRoutine(null); resetTimer(); }}>
            ← Volver a selección de nivel
          </button>

          <div style={S.timerBox} className="gm-timer-box titan-armor-card">
            <div style={S.timerStats} className="gm-timer-stats titan-inset-well">
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
                      <circle cx="140" cy="140" r="130" fill="none" stroke="#141922" strokeWidth="6" />
                      <circle cx="140" cy="140" r="130" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 130} strokeDashoffset={(2 * Math.PI * 130) * (1 - ((totalSecondsElapsed % 60) / 60))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                      
                      <circle cx="140" cy="140" r="112" fill="none" stroke="#141922" strokeWidth="14" />
                      <circle cx="140" cy="140" r="112" fill="none" stroke={getPhaseColor(currentPhase?.fase || '')} strokeWidth="14" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 112} strokeDashoffset={(2 * Math.PI * 112) * (1 - pPercent)} style={{ transition: 'all 1s linear' }} />
                      
                      <circle cx="140" cy="140" r="90" fill="none" stroke="#141922" strokeWidth="18" />
                      <circle cx="140" cy="140" r="90" fill="none" stroke="#34d399" strokeWidth="18" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 90} strokeDashoffset={(2 * Math.PI * 90) * (1 - totalPercent)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    
                    <div style={S.circleInner}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="titan-btn-armor-steel"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (routine.duracion_total_minutos > 11 && selectedLevel) {
                              setRoutine(generateRoutine(selectedLevel, routine.duracion_total_minutos - 1));
                              if (isActive || totalSecondsElapsed > 0) resetTimer();
                            }
                          }}
                          style={{ width: '24px', height: '24px', fontSize: '14px', padding: 0 }}
                        >-</button>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                          <span style={{ color: '#6EE7B7', fontSize: '24px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>{routine.duracion_total_minutos}</span>
                          <span style={{ color: '#6EE7B7', fontSize: '12px', fontWeight: 800, marginLeft: '4px' }}>MIN</span>
                        </div>
                        <button 
                          className="titan-btn-armor-steel"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (routine.duracion_total_minutos < 120 && selectedLevel) {
                              setRoutine(generateRoutine(selectedLevel, routine.duracion_total_minutos + 1));
                              if (isActive || totalSecondsElapsed > 0) resetTimer();
                            }
                          }}
                          style={{ width: '24px', height: '24px', fontSize: '14px', padding: 0 }}
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
              <p style={S.phaseSpeed}>{routine.estructura[currentPhaseIndex]?.velocidad_sugerida_kmh} <span style={{ fontSize: '14px', color: '#94A3B8' }}>km/h</span></p>
            </div>

            <div style={S.controls} className="gm-controls">
              <button className="titan-btn-armor-steel" style={S.ctrlBtnSm} onClick={resetTimer}>Parar</button>
              <button className="titan-btn-armor-copper" style={S.ctrlBtnLg} onClick={toggleTimer}>
                {isActive ? <><Pause size={28} /><span style={S.ctrlTextLg}>Pausa</span></> : <><Play size={28} style={{ marginLeft: '4px' }} /><span style={S.ctrlTextLg}>Iniciar</span></>}
              </button>
              <button className="titan-btn-armor-steel" style={S.ctrlBtnSm} onClick={skipToNextPhase}><SkipForward size={20} /></button>
            </div>
          </div>

          <div className="titan-armor-card" style={S.structureCard}>
            <h4 style={S.sHeader}>Estructura de la Rutina <span className="titan-badge-copper" style={S.sBadge}>{routine.duracion_total_minutos} MIN</span></h4>
            <div style={S.sList}>
              {routine.estructura.map((f, idx) => (
                <div key={idx} className="titan-inset-well" style={{ ...S.sItem, ...(idx === currentPhaseIndex ? S.sItemActive : {}) }}>
                  <div>
                    <p style={{ ...S.sItemTitle, color: idx === currentPhaseIndex ? '#fff' : '#CBD5E1' }}>{f.fase.replace(/_/g, ' ')}</p>
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
