import fetch from 'node-fetch';

const url = 'https://samgpnczlznynnfhjjff.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWdwbmN6bHpueW5uZmhqamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjU1NjQsImV4cCI6MjA4Nzc0MTU2NH0.AV1Z-QlltfPp8am-_ALlgopoGB8WhOrle83TNZrjqTE';

const INITIAL_GYMS = [
  {
    id: 'gym-titan-001',
    name: 'Titan Fitness Center',
    plan: 'pro',
    created_at: new Date().toISOString(),
    admin_email: 'admin@titanfitness.com',
  },
  {
    id: 'gym-powerhouse-002',
    name: 'Powerhouse Gym Club',
    plan: 'enterprise',
    created_at: new Date().toISOString(),
    admin_email: 'contacto@powerhouse.com',
  },
];

const MOCK_PROFILES = [
  {
    id: 'coach-001',
    role: 'coach',
    gym_id: 'gym-titan-001',
    managed_by: null,
    full_name: 'Carlos "El Búfalo" Mendoza',
    email: 'carlos.mendoza@gymmaster.io',
    password: '123',
    plan_active_until: '2030-12-31T23:59:59Z',
    avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
    phone: '+52 55 1234 5678',
  },
  {
    id: 'alumno-101',
    role: 'alumno',
    gym_id: 'gym-titan-001',
    managed_by: 'coach-001',
    full_name: 'Santiago "Santi" Gómez',
    email: 'santiago.gomez@alumno.gymmaster.io',
    password: '123',
    plan_active_until: '2026-10-15T23:59:59Z',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+52 55 8765 4321',
  },
  {
    id: 'alumno-102',
    role: 'alumno',
    gym_id: 'gym-titan-001',
    managed_by: 'coach-001',
    full_name: 'Valeria Fernández',
    email: 'valeria.f@alumno.gymmaster.io',
    password: '123',
    plan_active_until: '2026-09-30T23:59:59Z',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    phone: '+52 55 9988 7766',
  },
  {
    id: 'alumno-103',
    role: 'alumno',
    gym_id: 'gym-titan-001',
    managed_by: 'coach-001',
    full_name: 'Mateo "Expired" Rossi',
    email: 'mateo.rossi@alumno.gymmaster.io',
    password: '123',
    plan_active_until: '2025-12-31T23:59:59Z',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+52 55 1122 3344',
  },
];

const MOCK_ROUTINES = [
  {
    id: 'routine-001',
    alumno_id: 'alumno-101',
    coach_id: 'coach-001',
    gym_id: 'gym-titan-001',
    nombre_rutina: 'Torso Hipertrofia - Lunes',
    activa: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'routine-003',
    alumno_id: 'alumno-102',
    coach_id: 'coach-001',
    gym_id: 'gym-titan-001',
    nombre_rutina: 'Glúteos & Isquios Intensivo - Martes',
    activa: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_ROUTINE_LOGS = [
  {
    id: 'log-001',
    routine_id: 'routine-001',
    exercise_id: 'ex-0001',
    series: 4,
    repeticiones: 10,
    peso_objetivo: 70.0,
    peso_real: 72.5,
    orden: 1,
    notas: 'Puntualizar retracción escapular en la 3ra serie',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, true, false],
  },
  {
    id: 'log-002',
    routine_id: 'routine-001',
    exercise_id: 'ex-0002',
    series: 4,
    repeticiones: 12,
    peso_objetivo: 55.0,
    peso_real: 55.0,
    orden: 2,
    notas: 'Aguantar 1 segundo la contracción abajo',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, false, false],
  },
  {
    id: 'log-003',
    routine_id: 'routine-001',
    exercise_id: 'ex-0003',
    series: 3,
    repeticiones: 10,
    peso_objetivo: 22.0,
    peso_real: 20.0,
    orden: 3,
    notas: 'Cuidado con arqueo de zona lumbar',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [false, false, false],
  },
  {
    id: 'log-005',
    routine_id: 'routine-003',
    exercise_id: 'ex-0004',
    series: 4,
    repeticiones: 10,
    peso_objetivo: 60.0,
    peso_real: 65.0,
    orden: 1,
    notas: 'Sentadilla profunda',
    fecha_ultimo_cambio: new Date().toISOString(),
    completed_series: [true, true, true, true],
  },
];

async function insertTable(tableName, rows) {
  const res = await fetch(`${url}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });
  console.log(`Pushed to ${tableName}: Status ${res.status}`);
}

async function seedAll() {
  await insertTable('gym_tenants', INITIAL_GYMS);
  await insertTable('gym_profiles', MOCK_PROFILES);
  await insertTable('gym_routines', MOCK_ROUTINES);
  await insertTable('gym_routine_logs', MOCK_ROUTINE_LOGS);
  console.log('Seed completed successfully!');
}

seedAll();
