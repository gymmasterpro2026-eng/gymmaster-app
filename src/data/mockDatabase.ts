import { Profile, Routine, RoutineLog, GymTenant } from '../types';
import { INITIAL_EXERCISES } from './exerciseDatasetMock';

export const GYM_ID = 'gym-titan-001';

export const INITIAL_GYMS: GymTenant[] = [
  {
    id: GYM_ID,
    name: 'Titan Fitness Center',
    plan: 'enterprise',
    created_at: new Date().toISOString(),
    admin_email: 'carlos.mendoza@gymmaster.io'
  }
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'coach-001',
    role: 'coach',
    gym_id: GYM_ID,
    managed_by: null,
    full_name: 'Carlos "El Búfalo" Mendoza',
    email: 'carlos.mendoza@gymmaster.io',
    password: 'carlos123',
    plan_active_until: '2028-12-31T23:59:59Z',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+52 55 1234 5678'
  },
  {
    id: 'alumno-101',
    role: 'alumno',
    gym_id: GYM_ID,
    managed_by: 'coach-001',
    full_name: 'Santiago "Santi" Gómez',
    email: 'santiago.gomez@alumno.gymmaster.io',
    password: 'santi123',
    plan_active_until: '2026-10-15T23:59:59Z', // Active plan
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+52 55 9876 5432'
  },
  {
    id: 'alumno-102',
    role: 'alumno',
    gym_id: GYM_ID,
    managed_by: 'coach-001',
    full_name: 'Valeria Fernández',
    email: 'valeria.f@alumno.gymmaster.io',
    password: 'valeria123',
    plan_active_until: '2026-09-30T23:59:59Z', // Active plan
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+52 55 5555 4444'
  },
  {
    id: 'alumno-103',
    role: 'alumno',
    gym_id: GYM_ID,
    managed_by: 'coach-001',
    full_name: 'Mateo "Expired" Rossi',
    email: 'mateo.rossi@alumno.gymmaster.io',
    password: 'mateo123',
    plan_active_until: '2026-01-01T00:00:00Z', // Expired plan to test Time-Hack protection!
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+52 55 1111 2222'
  }
];

export const MOCK_ROUTINES: Routine[] = [
  {
    id: 'routine-001',
    alumno_id: 'alumno-101',
    coach_id: 'coach-001',
    gym_id: GYM_ID,
    nombre_rutina: 'Torso Hipertrofia - Día 1 (Lunes)',
    activa: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'routine-002',
    alumno_id: 'alumno-101',
    coach_id: 'coach-001',
    gym_id: GYM_ID,
    nombre_rutina: 'Pierna & Core - Día 2 (Miércoles)',
    activa: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'routine-003',
    alumno_id: 'alumno-102',
    coach_id: 'coach-001',
    gym_id: GYM_ID,
    nombre_rutina: 'Glúteos & Isquios Intensivo',
    activa: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_ROUTINE_LOGS: RoutineLog[] = [
  {
    id: 'log-001',
    routine_id: 'routine-001',
    exercise_id: 'ex-001', // Press Banca
    series: 4,
    repeticiones: 10,
    peso_objetivo: 70.0,
    peso_real: 72.5, // Updated by alumno
    orden: 1,
    notas: 'Puntualizar retipación escapular en la 3ra serie',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, true, false],
    exercise: INITIAL_EXERCISES[0]
  },
  {
    id: 'log-002',
    routine_id: 'routine-001',
    exercise_id: 'ex-002', // Lat pulldown
    series: 4,
    repeticiones: 12,
    peso_objetivo: 55.0,
    peso_real: 55.0,
    orden: 2,
    notas: 'Aguantar 1 segundo la contracción abajo',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, false, false],
    exercise: INITIAL_EXERCISES[1]
  },
  {
    id: 'log-003',
    routine_id: 'routine-001',
    exercise_id: 'ex-004', // Press militar mancuernas
    series: 3,
    repeticiones: 10,
    peso_objetivo: 22.0,
    peso_real: 20.0,
    orden: 3,
    notas: 'Cuidado con arqueo de zona lumbar',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [false, false, false],
    exercise: INITIAL_EXERCISES[3]
  },
  {
    id: 'log-004',
    routine_id: 'routine-001',
    exercise_id: 'ex-006', // Tricep pushdown
    series: 3,
    repeticiones: 15,
    peso_objetivo: 30.0,
    peso_real: 32.5,
    orden: 4,
    notas: 'Máxima extensión y bombeo',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [false, false, false],
    exercise: INITIAL_EXERCISES[5]
  },
  // Routine 003 for Valeria
  {
    id: 'log-005',
    routine_id: 'routine-003',
    exercise_id: 'ex-003', // Squat
    series: 4,
    repeticiones: 10,
    peso_objetivo: 60.0,
    peso_real: 65.0,
    orden: 1,
    notas: 'Sentadilla profunda',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, true, true],
    exercise: INITIAL_EXERCISES[2]
  },
  {
    id: 'log-006',
    routine_id: 'routine-003',
    exercise_id: 'ex-008', // Leg Press
    series: 4,
    repeticiones: 12,
    peso_objetivo: 120.0,
    peso_real: 130.0,
    orden: 2,
    notas: 'Énfasis en empujar con el talón',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, false, false],
    exercise: INITIAL_EXERCISES[7]
  }
];
