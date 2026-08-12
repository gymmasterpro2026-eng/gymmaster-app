import { Exercise, Profile, Routine, RoutineLog, RoutineWithLogs, GymTenant } from '../types';
import { INITIAL_EXERCISES } from '../data/exerciseDatasetMock';
import { MOCK_PROFILES, MOCK_ROUTINES, MOCK_ROUTINE_LOGS, INITIAL_GYMS } from '../data/mockDatabase';
import { translateExercise, translateExerciseList } from './translationService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

class DataService {
  private profiles: Profile[] = [...MOCK_PROFILES];
  private exercises: Exercise[] = [...INITIAL_EXERCISES];
  private routines: Routine[] = [...MOCK_ROUTINES];
  private logs: RoutineLog[] = [...MOCK_ROUTINE_LOGS];
  private gyms: GymTenant[] = [...INITIAL_GYMS];
  private language: 'es' | 'en' = 'es';
  private listeners: Array<() => void> = [];
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = new Date();

  constructor() {
    this.loadFromLocalStorage();
    if (isSupabaseConfigured && supabase) {
      this.initCloudSync();
      this.subscribeRealtime();
    }
    // Auto-polling heartbeat every 20 seconds to keep APK, Web and Local 100% synchronized
    setInterval(() => {
      if (isSupabaseConfigured && supabase && !this.isSyncing) {
        this.syncNow();
      }
    }, 20000);
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getSyncState() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
    };
  }

  public async syncNow(): Promise<void> {
    if (!supabase) return;
    this.isSyncing = true;
    this.notify();

    try {
      await this.initCloudSync();
    } catch (e) {
      console.warn('Manual/Auto sync error:', e);
    } finally {
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notify();
    }
  }

  private async saveToCloud(operation: () => Promise<any>) {
    if (!supabase) return;
    try {
      await operation();
    } catch (e) {
      console.warn('Cloud operation error:', e);
    }
  }

  private async initCloudSync() {
    if (!supabase) return;
    try {
      // 1. Gym Tenants
      const { data: remoteGyms } = await supabase.from('gym_tenants').select('*');
      if (remoteGyms && remoteGyms.length > 0) {
        this.gyms = remoteGyms as GymTenant[];
      } else {
        await supabase.from('gym_tenants').upsert(this.gyms);
      }

      // 2. Profiles
      const { data: remoteProfiles } = await supabase.from('gym_profiles').select('*');
      if (remoteProfiles && remoteProfiles.length > 0) {
        this.profiles = remoteProfiles as Profile[];
      } else {
        await supabase.from('gym_profiles').upsert(this.profiles);
      }

      // 3. Routines
      const { data: remoteRoutines } = await supabase.from('gym_routines').select('*');
      if (remoteRoutines && remoteRoutines.length > 0) {
        this.routines = remoteRoutines as Routine[];
      } else {
        await supabase.from('gym_routines').upsert(this.routines);
      }

      // 4. Routine Logs
      const { data: remoteLogs } = await supabase.from('gym_routine_logs').select('*');
      if (remoteLogs && remoteLogs.length > 0) {
        this.logs = remoteLogs as RoutineLog[];
      } else {
        await supabase.from('gym_routine_logs').upsert(this.logs);
      }

      // 5. Custom Exercises
      const { data: remoteExercises } = await supabase.from('gym_exercises').select('*');
      if (remoteExercises && remoteExercises.length > 0) {
        const existingIds = new Set(this.exercises.map((e) => e.id));
        remoteExercises.forEach((re) => {
          if (!existingIds.has(re.id)) {
            this.exercises.unshift(re as Exercise);
          }
        });
      }

      this.persist();
    } catch (e) {
      console.warn('Error during Supabase sync, staying on local state:', e);
    }
  }

  private subscribeRealtime() {
    if (!supabase) return;
    try {
      supabase
        .channel('gymmaster-realtime-all')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_routines' }, () => this.syncNow())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_routine_logs' }, () => this.syncNow())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_profiles' }, () => this.syncNow())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_exercises' }, () => this.syncNow())
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription warning:', e);
    }
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

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_tenants').upsert(this.gyms);
        await supabase.from('gym_profiles').upsert(this.profiles);
        await supabase.from('gym_routines').upsert(this.routines);
        await supabase.from('gym_routine_logs').upsert(this.logs);
      });
    }
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

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_tenants').insert(newGym);
        await supabase.from('gym_profiles').insert(newCoach);
      });
    }

    return { gym: newGym, coach: newCoach };
  }

  login(identifier: string, password?: string): { profile: Profile; gym: GymTenant } | null {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (password || '').trim();

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

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_profiles').insert(newAlumno);
      });
    }

    return newAlumno;
  }

  updatePlanValidity(alumnoId: string, newDateIso: string) {
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (alumno) {
      alumno.plan_active_until = newDateIso;
      this.persist();

      if (supabase) {
        this.saveToCloud(async () => {
          await supabase.from('gym_profiles').update({ plan_active_until: newDateIso }).eq('id', alumnoId);
        });
      }
    }
  }

  updateAlumnoCredentials(alumnoId: string, email: string, password?: string) {
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (alumno) {
      alumno.email = email;
      alumno.password = password;
      this.persist();

      if (supabase) {
        this.saveToCloud(async () => {
          await supabase.from('gym_profiles').update({ email, password }).eq('id', alumnoId);
        });
      }
    }
  }

  updateProfile(profileId: string, updates: Partial<Profile>): Profile | undefined {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (profile) {
      Object.assign(profile, updates);
      this.persist();

      if (supabase) {
        this.saveToCloud(async () => {
          await supabase.from('gym_profiles').update(updates).eq('id', profileId);
        });
      }
      this.notify();
    }
    return profile;
  }

  deleteAlumno(alumnoId: string) {
    this.profiles = this.profiles.filter((p) => p.id !== alumnoId);
    this.routines = this.routines.filter((r) => r.alumno_id !== alumnoId);
    this.persist();

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_profiles').delete().eq('id', alumnoId);
      });
    }
    this.notify();
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

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_exercises').insert(newEx);
      });
    }

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
      exercise: this.getExerciseById(log.exercise_id),
    }));

    this.logs.push(...newLogs);
    this.persist();

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_routines').insert(newRoutine);
        await supabase.from('gym_routine_logs').insert(newLogs.map(({ exercise, ...l }) => l));
      });
    }

    return {
      ...newRoutine,
      logs: newLogs,
    };
  }

  updateRoutine(
    routineId: string,
    nombreRutina: string,
    logsData: {
      id?: string;
      exercise_id: string;
      semana?: number;
      dia?: string;
      series: number;
      repeticiones: number;
      peso_objetivo: number;
      peso_real?: number;
      orden?: number;
      notas?: string;
    }[]
  ): RoutineWithLogs | undefined {
    const routine = this.routines.find((r) => r.id === routineId);
    if (!routine) return undefined;

    routine.nombre_rutina = nombreRutina;
    routine.updated_at = new Date().toISOString();

    // Remove existing logs for this routine and replace with updated ones
    this.logs = this.logs.filter((l) => l.routine_id !== routineId);

    const updatedLogs: RoutineLog[] = logsData.map((log, idx) => ({
      id: log.id || `log-${Date.now()}-${idx}`,
      routine_id: routineId,
      exercise_id: log.exercise_id,
      semana: log.semana || 1,
      dia: log.dia || 'Lunes',
      series: log.series,
      repeticiones: log.repeticiones,
      peso_objetivo: log.peso_objetivo,
      peso_real: log.peso_real || 0,
      orden: log.orden || idx + 1,
      notas: log.notas || '',
      completed_series: new Array(log.series).fill(false),
      fecha_ultimo_cambio: new Date().toISOString(),
      exercise: this.getExerciseById(log.exercise_id),
    }));

    this.logs.push(...updatedLogs);
    this.persist();

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase.from('gym_routines').update({ nombre_rutina: nombreRutina, updated_at: routine.updated_at }).eq('id', routineId);
        await supabase.from('gym_routine_logs').delete().eq('routine_id', routineId);
        await supabase.from('gym_routine_logs').insert(updatedLogs.map(({ exercise, ...l }) => l));
      });
    }

    this.notify();
    return {
      ...routine,
      logs: updatedLogs,
    };
  }

  // REAL-TIME PESO_REAL UPDATE
  updatePesoReal(logId: string, nuevoPesoKg: number, alumnoId: string): { success: boolean; message: string } {
    const alumno = this.profiles.find((p) => p.id === alumnoId);
    if (!alumno) {
      return { success: false, message: 'Alumno no encontrado' };
    }

    const nowServerTime = new Date();
    const planExpiry = new Date(alumno.plan_active_until);

    if (planExpiry < nowServerTime) {
      return {
        success: false,
        message: '⚠️ Plan vencido: No se pueden registrar pesos. Por favor, renueva tu membresía en el gimnasio.',
      };
    }

    const log = this.logs.find((l) => l.id === logId);
    if (!log) {
      return { success: false, message: 'Ejercicio de la rutina no encontrado' };
    }

    const routine = this.routines.find((r) => r.id === log.routine_id);
    if (!routine || routine.alumno_id !== alumnoId) {
      return { success: false, message: 'Aislamiento Multi-Tenant (RLS): Operación denegada.' };
    }

    log.peso_real = nuevoPesoKg;
    log.fecha_ultimo_cambio = new Date().toISOString();
    this.persist();

    if (supabase) {
      this.saveToCloud(async () => {
        await supabase
          .from('gym_routine_logs')
          .update({ peso_real: nuevoPesoKg, fecha_ultimo_cambio: log.fecha_ultimo_cambio })
          .eq('id', logId);
      });
    }

    return { success: true, message: 'Peso cargado en tiempo real correctamente' };
  }

  toggleSetCompleted(logId: string, setIndex: number) {
    const log = this.logs.find((l) => l.id === logId);
    if (log) {
      if (!log.completed_series) {
        log.completed_series = new Array(log.series).fill(false);
      }
      log.completed_series[setIndex] = !log.completed_series[setIndex];
      this.persist();

      if (supabase) {
        this.saveToCloud(async () => {
          await supabase
            .from('gym_routine_logs')
            .update({ completed_series: log.completed_series })
            .eq('id', logId);
        });
      }
    }
  }
}

export const dataService = new DataService();
