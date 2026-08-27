import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, Search, User } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Profile, Cobro } from '../types';

interface CobrosMesProps {
  onRefreshData: () => void;
  coachId?: string;
}

export const CobrosMes: React.FC<CobrosMesProps> = ({ onRefreshData, coachId }) => {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  let cobros = dataService.getCobros(selectedMonths, selectedYear);
  if (coachId) {
    cobros = cobros.filter(c => c.coach_id === coachId);
  }
  
  const profiles = dataService.getProfiles();

  const getProfile = (id: string) => profiles.find(p => p.id === id);

  const filteredCobros = useMemo(() => {
    return cobros.filter(c => {
      if (!searchQuery) return true;
      const p = getProfile(c.alumno_id);
      return (p?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             (p?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [cobros, searchQuery, profiles]);

  const totalRecaudado = filteredCobros.reduce((acc, c) => acc + (c.monto || 0), 0);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => 
      prev.includes(monthIndex) 
        ? prev.filter(m => m !== monthIndex) 
        : [...prev, monthIndex]
    );
  };

  const toggleAllMonths = () => {
    setSelectedMonths([]);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DollarSign size={28} color="#10b981" /> Historial de Cobros
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>Planilla de ingresos mensuales por cuotas</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', outline: 'none', fontSize: '12px' }}
            >
              <option value={-1}>Todos los años</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '400px', justifyContent: 'flex-end' }}>
            <button
              onClick={toggleAllMonths}
              style={{ background: selectedMonths.length === 0 ? '#10b981' : '#1e293b', color: selectedMonths.length === 0 ? '#000' : '#94a3b8', border: '1px solid #334155', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
            >
              Todos
            </button>
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                style={{ background: selectedMonths.includes(i) ? '#10b981' : '#1e293b', color: selectedMonths.includes(i) ? '#000' : '#fff', border: '1px solid #334155', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>
            Total Recaudado ({selectedMonths.length === 0 && selectedYear === -1 ? 'Histórico Completo' : `${selectedMonths.length === 0 ? 'Todo el año' : selectedMonths.map(m => months[m]).join(', ')} ${selectedYear === -1 ? '' : selectedYear}`.trim()})
          </span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>
            Gs. {totalRecaudado.toLocaleString('es-PY')}
          </span>
        </div>

        <div style={{ flex: 2, background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
           <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0 12px' }}>
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o email del alumno..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px', width: '100%', outline: 'none' }}
              />
            </div>
        </div>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Fecha y Hora</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Alumno</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Concepto</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Modalidad</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredCobros.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No hay cobros registrados en este periodo.
                </td>
              </tr>
            ) : (
              filteredCobros.map((cobro) => {
                const alumno = getProfile(cobro.alumno_id);
                return (
                  <tr key={cobro.id} style={{ borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.4)' }}>
                    <td style={{ padding: '16px', color: '#e2e8f0', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#94a3b8" />
                        {(() => {
                          try {
                            const d = new Date(cobro.fecha_pago || Date.now());
                            return isNaN(d.getTime()) ? 'Fecha Inválida' : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                          } catch (e) {
                            return 'Fecha Inválida';
                          }
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {alumno?.avatar_url ? (
                          <img src={alumno.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                        )}
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{alumno?.full_name || 'Desconocido'}</div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>{alumno?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>
                      <span>{cobro.notas || 'Renovación de Cuota'}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: (cobro.frecuencia || 'mensual') === 'mensual' ? 'rgba(52,211,153,0.1)' : (cobro.frecuencia || 'mensual') === 'semanal' ? 'rgba(249,115,22,0.1)' : 'rgba(234,179,8,0.1)',
                        color: (cobro.frecuencia || 'mensual') === 'mensual' ? '#34d399' : (cobro.frecuencia || 'mensual') === 'semanal' ? '#f97316' : '#eab308',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap'
                      }}>
                        {(cobro.frecuencia || 'mensual') === 'diario' ? 'Por Día' : (cobro.frecuencia || 'mensual')}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#10b981', fontWeight: 900, fontSize: '16px', textAlign: 'right' }}>
                      Gs. {(cobro.monto || 0).toLocaleString('es-PY')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
