-- =================================================================
-- PARCHE SQL: ACTIVAR BORRADO EN CASCADA AUTOMÁTICO EN SUPABASE
-- =================================================================
-- Ejecuta este código en el SQL Editor de tu panel de Supabase.

-- 1. Limpiar datos huérfanos (rutinas sin alumno) para evitar errores
DELETE FROM public.gym_routines
WHERE alumno_id NOT IN (SELECT id FROM public.gym_profiles);

-- 2. Limpiar logs huérfanos (ejercicios sin rutina)
DELETE FROM public.gym_routine_logs
WHERE routine_id NOT IN (SELECT id FROM public.gym_routines);

-- 3. Crear relación cascada entre Rutinas y Alumnos
ALTER TABLE public.gym_routines
  ADD CONSTRAINT fk_gym_routines_alumno
  FOREIGN KEY (alumno_id)
  REFERENCES public.gym_profiles(id)
  ON DELETE CASCADE;

-- 4. Crear relación cascada entre Logs de ejercicios y Rutinas
ALTER TABLE public.gym_routine_logs
  ADD CONSTRAINT fk_gym_logs_routine
  FOREIGN KEY (routine_id)
  REFERENCES public.gym_routines(id)
  ON DELETE CASCADE;

-- =================================================================
-- ¡Listo! Ahora al borrar un perfil (alumno o gym), la base 
-- de datos eliminará todo su contenido instantáneamente.
