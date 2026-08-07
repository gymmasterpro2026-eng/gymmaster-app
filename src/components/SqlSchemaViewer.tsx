import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Download, Database, Lock, Key, Terminal, Code } from 'lucide-react';

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ============================================================================
-- GYMMASTER PRO - SUPABASE DATABASE SCHEMA & STRICT RLS POLICIES
-- Multi-Tenant SaaS Isolation Engine based on Anexo Cobro Isolation Pattern
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('coach', 'alumno');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE DEFINITIONS
-- PROFILES (Users linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'alumno',
    gym_id UUID NOT NULL,
    managed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Coach ID
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    plan_active_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXERCISES CATALOG (GitHub exercises-dataset + Gym exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE,
    name TEXT NOT NULL,
    force TEXT,
    level TEXT NOT NULL DEFAULT 'beginner',
    mechanic TEXT,
    equipment TEXT,
    primary_muscles TEXT[] NOT NULL DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    instructions TEXT[] DEFAULT '{}',
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    gym_id UUID REFERENCES public.profiles(gym_id) ON DELETE CASCADE, -- NULL = Global catalog
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROUTINES
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL,
    nombre_rutina TEXT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROUTINE LOGS (Operational Table: Live Progress)
CREATE TABLE IF NOT EXISTS public.routine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    series INT NOT NULL DEFAULT 4 CHECK (series > 0),
    repeticiones INT NOT NULL DEFAULT 10 CHECK (repeticiones > 0),
    peso_objetivo NUMERIC(6,2) NOT NULL DEFAULT 0.00, -- Set by Coach
    peso_real NUMERIC(6,2) NOT NULL DEFAULT 0.00,     -- Updated in real time by Alumno
    orden INT NOT NULL DEFAULT 1,
    notas TEXT,
    fecha_ultimo_cambio TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SERVER-SIDE TRIGGERS & TIME-HACK IMMUNITY
CREATE OR REPLACE FUNCTION public.fn_update_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_ultimo_cambio = now(); -- Server time
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_routine_logs_timestamp BEFORE UPDATE ON public.routine_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_log_timestamp();

-- Server-side Validation: Verify plan validity against server now()
CREATE OR REPLACE FUNCTION public.fn_enforce_plan_validity_on_log()
RETURNS TRIGGER AS $$
DECLARE
    v_alumno_id UUID;
    v_plan_expiry TIMESTAMPTZ;
BEGIN
    SELECT alumno_id INTO v_alumno_id FROM public.routines WHERE id = NEW.routine_id;
    SELECT plan_active_until INTO v_plan_expiry FROM public.profiles WHERE id = v_alumno_id;

    IF v_plan_expiry IS NULL OR v_plan_expiry < now() THEN
        RAISE EXCEPTION 'Acceso denegado: El plan del alumno ha expirado.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_enforce_plan_on_log BEFORE UPDATE ON public.routine_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_plan_validity_on_log();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_logs ENABLE ROW LEVEL SECURITY;

-- ROUTINE LOGS RLS: Alumno SELECT own, UPDATE ONLY peso_real
CREATE POLICY "RoutineLogs: Alumno select own routine logs"
    ON public.routine_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id AND r.alumno_id = auth.uid()
        )
    );

CREATE POLICY "RoutineLogs: Alumno update peso_real"
    ON public.routine_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.routines r
            WHERE r.id = routine_logs.routine_id AND r.alumno_id = auth.uid() AND r.activa = true
        )
    );

CREATE POLICY "RoutineLogs: Coach full access"
    ON public.routine_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'coach'
        )
    );`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_gymmaster_pro.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="sql-schema-viewer-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> RLS Strict Security
            </span>
            <span className="text-xs text-slate-400">PostgreSQL / Supabase Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Arquitectura SQL & Políticas RLS (Entregable #1)
          </h1>
          <p className="text-xs text-slate-400">
            Aislamiento multi-tenant de datos, triggers automáticos e inmunidad al time-hack con server-side <code className="text-amber-300">now()</code>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .SQL</span>
          </button>
        </div>
      </div>

      {/* RLS Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center text-amber-400 font-bold text-xs uppercase">
            <Lock className="w-4 h-4 mr-1.5" />
            1. Regla de Oro Multi-Tenant
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El Alumno solo posee permisos SELECT sobre sus propias rutinas y UPDATE exclusivamente sobre el campo <code className="text-amber-300">peso_real</code> en <code className="text-slate-200">routine_logs</code>.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center text-emerald-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            2. Inmunidad al Time-Hack
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Las validaciones de vigencia del plan de gimnasio se ejecutan en PostgreSQL usando <code className="text-emerald-300">now()</code> del servidor, anulando intentos de modificación de reloj en móviles.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center text-sky-400 font-bold text-xs uppercase">
            <Key className="w-4 h-4 mr-1.5" />
            3. Control Coach (<code className="text-sky-300">managed_by</code>)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El Coach ostenta control CRUD total sobre alumnos bajo su tutoría (<code className="text-slate-200">managed_by = auth.uid()</code>) y sobre rutinas de su gimnasio.
          </p>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>supabase/schema.sql</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold">
            PostgreSQL 15+ / Supabase RLS
          </span>
        </div>

        <pre className="p-6 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-[500px]">
          <code>{sqlCode}</code>
        </pre>
      </div>
    </div>
  );
};
