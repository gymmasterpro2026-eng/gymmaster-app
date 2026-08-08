import React, { useState } from 'react';
import { Dumbbell, Save, X, Plus, Trash2, Search } from 'lucide-react';
import { Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';

interface EditRoutineModalProps {
  routine: RoutineWithLogs;
  exercises: Exercise[];
  onClose: () => void;
  onRoutineUpdated: () => void;
}

export const EditRoutineModal: React.FC<EditRoutineModalProps> = ({
  routine,
  exercises,
  onClose,
  onRoutineUpdated,
}) => {
  const [nombreRutina, setNombreRutina] = useState(routine.nombre_rutina || '');
  const [logsItems, setLogsItems] = useState(
    routine.logs.map((log) => ({
      id: log.id,
      exercise_id: log.exercise_id,
      semana: log.semana || 1,
      dia: log.dia || 'Lunes',
      series: log.series || 4,
      repeticiones: log.repeticiones || 10,
      peso_objetivo: log.peso_objetivo || 0,
      peso_real: log.peso_real || 0,
      notas: log.notas || '',
      exercise: log.exercise || exercises.find((e) => e.id === log.exercise_id),
    }))
  );

  const [showAddExercisePicker, setShowAddExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const musclesList: string[] = Array.from<string>(new Set(exercises.flatMap((ex) => ex.primary_muscles))).sort();
  const equipmentList: string[] = Array.from<string>(new Set(exercises.map((ex) => ex.equipment).filter((e): e is string => Boolean(e)))).sort();

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMuscle = selectedMuscle === 'all' || ex.primary_muscles.includes(selectedMuscle);
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;
    return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
  });

  const handleAddExercise = (exercise: Exercise) => {
    setLogsItems((prev) => [
      ...prev,
      {
        id: `log-temp-${Date.now()}-${prev.length}`,
        exercise_id: exercise.id,
        semana: 1,
        dia: 'Lunes',
        series: 4,
        repeticiones: 10,
        peso_objetivo: 40,
        peso_real: 0,
        notas: '',
        exercise: exercise,
      },
    ]);
    setShowAddExercisePicker(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setLogsItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setLogsItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateRoutine(routine.id, nombreRutina, logsItems);
    onRoutineUpdated();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '14px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              padding: '10px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Editar Mi Rutina de Entrenamiento
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Agrega o modifica ejercicios, días, series, repeticiones y cargas
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* Routine Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>
              Nombre de la Rutina:
            </label>
            <input
              type="text"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              required
              placeholder="Ej. Mi Plan Personalizado"
              style={{
                width: '100%',
                background: '#020617',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                padding: '12px 14px',
                border: '1px solid #334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Catalog Add Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>
              Ejercicios Asignados ({logsItems.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowAddExercisePicker(!showAddExercisePicker)}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase'
              }}
            >
              <Plus size={14} />
              <span>Agregar Ejercicio del Catálogo</span>
            </button>
          </div>

          {/* Exercise Add Picker */}
          {showAddExercisePicker && (
            <div style={{
              background: '#020617',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#f59e0b" />
                  Buscar en el Catálogo (1,324 GIFs)
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddExercisePicker(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}
                >
                  ✕ Cerrar
                </button>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o músculo (ej. sentadillas, pecho, mancuerna)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  padding: '10px 12px',
                  border: '1px solid #334155',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {/* Persianas / Dropdown Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '8px 10px',
                    border: '1px solid #334155',
                    outline: 'none',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">MÚSCULO: TODOS</option>
                  {musclesList.map((m) => (
                    <option key={m} value={m}>{m.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '8px 10px',
                    border: '1px solid #334155',
                    outline: 'none',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">EQUIPAMIENTO: TODOS</option>
                  {equipmentList.map((eq) => (
                    <option key={eq} value={eq}>{eq.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '8px 10px',
                    border: '1px solid #334155',
                    outline: 'none',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">NIVEL: TODOS</option>
                  <option value="beginner">PRINCIPIANTE</option>
                  <option value="intermediate">INTERMEDIO</option>
                  <option value="expert">AVANZADO</option>
                </select>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredExercises.slice(0, 25).map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setPreviewExercise(ex)}
                    title="Toca para ver vista previa y detalles"
                    style={{
                      padding: '8px 12px',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {ex.image_urls?.[0] && (
                        <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', padding: '2px' }} />
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>{ex.name}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{ex.primary_muscles.join(', ')} | {ex.equipment}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddExercise(ex);
                      }}
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#f59e0b',
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      + Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of Exercises in Routine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logsItems.map((item, idx) => (
              <div key={item.id || idx} style={{
                background: '#020617',
                border: '1px solid #1e293b',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#1e293b', color: '#f59e0b', fontSize: '12px', fontWeight: 900, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                      {item.exercise?.name || 'Ejercicio'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar de la rutina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Día:</label>
                    <select
                      value={item.dia}
                      onChange={(e) => handleItemChange(idx, 'dia', e.target.value)}
                      style={{ width: '100%', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '8px', border: '1px solid #334155' }}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Series:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.series}
                      onChange={(e) => handleItemChange(idx, 'series', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '8px', border: '1px solid #334155', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Reps:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.repeticiones}
                      onChange={(e) => handleItemChange(idx, 'repeticiones', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '8px', border: '1px solid #334155', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Objetivo (KG):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.peso_objetivo}
                      onChange={(e) => handleItemChange(idx, 'peso_objetivo', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', background: '#0f172a', color: '#f59e0b', fontSize: '12px', fontWeight: 900, padding: '8px', border: '1px solid rgba(245, 158, 11, 0.4)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '14px',
            borderTop: '1px solid #1e293b',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '8px 12px',
                textTransform: 'uppercase'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: '#f59e0b',
                color: '#000000',
                border: 'none',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase'
              }}
            >
              <Save size={16} />
              <span>Guardar Cambios de Rutina</span>
            </button>
          </div>
        </form>
      </div>
      {/* Preview Modal for Selected Exercise */}
      {previewExercise && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box'
        }} onClick={() => setPreviewExercise(null)}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #334155',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>{previewExercise.name}</h3>
              <button onClick={() => setPreviewExercise(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* GIF Large Container */}
            {previewExercise.image_urls?.[0] && (
              <div style={{
                position: 'relative',
                width: '100%',
                height: '240px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                border: '1px solid #334155',
                boxSizing: 'border-box'
              }}>
                <img src={fixImageUrl(previewExercise.image_urls[0])} alt={previewExercise.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Muscle and Equipment Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                {previewExercise.equipment || 'Máquina'}
              </span>
              {previewExercise.primary_muscles.map((m) => (
                <span key={m} style={{ background: '#1e293b', color: '#94a3b8', padding: '4px 10px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                  {m}
                </span>
              ))}
            </div>

            {/* Execution Instructions */}
            {previewExercise.instructions && previewExercise.instructions.length > 0 && (
              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '14px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>Instrucciones de Ejecución</h4>
                <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {previewExercise.instructions.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: 800, cursor: 'pointer', padding: '8px 12px', textTransform: 'uppercase' }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddExercise(previewExercise);
                  setPreviewExercise(null);
                }}
                style={{ background: '#f59e0b', color: '#000000', border: 'none', padding: '10px 20px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}
              >
                <Plus size={16} />
                <span>Añadir a la Rutina</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
