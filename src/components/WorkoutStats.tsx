import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy, BarChart2, Activity, Calendar, CheckCircle2, Flame } from 'lucide-react';
import { Profile } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';

// ── Types ─────────────────────────────────────────────────────────────
export interface WorkoutSession {
  id: string;
  alumno_id: string;
  fecha: string;          // ISO date string
  semana: number;
  dia: string;
  duracion_min: number;
  ejercicios: {
    exercise_id: string;
    nombre: string;
    primary_muscles: string[];
    peso_real: number;
    series: number;
    repeticiones: number;
    series_completadas: number;
    volumen_kg: number;
  }[];
  total_volumen_kg: number;
}

// ── Session Storage Helpers ────────────────────────────────────────────
export const saveSession = (session: WorkoutSession) => {
  const key = `gymmaster_sessions_${session.alumno_id}`;
  const existing: WorkoutSession[] = JSON.parse(localStorage.getItem(key) || '[]');
  // Replace if same date+dia+semana combo
  const idx = existing.findIndex(s => s.fecha === session.fecha && s.dia === session.dia && s.semana === session.semana);
  if (idx >= 0) existing[idx] = session;
  else existing.unshift(session);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 120))); // max 120 sessions
};

export const getSessions = (alumno_id: string): WorkoutSession[] => {
  const key = `gymmaster_sessions_${alumno_id}`;
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

const ALL_MUSCLES = [
  'Abdominales', 'Abductores', 'Aductores', 'Antebrazos', 'Bíceps',
  'Cardiovascular system', 'Cuádriceps', 'Delts', 'Dorsales (Espalda)',
  'Espalda Alta', 'Gemelos (Pantorrillas)', 'Glúteos', 'Isquiotibiales (Femorales)',
  'Levator scapulae', 'Pectorals', 'Serrato Mayor', 'Spine', 'Trapecios', 'Tríceps'
];

// ── Color palette ──────────────────────────────────────────────────────
const MUSCLE_COLORS: Record<string, string> = {
  'chest': '#06b6d4', 'pectorales': '#06b6d4', 'pecho': '#06b6d4', 'pectorals': '#06b6d4',
  'back': '#f59e0b',  'espalda': '#f59e0b', 'lats': '#f59e0b', 'dorsales (espalda)': '#f59e0b', 'espalda alta': '#fbbf24', 'levator scapulae': '#d97706', 'spine': '#b45309',
  'shoulders': '#a855f7', 'hombros': '#a855f7', 'deltoides': '#a855f7', 'delts': '#a855f7', 'trapecios': '#c084fc',
  'biceps': '#10b981', 'bíceps': '#10b981', 'bicep': '#10b981',
  'triceps': '#ef4444', 'tríceps': '#ef4444', 'tricep': '#ef4444',
  'legs': '#f97316', 'piernas': '#f97316', 'quadriceps': '#f97316', 'cuádriceps': '#f97316',
  'hamstrings': '#fb923c', 'isquiotibiales': '#fb923c', 'isquiotibiales (femorales)': '#fb923c',
  'glutes': '#e879f9', 'glúteos': '#e879f9', 'gluteus': '#e879f9',
  'core': '#34d399', 'abdominales': '#34d399', 'abs': '#34d399', 'serrato mayor': '#6ee7b7',
  'calves': '#38bdf8', 'gemelos': '#38bdf8', 'gemelos (pantorrillas)': '#38bdf8',
  'forearms': '#fbbf24', 'antebrazos': '#fbbf24',
  'abductores': '#f472b6', 'aductores': '#fb7185',
  'cardiovascular system': '#f87171'
};
const getMuscleColor = (m: string) => MUSCLE_COLORS[m.toLowerCase()] || '#64748b';

// ── Radar Chart (SVG pure) ─────────────────────────────────────────────
const RadarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const [rotation, setRotation] = useState(0);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length < 3) return (
    <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '13px' }}>
      Necesitás al menos 3 grupos musculares para el radar. Completá más sesiones. 💪
    </div>
  );

  const cx = 280, cy = 220, r = 130;
  const n = data.length;
  const max = Math.max(...data.map(d => d.value), 1);

  // Drag logic
  const getPointerAngle = (e: React.PointerEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    if (!svgRef.current) return;
    svgRef.current.setAttribute('data-dragging', 'true');
    svgRef.current.setAttribute('data-start-angle', getPointerAngle(e).toString());
    svgRef.current.setAttribute('data-start-rotation', rotation.toString());
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (svgRef.current?.getAttribute('data-dragging') === 'true') {
      const startAngle = parseFloat(svgRef.current.getAttribute('data-start-angle') || '0');
      const startRotation = parseFloat(svgRef.current.getAttribute('data-start-rotation') || '0');
      const currentAngle = getPointerAngle(e);
      
      let delta = currentAngle - startAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Si hay un giro significativo, limpiamos el label seleccionado para no confundir
      if (Math.abs(delta) > 5) setSelectedLabelIndex(null);

      setRotation(startRotation + delta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    svgRef.current?.setAttribute('data-dragging', 'false');
  };

  const getPoint = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / max) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const getLabelPoint = (i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = r + 26; // Distance from radar edge
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), angle };
  };

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPaths = rings.map(pct => {
    const pts = data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + pct * r * Math.cos(angle)},${cy + pct * r * Math.sin(angle)}`;
    });
    return pts.join(' ');
  });

  // Puntos individuales para los marcadores (círculos) - solo activos
  const activeData = data.filter(d => d.value > 0);
  
  const activeDataPoints = activeData.map(d => {
    const originalIndex = data.indexOf(d);
    return getPoint(originalIndex, d.value);
  });

  let polygon = activeDataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Si hay 1 o 2 grupos musculares trabajados, agregamos el centro al polígono y a los marcadores 
  // para que se forme un área cerrada (triángulo) hacia el origen.
  if (activeData.length > 0 && activeData.length < 3) {
    polygon += ` ${cx},${cy}`;
    activeDataPoints.push({ x: cx, y: cy });
  }

  // Color principal para el gráfico analítico
  const themeColor = '#14b8a6'; // Teal-500

  return (
    <svg 
      ref={svgRef}
      width="100%" height="auto" viewBox="20 20 520 400" 
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%', cursor: 'grab', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <style>{`
        .muscle-label {
          transition: font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.3s ease;
          cursor: pointer;
          pointer-events: bounding-box;
        }
        @media (hover: hover) {
          .muscle-label:hover {
            font-size: 11px !important;
            fill: #14b8a6 !important;
          }
        }
      `}</style>
      
      {/* Grupo principal giratorio manual */}
      <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
      {/* Grid rings (Líneas concéntricas de la telaraña) */}
      {ringPaths.map((pts, i) => (
        <polygon 
          key={`ring-${i}`} 
          points={pts} 
          fill="none" 
          stroke="#1e293b" // slate-800
          strokeWidth="1" 
        />
      ))}
      
      {/* Radial lines (Ejes desde el centro) */}
      {data.map((d, i) => {
        const outer = getPoint(i, max);
        const dataPt = getPoint(i, d.value);
        return (
          <React.Fragment key={`spoke-${i}`}>
            {/* Eje base completo */}
            <line 
              x1={cx} y1={cy} 
              x2={outer.x} y2={outer.y} 
              stroke="#334155" // slate-700
              strokeWidth="1" 
            />
            {/* Resalte verde agua solo para la parte de afuera de la telaraña (si fue entrenado) */}
            {d.value > 0 && (
              <line 
                x1={dataPt.x} y1={dataPt.y} 
                x2={outer.x} y2={outer.y} 
                stroke={themeColor} 
                strokeWidth="2" 
                strokeOpacity="0.8"
              />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Área de Datos (Polígono cerrado) */}
      <polygon 
        points={polygon} 
        fill="rgba(20, 184, 166, 0.4)" // Teal-500 semi-transparente
        stroke={themeColor} 
        strokeWidth="2" 
      />
      
      {/* Puntos de Datos (Marcadores en los vértices) */}
      {activeDataPoints.map((p, i) => (
        <circle 
          key={`dot-${i}`} 
          cx={p.x} 
          cy={p.y} 
          r="4" 
          fill={themeColor} 
        />
      ))}
      
      {/* Labels */}
      {data.map((d, i) => {
        const lp = getLabelPoint(i);
        const isRight = Math.cos(lp.angle) > 0.1;
        const isLeft = Math.cos(lp.angle) < -0.1;
        const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
        
        return (
          <text 
            key={`label-${i}`} 
            x={lp.x} 
            y={lp.y} 
            textAnchor={anchor} 
            dominantBaseline="middle"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLabelIndex(selectedLabelIndex === i ? null : i);
            }}
            className={`muscle-label uppercase tracking-wider ${d.value === 0 ? 'fill-red-500' : 'fill-slate-400'}`}
            fontSize={selectedLabelIndex === i ? "24" : "9"} 
            fontWeight="800"
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              letterSpacing: '0.05em',
              transformOrigin: `${lp.x}px ${lp.y}px`,
              transform: `rotate(${-rotation}deg)`,
              fill: selectedLabelIndex === i ? '#14b8a6' : undefined
            }}>
            {d.label.length > 22 ? d.label.slice(0, 21) + '.' : d.label}
          </text>
        );
      })}
      </g>
    </svg>
  );
};

// ── Bar Chart (SVG pure) ───────────────────────────────────────────────
function BarChart({ data, label }: { data: { fecha: string; peso: number; vol: number }[]; label: string }) {
  if (data.length < 2) return (
    <div style={{ textAlign: 'center', color: '#64748b', padding: '32px', fontSize: '13px' }}>
      Necesitás al menos 2 sesiones de "{label}" para ver el progreso.
    </div>
  );

  const W = 340, H = 120, padL = 36, padR = 10, padT = 10, padB = 28;
  const gW = W - padL - padR, gH = H - padT - padB;
  const maxPeso = Math.max(...data.map(d => d.peso), 1);
  const barW = Math.min(32, gW / data.length - 4);

  const last = data[data.length - 1].peso;
  const prev = data[data.length - 2].peso;
  const trend = last > prev ? 'up' : last < prev ? 'down' : 'flat';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {trend === 'up' && <TrendingUp size={16} color="#10b981" />}
        {trend === 'down' && <TrendingDown size={16} color="#ef4444" />}
        {trend === 'flat' && <Minus size={16} color="#64748b" />}
        <span style={{ fontSize: '12px', fontWeight: 800, color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b' }}>
          {trend === 'up' ? `+${(last - prev).toFixed(1)} kg vs sesión anterior` :
           trend === 'down' ? `${(last - prev).toFixed(1)} kg vs sesión anterior` :
           'Sin cambio vs sesión anterior'}
        </span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Y axis labels */}
        {[0, 0.5, 1].map(pct => (
          <text key={pct} x={padL - 4} y={padT + gH * (1 - pct)} textAnchor="end" dominantBaseline="middle"
            fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
            {Math.round(maxPeso * pct)}
          </text>
        ))}
        {/* Grid lines */}
        {[0, 0.5, 1].map(pct => (
          <line key={pct} x1={padL} x2={W - padR} y1={padT + gH * (1 - pct)} y2={padT + gH * (1 - pct)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + (i / data.length) * gW + (gW / data.length - barW) / 2;
          const bH = Math.max(2, (d.peso / maxPeso) * gH);
          const y = padT + gH - bH;
          const isLast = i === data.length - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH}
                fill={isLast ? '#f59e0b' : 'url(#barGrad)'} rx="2"
                opacity={isLast ? 1 : 0.5 + (i / data.length) * 0.4} />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="800">
                {d.peso > 0 ? d.peso : ''}
              </text>
              <text x={x + barW / 2} y={padT + gH + 10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">
                {d.fecha.slice(5).replace('-', '/')}
              </text>
            </g>
          );
        })}
        {/* Line */}
        <polyline
          points={data.map((d, i) => {
            const x = padL + (i / data.length) * gW + (gW / data.length) / 2;
            const y = padT + gH - (d.peso / maxPeso) * gH;
            return `${x},${y}`;
          }).join(' ')}
          fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.6"
        />
      </svg>
    </div>
  );
}

// ── Muscle Progress Accordion ──────────────────────────────────────────
function MuscleProgressAccordion({ item, index }: { item: any; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '16px', borderRadius: '6px' }}>
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          marginBottom: isOpen ? '16px' : '0', 
          cursor: 'pointer', userSelect: 'none',
          background: '#334155', padding: '12px', borderRadius: '6px'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{index + 1}</span>
        <span style={{ width: '10px', height: '10px', background: item.color, display: 'inline-block', borderRadius: '50%' }} />
        <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'capitalize', flex: 1 }}>
          {item.muscle}
        </span>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{isOpen ? 'Ocultar ▲' : 'Mostrar ▼'}</span>
      </div>
      
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {item.exercises.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', paddingLeft: '16px' }}>
              Aún no hay sesiones registradas para este grupo muscular.
            </div>
          ) : (
            item.exercises.map((ex: any) => {
              const maxPeso = Math.max(...ex.history.map((h: any) => h.peso), 1);
              return (
                <div key={ex.name} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                   {/* Exercise Header */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}>{ex.name}</span>
                      {ex.idStr && (
                        <span style={{ border: '1px solid #d97706', color: '#d97706', fontSize: '9px', padding: '2px 4px', fontWeight: 700, borderRadius: '4px' }}>
                          {ex.idStr}
                        </span>
                      )}
                   </div>

                   {/* Exercise History (Mini Bar Chart) */}
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                     <div className="custom-scrollbar" style={{ display: 'flex', gap: '12px', paddingLeft: '12px', borderLeft: `2px solid ${item.color}40`, overflowX: 'auto', flex: 1 }}>
                       {ex.history.map((h: any, idx: number) => {
                          const heightPct = Math.max(10, (h.peso / maxPeso) * 100);
                          const isFirst = idx === 0;

                          return (
                            <div key={h.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
                              {/* Delta text */}
                              <span style={{ 
                                fontSize: '10px', fontWeight: 900, 
                                color: h.delta > 0 ? '#10b981' : h.delta < 0 ? '#ef4444' : 'transparent',
                                height: '14px' // keep space
                              }}>
                                {!isFirst && h.delta !== 0 ? (h.delta > 0 ? `+${h.delta}` : h.delta) : ''}
                              </span>
                              
                              {/* Vertical Bar */}
                              <div style={{ width: '12px', height: '35px', background: '#1e293b', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: `${heightPct}%`, background: isFirst ? '#475569' : item.color, transition: 'height 0.5s' }} />
                              </div>
                              
                              {/* Peso */}
                              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff' }}>
                                {h.peso}
                              </span>
                              
                              {/* Fecha */}
                              <span style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                {h.timeLabel.split(' ')[0]} {h.timeLabel.split(' ')[1]}
                              </span>
                            </div>
                          );
                       })}
                     </div>
                     {ex.imgUrl && (
                       <img 
                         src={fixImageUrl(ex.imgUrl)} 
                         alt={ex.name} 
                         className="gm-exercise-gif"
                         style={{ 
                           width: '70px', height: '70px', objectFit: 'contain', 
                           background: '#000', borderRadius: '6px', 
                           border: `1px solid ${item.color}40`
                         }} 
                       />
                     )}
                   </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
interface WorkoutStatsProps {
  alumno: Profile;
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({ alumno }) => {
  const [period, setPeriod] = useState<'7days' | '14days' | 'month' | 'all' | 'custom'>('7days');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'radar' | 'progress' | 'history'>('radar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sessions = useMemo(() => getSessions(alumno.id), [alumno.id]);

  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(s => {
      const ts = parseInt(s.id.split('_').pop() || '0');
      const d = ts > 1000000000000 ? new Date(ts) : (s.fecha.length === 10 ? new Date(s.fecha.replace(/-/g, '/')) : new Date(s.fecha));
      
      // Si estamos en la pestaña radar
      if (activeSection === 'radar') {
        if (selectedDate) {
          return d.toDateString() === new Date(selectedDate).toDateString();
        } else if (period === 'custom') {
          // General: limitar estrictamente a los 7 días que se muestran en la barra
          const startOfWeek = new Date(currentWeekDays[0]);
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(currentWeekDays[6]);
          endOfWeek.setHours(23, 59, 59, 999);
          return d >= startOfWeek && d <= endOfWeek;
        }
      }

      // Filtros globales para ver el pasado (excluyen el día de hoy)
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      if (period === '7days') {
        const daysAgo = new Date(startOfToday); daysAgo.setDate(startOfToday.getDate() - 7);
        return d >= daysAgo && d < startOfToday;
      }
      if (period === '14days') {
        const daysAgo = new Date(startOfToday); daysAgo.setDate(startOfToday.getDate() - 14);
        return d >= daysAgo && d < startOfToday;
      }
      if (period === 'month') {
        const monthAgo = new Date(startOfToday); monthAgo.setDate(startOfToday.getDate() - 30);
        return d >= monthAgo && d < startOfToday;
      }
      return true;
    });
  }, [sessions, period, activeSection, selectedDate, currentWeekDays]);

  // Aggregate EXERCISE COUNT (Ejercicios completados con >= 3 series) by muscle group
  const muscleVolume = useMemo(() => {
    const map: Record<string, number> = {};
    
    // Inicializar todos los músculos en 0
    ALL_MUSCLES.forEach(m => {
      map[m.toLowerCase()] = 0;
    });

    filteredSessions.forEach(s => {
      s.ejercicios.forEach(e => {
        // Un ejercicio cuenta si el usuario completó por lo menos 3 series
        if (e.series_completadas >= 3) {
          e.primary_muscles.forEach(m => {
            const key = m.toLowerCase();
            if (map[key] !== undefined) {
               map[key] += 1; // Sumamos 1 ejercicio válido
            } else {
               map[key] = 1;
            }
          });
        }
      });
    });
    return map;
  }, [filteredSessions]);

  const radarData = useMemo(() =>
    Object.entries(muscleVolume)
      // Remove slice(0, 8) to include all muscles, or we can slice to top 8 if > 0, 
      // but the user wants to see all muscles. We will show all 19 in the radar!
      .map(([m, vol]) => {
        // Encontrar el nombre original en ALL_MUSCLES para un buen capitalizado
        const originalName = ALL_MUSCLES.find(x => x.toLowerCase() === m) || (m.charAt(0).toUpperCase() + m.slice(1));
        return {
          label: originalName,
          value: Math.round(vol),
          color: getMuscleColor(m),
        };
      }),
    [muscleVolume]
  );

  const muscleRanking = useMemo(() =>
    Object.entries(muscleVolume)
      .sort((a, b) => b[1] - a[1])
      .map(([m, vol]) => ({ muscle: m, vol: Math.round(vol), color: getMuscleColor(m) })),
    [muscleVolume]
  );

  const allMuscles = useMemo(() => Object.keys(muscleVolume).sort(), [muscleVolume]);

  // Progress chart data for all muscles (vertical list with deltas)
  const muscleProgressList = useMemo(() => {
    // Sort sessions chronologically (oldest to newest) to calculate deltas
    const chronoSessions = [...sessions].reverse();

    return allMuscles.map(m => {
      // Find sessions where this muscle was trained
      const mSessions = chronoSessions.filter(s => 
        s.ejercicios.some(e => e.primary_muscles.map(pm => pm.toLowerCase()).includes(m))
      );

      // Find all unique exercises for THIS muscle
      const uniqueExerciseNames = new Set<string>();
      mSessions.forEach(s => {
        s.ejercicios.filter(e => e.primary_muscles.map(pm => pm.toLowerCase()).includes(m))
          .forEach(e => uniqueExerciseNames.add(e.nombre));
      });

      const exercises = Array.from(uniqueExerciseNames).map(exName => {
        // Find sessions for this specific exercise
        const exSessions = mSessions.filter(s => s.ejercicios.some(e => e.nombre === exName));

        const getPeso = (s: WorkoutSession) => {
          const exs = s.ejercicios.filter(e => e.nombre === exName);
          return Math.max(...exs.map(e => e.peso_real), 0);
        };

        const uniqueRecords = exSessions.reduce<{ s: WorkoutSession; peso: number }[]>((acc, s) => {
          const peso = getPeso(s);
          const lastRecord = acc[acc.length - 1];
          if (!lastRecord || lastRecord.peso !== peso) {
            acc.push({ s, peso });
          }
          return acc;
        }, []);

        const recentRecords = uniqueRecords.slice(-5);

        const history = recentRecords.map((record, idx, arr) => {
          const { s, peso } = record;
          let delta = 0;
          let timeLabel = '';

          if (idx > 0) {
            const prev = arr[idx - 1];
            delta = peso - prev.peso;
          }
          const t = parseInt(s.id.split('_').pop() || '0');
          const d = new Date(t || s.fecha);
          timeLabel = `${d.getDate()} ${d.toLocaleString('es-ES', { month: 'short' })}`;

          return { id: s.id, peso, delta, timeLabel };
        });

        // Get the ID format from the most recent entry
        const exRecord = exSessions.flatMap(s => s.ejercicios).reverse().find(e => e.nombre === exName);
        const idStr = exRecord?.exercise_id ? `Nº ${exRecord.exercise_id.replace('ex_', '')}/1324` : '';
        const lastPeso = history.length > 0 ? history[history.length - 1].peso : 0;
        
        let imgUrl = '';
        if (exRecord?.exercise_id) {
           const fullEx = dataService.getExerciseById(exRecord.exercise_id);
           if (fullEx?.image_urls?.[0]) imgUrl = fullEx.image_urls[0];
        }

        return { name: exName, idStr, imgUrl, history, lastPeso };
      }).sort((a, b) => b.lastPeso - a.lastPeso); // Sort exercises within muscle

      const originalName = ALL_MUSCLES.find(x => x.toLowerCase() === m) || (m.charAt(0).toUpperCase() + m.slice(1));

      return {
        muscle: originalName,
        color: getMuscleColor(m),
        exercises,
        lastPesoSum: exercises.reduce((sum, ex) => sum + ex.lastPeso, 0)
      };
    })
    .sort((a, b) => b.lastPesoSum - a.lastPesoSum);
  }, [sessions, allMuscles]);

  // Stats summary
  const totalSessions = sessions.length;
  const totalVolume = Math.round(sessions.reduce((a, s) => a + s.total_volumen_kg, 0));
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.duracion_min, 0) / sessions.length) : 0;

  const S = {
    page: { fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 4px' },
    subtitle: { fontSize: '12px', color: '#64748b', margin: 0 },
    statCards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' } as React.CSSProperties,
    statCard: { background: '#0f172a', border: '1px solid #1e293b', padding: '16px', textAlign: 'center' as const },
    statNum: { fontSize: '28px', fontWeight: 900, color: '#f59e0b', display: 'block' },
    statLbl: { fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const },
    tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: (active: boolean): React.CSSProperties => ({
      background: active ? '#f59e0b' : '#1e293b',
      color: active ? '#000' : '#94a3b8',
      border: `1px solid ${active ? '#f59e0b' : '#334155'}`,
      padding: '10px 16px', fontSize: '12px', fontWeight: 800,
      cursor: 'pointer', borderRadius: '0', textTransform: 'uppercase',
      letterSpacing: '0.03em', transition: 'all 0.2s',
    }),
    periodBar: { display: 'flex', gap: '6px', marginBottom: '20px' },
    periodBtn: (active: boolean): React.CSSProperties => ({
      background: active ? '#10b981' : 'transparent',
      color: active ? '#fff' : '#64748b',
      border: `1px solid ${active ? '#10b981' : '#1e293b'}`,
      padding: '6px 14px', fontSize: '11px', fontWeight: 800,
      cursor: 'pointer', borderRadius: '0',
    }),
    section: { background: '#0f172a', border: '1px solid #1e293b', padding: '6px', marginBottom: '16px' },
    sectionTitle: { fontSize: '13px', fontWeight: 900, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' },
    emptyState: { textAlign: 'center' as const, color: '#64748b', padding: '40px', fontSize: '13px' },
  };

  if (sessions.length === 0) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <h2 style={S.title}>📊 Mi Progreso</h2>
          <p style={S.subtitle}>Estadísticas generadas a partir de tus entrenamientos</p>
        </div>
        <div style={{ ...S.section, ...S.emptyState }}>
          <Flame size={48} color="#f59e0b" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: '0 0 8px' }}>
            ¡Aún no hay sesiones registradas!
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Completá tu primer entrenamiento y presioná el botón<br />
            <strong style={{ color: '#f59e0b' }}>🏁 Terminar Entrenamiento</strong> para empezar a ver tu progreso aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5); /* slate-800 translúcido */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f59e0b; /* Amarillo-Naranja */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
      `}</style>
      
      {/* Header */}
      <div style={S.header}>
        <h2 style={S.title}>📊 Mi Progreso</h2>
        <p style={S.subtitle}>{totalSessions} sesiones registradas · {totalVolume.toLocaleString()} kg volumen total</p>
      </div>

      {/* Summary cards */}
      <div style={{ ...S.statCards, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div style={S.statCard}>
          <span style={S.statNum}>{totalSessions}</span>
          <span style={S.statLbl}>Sesiones</span>
        </div>
        <div style={S.statCard}>
          <span style={{ ...S.statNum, color: '#10b981' }}>{avgDuration}</span>
          <span style={S.statLbl}>min promedio</span>
        </div>
      </div>

      {/* Period selector */}
      <div style={S.periodBar}>
        {(['7days', '14days', 'month', 'all'] as const).map(p => (
          <button 
            key={p} 
            style={S.periodBtn(period === p)} 
            onClick={() => {
              setPeriod(p);
              setSelectedDate(null); // Limpiamos el día específico si cambian el período general
            }}
          >
            {p === '7days' ? 'Últimos 7 días' : p === '14days' ? 'Últimos 14 días' : p === 'month' ? 'Este mes' : 'Todo'}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div style={S.tabs}>
        <button style={S.tab(activeSection === 'radar')} onClick={() => setActiveSection('radar')}>
          🕸️ Distribución
        </button>
        <button style={S.tab(activeSection === 'progress')} onClick={() => setActiveSection('progress')}>
          📈 Progreso
        </button>
        <button style={S.tab(activeSection === 'history')} onClick={() => setActiveSection('history')}>
          📋 Historial
        </button>
      </div>

      {/* RADAR section */}
      {activeSection === 'radar' && (
        <>
          {/* Day Sub-tabs */}
          <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #1e293b' }}>
            <button 
              onClick={() => { setSelectedDate(null); setPeriod('custom'); }}
              style={{ ...S.periodBtn(!selectedDate && period === 'custom'), flexShrink: 0 }}
            >
              General
            </button>
            {currentWeekDays.map(d => {
              const dateStr = d.toISOString();
              const isSelected = selectedDate ? new Date(selectedDate).toDateString() === d.toDateString() : false;
              const isFuture = d > new Date() && d.toDateString() !== new Date().toDateString();
              const dayName = d.toLocaleString('es-ES', { weekday: 'short' });
              
              return (
                <button 
                  key={dateStr}
                  onClick={() => { setSelectedDate(dateStr); setPeriod('custom'); }}
                  style={{ ...S.periodBtn(isSelected), flexShrink: 0, opacity: isFuture ? 0.5 : 1 }}
                >
                  {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {d.getDate()}/{d.getMonth() + 1}
                </button>
              );
            })}
          </div>

          <div style={S.section}>
            <p style={S.sectionTitle}><Activity size={16} color="#06b6d4" /> Distribución por Volumen {selectedDate && `(${new Date(selectedDate).toLocaleDateString('es-ES')})`}</p>
            {radarData.length < 3 ? (
              <div style={S.emptyState}>Completá más sesiones con distintos grupos musculares.</div>
            ) : (
              <RadarChart data={radarData} />
            )}
          </div>

          {/* Ranking */}
          {muscleRanking.length > 0 && (
            <div style={S.section}>
              <p style={S.sectionTitle}><Trophy size={16} color="#f59e0b" /> Ranking de Ejercicios Completados</p>
              {muscleRanking.map((item, i) => {
                const pct = muscleRanking[0].vol > 0 ? Math.round((item.vol / muscleRanking[0].vol) * 100) : 0;
                return (
                  <div key={item.muscle} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', width: '16px' }}>#{i + 1}</span>
                        <span style={{ width: '10px', height: '10px', background: item.color, display: 'inline-block', borderRadius: '50%' }} />
                        {item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: item.color }}>{item.vol.toLocaleString()} ejer.</span>
                    </div>
                    <div style={{ background: '#1e293b', height: '6px', borderRadius: '0' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '0', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PROGRESS section */}
      {activeSection === 'progress' && (
        <div style={S.section}>
          <p style={S.sectionTitle}><BarChart2 size={16} color="#f59e0b" /> Progreso por Músculo / Ejercicio</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {muscleProgressList.map((item, i) => (
              <MuscleProgressAccordion key={item.muscle} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* HISTORY section */}
      {activeSection === 'history' && (
        <div style={S.section}>
          <p style={S.sectionTitle}><Calendar size={16} color="#a855f7" /> Historial de Sesiones</p>
          {sessions.slice(0, 20).map(s => (
            <div key={s.id} style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>
                    {new Date(s.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                    Sem {s.semana} · {s.dia}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                  <span style={{ color: '#f59e0b' }}>⏱ {s.duracion_min} min</span>
                  <span style={{ color: '#06b6d4' }}>⚡ {s.total_volumen_kg.toLocaleString()} kg</span>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Ejercicio</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px' }}>KG</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px' }}>Series</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px' }}>Reps</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px' }}>Volumen</th>
                  </tr>
                </thead>
                <tbody>
                  {s.ejercicios.map((e, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #0f172a' }}>
                      <td style={{ padding: '6px 0', color: '#fff', fontWeight: 700 }}>
                        {e.nombre}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                          {e.primary_muscles.slice(0, 2).map(m => (
                            <span key={m} style={{ fontSize: '9px', background: getMuscleColor(m.toLowerCase()) + '22', color: getMuscleColor(m.toLowerCase()), border: `1px solid ${getMuscleColor(m.toLowerCase())}44`, padding: '1px 5px' }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 900 }}>{e.peso_real}</td>
                      <td style={{ textAlign: 'center', color: '#94a3b8' }}>{e.series_completadas}/{e.series}</td>
                      <td style={{ textAlign: 'center', color: '#94a3b8' }}>{e.repeticiones}</td>
                      <td style={{ textAlign: 'center', color: '#06b6d4', fontWeight: 800 }}>{e.volumen_kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Compact Stats for Coach Card ───────────────────────────────────────
export const WorkoutStatsCompact: React.FC<{ alumno: Profile; onExpand?: () => void }> = ({ alumno, onExpand }) => {
  const sessions = useMemo(() => getSessions(alumno.id), [alumno.id]);
  const totalSessions = sessions.length;
  const totalVolume = Math.round(sessions.reduce((a, s) => a + s.total_volumen_kg, 0));
  const lastSession = sessions[0];

  // Weekly muscle volume
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const weekSessions = sessions.filter(s => new Date(s.fecha) >= weekAgo);
  const muscleMap: Record<string, number> = {};
  weekSessions.forEach(s => s.ejercicios.forEach(e => e.primary_muscles.forEach(m => {
    muscleMap[m.toLowerCase()] = (muscleMap[m.toLowerCase()] || 0) + e.volumen_kg;
  })));
  const topMuscles = Object.entries(muscleMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (totalSessions === 0) {
    return (
      <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '12px', marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center', fontWeight: 700 }}>
          Sin sesiones registradas aún
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '12px', marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 Estadísticas
        </span>
        {onExpand && (
          <button onClick={onExpand}
            style={{ fontSize: '10px', color: '#06b6d4', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
            Ver más →
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {[
          { label: 'Sesiones', val: totalSessions, color: '#f59e0b' },
          { label: 'Vol. total', val: `${totalVolume}kg`, color: '#06b6d4' },
          { label: 'Esta semana', val: weekSessions.length, color: '#10b981' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center', background: '#0f172a', padding: '8px 4px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '16px', fontWeight: 900, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
          </div>
        ))}
      </div>
      {topMuscles.length > 0 && (
        <div>
          <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Más trabajado esta semana
          </div>
          {topMuscles.map(([m, vol]) => {
            const pct = Math.round((vol / topMuscles[0][1]) * 100);
            return (
              <div key={m} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{m}</span>
                  <span style={{ fontSize: '10px', color: getMuscleColor(m), fontWeight: 800 }}>{Math.round(vol)} kg</span>
                </div>
                <div style={{ background: '#1e293b', height: '4px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: getMuscleColor(m), transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {lastSession && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#0f172a', border: '1px solid #1e293b', fontSize: '10px', color: '#64748b' }}>
          <CheckCircle2 size={10} color="#10b981" style={{ display: 'inline', marginRight: '4px' }} />
          Última sesión: <span style={{ color: '#fff', fontWeight: 700 }}>
            {new Date(lastSession.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {lastSession.dia}
          </span>
          <span style={{ marginLeft: '8px', color: '#f59e0b' }}>⚡ {lastSession.total_volumen_kg} kg</span>
        </div>
      )}
    </div>
  );
};
