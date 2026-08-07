import React, { useState } from 'react';
import { Database, Search, Filter, Dumbbell, ExternalLink, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { Exercise } from '../types';
import { dataService } from '../services/dataService';

interface ExerciseCatalogProps {
  exercises: Exercise[];
  onRefreshData?: () => void;
  initialSearchQuery?: string;
}

export const ExerciseCatalog: React.FC<ExerciseCatalogProps> = ({ exercises, onRefreshData, initialSearchQuery = '' }) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // New custom exercise state
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('barbell');
  const [level, setLevel] = useState('beginner');
  const [primaryMuscles, setPrimaryMuscles] = useState('chest');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const musclesList = Array.from(
    new Set(exercises.flatMap((ex) => ex.primary_muscles))
  ).sort();

  const equipmentList = Array.from(
    new Set(exercises.map((ex) => ex.equipment).filter(Boolean))
  ).sort();

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    const matchesMuscle = selectedMuscle === 'all' || ex.primary_muscles.includes(selectedMuscle);
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;

    return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    dataService.addCustomExercise({
      external_id: `custom_${Date.now()}`,
      name,
      level,
      equipment,
      primary_muscles: primaryMuscles.split(',').map((s) => s.trim()),
      secondary_muscles: [],
      instructions: instructions.split('\n').filter(Boolean),
      image_urls: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'],
      gym_id: 'gym-titan-001',
    });

    setName('');
    setShowAddCustomModal(false);
    onRefreshData();
  };

  return (
    <div id="exercise-catalog-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase">
              GitHub exercises-dataset
            </span>
            <span className="text-xs text-slate-400">Total: {exercises.length} ejercicios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Catálogo Global de Ejercicios & Máquinas
          </h1>
          <p className="text-xs text-slate-400">
            Base de datos unificada con mapeo de músculos, instrucciones y recursos visuales (GIFs/Fotos)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Ejercicio Personalizado</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-2xl pl-9 pr-3 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Muscle Filter */}
          <div>
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-2xl p-3 border border-slate-800 focus:border-amber-500 focus:outline-none uppercase"
            >
              <option value="all">Músculo: Todos</option>
              {musclesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Filter */}
          <div>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-2xl p-3 border border-slate-800 focus:border-amber-500 focus:outline-none uppercase"
            >
              <option value="all">Equipamiento: Todos</option>
              {equipmentList.map((eq) => (
                <option key={eq} value={eq as string}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-2xl p-3 border border-slate-800 focus:border-amber-500 focus:outline-none uppercase"
            >
              <option value="all">Nivel: Todos</option>
              <option value="beginner">Principiante (Beginner)</option>
              <option value="intermediate">Intermedio (Intermediate)</option>
              <option value="expert">Avanzado (Expert)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Image Preview */}
              <div className="relative h-64 bg-white overflow-hidden">
                <img
                  src={ex.image_urls[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'}
                  alt={ex.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-slate-700 uppercase">
                  {ex.equipment || 'General'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {ex.primary_muscles.map((m) => (
                    <span key={m} className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-amber-500/20">
                      {m}
                    </span>
                  ))}
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase">
                    {ex.level}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors">
                  {ex.name}
                </h3>

                {ex.instructions && ex.instructions.length > 0 && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {ex.instructions.join(' ')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 pt-0">
              <span className="text-[10px] text-slate-500 font-mono block">
                ID Externo: {ex.external_id || ex.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Plus className="w-5 h-5 text-amber-500 mr-2" />
                Crear Ejercicio para Gimnasio
              </h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nombre Ejercicio/Máquina</label>
                <input
                  type="text"
                  placeholder="Ej: Hack Squat de Discos Titán"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Equipamiento</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="cable">Cable</option>
                    <option value="machine">Machine</option>
                    <option value="body weight">Body Weight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nivel</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Músculos (Separados por coma)</label>
                <input
                  type="text"
                  placeholder="quadriceps, glutes"
                  value={primaryMuscles}
                  onChange={(e) => setPrimaryMuscles(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">URL de Imagen / GIF</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Instrucciones de Uso</label>
                <textarea
                  rows={2}
                  placeholder="Pasos de ejecución..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
