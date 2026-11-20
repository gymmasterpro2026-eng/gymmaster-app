import React, { useState } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { Exercise } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';
import { matchesLevelFilter } from '../utils/workoutIntelligence';

interface ExerciseCatalogProps {
  exercises: Exercise[];
  onRefreshData?: () => void;
  initialSearchQuery?: string;
}

const S = {
  page: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  headerBanner: {
    padding: '24px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '20px',
    marginBottom: '24px'
  },
  badge: {
    padding: '4px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px'
  },
  title: { fontSize: '26px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: '12px 0 4px', letterSpacing: '0.03em', textTransform: 'uppercase' as const },
  subtitle: { fontSize: '13px', color: '#94A3B8', margin: 0 },
  
  toolbar: {
    padding: '16px',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px'
  },
  inputWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '12px 16px', fontSize: '13px'
  },
  select: {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '12px 16px', fontSize: '13px', textTransform: 'uppercase' as const,
  },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: {
    overflow: 'hidden' as const,
    display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between'
  },
  imgWrap: { position: 'relative' as const, height: '220px', background: '#000', borderBottom: '1px solid rgba(201,111,40,0.3)', padding: '10px', boxSizing: 'border-box' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'contain' as const, background: 'transparent', padding: 0, transition: 'transform 0.4s' },
  equipBadge: {
    position: 'absolute' as const, top: '12px', right: '12px', padding: '4px 10px', fontSize: '10px', zIndex: 2
  },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px', flex: 1 },
  tagWrap: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px' },
  muscleTag: { padding: '2px 8px', fontSize: '10px' },
  levelTag: { padding: '2px 8px', fontSize: '10px' },
  exName: { fontSize: '16px', fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", color: '#fff', margin: 0, lineHeight: 1.3 },
  exDesc: { fontSize: '12px', color: '#94A3B8', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  cardFooter: { padding: '0 20px 18px', fontSize: '10px', color: '#64748B', fontFamily: 'monospace' },

  modal: { width: '100%', maxWidth: '460px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' as const },
  mTitle: { fontSize: '19px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' },
  mLabel: { display: 'block', fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '6px' },
  mInput: { width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', marginBottom: '14px' },
  mBtnCancel: { fontSize: '12px', padding: '10px 16px' },
  mBtnSave: { fontSize: '12px', padding: '10px 20px' },
};

export const ExerciseCatalog: React.FC<ExerciseCatalogProps> = ({ exercises, onRefreshData, initialSearchQuery = '' }) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('barbell');
  const [level, setLevel] = useState('beginner');
  const [primaryMuscles, setPrimaryMuscles] = useState('chest');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const musclesList = Array.from(new Set(exercises.flatMap(ex => ex.primary_muscles))).sort();
  const equipmentList = Array.from(new Set(exercises.map(ex => ex.equipment).filter(Boolean))).sort();

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

  const filtered = exercises
    .map((ex, origIndex) => ({ ex, catalogIndex: origIndex + 1 }))
    .filter(({ ex, catalogIndex }) => {
      const query = search.trim().toLowerCase();
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

      const matchesMuscle = selectedMuscle === 'all' || ex.primary_muscles.includes(selectedMuscle);
      const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
      const matchesLevel = matchesLevelFilter(ex.level, selectedLevel);

      return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
    })
    .sort((a, b) => {
      const targetNum = getSearchNumber(search);
      if (targetNum !== null) {
        if (a.catalogIndex === targetNum) return -1;
        if (b.catalogIndex === targetNum) return 1;
      }
      return 0;
    });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    dataService.addCustomExercise({
      external_id: `custom_${Date.now()}`, name, level, equipment, primary_muscles: primaryMuscles.split(',').map(s => s.trim()),
      secondary_muscles: [], instructions: instructions.split('\n').filter(Boolean),
      image_urls: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'],
      gym_id: 'gym-titan-001',
    });
    setName(''); setShowAddCustomModal(false); if (onRefreshData) onRefreshData();
  };

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div className="titan-armor-banner" style={S.headerBanner}>
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="titan-badge-copper" style={S.badge}>GitHub exercises-dataset</span>
            <span className="titan-badge-emerald" style={S.badge}><span>🇪🇸</span> Traductor Español Activo</span>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, alignSelf: 'center', fontFamily: 'monospace' }}>Total: {exercises.length}</span>
          </div>
          <h1 style={S.title}>Catálogo Global de Ejercicios & Máquinas</h1>
          <p style={S.subtitle}>Base de datos unificada en español con mapeo de músculos, instrucciones y animaciones GIF ({exercises.length} ejercicios)</p>
        </div>
        <button className="titan-btn-sprite-active" onClick={() => setShowAddCustomModal(true)}>
          <Plus size={16} /> Añadir Ejercicio Personalizado
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="titan-armor-card" style={S.toolbar}>
        <div style={S.inputWrap}>
          <Search size={16} color="#D57A30" style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
          <input className="titan-input" style={{ ...S.input, paddingLeft: '40px' }} type="text" placeholder="Buscar por nombre o Nº..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="titan-select" style={S.select} value={selectedMuscle} onChange={e => setSelectedMuscle(e.target.value)}>
          <option value="all">Músculo: Todos</option>
          {musclesList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="titan-select" style={S.select} value={selectedEquipment} onChange={e => setSelectedEquipment(e.target.value)}>
          <option value="all">Equipamiento: Todos</option>
          {equipmentList.map(eq => <option key={eq} value={eq as string}>{eq}</option>)}
        </select>
        <select className="titan-select" style={S.select} value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
          <option value="all">Nivel: Todos</option>
          <option value="beginner">Principiante (Beginner)</option>
          <option value="intermediate">Intermedio (Intermediate)</option>
          <option value="expert">Avanzado (Expert)</option>
        </select>
      </div>

      {/* GRID */}
      <div style={S.grid}>
        {filtered.map(({ ex, catalogIndex }) => (
          <div key={ex.id} className="titan-armor-card titan-armor-card-interactive" style={S.card}
            onMouseEnter={e => { const img = e.currentTarget.querySelector('img'); if(img) img.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { const img = e.currentTarget.querySelector('img'); if(img) img.style.transform = 'scale(1)'; }}>
            <div>
              <div style={S.imgWrap} className="gm-gif-wrap">
                <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} style={S.img} className="gm-exercise-gif gm-exercise-gif-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'; }} />
                <div className="titan-badge-copper" style={S.equipBadge}>{ex.equipment || 'General'}</div>
              </div>
              <div style={S.cardBody}>
                <div style={S.tagWrap}>
                  <span className="titan-badge-copper" style={{ fontSize: '10px', padding: '2px 7px', fontFamily: 'monospace' }}>
                    Nº {catalogIndex}
                  </span>
                  {ex.primary_muscles.map(m => <span key={m} className="titan-badge-copper" style={S.muscleTag}>{m}</span>)}
                  <span className="titan-badge-steel" style={S.levelTag}>{ex.level}</span>
                </div>
                <h3 style={S.exName}>{ex.name}</h3>
                {ex.instructions && ex.instructions.length > 0 && (
                  <p style={S.exDesc}>{ex.instructions.join(' ')}</p>
                )}
              </div>
            </div>
            <div style={S.cardFooter}>ID Externo: {ex.external_id || ex.id}</div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showAddCustomModal && (
        <div className="titan-modal-overlay" style={{ zIndex: 100 }} onClick={() => setShowAddCustomModal(false)}>
          <div className="titan-modal" style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 className="titan-section-title" style={S.mTitle}><Plus color="#D57A30" /> Crear Ejercicio</h3>
            <form onSubmit={handleCreateCustom}>
              <label style={S.mLabel}>Nombre Ejercicio/Máquina</label>
              <input className="titan-input" style={S.mInput} type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Hack Squat..." />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={S.mLabel}>Equipamiento</label>
                  <select className="titan-select" style={S.mInput} value={equipment} onChange={e => setEquipment(e.target.value)}>
                    <option value="barbell">Barbell</option><option value="dumbbell">Dumbbell</option>
                    <option value="cable">Cable</option><option value="machine">Machine</option>
                    <option value="body weight">Body Weight</option>
                  </select>
                </div>
                <div>
                  <label style={S.mLabel}>Nivel</label>
                  <select className="titan-select" style={S.mInput} value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <label style={S.mLabel}>Músculos (Separados por coma)</label>
              <input className="titan-input" style={S.mInput} type="text" value={primaryMuscles} onChange={e => setPrimaryMuscles(e.target.value)} placeholder="quadriceps, glutes" />

              <label style={S.mLabel}>URL de Imagen / GIF</label>
              <input className="titan-input" style={S.mInput} type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />

              <label style={S.mLabel}>Instrucciones de Uso</label>
              <textarea className="titan-textarea" style={{ ...S.mInput, minHeight: '60px', fontFamily: 'inherit' }} rows={2} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Pasos de ejecución..." />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="titan-btn-armor-steel" style={S.mBtnCancel} onClick={() => setShowAddCustomModal(false)}>Cancelar</button>
                <button type="submit" className="titan-btn-armor-copper" style={S.mBtnSave}>Guardar en Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
