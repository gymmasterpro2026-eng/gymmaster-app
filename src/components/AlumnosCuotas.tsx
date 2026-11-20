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
    return (
      <div 
        key={alumno.id} 
        className={`titan-armor-card titan-armor-card-interactive ${isExpired ? 'titan-armor-card-danger' : 'titan-armor-card-warn'}`}
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px' }}>{alumno.full_name}</h3>
          <span className={isExpired ? 'titan-badge-danger' : 'titan-badge-copper'} style={{ fontSize: '10px', padding: '4px 9px' }}>
            {isExpired ? 'VENCIDO' : `VENCE EN ${days} DÍAS`}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: isExpired ? '#FECACA' : '#E2E8F0' }}>
          <span><strong style={{ color: '#94A3B8' }}>Email:</strong> {alumno.email}</span>
          <span><strong style={{ color: '#94A3B8' }}>Teléfono:</strong> {alumno.phone || 'N/A'}</span>
        </div>

        {/* Plan Validity Box */}
        <div className="titan-inset-well" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Vencimiento Plan</span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 900, color: !isExpired ? '#6EE7B7' : '#FCA5A5', fontFamily: 'monospace' }}>
                {new Date(alumno.plan_active_until).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <input
                type="number"
                min="1"
                className="titan-input"
                value={renewDays[alumno.id] === undefined ? 30 : renewDays[alumno.id]}
                onChange={(e) => setRenewDays(prev => ({ ...prev, [alumno.id]: parseInt(e.target.value) || 0 }))}
                style={{ width: '58px', padding: '6px 4px', fontSize: '16px', fontWeight: 900, textAlign: 'center', borderRight: 'none' }}
                title="Días a sumar"
              />
              <button className="titan-btn-armor-copper" onClick={() => {
                const addDays = renewDays[alumno.id] === undefined ? 30 : renewDays[alumno.id];
                if (addDays > 0) handleRenewPlan(alumno.id, addDays);
              }} style={{ padding: '6px 12px', fontSize: '11px' }}>
                <RotateCcw size={12} /> Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div className="titan-armor-banner" style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '4px 10px' }}>CONTROL DE MEMBRESÍAS</span>
          <h1 className="titan-section-title" style={{ fontSize: '24px', margin: '8px 0 4px' }}>Alumnos Cuotas & Vencimientos</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>Monitoreo rápido de planes próximos a vencer y cuotas vencidas</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="titan-inset-well" style={{ padding: '10px 18px', textAlign: 'center' }}>
            <span style={{ fontSize: '9px', fontFamily: "'Chakra Petch', sans-serif", color: '#FFBD4A', display: 'block', letterSpacing: '0.08em' }}>POR VENCER</span>
            <strong style={{ fontSize: '20px', fontFamily: "'Chakra Petch', sans-serif", color: '#FFFFFF' }}>{expiringAlumnos.length}</strong>
          </div>
          <div className="titan-inset-well" style={{ padding: '10px 18px', textAlign: 'center', borderColor: 'rgba(239,68,68,0.4)' }}>
            <span style={{ fontSize: '9px', fontFamily: "'Chakra Petch', sans-serif", color: '#FCA5A5', display: 'block', letterSpacing: '0.08em' }}>VENCIDOS</span>
            <strong style={{ fontSize: '20px', fontFamily: "'Chakra Petch', sans-serif", color: '#F87171' }}>{expiredAlumnos.length}</strong>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="titan-section-title" style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#FFBD4A' }}>⚠️</span> Próximos a Vencer (4 días o menos)
        </h2>
        {expiringAlumnos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {expiringAlumnos.map(a => renderAlumnoCard(a, false))}
          </div>
        ) : (
          <div className="titan-inset-well" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No hay alumnos próximos a vencer.
          </div>
        )}
      </div>

      <div>
        <h2 className="titan-section-title" style={{ color: '#FCA5A5', fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#F87171' }}>🛑</span> Cuotas Vencidas
        </h2>
        {expiredAlumnos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {expiredAlumnos.map(a => renderAlumnoCard(a, true))}
          </div>
        ) : (
          <div className="titan-inset-well" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No hay alumnos con cuota vencida.
          </div>
        )}
      </div>

    </div>
  );
};
