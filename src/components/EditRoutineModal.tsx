import React, { useState, useEffect } from 'react';
import { Dumbbell, Save, X, Plus, Trash2, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Lunes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const WEEKS = [1, 2, 3, 4, 5];

  const DAY_COLOR_MAP: Record<string, { main: string; border: string; bg: string; text: string }> = {
    'Lunes':     { main: '#f59e0b', border: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.08)', text: '#fbbf24' },
    'Martes':    { main: '#06b6d4', border: 'rgba(6, 182, 212, 0.45)',  bg: 'rgba(6, 182, 212, 0.08)',  text: '#38bdf8' },
    'Miércoles': { main: '#10b981', border: 'rgba(16, 185, 129, 0.45)', bg: 'rgba(16, 185, 129, 0.08)', text: '#34d399' },
    'Jueves':    { main: '#a855f7', border: 'rgba(168, 85, 247, 0.45)', bg: 'rgba(168, 85, 247, 0.08)', text: '#c084fc' },
    'Viernes':   { main: '#f43f5e', border: 'rgba(244, 63, 94, 0.45)',  bg: 'rgba(244, 63, 94, 0.08)',  text: '#fb7185' },
    'Sábado':    { main: '#f97316', border: 'rgba(249, 115, 22, 0.45)',  bg: 'rgba(249, 115, 22, 0.08)',  text: '#fb923c' },
    'Domingo':   { main: '#6366f1', border: 'rgba(99, 102, 241, 0.45)', bg: 'rgba(99, 102, 241, 0.08)', text: '#818cf8' },
  };

  const getDayExerciseNumber = (items: typeof logsItems, currentIndex: number) => {
    const currentItem = items[currentIndex];
    let count = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if ((items[i].semana || 1) === (currentItem.semana || 1) && items[i].dia === currentItem.dia) {
        count++;
      }
    }
    return count;
  };

  const musclesList: string[] = Array.from<string>(new Set(exercises.flatMap((ex) => ex.primary_muscles))).sort();
  const equipmentList: string[] = Array.from<string>(new Set(exercises.map((ex) => ex.equipment).filter((e): e is string => Boolean(e)))).sort();

  const matchMuscle = (primaryMuscles: string[], selected: string): boolean => {
    if (selected === 'all') return true;
    const selLower = selected.toLowerCase();

    return primaryMuscles.some((m) => {
      const mLower = m.toLowerCase();
      if (mLower === selLower) return true;
      if (mLower.includes(selLower) || selLower.includes(mLower)) return true;

      if (
        (selLower.includes('gemelo') || selLower.includes('pantorrilla') || selLower.includes('calv')) &&
        (mLower.includes('gemelo') || mLower.includes('pantorrilla') || mLower.includes('calv') || mLower.includes('soleus'))
      ) return true;

      if (
        (selLower.includes('abdomin') || selLower.includes('abs')) &&
        (mLower.includes('abdomin') || mLower.includes('abs') || mLower.includes('oblique'))
      ) return true;

      if (
        (selLower.includes('pecho') || selLower.includes('pectoral') || selLower.includes('chest')) &&
        (mLower.includes('pecho') || mLower.includes('pectoral') || mLower.includes('chest'))
      ) return true;

      if (
        (selLower.includes('isquio') || selLower.includes('femoral') || selLower.includes('hamstring')) &&
        (mLower.includes('isquio') || mLower.includes('femoral') || mLower.includes('hamstring'))
      ) return true;

      if (
        (selLower.includes('cuadric') || selLower.includes('cuádric') || selLower.includes('quad')) &&
        (mLower.includes('cuadric') || mLower.includes('cuádric') || mLower.includes('quad'))
      ) return true;

      if (
        (selLower.includes('dorsal') || selLower.includes('espalda') || selLower.includes('lat') || selLower.includes('back')) &&
        (mLower.includes('dorsal') || mLower.includes('espalda') || mLower.includes('lat') || mLower.includes('back'))
      ) return true;

      if (
        (selLower.includes('hombro') || selLower.includes('deltoid') || selLower.includes('shoulder')) &&
        (mLower.includes('hombro') || mLower.includes('deltoid') || mLower.includes('shoulder'))
      ) return true;

      if (
        (selLower.includes('glute') || selLower.includes('glúte')) &&
        (mLower.includes('glute') || mLower.includes('glúte'))
      ) return true;

      if (selLower.includes('bicep') && mLower.includes('bicep')) return true;
      if (selLower.includes('tricep') && mLower.includes('tricep')) return true;

      return false;
    });
  };

  const getSearchNumber = (q: string): number | null => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return null;
    const isNumberQueryPattern = /^(?:#|n[º°.]\s*|ej(?:ercicio)?\s*)?\d+(?:\/\d+)?$/i.test(trimmed);
    if (isNumberQueryPattern) {
      const part = trimmed.split('/')[0];
      const digitsOnly = part.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 0) {
        const num = parseInt(digitsOnly, 10);
        if (!isNaN(num) && num > 0 && num <= exercises.length) return num;
      }
    }
    return null;
  };

  const filteredExercises = exercises
    .map((ex, origIndex) => ({ ex, catalogIndex: origIndex + 1 }))
    .filter(({ ex, catalogIndex }) => {
      const query = searchQuery.trim().toLowerCase();
      const targetNum = getSearchNumber(query);

      // Exact number match takes precedence and bypasses extra filters if directly requested
      if (targetNum !== null && catalogIndex === targetNum) {
        return true;
      }

      let matchesSearch = true;
      if (query) {
        matchesSearch =
          ex.name.toLowerCase().includes(query) ||
          ex.primary_muscles.some((m) => m.toLowerCase().includes(query)) ||
          (ex.equipment && ex.equipment.toLowerCase().includes(query)) ||
          (ex.level && ex.level.toLowerCase().includes(query));
      }

      const matchesMuscle = matchMuscle(ex.primary_muscles, selectedMuscle);
      const matchesEquip = selectedEquipment === 'all' || (ex.equipment && ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase()));
      const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;

      return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
    })
    .sort((a, b) => {
      const targetNum = getSearchNumber(searchQuery);
      if (targetNum !== null) {
        if (a.catalogIndex === targetNum) return -1;
        if (b.catalogIndex === targetNum) return 1;
      }
      return 0;
    })
    .map(({ ex }) => ex);

  const catalogList = filteredExercises;

  const handlePrevExercise = () => {
    if (!previewExercise) return;
    const idx = catalogList.findIndex((ex) => ex.id === previewExercise.id);
    if (idx > 0) {
      setPreviewExercise(catalogList[idx - 1]);
    } else {
      setPreviewExercise(catalogList[catalogList.length - 1]);
    }
  };

  const handleNextExercise = () => {
    if (!previewExercise) return;
    const idx = catalogList.findIndex((ex) => ex.id === previewExercise.id);
    if (idx >= 0 && idx < catalogList.length - 1) {
      setPreviewExercise(catalogList[idx + 1]);
    } else {
      setPreviewExercise(catalogList[0]);
    }
  };

  useEffect(() => {
    if (!previewExercise) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevExercise();
      } else if (e.key === 'ArrowRight') {
        handleNextExercise();
      } else if (e.key === 'Escape') {
        setPreviewExercise(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewExercise, catalogList]);

  const handleAddExercise = (exercise: Exercise) => {
    setLogsItems((prev) => [
      ...prev,
      {
        id: `log-temp-${Date.now()}-${prev.length}`,
        exercise_id: exercise.id,
        semana: selectedWeek,
        dia: selectedDay,
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

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setLogsItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= logsItems.length - 1) return;
    setLogsItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleReorderDirect = (index: number, newDayNumber: number) => {
    // Find all items with matching semana & dia
    const currentItem = logsItems[index];
    const sameDayIndices = logsItems
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => (item.semana || 1) === (currentItem.semana || 1) && item.dia === currentItem.dia)
      .map(({ i }) => i);

    if (sameDayIndices.length <= 1) return;

    const targetSubIndex = Math.max(0, Math.min(sameDayIndices.length - 1, newDayNumber - 1));
    const targetGlobalIndex = sameDayIndices[targetSubIndex];

    if (targetGlobalIndex === index) return;

    setLogsItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetGlobalIndex, 0, moved);
      return next;
    });
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
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#f59e0b" />
                  Buscar en el Catálogo ({filteredExercises.length} de {exercises.length} GIFs)
                </span>

                {/* Target Week & Day Selectors in Top Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '4px 10px'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ASIGNAR A:
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>SEMANA:</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      style={{
                        background: '#0f172a',
                        color: '#f59e0b',
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '4px 8px',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {WEEKS.map((w) => (
                        <option key={w} value={w}>Semana {w}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>DÍA:</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      style={{
                        background: '#0f172a',
                        color: '#f59e0b',
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '4px 8px',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddExercisePicker(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕ Cerrar
                </button>
              </div>

              <input
                type="text"
                placeholder="Buscar por Nº de ejercicio (ej. 2, 81), nombre o músculo..."
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

              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredExercises.map((ex) => {
                  const catNum = exercises.findIndex(e => e.id === ex.id) + 1;
                  return (
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
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {ex.name}
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '1px 5px', fontFamily: 'monospace' }}>
                              Nº {catNum}
                            </span>
                          </p>
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
                      + Añadir a Sem {selectedWeek} ({selectedDay})
                    </button>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* List of Exercises in Routine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logsItems.map((item, idx) => {
              const dayColor = DAY_COLOR_MAP[item.dia] || DAY_COLOR_MAP['Lunes'];
              const dayNum = getDayExerciseNumber(logsItems, idx);

              return (
                <div key={item.id || idx} style={{
                  background: dayColor.bg,
                  border: `1px solid ${dayColor.border}`,
                  borderLeft: `5px solid ${dayColor.main}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${dayColor.border}`, paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Reorder Buttons (Up & Down) + Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          title="Mover arriba"
                          style={{
                            background: idx === 0 ? 'rgba(255,255,255,0.05)' : dayColor.main,
                            color: idx === 0 ? '#475569' : '#090d16',
                            border: 'none',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 900
                          }}
                        >
                          <ChevronUp size={16} />
                        </button>

                        <span style={{ background: dayColor.main, color: '#090d16', fontSize: '12px', fontWeight: 900, padding: '3px 8px', borderRadius: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          #{dayNum}
                        </span>

                        <button
                          type="button"
                          disabled={idx === logsItems.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          title="Mover abajo"
                          style={{
                            background: idx === logsItems.length - 1 ? 'rgba(255,255,255,0.05)' : dayColor.main,
                            color: idx === logsItems.length - 1 ? '#475569' : '#090d16',
                            border: 'none',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: idx === logsItems.length - 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 900
                          }}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {item.exercise?.name || 'Ejercicio'}
                        {(() => {
                          const cIdx = item.exercise_id ? exercises.findIndex(e => e.id === item.exercise_id) : -1;
                          return cIdx >= 0 ? (
                            <span style={{ fontSize: '10px', fontWeight: 900, color: dayColor.text, background: 'rgba(0,0,0,0.3)', border: `1px solid ${dayColor.border}`, padding: '2px 6px', fontFamily: 'monospace' }}>
                              Nº {cIdx + 1}/{exercises.length}
                            </span>
                          ) : null;
                        })()}
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: dayColor.main, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Orden:</label>
                      <input
                        type="number"
                        min="1"
                        value={dayNum}
                        onChange={(e) => handleReorderDirect(idx, parseInt(e.target.value) || 1)}
                        style={{ width: '100%', background: '#0f172a', color: dayColor.text, fontSize: '12px', fontWeight: 900, padding: '8px', border: `1px solid ${dayColor.border}`, boxSizing: 'border-box' }}
                        title="Cambia la posición del ejercicio en este día"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Semana:</label>
                      <select
                        value={item.semana}
                        onChange={(e) => handleItemChange(idx, 'semana', parseInt(e.target.value) || 1)}
                        style={{ width: '100%', background: '#0f172a', color: '#f59e0b', fontSize: '12px', fontWeight: 800, padding: '8px', border: '1px solid rgba(245, 158, 11, 0.4)', boxSizing: 'border-box' }}
                      >
                        {WEEKS.map((w) => (
                          <option key={w} value={w}>Semana {w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: dayColor.main, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Día:</label>
                      <select
                        value={item.dia}
                        onChange={(e) => handleItemChange(idx, 'dia', e.target.value)}
                        style={{ width: '100%', background: '#0f172a', color: dayColor.text, fontSize: '12px', fontWeight: 900, padding: '8px', border: `1px solid ${dayColor.border}`, boxSizing: 'border-box' }}
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
            );
          })}
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
      {previewExercise && (() => {
        const idx = catalogList.findIndex((ex) => ex.id === previewExercise.id);
        const currentNum = idx >= 0 ? idx + 1 : 1;
        const totalNum = catalogList.length;

        return (
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

            {/* Left Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevExercise();
              }}
              title="Ejercicio anterior (Flecha Izquierda)"
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(245, 158, 11, 0.7)',
                color: '#f59e0b',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                marginRight: '16px',
                transition: 'transform 0.2s, background 0.2s',
                flexShrink: 0,
                zIndex: 1102
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#f59e0b';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
                e.currentTarget.style.color = '#f59e0b';
              }}
            >
              <ChevronLeft size={36} />
            </button>

            {/* Modal Box */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>{previewExercise.name}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px' }}>
                    {currentNum} / {totalNum}
                  </span>
                </div>
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
                  <span>Añadir a Sem {selectedWeek} ({selectedDay})</span>
                </button>
              </div>
            </div>

            {/* Right Navigation Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextExercise();
              }}
              title="Siguiente ejercicio (Flecha Derecha)"
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(245, 158, 11, 0.7)',
                color: '#f59e0b',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                marginLeft: '16px',
                transition: 'transform 0.2s, background 0.2s',
                flexShrink: 0,
                zIndex: 1102
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#f59e0b';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
                e.currentTarget.style.color = '#f59e0b';
              }}
            >
              <ChevronRight size={36} />
            </button>
          </div>
        );
      })()}
    </div>
  );
};
