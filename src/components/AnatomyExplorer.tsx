import React, { useState, useMemo } from 'react';
import Model, { IExerciseData, IMuscleStats, Muscle } from 'react-body-highlighter';
import { Exercise } from '../types';
import { fixImageUrl } from '../utils/imageUrl';

interface AnatomyExplorerProps {
  exercises: Exercise[];
  onAddExercise: (ex: Exercise) => void;
  onPreviewExercise: (ex: Exercise) => void;
  selectedWeek: number;
  selectedDay: string;
}

export const AnatomyExplorer: React.FC<AnatomyExplorerProps> = ({
  exercises,
  onAddExercise,
  onPreviewExercise,
  selectedWeek,
  selectedDay
}) => {
  const [modelType, setModelType] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Mapeo rudimentario de los músculos de GymMaster PRO a los esperados por react-body-highlighter
  const mapExerciseMusclesToModel = (primary_muscles: string[]): Muscle[] => {
    const mapped: Muscle[] = [];
    const lowerMuscles = primary_muscles.map(m => m.toLowerCase());
    
    lowerMuscles.forEach(m => {
      if (m.includes('pecho') || m.includes('chest') || m.includes('pectoral')) mapped.push('chest');
      if (m.includes('bicep') || m.includes('bícep')) mapped.push('biceps');
      if (m.includes('tricep') || m.includes('trícep')) mapped.push('triceps');
      if (m.includes('hombro') || m.includes('deltoid') || m.includes('delt') || m.includes('shoulder')) {
        mapped.push('front-deltoids');
        mapped.push('back-deltoids');
      }
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
      if (m.includes('gemelo') || m.includes('pantorrilla') || m.includes('calv') || m.includes('soleus')) {
        mapped.push('calves');
        mapped.push('left-soleus');
        mapped.push('right-soleus');
      }
      if (m.includes('antebrazo') || m.includes('forearm')) mapped.push('forearm');
      if (m.includes('abductor')) mapped.push('abductors');
      if (m.includes('adductor')) mapped.push('adductor');
    });

    return Array.from(new Set(mapped)); // Remove duplicates
  };

  const bodyData: IExerciseData[] = useMemo(() => {
    const allMuscles = new Set<Muscle>();
    exercises.forEach(ex => {
      mapExerciseMusclesToModel(ex.primary_muscles).forEach(m => allMuscles.add(m));
    });

    const data: IExerciseData[] = [
      {
        name: 'Available',
        muscles: Array.from(allMuscles)
      }
    ];

    if (selectedMuscle) {
      data.push({
        name: 'Selected',
        muscles: [selectedMuscle as Muscle]
      });
    }

    return data;
  }, [exercises, selectedMuscle]);

  const handleMuscleClick = (stats: IMuscleStats | any) => {
    // some versions return the object, some call it directly with no args if background clicked.
    if (stats && stats.muscle) {
      setSelectedMuscle(stats.muscle);
    }
  };

  const filteredExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    
    return exercises.filter(ex => {
      const mappedMuscles = mapExerciseMusclesToModel(ex.primary_muscles);
      return mappedMuscles.includes(selectedMuscle as Muscle);
    });
  }, [exercises, selectedMuscle]);

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '450px', maxHeight: '450px', width: '100%', background: '#020617', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* Left Pane - Interactive Body */}
      <div style={{ 
        flex: '0 0 240px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: '#0f172a', 
        border: '1px solid #1e293b', 
        borderRadius: '8px',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={() => setModelType('anterior')}
            style={{
              background: modelType === 'anterior' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: modelType === 'anterior' ? '#f59e0b' : '#64748b',
              border: modelType === 'anterior' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #334155',
              padding: '6px 12px',
              fontSize: '12px',
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
            onClick={() => setModelType('posterior')}
            style={{
              background: modelType === 'posterior' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: modelType === 'posterior' ? '#f59e0b' : '#64748b',
              border: modelType === 'posterior' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #334155',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              borderRadius: '4px'
            }}
          >
            Espalda
          </button>
        </div>

        <div style={{ width: '100%', flex: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '300px', overflow: 'hidden' }}>
          <Model
            data={bodyData}
            style={{ width: '180px', height: '100%' }}
            onClick={handleMuscleClick as any}
            type={modelType}
            bodyColor="#0f172a"
            highlightedColors={['#334155', '#f59e0b']}
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
              onClick={() => onPreviewExercise(ex)}
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
                  <img src={fixImageUrl(ex.image_urls[0])} alt={ex.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', padding: '2px', borderRadius: '4px' }} />
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
