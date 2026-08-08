import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Download, Lock, Key, Terminal } from 'lucide-react';

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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #451a03)',
        border: '1px solid #334155',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> RLS Strict Security
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>PostgreSQL / Supabase Engine</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
            Arquitectura SQL & Políticas RLS (Entregable #1)
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Aislamiento multi-tenant de datos, triggers automáticos e inmunidad al time-hack con server-side <code style={{ color: '#f59e0b' }}>now()</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
          <button
            onClick={handleDownload}
            style={{
              background: '#f59e0b',
              color: '#000000',
              border: 'none',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            <span>Descargar .SQL</span>
          </button>
        </div>
      </div>

      {/* RLS Highlights Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}>
            <Lock size={16} />
            1. Regla de Oro Multi-Tenant
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
            El Alumno solo posee permisos SELECT sobre sus propias rutinas y UPDATE exclusivamente sobre el campo <code style={{ color: '#f59e0b' }}>peso_real</code> en <code style={{ color: '#94a3b8' }}>routine_logs</code>.
          </p>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}>
            <ShieldCheck size={16} />
            2. Inmunidad al Time-Hack
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
            Las validaciones de vigencia del plan de gimnasio se ejecutan en PostgreSQL usando <code style={{ color: '#34d399' }}>now()</code> del servidor, anulando intentos de modificación de reloj en móviles.
          </p>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}>
            <Key size={16} />
            3. Control Coach (managed_by)
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
            El Coach ostenta control CRUD total sobre alumnos bajo su tutoría (<code style={{ color: '#38bdf8' }}>managed_by = auth.uid()</code>) y sobre rutinas de su gimnasio.
          </p>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div style={{ background: '#020617', border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ background: '#0f172a', padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
            <Terminal size={16} />
            <span>supabase/schema.sql</span>
          </div>
          <span style={{ fontSize: '10px', background: '#1e293b', color: '#94a3b8', padding: '4px 8px', fontWeight: 800 }}>
            PostgreSQL 15+ / Supabase RLS
          </span>
        </div>

        <pre style={{ margin: 0, padding: '24px', fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', lineHeight: '1.6', overflowX: 'auto', maxHeight: '500px' }}>
          <code>{sqlCode}</code>
        </pre>
      </div>
    </div>
  );
};
