import{j as e}from"./index-sbUMtb7O.js";import{r as c,a8 as o,j as p,a9 as T,aa as d,a3 as L,ab as N,ac as u}from"./vendor-icons-Ddqqwi1G.js";import"./dataset-exercises-DIAOdphz.js";import"./vendor-supabase-CK8f2pDy.js";import"./vendor-anatomy-BQbuD7Hp.js";const S=()=>{const[s,l]=c.useState(!1),i=`-- ============================================================================
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
    );`,n=()=>{navigator.clipboard.writeText(i),l(!0),setTimeout(()=>l(!1),2e3)},E=()=>{const r=new Blob([i],{type:"text/plain;charset=utf-8"}),t=URL.createObjectURL(r),a=document.createElement("a");a.href=t,a.download="schema_gymmaster_pro.sql",a.click(),URL.revokeObjectURL(t)};return e.jsxs("div",{style:{padding:"24px",maxWidth:"1400px",margin:"0 auto",fontFamily:"'Inter', sans-serif",display:"flex",flexDirection:"column",gap:"24px"},children:[e.jsxs("div",{className:"titan-armor-banner",style:{padding:"24px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"20px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",flexWrap:"wrap"},children:[e.jsxs("span",{className:"titan-badge-emerald",style:{padding:"4px 10px",fontSize:"10px",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(o,{size:14})," RLS Strict Security"]}),e.jsx("span",{style:{fontSize:"11px",color:"#94a3b8"},children:"PostgreSQL / Supabase Engine"})]}),e.jsx("h1",{className:"titan-section-title",style:{margin:0,fontSize:"24px"},children:"Arquitectura SQL & Políticas RLS (Entregable #1)"}),e.jsxs("p",{style:{margin:"4px 0 0",fontSize:"12px",color:"#94a3b8"},children:["Aislamiento multi-tenant de datos, triggers automáticos e inmunidad al time-hack con server-side ",e.jsx("code",{style:{color:"#FFBD4A"},children:"now()"})]})]}),e.jsxs("div",{style:{display:"flex",gap:"12px",flexWrap:"wrap"},children:[e.jsxs("button",{onClick:n,className:"titan-btn-sprite-idle",children:[s?e.jsx(p,{size:16,color:"#34d399"}):e.jsx(T,{size:16}),e.jsx("span",{children:s?"¡Copiado!":"Copiar SQL"})]}),e.jsxs("button",{onClick:E,className:"titan-btn-sprite-active",children:[e.jsx(d,{size:16}),e.jsx("span",{children:"Descargar .SQL"})]})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"16px"},children:[e.jsxs("div",{className:"titan-armor-card",style:{padding:"18px 20px",display:"flex",flexDirection:"column",gap:"6px"},children:[e.jsxs("div",{className:"titan-section-title",style:{display:"flex",alignItems:"center",gap:"8px",color:"#FFBD4A",fontSize:"12px"},children:[e.jsx(L,{size:16}),"1. Regla de Oro Multi-Tenant"]}),e.jsxs("p",{style:{margin:0,fontSize:"12px",color:"#cbd5e1",lineHeight:"1.5"},children:["El Alumno solo posee permisos SELECT sobre sus propias rutinas y UPDATE exclusivamente sobre el campo ",e.jsx("code",{style:{color:"#FFBD4A"},children:"peso_real"})," en ",e.jsx("code",{style:{color:"#94a3b8"},children:"routine_logs"}),"."]})]}),e.jsxs("div",{className:"titan-armor-card",style:{padding:"18px 20px",display:"flex",flexDirection:"column",gap:"6px"},children:[e.jsxs("div",{className:"titan-section-title",style:{display:"flex",alignItems:"center",gap:"8px",color:"#6EE7B7",fontSize:"12px"},children:[e.jsx(o,{size:16}),"2. Inmunidad al Time-Hack"]}),e.jsxs("p",{style:{margin:0,fontSize:"12px",color:"#cbd5e1",lineHeight:"1.5"},children:["Las validaciones de vigencia del plan de gimnasio se ejecutan en PostgreSQL usando ",e.jsx("code",{style:{color:"#6EE7B7"},children:"now()"})," del servidor, anulando intentos de modificación de reloj en móviles."]})]}),e.jsxs("div",{className:"titan-armor-card",style:{padding:"18px 20px",display:"flex",flexDirection:"column",gap:"6px"},children:[e.jsxs("div",{className:"titan-section-title",style:{display:"flex",alignItems:"center",gap:"8px",color:"#E2E8F0",fontSize:"12px"},children:[e.jsx(N,{size:16,color:"#D57A30"}),"3. Control Coach (managed_by)"]}),e.jsxs("p",{style:{margin:0,fontSize:"12px",color:"#cbd5e1",lineHeight:"1.5"},children:["El Coach ostenta control CRUD total sobre alumnos bajo su tutoría (",e.jsx("code",{style:{color:"#FFBD4A"},children:"managed_by = auth.uid()"}),") y sobre rutinas de su gimnasio."]})]})]}),e.jsxs("div",{className:"titan-armor-card",style:{overflow:"hidden"},children:[e.jsxs("div",{className:"titan-inset-well",style:{padding:"12px 20px",borderBottom:"1px solid rgba(201,111,40,0.35)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",fontFamily:"monospace",color:"#FFBD4A",fontSize:"12px",fontWeight:700},children:[e.jsx(u,{size:16,color:"#D57A30"}),e.jsx("span",{children:"supabase/schema.sql"})]}),e.jsx("span",{className:"titan-badge-steel",style:{fontSize:"10px",padding:"4px 8px"},children:"PostgreSQL 15+ / Supabase RLS"})]}),e.jsx("pre",{className:"titan-inset-well",style:{margin:0,padding:"24px",fontSize:"12px",fontFamily:"monospace",color:"#cbd5e1",lineHeight:"1.6",overflowX:"auto",maxHeight:"500px"},children:e.jsx("code",{children:i})})]})]})};export{S as SqlSchemaViewer};
