import { Exercise, Profile, Routine, RoutineLog, RoutineWithLogs, GymTenant } from '../types';
import { INITIAL_EXERCISES } from '../data/exerciseDatasetMock';
import { MOCK_PROFILES, MOCK_ROUTINES, MOCK_ROUTINE_LOGS, INITIAL_GYMS } from '../data/mockDatabase';
import { translateExercise, translateExerciseList } from './translationService';

class DataService {
  private profiles: Profile[] = [...MOCK_PROFILES];
  private exercises: Exercise[] = [...INITIAL_EXERCISES];
  private routines: Routine[] = [...MOCK_ROUTINES];
  private logs: RoutineLog[] = [...MOCK_ROUTINE_LOGS];
  private gyms: GymTenant[] = [...INITIAL_GYMS];
  private language: 'es' | 'en' = 'es';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const savedProfiles = localStorage.getItem('gymmaster_profiles');
      const savedExercises = localStorage.getItem('gymmaster_exercises');
      const savedRoutines = localStorage.getItem('gymmaster_routines');
      const savedLogs = localStorage.getItem('gymmaster_logs');
      const savedGyms = localStorage.getItem('gymmaster_gyms');
      const savedLang = localStorage.getItem('gymmaster_lang');

      if (savedLang === 'en' || savedLang === 'es') {
        this.language = savedLang;
      }

      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed) && parsed.length > 0) this.profiles = parsed;
      }
      if (savedExercises) {
        const parsed = JSON.parse(savedExercises);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].image_urls) {
            this.exercises = parsed;
          } else {
            console.warn('Old exercise schema detected, resetting exercises to default.');
            this.exercises = [...INITIAL_EXERCISES];
          }
        }
      }
      if (savedRoutines) {
        const parsed = JSON.parse(savedRoutines);
        if (Array.isArray(parsed)) this.routines = parsed;
      }
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) this.logs = parsed;
      }
      if (savedGyms) {
        const parsed = JSON.parse(savedGyms);
        if (Array.isArray(parsed) && parsed.length > 0) this.gyms = parsed;
      }
    } catch (e) {
      console.warn('Could not parse localStorage, falling back to initial seed.');
      this.resetToDefault();
    }
  }

  private persist() {
    try {
      localStorage.setItem('gymmaster_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('gymmaster_exercises', JSON.stringify(this.exercises));
      localStorage.setItem('gymmaster_routines', JSON.stringify(this.routines));
      localStorage.setItem('gymmaster_logs', JSON.stringify(this.logs));
      localStorage.setItem('gymmaster_gyms', JSON.stringify(this.gyms));
      localStorage.setItem('gymmaster_lang', this.language);
    } catch (e) {
      console.error('Error persisting to localStorage', e);
    }
  }

  // LANGUAGE TOGGLE
  setLanguage(lang: 'es' | 'en') {
    this.language = lang;
    this.persist();
  }

  getLanguage(): 'es' | 'en' {
    return this.language;
  }

  // RESET
  resetToDefault() {
    this.profiles = [...MOCK_PROFILES];
    this.exercises = [...INITIAL_EXERCISES];
    this.routines = [...MOCK_ROUTINES];
    this.logs = [...MOCK_ROUTINE_LOGS];
    this.gyms = [...INITIAL_GYMS];
    this.language = 'es';
    this.persist();
  }

  // GYMS & TENANTS
  getGyms(): GymTenant[] {
    return this.gyms;
  }

  getGymById(id: string): GymTenant | undefined {
    return this.gyms.find((g) => g.id === id);
  }

  createGym(
    name: string,
    plan: 'free' | 'pro' | 'enterprise',
    adminName: string,
    adminEmail: string,
    adminPassword?: string
  ): { gym: GymTenant; coach: Profile } {
    const gymId = `gym-${Date.now()}`;
    const newGym: GymTenant = {
      id: gymId,
      name,
      plan,
      created_at: new Date().toISOString(),
      admin_email: adminEmail,
    };

    const coachId = `coach-${Date.now()}`;
    const newCoach: Profile = {
      id: coachId,
      role: 'coach',
      gym_id: gymId,
      managed_by: null,
      full_name: adminName,
      email: adminEmail,
      password: adminPassword || '123456',
      plan_active_until: '2030-12-31T23:59:59Z',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      phone: '+52 55 0000 0000',
    };

    this.gyms.push(newGym);
    this.profiles.push(newCoach);
    this.persist();

    return { gym: newGym, coach: newCoach };
  }

  login(identifier: string, password?: string): { profile: Profile; gym: GymTenant } | null {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // User 'gym' with password '12345'
    if (cleanId === 'gym' && (cleanPass === '12345' || !cleanPass)) {
      const coach = this.profiles.find((p) => p.role === 'coach') || this.profiles[0];
      const gym = this.gyms.find((g) => g.id === coach.gym_id) || this.gyms[0];
      return { profile: coach, gym };
    }

    const profile = this.profiles.find(
      (p) =>
        p.email.toLowerCase() === cleanId ||
        p.email.toLowerCase().split('@')[0] === cleanId ||
        p.full_name.toLowerCase().includes(cleanId)
    );
    if (!profile) return null;

    if (cleanPass && profile.password && profile.password !== cleanPass) {
      return null;
    }

    const gym = this.gyms.find((g) => g.id === profile.gym_id) || {
      id: profile.gym_id,
      name: 'Gym Personalizado',
      plan: 'pro' as const,
    };

    return { profile, gym };
  }

  // PROFILES & ALUMNOS
  getProfiles(): Profile[] {
    return this.profiles;
  }

  getAlumnosByCoach(coachId: string): Profile[] {
    return this.profiles.filter((p) => p.role === 'alumno' && p.managed_by === coachId);
  }

  getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  createAlumno(data: Omit<Profile, 'id' | 'role'>): Profile {
    const newAlumno: Profile = {
      ...data,
      id: `alumno-${Date.now()}`,
      role: 'alumno',
    };
    this.profiles.push(newAlumno);
    this.persist();
    return newAlumno;
  }

  updatePlanValidity(alumnoId: string, newDateIso: string) {
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (alumno) {
      alumno.plan_active_until = newDateIso;
      this.persist();
    }
  }

  updateAlumnoCredentials(alumnoId: string, email: string, password?: string) {
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (alumno) {
      alumno.email = email;
      alumno.password = password;
      this.persist();
    }
  }

  // EXERCISES CATALOG
  getExercises(): Exercise[] {
    if (this.language === 'es') {
      return translateExerciseList(this.exercises);
    }
    return this.exercises;
  }

  getExerciseById(id: string): Exercise | undefined {
    const found = this.exercises.find((e) => e.id === id);
    if (!found) return undefined;
    return this.language === 'es' ? translateExercise(found) : found;
  }

  addCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
    const newEx: Exercise = {
      ...exercise,
      id: `ex-${Date.now()}`,
    };
    this.exercises.unshift(newEx);
    this.persist();
    return newEx;
  }

  // ROUTINES
  getRoutinesForAlumno(alumnoId: string): RoutineWithLogs[] {
    const alumnoRoutines = this.routines.filter((r) => r.alumno_id === alumnoId);

    return alumnoRoutines.map((routine) => {
      const routineLogs = this.logs
        .filter((l) => l.routine_id === routine.id)
        .sort((a, b) => a.orden - b.orden)
        .map((log) => ({
          ...log,
          exercise: this.getExerciseById(log.exercise_id),
        }));

      return {
        ...routine,
        logs: routineLogs,
      };
    });
  }

  getActiveRoutineForAlumno(alumnoId: string): RoutineWithLogs | null {
    const activeRoutine = this.routines.find((r) => r.alumno_id === alumnoId && r.activa);
    if (!activeRoutine) return null;

    const routineLogs = this.logs
      .filter((l) => l.routine_id === activeRoutine.id)
      .sort((a, b) => a.orden - b.orden)
      .map((log) => ({
        ...log,
        exercise: this.getExerciseById(log.exercise_id),
      }));

    return {
      ...activeRoutine,
      logs: routineLogs,
    };
  }

  createRoutine(
    routineData: Omit<Routine, 'id' | 'created_at' | 'updated_at'>,
    exerciseLogs: Omit<RoutineLog, 'id' | 'routine_id' | 'fecha_ultimo_cambio'>[]
  ): RoutineWithLogs {
    // Deactivate existing active routines if this new one is active
    if (routineData.activa) {
      this.routines.forEach((r) => {
        if (r.alumno_id === routineData.alumno_id) {
          r.activa = false;
        }
      });
    }

    const routineId = `routine-${Date.now()}`;
    const newRoutine: Routine = {
      ...routineData,
      id: routineId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.routines.push(newRoutine);

    const newLogs: RoutineLog[] = exerciseLogs.map((log, idx) => ({
      ...log,
      id: `log-${Date.now()}-${idx}`,
      routine_id: routineId,
      fecha_ultimo_cambio: new Date().toISOString(),
      completed_series: new Array(log.series).fill(false),
      exercise: this.exercises.find((e) => e.id === log.exercise_id),
    }));

    this.logs.push(...newLogs);
    this.persist();

    return {
      ...newRoutine,
      logs: newLogs,
    };
  }

  // REAL-TIME PESO_REAL UPDATE (Operational core for Alumno in Training Mode)
  updatePesoReal(logId: string, nuevoPesoKg: number, alumnoId: string): { success: boolean; message: string } {
    // 1. Time-Hack Immunity Server-time Check Simulation
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (!alumno) {
      return { success: false, message: 'Alumno no encontrado' };
    }

    const nowServerTime = new Date(); // Simulating PostgreSQL server `now()`
    const planExpiry = new Date(alumno.plan_active_until);

    if (planExpiry < nowServerTime) {
      return {
        success: false,
        message: '⚠️ Plan vencido: No se pueden registrar pesos. Por favor, renueva tu membresía en el gimnasio.',
      };
    }

    // 2. Strict RLS Check Simulation: Check if log belongs to alumno's active routine
    const log = this.logs.find((l) => l.id === logId);
    if (!log) {
      return { success: false, message: 'Ejercicio de la rutina no encontrado' };
    }

    const routine = this.routines.find((r) => r.id === log.routine_id);
    if (!routine || routine.alumno_id !== alumnoId) {
      return { success: false, message: 'Aislamiento Multi-Tenant (RLS): Operación denegada.' };
    }

    // 3. Perform update on peso_real and update fecha_ultimo_cambio
    log.peso_real = nuevoPesoKg;
    log.fecha_ultimo_cambio = new Date().toISOString();
    this.persist();

    return { success: true, message: 'Peso cargado en tiempo real correctamente' };
  }

  // Toggle completed set for Alumno in Training Mode
  toggleSetCompleted(logId: string, setIndex: number) {
    const log = this.logs.find((l) => l.id === logId);
    if (log) {
      if (!log.completed_series) {
        log.completed_series = new Array(log.series).fill(false);
      }
      log.completed_series[setIndex] = !log.completed_series[setIndex];
      this.persist();
    }
  }
}

export const dataService = new DataService();
