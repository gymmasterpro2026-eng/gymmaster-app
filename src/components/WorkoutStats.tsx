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

// Iconos anatómicos minimalistas dentro de hexágono cobre (como Imagen 1)
function renderMuscleGlyph(label: string) {
  const key = label.toUpperCase();
  if (key.includes('PECTORAL')) {
    return (
      <g stroke="#E8893A" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-7,-3 Q-3,-5 0,-1 Q3,-5 7,-3 L6,4 Q2,6 0,2 Q-2,6 -6,4 Z" fill="rgba(232,137,58,0.28)" />
        <line x1="0" y1="-2" x2="0" y2="5" />
      </g>
    );
  }
  if (key.includes('BÍCEPS') || key.includes('BICEPS')) {
    return (
      <g stroke="#E8893A" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-6,4 C-6,-1 -3,-5 2,-4 C4,-4 5,-2 3,0 C1,1 0,0 1,-2 M-5,4 L5,4 C6,4 7,1 5,-1" fill="rgba(232,137,58,0.22)" />
      </g>
    );
  }
  if (key.includes('CUÁDRICEPS') || key.includes('CUADRICEPS')) {
    return (
      <g stroke="#E8893A" strokeWidth="1.35" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-4,-6 L-1,-6 L-1,6 L-4,6 C-5,2 -5,-2 -4,-6 Z" fill="rgba(232,137,58,0.25)" />
        <path d="M1,-6 L4,-6 C5,-2 5,2 4,6 L1,6 Z" fill="rgba(232,137,58,0.25)" />
      </g>
    );
  }
  if (key.includes('TRÍCEPS') || key.includes('TRICEPS')) {
    return (
      <g stroke="#E8893A" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-6,4 C-5,0 -2,-5 3,-4 C5,-3 6,-1 4,1 L6,4 L-6,4 Z" fill="rgba(232,137,58,0.25)" />
        <path d="M-2,-1 L2,-3" />
      </g>
    );
  }
  if (key.includes('DORSAL')) {
    return (
      <g stroke="#E8893A" strokeWidth="1.35" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-7,-5 L-2,-2 L-2,6 L-4,6 Z" fill="rgba(232,137,58,0.28)" />
        <path d="M7,-5 L2,-2 L2,6 L4,6 Z" fill="rgba(232,137,58,0.28)" />
        <line x1="0" y1="-5" x2="0" y2="6" />
      </g>
    );
  }
  // Abdominales
  return (
    <g stroke="#E8893A" strokeWidth="1.2" fill="rgba(232,137,58,0.22)">
      <rect x="-4.5" y="-5.5" width="3.5" height="3" rx="0.6" />
      <rect x="1" y="-5.5" width="3.5" height="3" rx="0.6" />
      <rect x="-4.5" y="-1.5" width="3.5" height="3" rx="0.6" />
      <rect x="1" y="-1.5" width="3.5" height="3" rx="0.6" />
      <rect x="-4.5" y="2.5" width="3.5" height="3" rx="0.6" />
      <rect x="1" y="2.5" width="3.5" height="3" rx="0.6" />
    </g>
  );
}

