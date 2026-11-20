import React, { useState, useEffect } from 'react';
import { Dumbbell, Save, X, Plus, Trash2, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Exercise, RoutineWithLogs } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';
import { inferGenderFromName } from '../utils/genderInference';
import { calculateRecommendedPrescription, matchesLevelFilter, selectExercisesForLevel } from '../utils/workoutIntelligence';
import { AnatomyExplorer } from './AnatomyExplorer';
import { MultiSelect } from './MultiSelect';

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
  const [pickerViewMode, setPickerViewMode] = useState<'list' | 'anatomy'>('list');
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewContextList, setPreviewContextList] = useState<Exercise[] | null>(null);
  const [previewReadOnly, setPreviewReadOnly] = useState(false); // true = abierto desde GIF rutina, sin botón añadir
  
  // Generator State
  const [genMuscles, setGenMuscles] = useState<string[]>([]);
  const [genLevel, setGenLevel] = useState<string>('Intermedio');
  const studentProfile = dataService.getProfileById(routine.alumno_id);
  const studentGender: 'male' | 'female' = studentProfile?.gender || inferGenderFromName(studentProfile?.full_name || '');

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
        (mLower.includes('dorsal') || selLower.includes('espalda') || selLower.includes('lat') || selLower.includes('back'))
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
      const matchesLevel = matchesLevelFilter(ex.level, selectedLevel);

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

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const catalogList = filteredExercises;
  const activePreviewList = previewContextList || catalogList;

  const openPreview = (ex: Exercise, contextList?: Exercise[], index?: number, readOnly: boolean = false) => {
    setPreviewExercise(ex);
    setPreviewContextList(contextList || null);
    if (index !== undefined && index >= 0) {
      setPreviewIndex(index);
    } else if (contextList && contextList.length > 0) {
      const foundIdx = contextList.findIndex((e) => e.id === ex.id);
      setPreviewIndex(foundIdx >= 0 ? foundIdx : 0);
    } else {
      const foundIdx = catalogList.findIndex((e) => e.id === ex.id);
      setPreviewIndex(foundIdx >= 0 ? foundIdx : 0);
    }
    setPreviewReadOnly(readOnly);
  };

  const handlePrevExercise = () => {
    if (!activePreviewList || activePreviewList.length === 0) return;
    let newIdx = 0;
    if (previewIndex !== null && previewIndex >= 0) {
      newIdx = previewIndex > 0 ? previewIndex - 1 : activePreviewList.length - 1;
    } else if (previewExercise) {
      const idx = activePreviewList.findIndex((ex) => ex.id === previewExercise.id);
      newIdx = idx > 0 ? idx - 1 : activePreviewList.length - 1;
    }
    setPreviewIndex(newIdx);
    setPreviewExercise(activePreviewList[newIdx]);
  };

  const handleNextExercise = () => {
    if (!activePreviewList || activePreviewList.length === 0) return;
    let newIdx = 0;
    if (previewIndex !== null && previewIndex >= 0) {
      newIdx = previewIndex < activePreviewList.length - 1 ? previewIndex + 1 : 0;
    } else if (previewExercise) {
      const idx = activePreviewList.findIndex((ex) => ex.id === previewExercise.id);
      newIdx = idx >= 0 && idx < activePreviewList.length - 1 ? idx + 1 : 0;
    }
    setPreviewIndex(newIdx);
    setPreviewExercise(activePreviewList[newIdx]);
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
        setPreviewContextList(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewExercise, activePreviewList]);

  const handleAddExercise = (exercise: Exercise) => {
    const rec = calculateRecommendedPrescription(exercise, genLevel, studentGender);
    setLogsItems((prev) => [
      ...prev,
      {
        id: `log-temp-${Date.now()}-${prev.length}`,
        exercise_id: exercise.id,
        semana: selectedWeek,
        dia: selectedDay,
        series: rec.series,
        repeticiones: rec.repeticiones,
        peso_objetivo: rec.peso_objetivo,
        peso_real: rec.peso_objetivo,
        notas: '',
        exercise: exercise,
      },
    ]);
    setShowAddExercisePicker(false);
  };

  const handleGenerateRoutine = () => {
    if (genMuscles.length === 0) {
      alert("Selecciona al menos 1 músculo");
      return;
    }

    const hasAbs = genMuscles.some(m => m.toLowerCase().includes('abdomin') || m.toLowerCase() === 'abs' || m.toLowerCase() === 'core');
    const mainMuscles = genMuscles.filter(m => !(m.toLowerCase().includes('abdomin') || m.toLowerCase() === 'abs' || m.toLowerCase() === 'core'));
    
    const countPerMuscle = mainMuscles.length === 1 ? 5 : mainMuscles.length === 2 ? 3 : mainMuscles.length >= 3 ? 2 : 0;
    const absCount = hasAbs ? 3 : 0;

    let selectedExercisesForGeneration: Exercise[] = [];
    const workingExistingIds = new Set<string>(logsItems.map((log) => String(log.exercise_id)));

    mainMuscles.forEach(muscle => {
      const selected = selectExercisesForLevel(
        exercises,
        [muscle],
        genLevel,
        countPerMuscle,
        workingExistingIds,
        matchMuscle
      );
      selected.forEach((ex) => workingExistingIds.add(ex.id));
      selectedExercisesForGeneration = [...selectedExercisesForGeneration, ...selected];
    });

    if (hasAbs) {
      const absSelected = selectExercisesForLevel(
        exercises,
        ['abdomin', 'abs', 'core'],
        genLevel,
        absCount,
        workingExistingIds,
        matchMuscle
      );
      absSelected.forEach((ex) => workingExistingIds.add(ex.id));
      selectedExercisesForGeneration = [...selectedExercisesForGeneration, ...absSelected];
    }

    if (selectedExercisesForGeneration.length === 0) {
      alert("No se encontraron suficientes ejercicios para el nivel seleccionado.");
      return;
    }

    const newItems = selectedExercisesForGeneration.map((ex, idx) => {
      const rec = calculateRecommendedPrescription(ex, genLevel, studentGender);
      return {
        id: `log-temp-${Date.now()}-${idx}`,
        exercise_id: ex.id,
        semana: selectedWeek,
        dia: selectedDay,
        series: rec.series,
        repeticiones: rec.repeticiones,
        peso_objetivo: rec.peso_objetivo,
        peso_real: rec.peso_objetivo,
        notas: '',
        exercise: ex,
      };
    });

    setLogsItems(prev => [...prev, ...newItems]);
    setShowAddExercisePicker(false);
    setGenMuscles([]);
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
    <>
      <style>{`
        @media (max-width: 768px) {
          .gm-modal-overlay { left: 0 !important; }
        }
      `}</style>
      <div
        className="gm-modal-overlay titan-modal-overlay"
        style={{
          left: '260px',
        }}
      >
        <div className="titan-modal" style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden'
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '14px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(213, 122, 48, 0.16)',
              color: '#FFBD4A',
              padding: '10px',
              border: '1px solid rgba(213, 122, 48, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px' }}>
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
            className="titan-btn-armor-steel"
            style={{
              padding: '6px 12px',
              fontSize: '18px',
              lineHeight: 1,
            }}
            title="Volver"
          >
            ‹
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Nombre de la Rutina:
            </label>
            <input
              type="text"
              className="titan-input"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              required
              placeholder="Ej. Mi Plan Personalizado"
              style={{
                width: '100%',
                fontSize: '14px',
                fontWeight: 800,
                padding: '12px 14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 className="titan-section-title" style={{ margin: 0, fontSize: '12px', color: '#FFBD4A' }}>
              Ejercicios Asignados ({logsItems.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowAddExercisePicker(!showAddExercisePicker)}
              className="titan-btn-armor-copper"
              style={{
                padding: '8px 14px',
                fontSize: '11px',
              }}
            >
              <Plus size={14} />
              <span>Agregar Ejercicio del Catálogo</span>
            </button>
          </div>

          {showAddExercisePicker && (
            <div className="titan-inset-well" style={{
              borderColor: 'rgba(213, 122, 48, 0.5)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#D57A30" />
                  Buscar en el Catálogo ({filteredExercises.length} de {exercises.length} GIFs)
                </span>

                <div className="titan-inset-well" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: 'rgba(213, 122, 48, 0.45)',
                  padding: '5px 10px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ASIGNAR A:
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>SEMANA:</label>
                    <select
                      className="titan-select"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      style={{
                        color: '#FFBD4A',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 8px',
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
                      className="titan-select"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      style={{
                        color: '#FFBD4A',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 8px',
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
                  className="titan-btn-armor-steel"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="titan-inset-well" style={{
                borderLeft: '3px solid #D57A30',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <span style={{ fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase' }}>
                  🤖 Auto-Generador:
                </span>
                
                <MultiSelect
                  options={musclesList}
                  selected={genMuscles}
                  onChange={setGenMuscles}
                  placeholder="MÚSCULOS..."
                />

                <select
                  className="titan-select"
                  value={genLevel}
                  onChange={(e) => setGenLevel(e.target.value)}
                  style={{
                    color: '#FFBD4A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '8px 10px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Principiante">NIVEL: LIVIANA (Principiante)</option>
                  <option value="Intermedio">NIVEL: MEDIA (Intermedio)</option>
                  <option value="Avanzado">NIVEL: DIFÍCIL (Avanzado)</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateRoutine}
                  className="titan-btn-armor-copper"
                  style={{
                    padding: '8px 16px',
                    fontSize: '11px',
                    marginLeft: 'auto',
                  }}
                >
                  ⚡ Generar Rutina
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPickerViewMode('list')}
                  className={pickerViewMode === 'list' ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                  }}
                >
                  Vista Lista
                </button>
                <button
                  type="button"
                  onClick={() => setPickerViewMode('anatomy')}
                  className={pickerViewMode === 'anatomy' ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                  }}
                >
                  Vista Anatómica
                </button>
              </div>

              {pickerViewMode === 'anatomy' ? (
                <AnatomyExplorer
                  exercises={exercises}
                  onAddExercise={handleAddExercise}
                  onPreviewExercise={openPreview}
                  selectedWeek={selectedWeek}
                  selectedDay={selectedDay}
                  initialGender={
                    dataService.getProfileById(routine.alumno_id)?.gender || 
                    inferGenderFromName(dataService.getProfileById(routine.alumno_id)?.full_name || '')
                  }
                />
              ) : (
                <>
                  <input
                type="text"
                className="titan-input"
                placeholder="Buscar por Nº de ejercicio (ej. 2, 81), nombre o músculo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '12px',
                  padding: '10px 12px',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <select
                  className="titan-select"
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  style={{
                    color: '#FFBD4A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '8px 10px',
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
                  className="titan-select"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  style={{
                    color: '#FFBD4A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '8px 10px',
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
                  className="titan-select"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  style={{
                    color: '#FFBD4A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '8px 10px',
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
                      onClick={() => openPreview(ex, catalogList)}
                      title="Toca para ver vista previa y detalles"
                      className="titan-armor-card titan-armor-card-interactive"
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {ex.image_urls?.[0] && (
                          <div className="gm-gif-wrap" style={{ width: '44px', height: '44px', background: '#000', padding: '2px', border: '1px solid rgba(213,122,48,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} className="gm-exercise-gif" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'transparent', display: 'block' }} />
                          </div>
                        )}
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {ex.name}
                            <span className="titan-badge-copper" style={{ fontSize: '9px', padding: '1px 5px', fontFamily: 'monospace' }}>
                              Nº {catNum}
                            </span>
                          </p>
                          <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{ex.primary_muscles.join(', ')} | {ex.equipment}</p>
                        </div>
                      </div>
                    <button
                      type="button"
                      className="titan-btn-armor-copper"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddExercise(ex);
                      }}
                      style={{
                        fontSize: '10px',
                        padding: '6px 12px',
                      }}
                    >
                      + Añadir a Sem {selectedWeek} ({selectedDay})
                    </button>
                  </div>
                );
              })}
              </div>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logsItems.map((item, idx) => {
              const dayColor = DAY_COLOR_MAP[item.dia] || DAY_COLOR_MAP['Lunes'];
              const dayNum = getDayExerciseNumber(logsItems, idx);

              return (
                <div key={item.id || idx} className="titan-armor-card" style={{
                  borderLeft: `5px solid ${dayColor.main}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          title="Mover arriba"
                          className="titan-btn-armor-steel"
                          style={{
                            width: '24px',
                            height: '24px',
                            padding: 0,
                          }}
                        >
                          <ChevronUp size={15} />
                        </button>

                        <span style={{ background: dayColor.main, color: '#090d16', fontSize: '12px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          #{dayNum}
                        </span>

                        <button
                          type="button"
                          disabled={idx === logsItems.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          title="Mover abajo"
                          className="titan-btn-armor-steel"
                          style={{
                            width: '24px',
                            height: '24px',
                            padding: 0,
                          }}
                        >
                          <ChevronDown size={15} />
                        </button>
                      </div>

                      {/* GIF del ejercicio */}
                      {item.exercise?.image_urls?.[0] && (
                        <div
                          className="gm-gif-wrap"
                          title="Ver GIF del ejercicio"
                          style={{
                            width: '56px',
                            height: '56px',
                            border: `1.5px solid ${dayColor.border}`,
                            flexShrink: 0,
                            cursor: 'pointer',
                            background: '#000',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onClick={() => {
                            const ex = item.exercise || exercises.find((e) => e.id === item.exercise_id);
                            if (ex) {
                              const routineExercises = logsItems
                                .map((l) => l.exercise || exercises.find((e) => e.id === l.exercise_id))
                                .filter(Boolean) as Exercise[];
                              openPreview(ex, routineExercises, idx, true);
                            }
                          }}
                        >
                          <img
                            src={fixImageUrl(item.exercise.image_urls[0])}
                            alt={item.exercise.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              background: 'transparent',
                              display: 'block',
                            }}
                            className="gm-exercise-gif"
                          />
                        </div>
                      )}

                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {item.exercise?.name || 'Ejercicio'}
                        {(() => {
                          const cIdx = item.exercise_id ? exercises.findIndex(e => e.id === item.exercise_id) : -1;
                          return cIdx >= 0 ? (
                            <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '2px 6px', fontFamily: 'monospace' }}>
                              Nº {cIdx + 1}/{exercises.length}
                            </span>
                          ) : null;
                        })()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="titan-btn-armor-danger"
                      style={{ padding: '6px' }}
                      title="Eliminar de la rutina"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: dayColor.main, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Orden:</label>
                      <input
                        type="number"
                        min="1"
                        className="titan-input"
                        value={dayNum}
                        onChange={(e) => handleReorderDirect(idx, parseInt(e.target.value) || 1)}
                        style={{ width: '100%', color: dayColor.text, fontSize: '12px', fontWeight: 900, padding: '8px', boxSizing: 'border-box' }}
                        title="Cambia la posición del ejercicio en este día"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#D57A30', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Semana:</label>
                      <select
                        className="titan-select"
                        value={item.semana}
                        onChange={(e) => handleItemChange(idx, 'semana', parseInt(e.target.value) || 1)}
                        style={{ width: '100%', color: '#FFBD4A', fontSize: '12px', fontWeight: 800, padding: '8px', boxSizing: 'border-box' }}
                      >
                        {WEEKS.map((w) => (
                          <option key={w} value={w}>Semana {w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: dayColor.main, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Día:</label>
                      <select
                        className="titan-select"
                        value={item.dia}
                        onChange={(e) => handleItemChange(idx, 'dia', e.target.value)}
                        style={{ width: '100%', color: dayColor.text, fontSize: '12px', fontWeight: 900, padding: '8px', boxSizing: 'border-box' }}
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Series:</label>
                    <input
                      type="number"
                      min="1"
                      className="titan-input"
                      value={item.series}
                      onChange={(e) => handleItemChange(idx, 'series', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', fontSize: '12px', fontWeight: 800, padding: '8px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Reps:</label>
                    <input
                      type="number"
                      min="1"
                      className="titan-input"
                      value={item.repeticiones}
                      onChange={(e) => handleItemChange(idx, 'repeticiones', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', fontSize: '12px', fontWeight: 800, padding: '8px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#FFBD4A', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Objetivo (KG):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="titan-input"
                      value={item.peso_objetivo}
                      onChange={(e) => handleItemChange(idx, 'peso_objetivo', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', color: '#FFBD4A', fontSize: '12px', fontWeight: 900, padding: '8px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              className="titan-btn-armor-steel"
              style={{
                fontSize: '11px',
                padding: '9px 16px',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="titan-btn-armor-glow"
              style={{
                padding: '10px 20px',
                fontSize: '12px',
              }}
            >
              <Save size={16} />
              <span>Guardar Cambios de Rutina</span>
            </button>
          </div>
        </form>
      </div>

      {previewExercise && (() => {
        const idx = previewIndex !== null && previewIndex >= 0 
          ? previewIndex 
          : activePreviewList.findIndex((ex) => ex.id === previewExercise.id);
        const currentNum = idx >= 0 ? idx + 1 : 1;
        const totalNum = activePreviewList.length;

        return (
          <div className="titan-modal-overlay" style={{
            zIndex: 1100,
          }} onClick={() => { setPreviewExercise(null); setPreviewContextList(null); setPreviewIndex(null); }}>

            <button
              type="button"
              className="titan-btn-armor-glow"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevExercise();
              }}
              title="Ejercicio anterior (Flecha Izquierda)"
              style={{
                width: '52px',
                height: '52px',
                marginRight: '16px',
                flexShrink: 0,
                zIndex: 1102
              }}
            >
              <ChevronLeft size={30} />
            </button>

            {/* Modal Box */}
            <div className="titan-modal" style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px' }}>{previewExercise.name}</h3>
                  <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {currentNum} / {totalNum}
                  </span>
                </div>
                <button className="titan-btn-armor-steel" style={{ padding: '5px' }} onClick={() => { setPreviewExercise(null); setPreviewContextList(null); setPreviewIndex(null); }}>
                  <X size={18} />
                </button>
              </div>

              {/* GIF Large Container */}
              {previewExercise.image_urls?.[0] && (
                <div className="gm-gif-wrap titan-inset-well" style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  boxSizing: 'border-box'
                }}>
                  <img src={fixImageUrl(previewExercise.image_urls[0])} alt={previewExercise.name} className="gm-exercise-gif gm-exercise-gif-lg" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}

              {/* Muscle and Equipment Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="titan-badge-copper" style={{ padding: '4px 10px', fontSize: '10px' }}>
                  {previewExercise.equipment || 'Máquina'}
                </span>
                {previewExercise.primary_muscles.map((m) => (
                  <span key={m} className="titan-badge-steel" style={{ padding: '4px 10px', fontSize: '10px' }}>
                    {m}
                  </span>
                ))}
              </div>

              {/* Execution Instructions */}
              {previewExercise.instructions && previewExercise.instructions.length > 0 && (
                <div className="titan-inset-well" style={{ padding: '14px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#FFBD4A', textTransform: 'uppercase' }}>Instrucciones de Ejecución</h4>
                  <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    {previewExercise.instructions.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => { setPreviewExercise(null); setPreviewContextList(null); setPreviewIndex(null); }}
                  className="titan-btn-armor-steel"
                  style={{ fontSize: '11px', padding: '8px 14px' }}
                >
                  Cerrar
                </button>
                {!previewReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddExercise(previewExercise);
                    setPreviewExercise(null);
                    setPreviewContextList(null);
                    setPreviewIndex(null);
                  }}
                  className="titan-btn-armor-copper"
                  style={{ padding: '10px 20px', fontSize: '12px' }}
                >
                  <Plus size={16} />
                  <span>Añadir a Sem {selectedWeek} ({selectedDay})</span>
                </button>
                )}
              </div>
            </div>

            {/* Right Navigation Arrow Button */}
            <button
              type="button"
              className="titan-btn-armor-glow"
              onClick={(e) => {
                e.stopPropagation();
                handleNextExercise();
              }}
              title="Siguiente ejercicio (Flecha Derecha)"
              style={{
                width: '52px',
                height: '52px',
                marginLeft: '16px',
                flexShrink: 0,
                zIndex: 1102
              }}
            >
              <ChevronRight size={30} />
            </button>
          </div>
        );
      })()}
    </div>
    </>
  );
};
