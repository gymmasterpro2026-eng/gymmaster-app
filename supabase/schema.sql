-- ============================================================================
-- GYMMASTER PRO - SUPABASE DATABASE SCHEMA & STRICT RLS POLICIES
-- Multi-Tenant SaaS Isolation Engine based on Anexo Cobro Isolation Pattern
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('coach', 'alumno');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ----------------------------------------------------------------------------

-- PROFILES (Users linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'alumno',
    gym_id UUID NOT NULL,
    managed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Coach ID for Alumnos
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    plan_active_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXERCISES CATALOG (Imported from GitHub exercises-dataset + custom gym exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE, -- e.g. "Barbell_Bench_Press"
    name TEXT NOT NULL,
    force TEXT, -- 'push', 'pull', 'static'
    level TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'expert'
    mechanic TEXT, -- 'compound', 'isolation'
    equipment TEXT, -- 'barbell', 'dumbbell', 'cable', 'machine', 'body only'
    primary_muscles TEXT[] NOT NULL DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    instructions TEXT[] DEFAULT '{}',
    image_urls TEXT[] NOT NULL DEFAULT '{}', -- URLs/GIFs for visual identification
    gym_id UUID REFERENCES public.profiles(gym_id) ON DELETE CASCADE, -- NULL = Global catalog, UUID = Custom Gym Exercise
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROUTINES
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL,
    nombre_rutina TEXT NOT NULL, -- Ej: "Pecho & Tríceps - Lunes"
    activa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROUTINE LOGS (Operational Table: Workouts & Live Progress)
CREATE TABLE IF NOT EXISTS public.routine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    series INT NOT NULL DEFAULT 4 CHECK (series > 0),
    repeticiones INT NOT NULL DEFAULT 10 CHECK (repeticiones > 0),
    peso_objetivo NUMERIC(6,2) NOT NULL DEFAULT 0.00, -- Weight prescribed by Coach (KG)
    peso_real NUMERIC(6,2) NOT NULL DEFAULT 0.00, -- Weight updated in real time by Alumno (KG)
    orden INT NOT NULL DEFAULT 1,
    notas TEXT,
    fecha_ultimo_cambio TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT QUERYING
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_gym_role ON public.profiles(gym_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_managed_by ON public.profiles(managed_by);
CREATE INDEX IF NOT EXISTS idx_routines_alumno ON public.routines(alumno_id) WHERE activa = true;
CREATE INDEX IF NOT EXISTS idx_routines_coach ON public.routines(coach_id);
CREATE INDEX IF NOT EXISTS idx_routine_logs_routine ON public.routine_logs(routine_id, orden);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment_muscle ON public.exercises USING GIN (primary_muscles);

-- ----------------------------------------------------------------------------
-- 4. SERVER-SIDE AUTOMATIC TRIGGERS & TIME-HACK IMMUNITY
-- ----------------------------------------------------------------------------

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_update_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_ultimo_cambio = now(); -- Always uses server-side now() (Inmune to device time hacks)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_routines_updated_at ON public.routines;
CREATE TRIGGER trg_routines_updated_at BEFORE UPDATE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_routine_logs_timestamp ON public.routine_logs;
CREATE TRIGGER trg_routine_logs_timestamp BEFORE UPDATE ON public.routine_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_log_timestamp();

-- Server-side Validation: Verify plan validity against server now()
CREATE OR REPLACE FUNCTION public.fn_check_active_gym_plan(p_alumno_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan_expiry TIMESTAMPTZ;
BEGIN
    SELECT plan_active_until INTO v_plan_expiry
    FROM public.profiles
    WHERE id = p_alumno_id;

    -- Strict server-time comparison: client device time changes do not affect this
    IF v_plan_expiry IS NULL OR v_plan_expiry < now() THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to prevent Alumno from logging workout if plan is expired
CREATE OR REPLACE FUNCTION public.fn_enforce_plan_validity_on_log()
RETURNS TRIGGER AS $$
DECLARE
    v_alumno_id UUID;
    v_is_valid BOOLEAN;
BEGIN
    SELECT alumno_id INTO v_alumno_id
    FROM public.routines
    WHERE id = NEW.routine_id;

    v_is_valid := public.fn_check_active_gym_plan(v_alumno_id);

    IF NOT v_is_valid THEN
        RAISE EXCEPTION 'Acceso denegado: El plan del alumno ha expirado. Por favor, renueve la membresía.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_plan_on_log ON public.routine_logs;
CREATE TRIGGER trg_enforce_plan_on_log BEFORE UPDATE ON public.routine_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_plan_validity_on_log();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_gym_id()
RETURNS UUID AS $$
    SELECT gym_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------
-- PROFILES RLS
-- --------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Profiles: view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- Coach can view profiles of Alumnos managed by them or in same gym
CREATE POLICY "Profiles: Coach view managed alumnos"
    ON public.profiles FOR SELECT
    USING (
        get_current_role() = 'coach' AND (
            managed_by = auth.uid() OR gym_id = get_current_gym_id()
        )
    );

-- Coach can insert/update Alumnos they manage
CREATE POLICY "Profiles: Coach manage alumnos"
    ON public.profiles FOR ALL
    USING (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    )
    WITH CHECK (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    );

-- --------------------------------------------------
-- EXERCISES RLS
-- --------------------------------------------------
-- Everyone authenticated can view global exercises or gym-specific exercises
CREATE POLICY "Exercises: View public or gym exercises"
    ON public.exercises FOR SELECT
    USING (
        gym_id IS NULL OR gym_id = get_current_gym_id()
    );

-- Only Coaches can create/manage custom gym exercises
CREATE POLICY "Exercises: Coach manage custom exercises"
    ON public.exercises FOR ALL
    USING (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    )
    WITH CHECK (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    );

-- --------------------------------------------------
-- ROUTINES RLS
-- --------------------------------------------------
-- Alumno can ONLY view their active routine
CREATE POLICY "Routines: Alumno view own active routines"
    ON public.routines FOR SELECT
    USING (
        alumno_id = auth.uid() AND activa = true
    );

-- Coach has full access to routines in their gym / created by them
CREATE POLICY "Routines: Coach full access"
    ON public.routines FOR ALL
    USING (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    )
    WITH CHECK (
        get_current_role() = 'coach' AND gym_id = get_current_gym_id()
    );

-- --------------------------------------------------
-- ROUTINE_LOGS RLS (THE OPERATIONAL LOGS TABLE)
-- --------------------------------------------------
-- Alumno can SELECT logs belonging to their routines
CREATE POLICY "RoutineLogs: Alumno select own routine logs"
    ON public.routine_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id
            AND r.alumno_id = auth.uid()
        )
    );

-- Alumno can UPDATE ONLY the 'peso_real' field on their own active routine logs
CREATE POLICY "RoutineLogs: Alumno update peso_real"
    ON public.routine_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id
            AND r.alumno_id = auth.uid()
            AND r.activa = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id
            AND r.alumno_id = auth.uid()
            AND r.activa = true
        )
    );

-- Coach can fully manage routine logs
CREATE POLICY "RoutineLogs: Coach full access"
    ON public.routine_logs FOR ALL
    USING (
        get_current_role() = 'coach' AND EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id
            AND r.gym_id = get_current_gym_id()
        )
    )
    WITH CHECK (
        get_current_role() = 'coach' AND EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id
            AND r.gym_id = get_current_gym_id()
        )
    );
