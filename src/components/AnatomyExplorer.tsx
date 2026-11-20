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
    <div className="titan-inset-well" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', minHeight: '540px', width: '100%', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* Left Pane - Anatomy Model */}
      <div className="titan-armor-card" style={{ flex: '0 0 250px', padding: '16px', display: 'flex', flexDirection: 'column', maxHeight: '540px', flexShrink: 0, overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => setModelType('front')}
              className={modelType === 'front' ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'}
              style={{
                padding: '4px 9px',
                fontSize: '10px',
              }}
            >
              Frente
            </button>
            <button 
              type="button"
              onClick={() => setModelType('back')}
              className={modelType === 'back' ? 'titan-btn-armor-glow' : 'titan-btn-armor-steel'}
              style={{
                padding: '4px 9px',
                fontSize: '10px',
              }}
            >
              Espalda
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => setGender('male')}
              className={gender === 'male' ? 'titan-btn-armor-copper' : 'titan-btn-armor-steel'}
              style={{
                padding: '4px 9px',
                fontSize: '10px',
              }}
            >
              Hombre
            </button>
            <button 
              type="button"
              onClick={() => setGender('female')}
              className={gender === 'female' ? 'titan-btn-armor-copper' : 'titan-btn-armor-steel'}
              style={{
                padding: '4px 9px',
                fontSize: '10px',
              }}
            >
              Mujer
            </button>
          </div>
        </div>

        <div style={{ width: '100%', flex: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '430px', overflow: 'hidden' }}>
          <Body
            data={bodyData}
            onBodyPartClick={handleMuscleClick}
            side={modelType}
            gender={gender}
            colors={['#334155', '#8C4D20', '#FF9838']}
            scale={1.2}
          />
        </div>
        
        <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
          Haz clic en un músculo para ver los ejercicios.
        </p>
      </div>

      {/* Right Pane - Exercise List */}
      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden', maxHeight: '540px' }}>
        <h4 className="titan-section-title" style={{ margin: 0, fontSize: '13px', color: '#FFBD4A' }}>
          {selectedMuscle ? `Ejercicios para: ${selectedMuscle}` : 'Selecciona un músculo'}
        </h4>

        <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selectedMuscle && filteredExercises.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No hay ejercicios registrados para este músculo específico.
            </div>
          )}

          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => onPreviewExercise(ex, filteredExercises)}
              title="Toca para ver vista previa y detalles"
              className="titan-armor-card titan-armor-card-interactive"
              style={{
                padding: '10px 12px',
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
                className="titan-btn-armor-copper"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddExercise(ex);
                }}
                style={{
                  fontSize: '10px',
                  padding: '6px 10px',
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
