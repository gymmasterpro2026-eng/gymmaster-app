export type UserRole = 'coach' | 'alumno';

export interface Profile {
  id: string; // Auth UUID
  role: UserRole;
  gym_id: string;
  managed_by: string | null; // Coach UUID if role === 'alumno'
  full_name: string;
  email: string;
  password?: string;
  plan_active_until: string; // ISO timestamp
  avatar_url?: string;
  phone?: string;
}

export interface Exercise {
  id: string;
  external_id?: string;
  name: string;
  force?: 'push' | 'pull' | 'static' | string;
  level: 'beginner' | 'intermediate' | 'expert' | string;
  mechanic?: 'compound' | 'isolation' | string;
  equipment?: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  instructions: string[];
  image_urls: string[]; // URLs or dataset paths
  gym_id?: string | null; // NULL for global catalog, UUID for custom gym exercise
}

export interface Routine {
  id: string;
  alumno_id: string;
  coach_id: string;
  gym_id: string;
  nombre_rutina: string; // e.g. "Pecho y Tríceps - Lunes"
  activa: boolean;
  created_at: string;
  updated_at?: string;
  exercise_count?: number;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  exercise_id: string;
  semana?: number; // Ej: 1, 2, 3
  dia?: string; // Ej: 'Lunes', 'Martes', etc.
  series: number;
  repeticiones: number;
  peso_objetivo: number; // KG specified by Coach
  peso_real: number; // KG updated in real-time by Alumno
  orden: number;
  notas?: string;
  completed_series?: boolean[]; // Client helper state for training mode
  fecha_ultimo_cambio: string; // ISO timestamp (updated via server trigger)
  exercise?: Exercise; // Joined exercise relation
}

export interface RoutineWithLogs extends Routine {
  logs: RoutineLog[];
}

export interface GymTenant {
  id: string;
  name: string;
  logo_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at?: string;
  admin_email?: string;
}
