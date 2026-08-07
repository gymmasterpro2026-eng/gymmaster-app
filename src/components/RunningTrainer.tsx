import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Activity, Volume2, VolumeX, ChevronRight, RefreshCw, Zap, SkipForward, Dumbbell } from 'lucide-react';

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

export function RunningTrainer() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [routine, setRoutine] = useState<RunningRoutine | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  // Timer states (in seconds)
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  // TTS State
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generador de Rutinas Algorítmico (Sustituto de IA)
  const generateRoutine = (level: number, customTargetMins?: number): RunningRoutine => {
    const phases: RoutinePhase[] = [];
    
    // Configuraciones por nivel
    let warmupSpeed = "";
    let coolDownSpeed = "";
    let intervalStrongSpeed = "";
    let intervalRestSpeed = "";
    let numIntervals = 3;
    let intervalStrongMins = 1;
    let intervalRestMins = 1;

    // Lógica simplificada de progresión
    if (level <= 3) {
      warmupSpeed = "4.0-5.0";
      coolDownSpeed = "4.0";
      intervalStrongSpeed = `${6.0 + (level*0.5)} - ${7.0 + (level*0.5)}`;
      intervalRestSpeed = "5.0-5.5";
      numIntervals = 3 + level;
    } else if (level <= 7) {
      warmupSpeed = "5.0-6.0";
      coolDownSpeed = "5.0";
      intervalStrongSpeed = `${9.0 + ((level-3)*1.0)} - ${10.5 + ((level-3)*1.0)}`;
      intervalRestSpeed = "6.0-7.0";
      numIntervals = 5 + (level-3);
      intervalStrongMins = 2;
    } else {
      warmupSpeed = "6.0-7.0";
      coolDownSpeed = "6.0";
      intervalStrongSpeed = `${14.5 + ((level-8)*1.5)} - ${16.0 + ((level-8)*2.0)}`;
      intervalRestSpeed = "8.0-9.0";
      numIntervals = 8;
      intervalStrongMins = 1; // Sprints cortos
      intervalRestMins = 2;   // Recuperaciones largas
    }

    if (customTargetMins && customTargetMins > 10) {
      const intervalCycleTime = intervalStrongMins + intervalRestMins;
      numIntervals = Math.floor((customTargetMins - 10) / intervalCycleTime);
      if (numIntervals < 1) numIntervals = 1;
    }

    let currentMinute = 0;

    // Calentamiento
    phases.push({
      fase: "Calentamiento",
      tiempo_inicio_min: currentMinute,
      tiempo_fin_min: currentMinute + 5,
      velocidad_sugerida_kmh: warmupSpeed,
      guion_entrenador: `Bienvenido al entrenamiento nivel ${level}. Empieza con un trote suave o caminata rápida a ${warmupSpeed} kilómetros por hora. Respira profundo y prepara tus articulaciones.`
    });
    currentMinute += 5;

    // Intervalos
    for (let i = 1; i <= numIntervals; i++) {
      phases.push({
        fase: `Intervalo_Fuerte_${i}`,
        tiempo_inicio_min: currentMinute,
        tiempo_fin_min: currentMinute + intervalStrongMins,
        velocidad_sugerida_kmh: intervalStrongSpeed,
        guion_entrenador: i === 1 
          ? `¡Aquí vamos! Sube la velocidad a un rango de ${intervalStrongSpeed}. ¡Ponele energía, tú puedes mantener este ritmo!` 
          : `¡Otro intervalo! Acelera a ${intervalStrongSpeed}. Concéntrate en tu técnica de braceo.`
      });
      currentMinute += intervalStrongMins;

      phases.push({
        fase: `Recuperacion_${i}`,
        tiempo_inicio_min: currentMinute,
        tiempo_fin_min: currentMinute + intervalRestMins,
        velocidad_sugerida_kmh: intervalRestSpeed,
        guion_entrenador: `Baja el ritmo a ${intervalRestSpeed}. Recupera el aliento y relaja los hombros. Gran esfuerzo en ese intervalo.`
      });
      currentMinute += intervalRestMins;
    }

    // Enfriamiento
    phases.push({
      fase: "Enfriamiento",
      tiempo_inicio_min: currentMinute,
      tiempo_fin_min: currentMinute + 5,
      velocidad_sugerida_kmh: coolDownSpeed,
      guion_entrenador: `¡Excelente trabajo hoy! Baja la velocidad a ${coolDownSpeed} kilómetros por hora o menos. Camina, normaliza tus pulsaciones y prepárate para descansar.`
    });
    currentMinute += 5;

    return {
      nivel_generado: level,
      duracion_total_minutos: currentMinute,
      estructura: phases
    };
  };

  const handleLevelSelect = (level: number) => {
    const newRoutine = generateRoutine(level);
    setRoutine(newRoutine);
    setSelectedLevel(level);
    setTotalSecondsElapsed(0);
    setCurrentPhaseIndex(0);
    setIsActive(false);
  };

  // TTS Function
  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Detener audios anteriores
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Acento español de España
    utterance.rate = 1.1;     // Ritmo enérgico / joven
    utterance.pitch = 1.25;   // Tono ligeramente más agudo (femenino, ~20 años)
    
    // Tratar de buscar una voz femenina española
    const voices = window.speechSynthesis.getVoices();
    // Buscamos primero voces conocidas de España que sean de mujer (ej. Helena, Google)
    const esVoice = voices.find(v => 
      (v.lang === 'es-ES' || v.lang === 'es_ES') && 
      (v.name.includes('Helena') || v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Mujer'))
    ) || voices.find(v => v.lang.includes('es-ES'));

    if (esVoice) utterance.voice = esVoice;

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && routine) {
      interval = setInterval(() => {
        setTotalSecondsElapsed((prev) => {
          const newElapsed = prev + 1;
          
          // Revisar si cambiamos de fase
          const currentPhase = routine.estructura[currentPhaseIndex];
          if (currentPhase && newElapsed >= currentPhase.tiempo_fin_min * 60) {
            // Avanzar a la siguiente fase
            if (currentPhaseIndex + 1 < routine.estructura.length) {
              const nextIndex = currentPhaseIndex + 1;
              setCurrentPhaseIndex(nextIndex);
              
              // Disparar audio de la nueva fase
              speakText(routine.estructura[nextIndex].guion_entrenador);
            } else {
              // Fin de la rutina
              setIsActive(false);
              speakText("¡Entrenamiento completado! Felicitaciones por tu esfuerzo de hoy.");
            }
          }
          return newElapsed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, routine, currentPhaseIndex, ttsEnabled]);

  const toggleTimer = () => {
    if (!isActive && totalSecondsElapsed === 0 && routine) {
      // Iniciar primera vez
      speakText(routine.estructura[0].guion_entrenador);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTotalSecondsElapsed(0);
    setCurrentPhaseIndex(0);
    window.speechSynthesis.cancel();
  };

  const skipToNextPhase = () => {
    if (routine && currentPhaseIndex < routine.estructura.length - 1) {
      const nextIndex = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextIndex);
      setTotalSecondsElapsed(routine.estructura[nextIndex].tiempo_inicio_min * 60);
      speakText(routine.estructura[nextIndex].guion_entrenador);
    }
  };

  // Pre-cargar voces (necesario en algunos navegadores)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#030303] min-h-screen -m-6 md:-m-10 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="p-6 rounded-none flex items-center justify-between shadow-xl border border-gray-200 bg-white">
        <div>
          <h2 className="text-2xl font-black text-black flex items-center gap-2">
            <Activity className="w-8 h-8 text-amber-500" />
            Entrenador de Running (Intervalos)
          </h2>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Generador algorítmico de rutinas con asistencia de voz TTS.
          </p>
        </div>
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-3 rounded-none border transition-colors ${ttsEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
          title={ttsEnabled ? "Voz Activada" : "Voz Desactivada"}
        >
          {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {!routine ? (
        // Pantalla 1: Selección de Nivel
        <div className="bg-white border border-gray-200 shadow-xl p-8 rounded-none">
          <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Zap className="w-5 h-5 text-amber-500" />
            Selecciona tu Nivel de Condición
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[1,2,3,4,5,6,7,8,9,10].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                className="group relative bg-gray-50 hover:bg-black border border-gray-200 hover:border-black p-4 flex flex-col items-center justify-center transition-all rounded-none"
              >
                <span className="text-2xl font-black text-gray-800 group-hover:text-amber-400 transition-colors">
                  {level}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white mt-2 text-center">
                  {level <= 3 ? "Principiante" : level <= 7 ? "Intermedio" : "Élite"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Pantalla 2: Cronómetro y Entrenamiento (Estilo Dark + Anillos)
        <div className="space-y-6">
          <button 
            onClick={() => { setRoutine(null); resetTimer(); }}
            className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors bg-black/50 px-3 py-1.5 rounded-lg border border-white/10"
          >
            ← Volver a selección de nivel
          </button>

          <div className="bg-[#030303] text-white p-6 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden border border-white/5 mx-auto max-w-sm sm:max-w-md w-full">
            
            {/* Top Stats Bar */}
            <div className="flex items-center justify-between text-center mb-8 px-2">
              <div>
                <p className="text-white font-black text-lg">{currentPhaseIndex + 1}/{routine.estructura.length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Fases</p>
              </div>
              <div>
                <p className="text-white font-black text-lg">--</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">BPM</p>
              </div>
              <div>
                <p className="text-white font-black text-lg">{Math.ceil((currentPhaseIndex + 1)/2)}/{Math.ceil(routine.estructura.length/2)}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Ciclos</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Cronómetro Circular Doble Anillo */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-10 flex items-center justify-center">
                
                {(() => {
                  const currentPhase = routine.estructura[currentPhaseIndex];
                  const totalDurationSecs = routine.duracion_total_minutos * 60;
                  const totalPercent = Math.min(totalSecondsElapsed / totalDurationSecs, 1);
                  
                  const phaseTotalSecs = (currentPhase.tiempo_fin_min - currentPhase.tiempo_inicio_min) * 60;
                  const phaseElapsedSecs = totalSecondsElapsed - (currentPhase.tiempo_inicio_min * 60);
                  const phaseRemainingSecs = Math.max(phaseTotalSecs - phaseElapsedSecs, 0);
                  const phasePercentRemaining = Math.max(phaseRemainingSecs / phaseTotalSecs, 0);

                  const secondsRadius = 122;
                  const outerRadius = 106;
                  const innerRadius = 86;
                  
                  const secondsCircumference = 2 * Math.PI * secondsRadius;
                  const outerCircumference = 2 * Math.PI * outerRadius;
                  const innerCircumference = 2 * Math.PI * innerRadius;
                  
                  const secondsPercent = (totalSecondsElapsed % 60) / 60;

                  const getPhaseColor = (faseName: string) => {
                    const f = faseName.toLowerCase();
                    if (f.includes('calentamiento')) return 'stroke-cyan-400';
                    if (f.includes('intervalo_fuerte')) return 'stroke-amber-500';
                    if (f.includes('recuperacion')) return 'stroke-blue-400';
                    if (f.includes('enfriamiento')) return 'stroke-indigo-400';
                    return 'stroke-amber-500';
                  };

                  return (
                    <>
                      {/* SVG Rings */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        {/* 60s Track (Outer-most) */}
                        <circle cx="50%" cy="50%" r={secondsRadius} className="stroke-[#1a1a1a]" strokeWidth="6" fill="none" />
                        {/* 60s Progress */}
                        <circle cx="50%" cy="50%" r={secondsRadius} 
                          className="stroke-red-500 transition-all duration-1000 ease-linear" 
                          strokeWidth="6" fill="none" strokeLinecap="round"
                          strokeDasharray={secondsCircumference}
                          strokeDashoffset={secondsCircumference - (secondsPercent * secondsCircumference)}
                        />

                        {/* Phase Track (Middle) */}
                        <circle cx="50%" cy="50%" r={outerRadius} className="stroke-[#1a1a1a]" strokeWidth="14" fill="none" />
                        {/* Phase Progress (Middle) */}
                        <circle cx="50%" cy="50%" r={outerRadius} 
                          className={`${getPhaseColor(currentPhase?.fase || '')} transition-all duration-1000 ease-linear`} 
                          strokeWidth="14" fill="none" strokeLinecap="round"
                          strokeDasharray={outerCircumference}
                          strokeDashoffset={outerCircumference - (phasePercentRemaining * outerCircumference)}
                        />

                        {/* Total Track (Inner) */}
                        <circle cx="50%" cy="50%" r={innerRadius} className="stroke-[#1a1a1a]" strokeWidth="18" fill="none" />
                        {/* Total Progress (Inner) */}
                        <circle cx="50%" cy="50%" r={innerRadius} 
                          className="stroke-emerald-400 transition-all duration-1000 ease-linear" 
                          strokeWidth="18" fill="none" strokeLinecap="round"
                          strokeDasharray={innerCircumference}
                          strokeDashoffset={innerCircumference - (totalPercent * innerCircumference)}
                        />
                      </svg>

                      {/* Info inside circle */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <div className="flex items-baseline justify-center mb-1 group">
                          <input 
                            key={`svg-${selectedLevel}-${routine.duracion_total_minutos}`}
                            type="number" 
                            min="11"
                            max="120"
                            className="w-16 bg-transparent text-emerald-400 font-black text-2xl text-center outline-none border-b-2 border-transparent hover:border-emerald-500/30 focus:border-emerald-400 transition-colors"
                            defaultValue={routine.duracion_total_minutos}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 10 && selectedLevel && val !== routine.duracion_total_minutos) {
                                 const newRoutine = generateRoutine(selectedLevel, val);
                                 setRoutine(newRoutine);
                                 if (isActive || totalSecondsElapsed > 0) resetTimer();
                              } else {
                                 e.target.value = routine.duracion_total_minutos.toString();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            title="Editar duración total"
                          />
                          <span className="text-emerald-500 font-bold text-sm tracking-widest ml-1">MIN</span>
                        </div>
                        {/* Phase Remaining Time */}
                        <span className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tighter">
                          {formatTime(phaseRemainingSecs)}
                        </span>
                        
                        {/* Total Time */}
                        <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                          {formatTime(totalSecondsElapsed)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Text Info */}
              <div className="mb-10 w-full">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">
                  <span>{routine.estructura[currentPhaseIndex]?.fase.replace(/_/g, ' ')}</span>
                </p>
                <p className="text-amber-500 font-black text-2xl">
                  <span>{routine.estructura[currentPhaseIndex]?.velocidad_sugerida_kmh}</span> <span className="text-sm">km/h</span>
                </p>
              </div>

              {/* Controles Inferiores (Botones Circulares) */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 w-full">
                <button
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  title="Parar y Resetear"
                >
                  <span className="text-[9px] font-bold uppercase">Parar</span>
                </button>
                
                <button
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex flex-col items-center justify-center text-white transition-all shadow-xl"
                >
                  {isActive ? (
                    <>
                      <Pause className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Pausa</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mb-1 ml-1 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Iniciar</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={skipToNextPhase}
                  className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  title="Siguiente Fase"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Próximas Fases Preview */}
          <div className="bg-white border border-gray-200 p-6 rounded-none shadow-xl">
            <h4 className="font-bold text-black uppercase tracking-wide text-xs mb-4 flex items-center">
              Estructura de la Rutina 
              <div className="flex items-center bg-amber-100 border border-amber-500 rounded-none px-2 py-0.5 ml-2">
                <span className="text-amber-700 font-black text-center px-1">
                  {routine.duracion_total_minutos}
                </span>
                <span className="text-amber-700 font-bold ml-0.5">MIN</span>
              </div>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {routine.estructura.map((fase, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 border-l-4 transition-colors ${
                    idx === currentPhaseIndex ? 'bg-amber-50 border-amber-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div>
                    <p className={`font-bold text-sm ${idx === currentPhaseIndex ? 'text-black' : 'text-gray-600'}`}>
                      {fase.fase.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Min: {fase.tiempo_inicio_min}:00 - {fase.tiempo_fin_min}:00
                    </p>
                  </div>
                  <span className={`font-black text-sm ${idx === currentPhaseIndex ? 'text-amber-600' : 'text-gray-400'}`}>
                    {fase.velocidad_sugerida_kmh} km/h
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
      </div>
    </div>
  );
}
