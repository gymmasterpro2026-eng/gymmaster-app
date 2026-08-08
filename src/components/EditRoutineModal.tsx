import React, { useState } from 'react';
import { Dumbbell, Save, X, Plus, Trash2, Search, Calendar, ChevronRight } from 'lucide-react';
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
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-none p-6 max-w-3xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-none border border-amber-500/30">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Editar Rutina de Entrenamiento</h3>
              <p className="text-xs text-slate-400">Modifica los ejercicios, cargas, repeticiones y días</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-none hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
          {/* Routine Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre de la Rutina:</label>
            <input
              type="text"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              required
              className="w-full bg-slate-950 text-white font-bold text-sm rounded-none px-4 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none"
              placeholder="Ej: Hipertrofia Torso - Piernas"
            />
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Ejercicios Asignados ({logsItems.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddExercisePicker(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-none flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Ejercicio del Catálogo</span>
              </button>
            </div>

            {/* Exercise Add Picker Modal */}
            {showAddExercisePicker && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-none p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    Seleccionar Ejercicio (Base de 1,324 GIFs)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddExercisePicker(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Cerrar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar ejercicio en español..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-none px-3 py-2 border border-slate-800 focus:border-amber-500 focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredExercises.slice(0, 15).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => handleAddExercise(ex)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-none flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        {ex.image_urls?.[0] && (
                          <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} className="w-8 h-8 rounded-none object-cover bg-white" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">{ex.name}</p>
                          <p className="text-[10px] text-slate-400">{ex.primary_muscles.join(', ')} | {ex.equipment}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-none">+ Añadir</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of routine items */}
            {logsItems.map((item, idx) => (
              <div key={item.id || idx} className="bg-slate-950 border border-slate-800 rounded-none p-4 space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="bg-slate-800 text-amber-400 text-xs font-mono font-bold w-6 h-6 rounded-none flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {item.exercise?.name || 'Ejercicio'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded-none hover:bg-rose-500/10 transition-all"
                    title="Eliminar de la rutina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Día */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Día de Semana:</label>
                    <select
                      value={item.dia}
                      onChange={(e) => handleItemChange(idx, 'dia', e.target.value)}
                      className="w-full bg-slate-900 text-white rounded-none px-2.5 py-2 border border-slate-800 focus:border-amber-500"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Series */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Series:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.series}
                      onChange={(e) => handleItemChange(idx, 'series', parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 text-white font-bold rounded-none px-2.5 py-2 border border-slate-800 focus:border-amber-500"
                    />
                  </div>

                  {/* Repeticiones */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Repeticiones:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.repeticiones}
                      onChange={(e) => handleItemChange(idx, 'repeticiones', parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 text-white font-bold rounded-none px-2.5 py-2 border border-slate-800 focus:border-amber-500"
                    />
                  </div>

                  {/* Peso Objetivo (KG) */}
                  <div>
                    <label className="text-[10px] font-semibold text-amber-400 block mb-1">Peso Objetivo (KG):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.peso_objetivo}
                      onChange={(e) => handleItemChange(idx, 'peso_objetivo', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 text-amber-400 font-extrabold rounded-none px-2.5 py-2 border border-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <input
                    type="text"
                    placeholder="Notas o técnica (ej: Mantener codos a 45°)..."
                    value={item.notas}
                    onChange={(e) => handleItemChange(idx, 'notas', e.target.value)}
                    className="w-full bg-slate-900 text-slate-300 text-xs rounded-none px-3 py-2 border border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-none text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-none text-xs shadow-lg flex items-center space-x-2 hover:brightness-110 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de Rutina</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
