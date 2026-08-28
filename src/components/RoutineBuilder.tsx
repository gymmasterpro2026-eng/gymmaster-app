import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Save, Check, X, Search, Sparkles, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Exercise, Profile } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';
import { inferGenderFromName } from '../utils/genderInference';
import { AnatomyExplorer } from './AnatomyExplorer';
import { MultiSelect } from './MultiSelect';

interface RoutineBuilderProps {
  coachId: string;
  gymId: string;
  alumnos: Profile[];
  exercises: Exercise[];
  initialAlumnoId?: string;
  onRoutineCreated: () => void;
  onCancel: () => void;
}

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  coachId,
  gymId,
  alumnos,
  exercises,
  initialAlumnoId,
  onRoutineCreated,
  onCancel,
}) => {
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>(initialAlumnoId || alumnos[0]?.id || '');
  const [nombreRutina, setNombreRutina] = useState<string>('Plan de Entrenamiento Mensual');
  const [activa, setActiva] = useState<boolean>(true);

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Lunes');

  // Exercise items added to routine
  const [routineItems, setRoutineItems] = useState<
    {
      id: string;
      semana: number;
      dia: string;
      exercise_id: string;
      series: number;
      repeticiones: number;
      peso_objetivo: number;
      notas: string;
      combinado_con?: string;
    }[]
  >([
    { id: '1', semana: 1, dia: 'Lunes', exercise_id: exercises[0]?.id || 'ex-001', series: 4, repeticiones: 10, peso_objetivo: 70, notas: 'Mantener codos en ángulo de 45°' },
    { id: '2', semana: 1, dia: 'Martes', exercise_id: exercises[1]?.id || 'ex-002', series: 4, repeticiones: 12, peso_objetivo: 55, notas: 'Pausa isométrica de 1 seg abajo' },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const [pickerViewMode, setPickerViewMode] = useState<'list' | 'anatomy'>('list');
  const [genMuscles, setGenMuscles] = useState<string[]>([]);
  const [genLevel, setGenLevel] = useState<string>('Intermedio');

  const musclesList = Array.from(
    new Set(exercises.flatMap((ex) => ex.primary_muscles))
  ).sort();

  const equipmentList = Array.from(
    new Set(exercises.map((ex) => ex.equipment).filter(Boolean))
  ).sort();

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

  const filteredCatalog = exercises
    .map((ex, origIndex) => ({ ex, catalogIndex: origIndex + 1 }))
    .filter(({ ex, catalogIndex }) => {
      const query = searchQuery.trim().toLowerCase();
      const targetNum = getSearchNumber(query);

      if (targetNum !== null && catalogIndex === targetNum) {
        return true;
      }

      let matchesSearch = true;
      if (query) {
        matchesSearch =
          ex.name.toLowerCase().includes(query) ||
          catalogIndex.toString() === query ||
          ex.primary_muscles.some((m) => m.toLowerCase().includes(query)) ||
          (ex.equipment && ex.equipment.toLowerCase().includes(query)) ||
          (ex.level && ex.level.toLowerCase().includes(query));
      }

      const matchesMuscle = matchMuscle(ex.primary_muscles, selectedMuscle);
      const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
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
    });

  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    setRoutineItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        semana: selectedWeek,
        dia: selectedDay,
        exercise_id: exercise.id,
        series: 4,
        repeticiones: 10,
        peso_objetivo: 50,
        notas: '',
      },
    ]);
  };

  const handleAddCombined = (exercise: Exercise) => {
    setRoutineItems((prev) => {
      const itemsForDay = prev.filter(item => item.dia === selectedDay && item.semana === selectedWeek);
      if (itemsForDay.length === 0) {
        alert("Debe añadir primero un ejercicio normal para poder combinarlo.");
        return prev;
      }
      const lastItem = itemsForDay[itemsForDay.length - 1];
      const groupId = lastItem.combinado_con || Math.random().toString(36).substr(2, 9);
      
      const newPrev = prev.map(item => item.id === lastItem.id ? { ...item, combinado_con: groupId } : item);
      
      return [
        ...newPrev,
        {
          id: Math.random().toString(36).substr(2, 9),
          semana: selectedWeek,
          dia: selectedDay,
          exercise_id: exercise.id,
          series: lastItem.series,
          repeticiones: lastItem.repeticiones,
          peso_objetivo: 50,
          notas: '',
          combinado_con: groupId,
        }
      ];
    });
  };

  const handleRemoveItem = (id: string) => {
    setRoutineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setRoutineItems((prev) => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
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

    const getRandomExercises = (muscles: string[], level: string, count: number) => {
      let pool = exercises.filter(ex => 
        (level === 'all' || ex.level === level) &&
        muscles.some(m => matchMuscle(ex.primary_muscles, m))
      );

      if (pool.length === 0) {
        pool = exercises.filter(ex => muscles.some(m => matchMuscle(ex.primary_muscles, m)));
      }

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const currentExerciseIds = new Set(routineItems.map(log => log.exercise_id));
      
      const freshExercises = pool.filter(ex => !currentExerciseIds.has(ex.id));
      const usedExercises = pool.filter(ex => currentExerciseIds.has(ex.id));
      
      const smartPool = [...freshExercises, ...usedExercises];

      return smartPool.slice(0, count);
    };

    mainMuscles.forEach(muscle => {
      const selected = getRandomExercises([muscle], genLevel, countPerMuscle);
      selectedExercisesForGeneration = [...selectedExercisesForGeneration, ...selected];
    });

    if (hasAbs) {
      const absSelected = getRandomExercises(['abdomin', 'abs', 'core'], genLevel, absCount);
      selectedExercisesForGeneration = [...selectedExercisesForGeneration, ...absSelected];
    }

    if (selectedExercisesForGeneration.length === 0) {
      alert("No se encontraron suficientes ejercicios para el nivel seleccionado.");
      return;
    }

    const newItems = selectedExercisesForGeneration.map((ex, idx) => ({
      id: `gen-${Date.now()}-${idx}`,
      exercise_id: ex.id,
      semana: selectedWeek,
      dia: selectedDay,
      series: 4,
      repeticiones: 10,
      peso_objetivo: 40,
      notas: '',
    }));

    setRoutineItems(prev => [...prev, ...newItems]);
    setGenMuscles([]);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnoId) {
      alert('Por favor selecciona un Alumno.');
      return;
    }
    if (routineItems.length === 0) {
      alert('Agrega al menos un ejercicio a la rutina.');
      return;
    }

    dataService.createRoutine(
      {
        alumno_id: selectedAlumnoId,
        coach_id: coachId,
        gym_id: gymId,
        nombre_rutina: nombreRutina,
        activa: activa,
      },
      routineItems.map((item, idx) => ({
        semana: item.semana,
        dia: item.dia,
        exercise_id: item.exercise_id,
        series: item.series,
        repeticiones: item.repeticiones,
        peso_objetivo: item.peso_objetivo,
        peso_real: 0,
        orden: idx + 1,
        notas: item.notas,
      }))
    );

    onRoutineCreated();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-none p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-3 py-1 rounded-none border border-amber-500/20 uppercase">
            Diseñador de Rutinas
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Crear Nueva Rutina Personalizada
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-none bg-slate-100 hover:bg-slate-200 border border-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSaveRoutine} className="space-y-6">
        {/* Top Header Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Seleccionar Alumno
            </label>
            <select
              value={selectedAlumnoId}
              onChange={(e) => setSelectedAlumnoId(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-none p-3 text-sm font-semibold focus:border-amber-500 focus:outline-none"
            >
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Nombre de la Rutina
            </label>
            <input
              type="text"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              placeholder="Ej: Pecho & Tríceps Hipertrofia"
              required
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-none p-3 text-sm font-semibold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Estado de la Rutina
            </label>
            <button
              type="button"
              onClick={() => setActiva(!activa)}
              className={`w-full p-3 rounded-none border text-xs font-extrabold flex items-center justify-between transition-all ${
                activa
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-500 border-slate-300'
              }`}
            >
              <span>{activa ? 'RUTINA ACTIVA EN SALA DE PESAS' : 'RUTINA BORRADOR / INACTIVA'}</span>
              <div className={`w-4 h-4 rounded-none ${activa ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Week Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-3">
          {[1, 2, 3, 4, 5].map((weekNum) => {
            const hasExercises = routineItems.some(item => item.semana === weekNum);
            return (
              <button
                key={weekNum}
                type="button"
                onClick={() => setSelectedWeek(weekNum)}
                className={`px-6 py-2 rounded-none text-sm font-black whitespace-nowrap transition-all flex items-center border ${
                  selectedWeek === weekNum 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Semana {weekNum}
                {hasExercises && (
                  <span className={`ml-2 w-1.5 h-1.5 rounded-none ${selectedWeek === weekNum ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Day Tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-3 scrollbar-hide">
          {DAYS.map((day) => {
            const hasExercises = routineItems.some(item => item.semana === selectedWeek && item.dia === day);
            const count = routineItems.filter(i => i.semana === selectedWeek && i.dia === day).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-none text-xs font-bold whitespace-nowrap transition-all flex items-center border ${
                  selectedDay === day 
                    ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {day}
                {hasExercises && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-none text-[10px] ${selectedDay === day ? 'bg-slate-900 text-amber-400' : 'bg-slate-200 text-slate-600'}`}>
                    {count} ej.
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Routine Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ejercicios para Semana {selectedWeek} - {selectedDay} ({routineItems.filter(item => item.semana === selectedWeek && item.dia === selectedDay).length})
            </h3>
            <span className="text-xs text-slate-500 hidden sm:block">Prescribe series, reps y peso objetivo</span>
          </div>

          {(() => {
            const itemsForDay = routineItems.filter(item => item.semana === selectedWeek && item.dia === selectedDay);
            
            if (itemsForDay.length === 0) {
              return (
                <div className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-none p-8 text-center text-slate-500 text-sm font-medium">
                  Día libre o sin ejercicios. Selecciona un ejercicio del catálogo para añadir a Semana {selectedWeek} - {selectedDay}.
                </div>
              );
            }

            const groupedItems: { isGroup: boolean, id: string, items: typeof itemsForDay }[] = [];
            itemsForDay.forEach(item => {
              if (item.combinado_con) {
                const existingGroup = groupedItems.find(g => g.isGroup && g.id === item.combinado_con);
                if (existingGroup) {
                  existingGroup.items.push(item);
                } else {
                  groupedItems.push({ isGroup: true, id: item.combinado_con, items: [item] });
                }
              } else {
                groupedItems.push({ isGroup: false, id: item.id, items: [item] });
              }
            });

            return groupedItems.map((group, groupIdx) => {
              return (
                <div
                  key={group.id}
                  className="bg-slate-800 border border-slate-700 rounded-none p-4 flex flex-col gap-3 shadow-sm"
                >
                  {/* Card Header for Group or Single Item */}
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-none bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                        #{groupIdx + 1}
                      </span>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {group.isGroup ? (
                          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-none border border-indigo-500/30 flex items-center font-bold uppercase tracking-widest">
                            <Link2 className="w-3 h-3 mr-1" />
                            {group.items.length === 2 ? 'Biserie' : group.items.length === 3 ? 'Triserie' : 'Circuito Combinado'}
                          </span>
                        ) : 'Ejercicio Simple'}
                      </h4>
                    </div>
                    {group.isGroup && (
                      <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 border border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Series Totales:</label>
                        <input
                          type="number"
                          min="1"
                          value={group.items[0].series}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            group.items.forEach(item => handleUpdateItem(item.id, 'series', val));
                          }}
                          className="w-12 bg-transparent text-amber-400 font-black text-center rounded-none text-sm focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Exercises List inside Card */}
                  <div className="flex flex-col gap-2">
                    {group.items.map((item, idx) => {
                      const exerciseObj = exercises.find((e) => e.id === item.exercise_id);
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-3 border border-slate-200 shadow-sm"
                        >
                          <div className="flex items-center space-x-3 min-w-[200px]">
                            {group.isGroup && (
                              <span className="text-indigo-600 font-black text-sm opacity-90 w-4 text-center">
                                {String.fromCharCode(65 + idx)} {/* A, B, C... */}
                              </span>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                {exerciseObj?.name || 'Ejercicio'}
                              </h4>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">
                                {exerciseObj?.equipment} • {exerciseObj?.primary_muscles.join(', ')}
                              </span>
                            </div>
                          </div>

                          <div className={`grid ${group.isGroup ? 'grid-cols-2' : 'grid-cols-3'} gap-2 w-full md:w-auto`}>
                            {!group.isGroup && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Series</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.series}
                                  onChange={(e) => handleUpdateItem(item.id, 'series', parseInt(e.target.value) || 1)}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center rounded-none p-1.5 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Reps</label>
                              <input
                                type="number"
                                min="1"
                                value={item.repeticiones}
                                onChange={(e) => handleUpdateItem(item.id, 'repeticiones', parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center rounded-none p-1.5 text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Peso Obj (KG)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={item.peso_objetivo}
                                onChange={(e) => handleUpdateItem(item.id, 'peso_objetivo', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center rounded-none p-1.5 text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-end gap-2 w-full md:w-auto">
                            <div className="w-full md:w-48">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Indicaciones Coach</label>
                              <input
                                type="text"
                                placeholder="Ej: Controlar bajada..."
                                value={item.notas}
                                onChange={(e) => handleUpdateItem(item.id, 'notas', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-none p-1.5 text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 h-[34px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-none transition-all flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Catalog Picker to add more exercises */}
        <div className="bg-slate-800 border border-slate-700 rounded-none p-4 space-y-3">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Plus className="w-4 h-4 text-amber-500 mr-1" />
              Añadir Ejercicio desde Catálogo
            </h3>
            
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase' }}>
                🤖 Auto-Generador:
              </span>
              
              <MultiSelect
                options={musclesList}
                selected={genMuscles}
                onChange={setGenMuscles}
                placeholder="MÚSCULOS..."
              />

              <select
                value={genLevel}
                onChange={(e) => setGenLevel(e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '8px 10px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  outline: 'none',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <option value="Principiante">NIVEL: LIVIANA (Principiante)</option>
                <option value="Intermedio">NIVEL: MEDIA (Intermedio)</option>
                <option value="Avanzado">NIVEL: DIFÍCIL (Avanzado)</option>
              </select>

              <button
                type="button"
                onClick={handleGenerateRoutine}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.4)'
                }}
              >
                ⚡ Generar Rutina
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setPickerViewMode('list')}
                style={{
                  background: pickerViewMode === 'list' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: pickerViewMode === 'list' ? '#f59e0b' : '#94a3b8',
                  border: pickerViewMode === 'list' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  borderRadius: '4px'
                }}
              >
                Vista Lista
              </button>
              <button
                type="button"
                onClick={() => setPickerViewMode('anatomy')}
                style={{
                  background: pickerViewMode === 'anatomy' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: pickerViewMode === 'anatomy' ? '#f59e0b' : '#94a3b8',
                  border: pickerViewMode === 'anatomy' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  borderRadius: '4px'
                }}
              >
                Vista Anatómica
              </button>
            </div>

            {pickerViewMode === 'anatomy' ? (
              <AnatomyExplorer
                exercises={exercises}
                onAddExercise={handleAddExerciseToRoutine}
                onPreviewExercise={(ex) => setPreviewExercise(ex)}
                selectedWeek={selectedWeek}
                selectedDay={selectedDay}
                initialGender={alumnos.find(a => a.id === selectedAlumnoId)?.gender || inferGenderFromName(alumnos.find(a => a.id === selectedAlumnoId)?.full_name || '')}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, músculo o Nº (ej: 15, #15)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white text-xs text-slate-900 border border-slate-300 rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <select
                    value={selectedMuscle}
                    onChange={(e) => setSelectedMuscle(e.target.value)}
                    className="w-full bg-white text-slate-700 text-xs rounded-none p-2.5 border border-slate-300 focus:border-amber-500 focus:outline-none uppercase transition-colors"
                  >
                    <option value="all">Músculo: Todos</option>
                    {musclesList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full bg-white text-slate-700 text-xs rounded-none p-2.5 border border-slate-300 focus:border-amber-500 focus:outline-none uppercase transition-colors"
                  >
                    <option value="all">Equip: Todos</option>
                    {equipmentList.map((eq) => (
                      <option key={eq} value={eq as string}>{eq}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-white text-slate-700 text-xs rounded-none p-2.5 border border-slate-300 focus:border-amber-500 focus:outline-none uppercase transition-colors"
                  >
                    <option value="all">Nivel: Todos</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="expert">Experto</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredCatalog.map(({ ex, catalogIndex }) => (
                    <div
                      key={ex.id}
                      className="bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-none flex items-center justify-between transition-all shadow-sm group"
                    >
                      <div
                        onClick={() => setPreviewExercise(ex)}
                        className="flex items-center space-x-4 cursor-pointer flex-1 mr-2"
                        title="Toca para ver el GIF ampliado y detalles del ejercicio"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={fixImageUrl(ex.image_urls[0])}
                            alt={ex.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80';
                            }}
                            className="w-20 h-20 object-contain p-1 rounded-none border border-slate-700 bg-black shrink-0 shadow-sm group-hover:scale-105 transition-transform gm-exercise-gif"
                          />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug mb-1 flex items-center gap-2 flex-wrap">
                            <span>{ex.name}</span>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-mono">
                              Nº {catalogIndex}
                            </span>
                          </h5>
                          <span className="text-xs text-slate-500 uppercase font-medium block">{ex.equipment}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleAddCombined(ex); }}
                          className="p-2.5 rounded-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-all shrink-0 cursor-pointer"
                          title="Combinar con el último ejercicio (Biserie/Triserie)"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleAddExerciseToRoutine(ex); }}
                          className="p-2.5 rounded-none bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-all shrink-0 cursor-pointer"
                          title="Añadir a la rutina"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Enlarged Exercise GIF Preview */}
        {previewExercise && (() => {
          const currentItemIndex = filteredCatalog.findIndex(({ ex }) => ex.id === previewExercise.id);
          const catalogNum = currentItemIndex >= 0 ? filteredCatalog[currentItemIndex].catalogIndex : exercises.findIndex(e => e.id === previewExercise.id) + 1;
          const hasPrev = currentItemIndex > 0;
          const hasNext = currentItemIndex >= 0 && currentItemIndex < filteredCatalog.length - 1;

          return (
            <div
              className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPreviewExercise(null)}
            >
              <div
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Navigation Arrow Left */}
                {hasPrev && (
                  <button
                    type="button"
                    onClick={() => setPreviewExercise(filteredCatalog[currentItemIndex - 1].ex)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 text-amber-400 border border-amber-400/50 p-3 rounded-full transition-all shadow-xl cursor-pointer"
                    title="Ejercicio anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Navigation Arrow Right */}
                {hasNext && (
                  <button
                    type="button"
                    onClick={() => setPreviewExercise(filteredCatalog[currentItemIndex + 1].ex)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 text-amber-400 border border-amber-400/50 p-3 rounded-full transition-all shadow-xl cursor-pointer"
                    title="Siguiente ejercicio"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Modal Header */}
                <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 font-mono">
                      Nº {catalogNum} / {exercises.length}
                    </span>
                    <h3 className="text-base font-extrabold text-white">{previewExercise.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewExercise(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
                  <div className="flex justify-center bg-black border border-slate-700 p-3 gm-gif-wrap">
                    <img
                      src={fixImageUrl(previewExercise.image_urls[0])}
                      alt={previewExercise.name}
                      className="max-h-[300px] w-auto object-contain gm-exercise-gif"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase">
                    <div className="bg-slate-800 p-2 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Músculos</span>
                      <span className="text-amber-400">{previewExercise.primary_muscles.join(', ')}</span>
                    </div>
                    <div className="bg-slate-800 p-2 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Equipamiento</span>
                      <span className="text-amber-400">{previewExercise.equipment || 'General'}</span>
                    </div>
                    <div className="bg-slate-800 p-2 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Nivel</span>
                      <span className="text-amber-400">{previewExercise.level || 'Todos'}</span>
                    </div>
                  </div>

                  {previewExercise.instructions && previewExercise.instructions.length > 0 && (
                    <div className="bg-slate-950 p-3 border border-slate-800 space-y-1">
                      <h4 className="text-xs font-extrabold text-amber-500 uppercase">Instrucciones de Ejecución</h4>
                      <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 leading-relaxed">
                        {previewExercise.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCombined(previewExercise);
                      setPreviewExercise(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Combinar con Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddExerciseToRoutine(previewExercise);
                      setPreviewExercise(null);
                    }}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir a Sem {selectedWeek} ({selectedDay})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-none text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-none text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-md flex items-center space-x-2 transition-all cursor-pointer border border-amber-500"
          >
            <Save className="w-4 h-4" />
            <span>Guardar & Asignar Rutina</span>
          </button>
        </div>
      </form>
    </div>
  );
};
