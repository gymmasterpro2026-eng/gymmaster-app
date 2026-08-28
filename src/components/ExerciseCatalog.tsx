import React, { useState } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { Exercise } from '../types';
import { dataService } from '../services/dataService';
import { fixImageUrl } from '../utils/imageUrl';

interface ExerciseCatalogProps {
  exercises: Exercise[];
  onRefreshData?: () => void;
  initialSearchQuery?: string;
}

const S = {
  page: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  headerBanner: {
    background: 'linear-gradient(135deg, #111827, #1f2937, #451a03)',
    border: '1px solid #475569', borderRadius: '0', padding: '24px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginBottom: '24px'
  },
  badge: {
    background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)',
    padding: '4px 12px', borderRadius: '0', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' as const,
  },
  badgeGreen: {
    background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)',
    padding: '4px 12px', borderRadius: '0', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px'
  },
  title: { fontSize: '28px', fontWeight: 900, color: '#fff', margin: '12px 0 4px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 },
  btnPrimary: {
    background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '0', padding: '12px 20px',
    fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(245,158,11,0.2)', transition: 'all 0.2s', textTransform: 'uppercase' as const, letterSpacing: '0.05em'
  },
  
  toolbar: {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', padding: '16px',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px'
  },
  inputWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', boxSizing: 'border-box' as const, background: '#121212', border: '1px solid #334155',
    borderRadius: '0', padding: '12px 16px', color: '#fff', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s',
  },
  select: {
    width: '100%', boxSizing: 'border-box' as const, background: '#121212', border: '1px solid #334155',
    borderRadius: '0', padding: '12px 16px', color: '#fff', fontSize: '13px', outline: 'none', textTransform: 'uppercase' as const,
  },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0', overflow: 'hidden' as const,
    display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', transition: 'all 0.2s'
  },
  imgWrap: { position: 'relative' as const, height: '220px', background: '#000' },
  img: { width: '100%', height: '100%', objectFit: 'contain' as const, padding: '10px', transition: 'transform 0.4s' },
  equipBadge: {
    position: 'absolute' as const, top: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
    color: '#f59e0b', padding: '4px 10px', borderRadius: '0', fontSize: '10px', fontWeight: 800, border: '1px solid #333', textTransform: 'uppercase' as const
  },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px', flex: 1 },
  tagWrap: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px' },
  muscleTag: { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '0', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const },
  levelTag: { background: '#1e293b', color: '#888', padding: '2px 8px', borderRadius: '0', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const },
  exName: { fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 },
  exDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  cardFooter: { padding: '0 20px 20px', fontSize: '10px', color: '#555', fontFamily: 'monospace' },

  modalOverlay: { position: 'fixed' as const, inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  modal: { background: '#0f172a', border: '1px solid #334155', borderRadius: '0', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' as const },
  mTitle: { fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '8px' },
  mLabel: { display: 'block', fontSize: '10px', fontWeight: 800, color: '#888', textTransform: 'uppercase' as const, marginBottom: '6px' },
  mInput: { width: '100%', boxSizing: 'border-box' as const, background: '#121212', border: '1px solid #334155', borderRadius: '0', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '16px' },
  mBtnCancel: { background: 'transparent', border: 'none', color: '#888', fontSize: '13px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer' },
  mBtnSave: { background: '#f59e0b', border: 'none', color: '#0f172a', fontSize: '13px', fontWeight: 900, padding: '10px 20px', borderRadius: '0', cursor: 'pointer' },
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
      const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;

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
      <div style={S.headerBanner}>
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={S.badge}>GitHub exercises-dataset</span>
            <span style={S.badgeGreen}><span>🇪🇸</span> Traductor Español Activo</span>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: 600, alignSelf: 'center' }}>Total: {exercises.length}</span>
          </div>
          <h1 style={S.title}>Catálogo Global de Ejercicios & Máquinas</h1>
          <p style={S.subtitle}>Base de datos unificada en español con mapeo de músculos, instrucciones y animaciones GIF (1,324 ejercicios)</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowAddCustomModal(true)}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <Plus size={16} /> Añadir Ejercicio Personalizado
        </button>
      </div>

      {/* TOOLBAR */}
      <div style={S.toolbar}>
        <div style={S.inputWrap}>
          <Search size={16} color="#888" style={{ position: 'absolute', left: '16px' }} />
          <input style={{ ...S.input, paddingLeft: '40px' }} type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />
        </div>
        <select style={S.select} value={selectedMuscle} onChange={e => setSelectedMuscle(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
          <option value="all">Músculo: Todos</option>
          {musclesList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select style={S.select} value={selectedEquipment} onChange={e => setSelectedEquipment(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
          <option value="all">Equipamiento: Todos</option>
          {equipmentList.map(eq => <option key={eq} value={eq as string}>{eq}</option>)}
        </select>
        <select style={S.select} value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
          <option value="all">Nivel: Todos</option>
          <option value="beginner">Principiante (Beginner)</option>
          <option value="intermediate">Intermedio (Intermediate)</option>
          <option value="expert">Avanzado (Expert)</option>
        </select>
      </div>

      {/* GRID */}
      <div style={S.grid}>
        {filtered.map(({ ex, catalogIndex }) => (
          <div key={ex.id} style={S.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; const img = e.currentTarget.querySelector('img'); if(img) img.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; const img = e.currentTarget.querySelector('img'); if(img) img.style.transform = 'scale(1)'; }}>
            <div>
              <div style={S.imgWrap} className="gm-gif-wrap">
                <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} style={S.img} className="gm-exercise-gif" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'; }} />
                <div style={S.equipBadge}>{ex.equipment || 'General'}</div>
              </div>
              <div style={S.cardBody}>
                <div style={S.tagWrap}>
                  <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '10px', fontWeight: 900, padding: '2px 6px', fontFamily: 'monospace' }}>
                    Nº {catalogIndex}
                  </span>
                  {ex.primary_muscles.map(m => <span key={m} style={S.muscleTag}>{m}</span>)}
                  <span style={S.levelTag}>{ex.level}</span>
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
        <div style={S.modalOverlay} onClick={() => setShowAddCustomModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.mTitle}><Plus color="#f59e0b" /> Crear Ejercicio</h3>
            <form onSubmit={handleCreateCustom}>
              <label style={S.mLabel}>Nombre Ejercicio/Máquina</label>
              <input style={S.mInput} type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Hack Squat..." onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={S.mLabel}>Equipamiento</label>
                  <select style={S.mInput} value={equipment} onChange={e => setEquipment(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
                    <option value="barbell">Barbell</option><option value="dumbbell">Dumbbell</option>
                    <option value="cable">Cable</option><option value="machine">Machine</option>
                    <option value="body weight">Body Weight</option>
                  </select>
                </div>
                <div>
                  <label style={S.mLabel}>Nivel</label>
                  <select style={S.mInput} value={level} onChange={e => setLevel(e.target.value)} onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'}>
                    <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <label style={S.mLabel}>Músculos (Separados por coma)</label>
              <input style={S.mInput} type="text" value={primaryMuscles} onChange={e => setPrimaryMuscles(e.target.value)} placeholder="quadriceps, glutes" onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />

              <label style={S.mLabel}>URL de Imagen / GIF</label>
              <input style={S.mInput} type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />

              <label style={S.mLabel}>Instrucciones de Uso</label>
              <textarea style={{ ...S.mInput, minHeight: '60px', fontFamily: 'inherit' }} rows={2} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Pasos de ejecución..." onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='#334155'} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" style={S.mBtnCancel} onClick={() => setShowAddCustomModal(false)}>Cancelar</button>
                <button type="submit" style={S.mBtnSave}>Guardar en Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
