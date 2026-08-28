import React, { useState, useMemo, useEffect } from 'react';
import Body, { ExtendedBodyPart, Slug } from '@mjcdev/react-body-highlighter';
import { Exercise } from '../types';
import { fixImageUrl } from '../utils/imageUrl';

interface AnatomyExplorerProps {
  exercises: Exercise[];
  onAddExercise: (ex: Exercise) => void;
  onPreviewExercise: (ex: Exercise, contextList?: Exercise[]) => void;
  selectedWeek: number;
  selectedDay: string;
  initialGender?: 'male' | 'female';
}

export const AnatomyExplorer: React.FC<AnatomyExplorerProps> = ({
  exercises,
  onAddExercise,
  onPreviewExercise,
  selectedWeek,
  selectedDay,
  initialGender = 'male'
}) => {
  const [modelType, setModelType] = useState<'front' | 'back'>('front');
  const [gender, setGender] = useState<'male' | 'female'>(initialGender);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Sync with initialGender if it changes from parent
  useEffect(() => {
    setGender(initialGender);
  }, [initialGender]);

  // Mapeo a los slugs esperados por @mjcdev/react-body-highlighter
  const mapExerciseMusclesToModel = (primary_muscles: string[]): Slug[] => {
    const mapped: Slug[] = [];
    const lowerMuscles = primary_muscles.map(m => m.toLowerCase());
    
    lowerMuscles.forEach(m => {
      if (m.includes('pecho') || m.includes('chest') || m.includes('pectoral')) mapped.push('chest');
      if (m.includes('bicep') || m.includes('bícep')) {
        mapped.push('biceps');
        mapped.push('triceps');
      }
      if (m.includes('tricep') || m.includes('trícep')) {
        mapped.push('triceps');
        mapped.push('biceps'); // Vinculamos para área grande frontal
      }
      if (m.includes('hombro') || m.includes('deltoid') || m.includes('delt') || m.includes('shoulder')) mapped.push('deltoids');
      if (m.includes('espalda') || m.includes('back') || m.includes('dorsal') || m.includes('lat')) {
        mapped.push('upper-back');
        mapped.push('lower-back');
      }
      if (m.includes('trap')) mapped.push('trapezius');
      if (m.includes('abdomin') || m.includes('abs') || m.includes('core')) {
        mapped.push('abs');
        mapped.push('obliques');
      }
      if (m.includes('cuadric') || m.includes('cuádric') || m.includes('quad')) mapped.push('quadriceps');
      if (m.includes('isquio') || m.includes('femoral') || m.includes('hamstring')) mapped.push('hamstring');
      if (m.includes('glute') || m.includes('glúte')) mapped.push('gluteal');
      if (m.includes('gemelo') || m.includes('pantorrilla') || m.includes('calv') || m.includes('soleus')) mapped.push('calves');
      if (m.includes('antebrazo') || m.includes('forearm')) mapped.push('forearm');
      if (m.includes('abductor')) mapped.push('adductors');
      if (m.includes('adductor')) mapped.push('adductors');
      if (m.includes('cuello') || m.includes('neck') || m.includes('cervical')) mapped.push('neck');
    });

    return Array.from(new Set(mapped)); // Remove duplicates
  };

  const bodyData: ExtendedBodyPart[] = useMemo(() => {
    const allMuscles = new Set<Slug>();
    exercises.forEach(ex => {
      mapExerciseMusclesToModel(ex.primary_muscles).forEach(m => allMuscles.add(m));
    });

    const data: ExtendedBodyPart[] = Array.from(allMuscles).map(slug => ({
      slug,
      intensity: 1, // Represents available
    }));

    if (selectedMuscle) {
      // Si selecciona tríceps o bíceps, iluminamos ambos para que se vea un área gigante (todo el brazo)
      const musclesToHighlight = (selectedMuscle === 'biceps' || selectedMuscle === 'triceps') 
        ? ['biceps', 'triceps'] 
        : [selectedMuscle];

      musclesToHighlight.forEach(muscleToHighlight => {
        const idx = data.findIndex(d => d.slug === muscleToHighlight);
        if (idx !== -1) {
          data[idx].intensity = 2;
        } else {
          data.push({ slug: muscleToHighlight as Slug, intensity: 2 });
        }
      });
    }

    return data;
  }, [exercises, selectedMuscle]);

  const handleMuscleClick = (part: ExtendedBodyPart | any) => {
    if (part && part.slug) {
      setSelectedMuscle(part.slug);
    }
  };

  const filteredExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    
    return exercises.filter(ex => {
      const mappedMuscles = mapExerciseMusclesToModel(ex.primary_muscles);
      if (selectedMuscle === 'biceps' || selectedMuscle === 'triceps') {
        return mappedMuscles.includes('biceps') || mappedMuscles.includes('triceps');
      }
      return mappedMuscles.includes(selectedMuscle as Slug);
    });
  }, [exercises, selectedMuscle]);

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '540px', maxHeight: '540px', width: '100%', background: '#020617', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* Left Pane - Anatomy Model */}
      <div style={{ flex: '0 0 240px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', maxHeight: '540px', flexShrink: 0, overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => setModelType('front')}
              style={{
                background: modelType === 'front' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: modelType === 'front' ? '#f59e0b' : '#64748b',
                border: modelType === 'front' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #cbd5e1',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                borderRadius: '4px'
              }}
            >
              Frente
            </button>
            <button 
              type="button"
              onClick={() => setModelType('back')}
              style={{
                background: modelType === 'back' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: modelType === 'back' ? '#f59e0b' : '#64748b',
                border: modelType === 'back' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #cbd5e1',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                borderRadius: '4px'
              }}
            >
              Espalda
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => setGender('male')}
              style={{
                background: gender === 'male' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: gender === 'male' ? '#10b981' : '#64748b',
                border: gender === 'male' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #cbd5e1',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                borderRadius: '4px'
              }}
            >
              Hombre
            </button>
            <button 
              type="button"
              onClick={() => setGender('female')}
              style={{
                background: gender === 'female' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: gender === 'female' ? '#10b981' : '#64748b',
                border: gender === 'female' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #cbd5e1',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                borderRadius: '4px'
              }}
            >
              Mujer
            </button>
          </div>
        </div>

        <div style={{ width: '100%', flex: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '450px', overflow: 'hidden' }}>
          <Body
            data={bodyData}
            onBodyPartClick={handleMuscleClick}
            side={modelType}
            gender={gender}
            colors={['#475569', '#10b981', '#f59e0b']}
            scale={1.2}
          />
        </div>
        
        <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          Haz clic en un músculo para ver los ejercicios.
        </p>
      </div>

      {/* Right Pane - Exercise List */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>
          {selectedMuscle ? `Ejercicios para: ${selectedMuscle}` : 'Selecciona un músculo'}
        </h4>

        <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selectedMuscle && filteredExercises.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              No hay ejercicios registrados para este músculo específico.
            </div>
          )}

          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => onPreviewExercise(ex, filteredExercises)}
              title="Toca para ver vista previa y detalles"
              style={{
                padding: '10px 12px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {ex.image_urls?.[0] && (
                  <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} className="gm-exercise-gif" style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#000', padding: '2px', borderRadius: '4px' }} />
                )}
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                    {ex.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>
                    {ex.primary_muscles.join(', ')} | {ex.equipment}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddExercise(ex);
                }}
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  borderRadius: '4px'
                }}
              >
                + Añadir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
