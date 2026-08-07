import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Save, Check, X, Search, Sparkles, Link2 } from 'lucide-react';
import { Exercise, Profile } from '../types';
import { dataService } from '../services/dataService';

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

  // Catalog picker search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const musclesList = Array.from(
    new Set(exercises.flatMap((ex) => ex.primary_muscles))
  ).sort();

  const equipmentList = Array.from(
    new Set(exercises.map((ex) => ex.equipment).filter(Boolean))
  ).sort();

  const filteredCatalog = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMuscle = selectedMuscle === 'all' || ex.primary_muscles.includes(selectedMuscle);
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;

    return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
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
          <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase">
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
              <div className={`w-4 h-4 rounded-full ${activa ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Week Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-3">
          {[1, 2, 3].map((weekNum) => {
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
                  <span className={`ml-2 w-1.5 h-1.5 rounded-full ${selectedWeek === weekNum ? 'bg-white' : 'bg-emerald-500'}`} />
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
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${selectedDay === day ? 'bg-slate-900 text-amber-400' : 'bg-slate-200 text-slate-600'}`}>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredCatalog.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleAddExerciseToRoutine(ex)}
                className="bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-none flex items-center justify-between cursor-pointer group transition-all shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={ex.image_urls[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80'}
                    alt={ex.name}
                    className="w-24 h-24 object-contain p-1.5 rounded-none border border-slate-200 bg-white shrink-0 shadow-sm"
                  />
                  <div>
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug mb-1">
                      {ex.name}
                    </h5>
                    <span className="text-xs text-slate-500 uppercase font-medium block">{ex.equipment}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleAddCombined(ex); }}
                    className="p-2.5 rounded-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-transparent hover:border-indigo-200 transition-all shrink-0"
                    title="Combinar con el último ejercicio (Biserie/Triserie)"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleAddExerciseToRoutine(ex); }}
                    className="p-2.5 rounded-none bg-amber-50 text-amber-600 hover:bg-amber-100 border border-transparent hover:border-amber-200 transition-all shrink-0"
                    title="Añadir solo"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
