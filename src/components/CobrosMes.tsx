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
    <div style={{ padding: '24px', maxWidth: '1120px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div className="titan-armor-banner" style={{ padding: '22px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(213,122,48,0.22), rgba(140,62,16,0.12))', border: '1px solid rgba(213,122,48,0.45)', padding: '12px', color: '#FFBD4A', display: 'flex' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="titan-section-title" style={{ fontSize: '22px', margin: 0 }}>
              Historial de Cobros
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>Planilla de ingresos mensuales por cuotas</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="titan-select"
              style={{ padding: '6px 12px', fontSize: '12px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}
            >
              <option value={-1}>Todos los años</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '460px', justifyContent: 'flex-end' }}>
            <button
              onClick={toggleAllMonths}
              className={`titan-filter-pill titan-pill-compact ${selectedMonths.length === 0 ? 'active' : ''}`}
            >
              Todos
            </button>
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                className={`titan-filter-pill titan-pill-compact ${selectedMonths.includes(i) ? 'active' : ''}`}
              >
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="titan-armor-card" style={{ flex: 1, minWidth: '240px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Total Recaudado ({selectedMonths.length === 0 && selectedYear === -1 ? 'Histórico Completo' : `${selectedMonths.length === 0 ? 'Todo el año' : selectedMonths.map(m => months[m]).join(', ')} ${selectedYear === -1 ? '' : selectedYear}`.trim()})
          </span>
          <span style={{ fontSize: '30px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', marginTop: '6px' }}>
            Gs. {totalRecaudado.toLocaleString('es-PY')}
          </span>
        </div>

        <div className="titan-armor-card" style={{ flex: 2, minWidth: '280px', padding: '20px 24px', display: 'flex', alignItems: 'center' }}>
           <div className="titan-inset-well" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 12px' }}>
              <Search size={18} color="#D57A30" />
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

      <div className="titan-armor-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="titan-table">
            <thead>
              <tr>
                <th style={{ padding: '15px 16px', fontSize: '11px' }}>Fecha y Hora</th>
                <th style={{ padding: '15px 16px', fontSize: '11px' }}>Alumno</th>
                <th style={{ padding: '15px 16px', fontSize: '11px' }}>Concepto</th>
                <th style={{ padding: '15px 16px', fontSize: '11px' }}>Modalidad</th>
                <th style={{ padding: '15px 16px', fontSize: '11px', textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredCobros.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                    No hay cobros registrados en este periodo.
                  </td>
                </tr>
              ) : (
                filteredCobros.map((cobro) => {
                  const alumno = getProfile(cobro.alumno_id);
                  return (
                    <tr key={cobro.id}>
                      <td style={{ padding: '15px 16px', color: '#e2e8f0', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="#D57A30" />
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
                      <td style={{ padding: '15px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {alumno?.avatar_url ? (
                            <img src={alumno.avatar_url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid #D57A30' }} />
                          ) : (
                            <div className="titan-inset-well" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="#D57A30" /></div>
                          )}
                          <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{alumno?.full_name || 'Desconocido'}</div>
                            <div style={{ color: '#94A3B8', fontSize: '11px' }}>{alumno?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 16px', color: '#CBD5E1', fontSize: '13px' }}>
                        <span>{cobro.notas || 'Renovación de Cuota'}</span>
                      </td>
                      <td style={{ padding: '15px 16px' }}>
                        <span className={(cobro.frecuencia || 'mensual') === 'mensual' ? 'titan-badge-emerald' : 'titan-badge-copper'} style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          whiteSpace: 'nowrap'
                        }}>
                          {(cobro.frecuencia || 'mensual') === 'diario' ? 'Por Día' : (cobro.frecuencia || 'mensual')}
                        </span>
                      </td>
                      <td style={{ padding: '15px 16px', color: '#FFBD4A', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: '16px', textAlign: 'right' }}>
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
    </div>
  );
};
