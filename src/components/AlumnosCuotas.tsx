import React, { useState } from 'react';
import { Profile } from '../types';
import { RotateCcw } from 'lucide-react';
import { dataService } from '../services/dataService';

interface AlumnosCuotasProps {
  alumnos: Profile[];
  onRefreshData?: () => void;
}

export const AlumnosCuotas: React.FC<AlumnosCuotasProps> = ({ alumnos, onRefreshData }) => {
  const [renewDays, setRenewDays] = useState<Record<string, number>>({});
  
  const handleRenewPlan = (alumnoId: string, daysToAdd: number) => {
    const newDate = new Date(Date.now() + daysToAdd * 86400000).toISOString();
    dataService.updatePlanValidity(alumnoId, newDate);
    if (onRefreshData) onRefreshData();
  };
  const now = new Date();
  
  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const activeUntil = new Date(dateString);
    const diffTime = activeUntil.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiringAlumnos = alumnos.filter(a => {
    const days = getDaysRemaining(a.plan_active_until);
    return days > 0 && days <= 4;
  }).sort((a, b) => getDaysRemaining(a.plan_active_until) - getDaysRemaining(b.plan_active_until));

  const expiredAlumnos = alumnos.filter(a => {
    const days = getDaysRemaining(a.plan_active_until);
    return days <= 0;
  }).sort((a, b) => getDaysRemaining(a.plan_active_until) - getDaysRemaining(b.plan_active_until));

  const renderAlumnoCard = (alumno: Profile, isExpired: boolean) => {
    const days = getDaysRemaining(alumno.plan_active_until);
    const bgColor = isExpired ? '#ef4444' : '#f59e0b';
    const textColor = isExpired ? '#ffffff' : '#000000';
    const badgeBgColor = isExpired ? '#ffffff' : '#000000';
    const badgeTextColor = isExpired ? '#ef4444' : '#f59e0b';
    
    return (
      <div 
        key={alumno.id} 
        style={{
          background: bgColor,
          border: 'none',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: textColor, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>{alumno.full_name}</h3>
          <span style={{ 
            color: badgeTextColor, 
            backgroundColor: badgeBgColor,
            fontSize: '12px', 
            fontWeight: 900, 
            padding: '4px 8px', 
            borderRadius: '4px'
          }}>
            {isExpired ? 'VENCIDO' : `VENCE EN ${days} DÍAS`}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: textColor }}>
          <span><strong style={{ opacity: 0.8 }}>Email:</strong> {alumno.email}</span>
          <span><strong style={{ opacity: 0.8 }}>Teléfono:</strong> {alumno.phone || 'N/A'}</span>
        </div>

        {/* Plan Validity Box */}
        <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>Vencimiento Plan</span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 900, color: !isExpired ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.4)' }}>
              <input
                type="number"
                min="1"
                value={renewDays[alumno.id] === undefined ? 30 : renewDays[alumno.id]}
                onChange={(e) => setRenewDays(prev => ({ ...prev, [alumno.id]: parseInt(e.target.value) || 0 }))}
                style={{ width: '60px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '6px 2px 6px 8px', fontSize: '18px', fontWeight: 900, textAlign: 'center', outline: 'none' }}
                title="Días a sumar"
              />
              <button onClick={() => {
                const addDays = renewDays[alumno.id] === undefined ? 30 : renewDays[alumno.id];
                if (addDays > 0) handleRenewPlan(alumno.id, addDays);
              }} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={12} /> Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f59e0b' }}>⚠️</span> Próximos a Vencer (4 días o menos)
        </h2>
        {expiringAlumnos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {expiringAlumnos.map(a => renderAlumnoCard(a, false))}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
            No hay alumnos próximos a vencer.
          </div>
        )}
      </div>

      <div>
        <h2 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ef4444' }}>🛑</span> Cuotas Vencidas
        </h2>
        {expiredAlumnos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {expiredAlumnos.map(a => renderAlumnoCard(a, true))}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
            No hay alumnos con cuota vencida.
          </div>
        )}
      </div>

    </div>
  );
};
