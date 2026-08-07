-- ============================================================================
-- GYMMASTER PRO - TABLAS PARA BASE DE DATOS COMPARTIDA EN SUPABASE (ANEXO COBRO)
-- Copiar y pegar este script en el SQL Editor de Supabase (https://supabase.com)
-- ============================================================================

-- 1. GYM TENANTS (Gimnasios)
CREATE TABLE IF NOT EXISTS public.gym_tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'pro',
    created_at TIMESTAMPTZ DEFAULT now(),
    admin_email TEXT
);

-- 2. GYM PROFILES (Coaches y Alumnos)
CREATE TABLE IF NOT EXISTS public.gym_profiles (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'alumno',
    gym_id TEXT NOT NULL,
    managed_by TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT,
    plan_active_until TIMESTAMPTZ NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GYM EXERCISES (Ejercicios personalizados o modificados)
CREATE TABLE IF NOT EXISTS public.gym_exercises (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    name TEXT NOT NULL,
    force TEXT,
    level TEXT NOT NULL DEFAULT 'beginner',
    mechanic TEXT,
    equipment TEXT,
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    instructions TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    gym_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GYM ROUTINES (Rutinas asignadas)
CREATE TABLE IF NOT EXISTS public.gym_routines (
    id TEXT PRIMARY KEY,
    alumno_id TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    gym_id TEXT NOT NULL,
    nombre_rutina TEXT NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GYM ROUTINE LOGS (Avances de cargas y repeticiones)
CREATE TABLE IF NOT EXISTS public.gym_routine_logs (
    id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    semana INT,
    dia TEXT,
    series INT NOT NULL,
    repeticiones INT NOT NULL,
    peso_objetivo NUMERIC NOT NULL,
    peso_real NUMERIC NOT NULL,
    orden INT NOT NULL,
    notas TEXT,
    completed_series BOOLEAN[] DEFAULT '{}',
    fecha_ultimo_cambio TIMESTAMPTZ DEFAULT now()
);

-- POLÍTICAS DE ACCESO (Permitir lectura y escritura abierta para la app)
ALTER TABLE public.gym_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routine_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total gym_tenants" ON public.gym_tenants;
DROP POLICY IF EXISTS "Acceso total gym_profiles" ON public.gym_profiles;
DROP POLICY IF EXISTS "Acceso total gym_exercises" ON public.gym_exercises;
DROP POLICY IF EXISTS "Acceso total gym_routines" ON public.gym_routines;
DROP POLICY IF EXISTS "Acceso total gym_routine_logs" ON public.gym_routine_logs;

CREATE POLICY "Acceso total gym_tenants" ON public.gym_tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total gym_profiles" ON public.gym_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total gym_exercises" ON public.gym_exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total gym_routines" ON public.gym_routines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total gym_routine_logs" ON public.gym_routine_logs FOR ALL USING (true) WITH CHECK (true);