// ── Radar Chart (SVG pure — Titan Hexagonal Neon Look) ─────────────────
const RadarChart = ({
  data,
  secondaryData,
  showHexIcons = true,
}: {
  data: { label: string; value: number; color: string }[];
  secondaryData?: number[];
  showHexIcons?: boolean;
}) => {
  const [rotation, setRotation] = useState(0);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length < 3) return (
    <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px', fontSize: '13px' }}>
      Necesitás al menos 3 grupos musculares para el radar. Completá más sesiones.
    </div>
  );

  const isSixMode = showHexIcons && data.length === 6;
  const cx = 320, cy = 205, r = isSixMode ? 128 : 132;
  const n = data.length;
  const secMax = secondaryData && secondaryData.length === n ? Math.max(...secondaryData, 0) : 0;
  const max = Math.max(...data.map(d => d.value), secMax, 1);

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
    const dist = isSixMode ? r + 28 : r + 26;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), angle };
  };

  // Grid rings (4 anillos como en Imagen 1)
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPaths = rings.map(pct => {
    const pts = data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + pct * r * Math.cos(angle)},${cy + pct * r * Math.sin(angle)}`;
    });
    return pts.join(' ');
  });

  // Polígono completo sobre los N ejes (si algunos valen 0 quedan en el centro o cerca del centro formando silueta cerrada fiel)
  const allPoints = data.map((d, i) => getPoint(i, d.value));
  const hasAnyActive = data.some(d => d.value > 0);
  const polygon = hasAnyActive ? allPoints.map(p => `${p.x},${p.y}`).join(' ') : '';
  const activeDataPoints = data
    .map((d, i) => (d.value > 0 ? getPoint(i, d.value) : null))
    .filter((p): p is { x: number; y: number } => p !== null);

  const hasSecondary = Boolean(secondaryData && secondaryData.length === n && secondaryData.some(v => v > 0));
  const secondaryPolygon = hasSecondary
    ? secondaryData!.map((v, i) => {
        const pt = getPoint(i, v);
        return `${pt.x},${pt.y}`;
      }).join(' ')
    : '';

  const themeColor = '#FFBD4A';
  const hexBadgePts = '0,-14 12.1,-7 12.1,7 0,14 -12.1,7 -12.1,-7';

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox="0 0 640 410"
      style={{ display: 'block', margin: '0 auto', maxWidth: '720px', height: 'auto', cursor: 'grab', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <defs>
        <radialGradient id="titanRadarGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FFBE55" stopOpacity="0.46" />
          <stop offset="100%" stopColor="#C95812" stopOpacity="0.22" />
        </radialGradient>
        <radialGradient id="titanRadarSecondaryGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#D97724" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7C2D12" stopOpacity="0.1" />
        </radialGradient>
        <filter id="titanGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="titanTechGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
        </pattern>
      </defs>
      <style>{`
        .muscle-label {
          transition: fill 0.2s ease;
          cursor: pointer;
          pointer-events: bounding-box;
        }
        @media (hover: hover) {
          .muscle-label:hover {
            fill: #FFBD4A !important;
          }
        }
      `}</style>

      {/* Fondo micro-cuadrícula detrás del radar */}
      <rect x={cx - r - 60} y={cy - r - 20} width={(r + 60) * 2} height={(r + 20) * 2} fill="url(#titanTechGrid)" />

      {/* Grupo principal */}
      <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        {/* Anillos hexagonales */}
        {ringPaths.map((pts, i) => (
          <polygon
            key={`ring-${i}`}
            points={pts}
            fill="none"
            stroke={i === rings.length - 1 ? 'rgba(217, 119, 36, 0.42)' : 'rgba(217, 119, 36, 0.24)'}
            strokeWidth={i === rings.length - 1 ? '1.2' : '1'}
          />
        ))}

        {/* Radios desde el centro */}
        {data.map((_, i) => {
          const outer = getPoint(i, max);
          return (
            <line
              key={`spoke-${i}`}
              x1={cx} y1={cy}
              x2={outer.x} y2={outer.y}
              stroke="rgba(217, 119, 36, 0.24)"
              strokeWidth="1"
            />
          );
        })}

        {/* Capa secundaria comparativa (doble malla como Imagen 1) */}
        {secondaryPolygon && (
          <polygon
            points={secondaryPolygon}
            fill="url(#titanRadarSecondaryGrad)"
            stroke="#C96F28"
            strokeOpacity="0.65"
            strokeWidth="1.5"
          />
        )}

        {/* Polígono principal neón naranja/ámbar */}
        {polygon && (
          <polygon
            points={polygon}
            fill="url(#titanRadarGrad)"
            stroke={themeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#titanGlow)"
          />
        )}

        {/* Vértices */}
        {activeDataPoints.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#FFBD4A"
            stroke="#0E1217"
            strokeWidth="1.2"
          />
        ))}

        {/* Etiquetas e Insignias Hexagonales */}
        {data.map((d, i) => {
          const lp = getLabelPoint(i);
          if (isSixMode) {
            const isTop = i === 0;
            const isBottom = i === 3;
            const isRight = i === 1 || i === 2;
            const hexX = isTop || isBottom ? lp.x - 42 : isRight ? lp.x + 12 : lp.x - 12;
            const hexY = isTop ? lp.y - 2 : isBottom ? lp.y + 4 : lp.y;
            const textX = isTop || isBottom ? hexX + 20 : isRight ? hexX + 20 : hexX - 20;
            const textAnchor: 'start' | 'end' = isRight || isTop || isBottom ? 'start' : 'end';

            return (
              <g
                key={`label-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLabelIndex(selectedLabelIndex === i ? null : i);
                }}
                style={{
                  cursor: 'pointer',
                  transformOrigin: `${lp.x}px ${lp.y}px`,
                  transform: `rotate(${-rotation}deg)`,
                }}
              >
                <g transform={`translate(${hexX}, ${hexY})`}>
                  <polygon
                    points={hexBadgePts}
                    fill="#14100C"
                    stroke="#D97724"
                    strokeWidth="1.6"
                  />
                  {renderMuscleGlyph(d.label)}
                </g>
                <text
                  x={textX}
                  y={hexY + 1}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  className="muscle-label uppercase"
                  fontSize="13.5"
                  fontWeight="700"
                  style={{
                    fontFamily: "'Chakra Petch', sans-serif",
                    letterSpacing: '0.06em',
                    fill: selectedLabelIndex === i ? '#FFBD4A' : '#E2E8F0',
                  }}
                >
                  {d.label}
                </text>
              </g>
            );
          }

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
              className="muscle-label uppercase tracking-wider"
              fontSize={selectedLabelIndex === i ? "18" : "9.5"}
              fontWeight="700"
              style={{
                fontFamily: "'Chakra Petch', 'Inter', sans-serif",
                letterSpacing: '0.06em',
                transformOrigin: `${lp.x}px ${lp.y}px`,
                transform: `rotate(${-rotation}deg)`,
                fill: selectedLabelIndex === i ? '#FFBD4A' : d.value === 0 ? '#64748b' : '#E2E8F0'
              }}
            >
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
    <div className="titan-armor-card" style={{ padding: '16px' }}>
      <button 
        type="button"
        className="titan-btn-armor-steel"
        style={{ 
          width: '100%',
          display: 'flex', alignItems: 'center', gap: '8px', 
          justifyContent: 'flex-start',
          marginBottom: isOpen ? '14px' : '0', 
          padding: '12px 14px',
          borderLeft: `3px solid ${item.color}`,
          textAlign: 'left',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{index + 1}</span>
        <span style={{ width: '9px', height: '9px', background: item.color, display: 'inline-block', transform: 'rotate(45deg)' }} />
        <span style={{ fontSize: '13px', color: '#fff', textTransform: 'uppercase', flex: 1 }}>
          {item.muscle}
        </span>
        <span style={{ color: '#FFBD4A', fontSize: '10px' }}>{isOpen ? 'Ocultar ▲' : 'Mostrar ▼'}</span>
      </button>
      
      {isOpen && (
        <div className="titan-inset-well" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
          {item.exercises.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
              Aún no hay sesiones registradas para este grupo muscular.
            </div>
          ) : (
            item.exercises.map((ex: any) => {
              const maxPeso = Math.max(...ex.history.map((h: any) => h.peso), 1);
              return (
                <div key={ex.name} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '16px' }}>
                   {/* Exercise Header */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="titan-section-title" style={{ fontSize: '13px' }}>{ex.name}</span>
                      {ex.idStr && (
                        <span className="titan-badge-copper" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {ex.idStr}
                        </span>
                      )}
                   </div>

                   {/* Exercise History (Mini Bar Chart) */}
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                     <div className="custom-scrollbar" style={{ display: 'flex', gap: '12px', paddingLeft: '12px', borderLeft: `2px solid ${item.color}55`, overflowX: 'auto', flex: 1 }}>
                       {ex.history.map((h: any, idx: number) => {
                          const heightPct = Math.max(10, (h.peso / maxPeso) * 100);
                          const isFirst = idx === 0;

                          return (
                            <div key={h.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
                              {/* Delta text */}
                              <span style={{ 
                                fontSize: '10px', fontWeight: 900, 
                                color: h.delta > 0 ? '#6EE7B7' : h.delta < 0 ? '#FCA5A5' : 'transparent',
                                height: '14px'
                              }}>
                                {!isFirst && h.delta !== 0 ? (h.delta > 0 ? `+${h.delta}` : h.delta) : ''}
                              </span>
                              
                              {/* Vertical Bar */}
                              <div style={{ width: '12px', height: '35px', background: '#141922', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: `${heightPct}%`, background: isFirst ? '#47505E' : item.color, transition: 'height 0.5s' }} />
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
                       <div className="gm-gif-wrap" style={{ width: '72px', height: '72px', background: '#000', padding: '4px', border: `1px solid ${item.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <img 
                           src={fixImageUrl(ex.imgUrl)} 
                           alt={ex.name} 
                           className="gm-exercise-gif"
                           style={{ 
                             width: '100%', height: '100%', objectFit: 'contain', 
                             background: 'transparent', display: 'block'
                           }} 
                         />
                       </div>
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

const SIX_GROUP_BUCKETS: { label: string; keys: string[] }[] = [
  { label: 'PECTORALES', keys: ['pectorals', 'pectorales', 'pecho (pectorales)', 'pecho', 'chest', 'serrato mayor'] },
  { label: 'BÍCEPS', keys: ['bíceps', 'biceps', 'bicep', 'antebrazos', 'forearms'] },
  { label: 'CUÁDRICEPS', keys: ['cuádriceps', 'quadriceps', 'quads', 'piernas', 'glúteos', 'glutes', 'isquiotibiales (femorales)', 'isquiotibiales', 'gemelos (pantorrillas)', 'gemelos', 'abductores', 'aductores'] },
  { label: 'TRÍCEPS', keys: ['tríceps', 'triceps', 'tricep', 'delts', 'hombros (deltoides)', 'hombros', 'shoulders', 'deltoides'] },
  { label: 'DORSALES', keys: ['dorsales (espalda)', 'dorsales', 'espalda alta', 'espalda', 'lats', 'back', 'trapecios', 'levator scapulae', 'spine'] },
  { label: 'ABDOMINALES', keys: ['abdominales', 'abs', 'core', 'oblicuos', 'cardiovascular system'] },
];

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({ alumno }) => {
  const [period, setPeriod] = useState<'7days' | '30days' | 'month' | 'all' | 'custom'>('7days');
  const [radarMode, setRadarMode] = useState<'6' | '19'>('6');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'radar' | 'progress' | 'history'>('radar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [sessions, setSessions] = useState<WorkoutSession[]>(() => getSessions(alumno.id));

  useEffect(() => {
    setSessions(getSessions(alumno.id));
    const unsub = dataService.subscribe(() => {
      setSessions(getSessions(alumno.id));
    });
    return () => unsub();
  }, [alumno.id]);

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
      
      // Si estamos en la pestaña radar y seleccionó un día puntual o 'custom' semana actual
      if (activeSection === 'radar') {
        if (selectedDate) {
          return d.toDateString() === new Date(selectedDate).toDateString();
        } else if (period === 'custom') {
          const startOfWeek = new Date(currentWeekDays[0]);
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(currentWeekDays[6]);
          endOfWeek.setHours(23, 59, 59, 999);
          return d >= startOfWeek && d <= endOfWeek;
        }
      }

      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      if (period === '7days') {
        const daysAgo = new Date(now); daysAgo.setHours(0, 0, 0, 0); daysAgo.setDate(daysAgo.getDate() - 6);
        return d >= daysAgo && d <= endOfToday;
      }
      if (period === '30days') {
        const daysAgo = new Date(now); daysAgo.setHours(0, 0, 0, 0); daysAgo.setDate(daysAgo.getDate() - 29);
        return d >= daysAgo && d <= endOfToday;
      }
      if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return d >= startOfMonth && d <= endOfToday;
      }
      return true;
    });
  }, [sessions, period, activeSection, selectedDate, currentWeekDays]);

  // Aggregate EXERCISE COUNT (Ejercicios completados con >= 3 series) by muscle group
  const muscleVolume = useMemo(() => {
    const map: Record<string, number> = {};
    ALL_MUSCLES.forEach(m => {
      map[m.toLowerCase()] = 0;
    });

    filteredSessions.forEach(s => {
      s.ejercicios.forEach(e => {
        if (e.series_completadas >= 3) {
          e.primary_muscles.forEach(m => {
            const key = m.toLowerCase();
            map[key] = (map[key] || 0) + 1;
          });
        }
      });
    });
    return map;
  }, [filteredSessions]);

  // Malla secundaria histórica (todas las sesiones) para comparación visual de doble capa
  const allTimeSixBuckets = useMemo(() => {
    const rawMap: Record<string, number> = {};
    sessions.forEach(s => {
      s.ejercicios.forEach(e => {
        if (e.series_completadas >= 3) {
          e.primary_muscles.forEach(m => {
            const key = m.toLowerCase();
            rawMap[key] = (rawMap[key] || 0) + 1;
          });
        }
      });
    });
    return SIX_GROUP_BUCKETS.map(b =>
      b.keys.reduce((acc, k) => acc + (rawMap[k] || 0), 0)
    );
  }, [sessions]);

  const radarData = useMemo(() => {
    if (radarMode === '6') {
      return SIX_GROUP_BUCKETS.map((b) => {
        const val = b.keys.reduce((acc, k) => acc + (muscleVolume[k] || 0), 0);
        return {
          label: b.label,
          value: Math.round(val),
          color: '#FFBD4A',
        };
      });
    }
    return Object.entries(muscleVolume).map(([m, vol]) => {
      const originalName = ALL_MUSCLES.find(x => x.toLowerCase() === m) || (m.charAt(0).toUpperCase() + m.slice(1));
      return {
        label: originalName,
        value: Math.round(vol),
        color: getMuscleColor(m),
      };
    });
  }, [muscleVolume, radarMode]);

  const muscleRanking = useMemo(() =>
    Object.entries(muscleVolume)
      .sort((a, b) => b[1] - a[1])
      .map(([m, vol]) => ({ muscle: m, vol: Math.round(vol), color: getMuscleColor(m) })),
    [muscleVolume]
  );

  const allMuscles = useMemo(() => Object.keys(muscleVolume).sort(), [muscleVolume]);

  // Progress chart data for all muscles (vertical list with deltas) — solo calcular cuando la pestaña Progreso está activa
  const muscleProgressList = useMemo(() => {
    if (activeSection !== 'progress') return [];
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

        // Get the ID format from the most recent entry (O(1) via indexed catalog map)
        const exRecord = exSessions.flatMap(s => s.ejercicios).reverse().find(e => e.nombre === exName);
        let idStr = '';
        if (exRecord?.exercise_id) {
          const catPos = dataService.getExerciseCatalogPosition(exRecord.exercise_id);
          idStr = catPos ? `Nº ${catPos}` : `Nº ${exRecord.exercise_id}`;
        }
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
  }, [sessions, allMuscles, activeSection]);

  // Stats summary
  const totalSessions = sessions.length;
  const totalVolume = Math.round(sessions.reduce((a, s) => a + s.total_volumen_kg, 0));
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.duracion_min, 0) / sessions.length) : 0;

  const S = {
    page: { fontFamily: "'Inter', sans-serif", color: '#E2E8F0', maxWidth: '1040px', margin: '0 auto', padding: '4px 0 32px' },
    section: {
      padding: '24px 28px',
      marginBottom: '20px',
    },
    sectionTitle: { fontSize: '18px', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#FFFFFF', margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px' },
    emptyState: { textAlign: 'center' as const, color: '#94A3B8', padding: '40px', fontSize: '13px' },
  };

  if (sessions.length === 0) {
    return (
      <div style={S.page}>
        <div className="titan-tab-strip">
          <button className="titan-tab titan-tab-active">DISTRIBUCIÓN</button>
          <button className="titan-tab" style={{ opacity: 0.6 }}>PROGRESO</button>
          <button className="titan-tab" style={{ opacity: 0.6 }}>HISTORIAL</button>
        </div>
        <div className="titan-panel" style={{ ...S.section, ...S.emptyState }}>
          <Flame size={44} color="#D57A30" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 className="font-titan" style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase' }}>
            Aún no hay sesiones registradas
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
            Completa tu primer entrenamiento y presiona{' '}
            <strong style={{ color: '#D57A30' }}>Terminar Entrenamiento</strong> para ver tu progreso aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0B0E13; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C96F28; border-radius: 2px; }
      `}</style>

      {/* Fila superior única: Filtros de tiempo en pastillas metálicas + resumen discreto */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          {(['7days', '30days', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              className={`titan-filter-pill ${period === p && !selectedDate ? 'active' : ''}`}
              onClick={() => {
                setPeriod(p);
                setSelectedDate(null);
              }}
            >
              {p === '7days' ? 'Últimos 7 días' : p === '30days' ? 'Últimos 30 días' : p === 'month' ? 'Este mes' : 'Todo'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", color: '#94A3B8', letterSpacing: '0.06em' }}>
          <span><strong style={{ color: '#D67B35' }}>{totalSessions}</strong> SESIONES</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span><strong style={{ color: '#D67B35' }}>{avgDuration}</strong> MIN PROM</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span><strong style={{ color: '#E2E8F0' }}>{totalVolume.toLocaleString()}</strong> KG</span>
        </div>
      </div>

      {/* Barra de 3 Pestañas soldadas directamente al borde cobre del panel */}
      <div className="titan-tab-strip">
        <button
          className={`titan-tab ${activeSection === 'radar' ? 'titan-tab-active' : ''}`}
          onClick={() => setActiveSection('radar')}
        >
          DISTRIBUCIÓN
        </button>
        <button
          className={`titan-tab ${activeSection === 'progress' ? 'titan-tab-active' : ''}`}
          onClick={() => setActiveSection('progress')}
        >
          PROGRESO
        </button>
        <button
          className={`titan-tab ${activeSection === 'history' ? 'titan-tab-active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          HISTORIAL
        </button>
      </div>

      {/* RADAR section */}
      {activeSection === 'radar' && (
        <>
          <div className="titan-panel" style={S.section}>
            <div style={S.sectionTitle}>
              <span>
                Distribución por Volumen{selectedDate ? ` · ${new Date(selectedDate).toLocaleDateString('es-ES')}` : ''}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  aria-label="Filtrar por día de la semana"
                  value={selectedDate || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) {
                      setSelectedDate(null);
                      if (period === 'custom') setPeriod('7days');
                    } else {
                      setSelectedDate(v);
                      setPeriod('custom');
                    }
                  }}
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontWeight: 600,
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                  className="titan-select"
                >
                  <option value="">Todos los días del rango</option>
                  {currentWeekDays.map(d => {
                    const dayName = d.toLocaleString('es-ES', { weekday: 'short' });
                    return (
                      <option key={d.toISOString()} value={d.toISOString()}>
                        {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {d.getDate()}/{d.getMonth() + 1}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => setRadarMode(m => (m === '6' ? '19' : '6'))}
                  className="titan-btn-armor-steel"
                  style={{ padding: '5px 12px', fontSize: '10px', color: '#FFBD4A' }}
                >
                  {radarMode === '6' ? '6 Grupos ▾' : '19 Músculos ▾'}
                </button>
              </div>
            </div>

            <RadarChart
              data={radarData}
              secondaryData={radarMode === '6' ? allTimeSixBuckets : undefined}
              showHexIcons={radarMode === '6'}
            />
          </div>

          {/* Ranking */}
          {muscleRanking.length > 0 && (
            <div className="titan-armor-card" style={{ padding: '22px 24px', marginBottom: '18px' }}>
              <p className="titan-section-title" style={{ fontSize: '14px', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={15} color="#D57A30" /> Ranking de Ejercicios Completados
              </p>
              {muscleRanking.map((item, i) => {
                const pct = muscleRanking[0].vol > 0 ? Math.round((item.vol / muscleRanking[0].vol) * 100) : 0;
                return (
                  <div key={item.muscle} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace', width: '16px' }}>#{i + 1}</span>
                        <span style={{ width: '8px', height: '8px', background: '#D57A30', display: 'inline-block', transform: 'rotate(45deg)' }} />
                        {item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#FFBD4A' }}>{item.vol.toLocaleString()} ejer.</span>
                    </div>
                    <div className="titan-inset-well" style={{ height: '7px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #B55B1E, #FFBD4A)', transition: 'width 0.5s' }} />
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
        <div className="titan-panel" style={S.section}>
          <p className="titan-section-title" style={{ fontSize: '16px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="#D57A30" /> Progreso por Músculo / Ejercicio
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {muscleProgressList.map((item, i) => (
              <MuscleProgressAccordion key={item.muscle} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* HISTORY section */}
      {activeSection === 'history' && (
        <div className="titan-panel" style={S.section}>
          <p className="titan-section-title" style={{ fontSize: '16px', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#D57A30" /> Historial de Sesiones
          </p>
          {sessions.slice(0, 20).map(s => (
            <div key={s.id} className="titan-inset-well" style={{ padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                    {new Date(s.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>
                    Sem {s.semana} · {s.dia}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>
                  <span className="titan-badge-copper" style={{ padding: '2px 8px' }}>⏱ {s.duracion_min} min</span>
                  <span className="titan-badge-steel" style={{ padding: '2px 8px', color: '#FFBD4A' }}>⚡ {s.total_volumen_kg.toLocaleString()} kg</span>
                </div>
              </div>
              <table className="titan-table" style={{ fontSize: '11px' }}>
                <thead>
                  <tr style={{ fontSize: '10px' }}>
                    <th style={{ textAlign: 'left', padding: '7px 10px' }}>Ejercicio</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px' }}>KG</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px' }}>Series</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px' }}>Reps</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px' }}>Volumen</th>
                  </tr>
                </thead>
                <tbody>
                  {s.ejercicios.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 10px', color: '#fff', fontWeight: 700 }}>
                        {e.nombre}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                          {e.primary_muscles.slice(0, 2).map(m => (
                            <span key={m} style={{ fontSize: '9px', background: getMuscleColor(m.toLowerCase()) + '22', color: getMuscleColor(m.toLowerCase()), border: `1px solid ${getMuscleColor(m.toLowerCase())}44`, padding: '1px 5px' }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: '#FFBD4A', fontWeight: 900 }}>{e.peso_real}</td>
                      <td style={{ textAlign: 'center', color: '#CBD5E1' }}>{e.series_completadas}/{e.series}</td>
                      <td style={{ textAlign: 'center', color: '#CBD5E1' }}>{e.repeticiones}</td>
                      <td style={{ textAlign: 'center', color: '#D57A30', fontWeight: 800 }}>{e.volumen_kg}</td>
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
      <div className="titan-inset-well" style={{ padding: '12px', marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, textAlign: 'center', fontWeight: 700 }}>
          Sin sesiones registradas aún
        </p>
      </div>
    );
  }

  return (
    <div className="titan-inset-well" style={{ padding: '12px', marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 Estadísticas
        </span>
        {onExpand && (
          <button onClick={onExpand} className="titan-btn-armor-steel"
            style={{ fontSize: '10px', padding: '3px 8px', color: '#FFBD4A' }}>
            Ver más →
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {[
          { label: 'Sesiones', val: totalSessions, color: '#FFBD4A' },
          { label: 'Vol. total', val: `${totalVolume}kg`, color: '#D57A30' },
          { label: 'Esta semana', val: weekSessions.length, color: '#6EE7B7' },
        ].map(item => (
          <div key={item.label} className="titan-inset-well" style={{ textAlign: 'center', padding: '8px 4px', borderTop: `2px solid ${item.color}` }}>
            <div style={{ fontSize: '15px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
          </div>
        ))}
      </div>
      {topMuscles.length > 0 && (
        <div>
          <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
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
                <div style={{ background: '#141922', height: '4px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: getMuscleColor(m), transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {lastSession && (
        <div className="titan-inset-well" style={{ marginTop: '10px', padding: '8px', fontSize: '10px', color: '#94A3B8' }}>
          <CheckCircle2 size={10} color="#6EE7B7" style={{ display: 'inline', marginRight: '4px' }} />
          Última sesión: <span style={{ color: '#fff', fontWeight: 700 }}>
            {new Date(lastSession.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {lastSession.dia}
          </span>
          <span style={{ marginLeft: '8px', color: '#FFBD4A' }}>⚡ {lastSession.total_volumen_kg} kg</span>
        </div>
      )}
    </div>
  );
};
