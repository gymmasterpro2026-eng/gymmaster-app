/**
 * GymMaster Pro - Exercise Dataset Import & Migration Script
 * Source Dataset: GitHub hasaneyldrm/exercises-dataset & free-exercise-db
 *
 * Usage:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/import-exercises.js
 * Or run without env vars to generate an offline migration SQL file `exercises_seed.sql`
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Primary dataset URL (Fallback to GitHub RAW asset CDN)
const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

async function runImport() {
  console.log('🚀 GymMaster Pro - Iniciando importación de catálogo de ejercicios...');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    console.log(`📡 Conectando a Supabase instance: ${supabaseUrl}`);
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.log('⚠️ No se detectaron credenciales de Supabase en entorno. Se generará un archivo SQL de migración (exercises_seed.sql).');
  }

  try {
    console.log(`📥 Descargando dataset desde: ${DATASET_URL}`);
    const response = await fetch(DATASET_URL);

    if (!response.ok) {
      throw new Error(`Error en descarga HTTP ${response.status}: ${response.statusText}`);
    }

    const rawExercises = await response.json();
    console.log(`✅ Dataset cargado. Total de ejercicios encontrados: ${rawExercises.length}`);

    // Transform and map to GymMaster Pro database schema
    const transformed = rawExercises.map((ex) => {
      // Map images to full absolute URLs
      const imageUrls = Array.isArray(ex.images)
        ? ex.images.map((img) => `${IMAGE_BASE_URL}${img}`)
        : [];

      return {
        external_id: ex.id || ex.name?.toLowerCase().replace(/\s+/g, '_'),
        name: ex.name,
        force: ex.force || null,
        level: ex.level || 'beginner',
        mechanic: ex.mechanic || null,
        equipment: ex.equipment || 'body weight',
        primary_muscles: Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles : [],
        secondary_muscles: Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles : [],
        instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
        image_urls: imageUrls,
        gym_id: null, // NULL = Global shared catalog
      };
    });

    if (supabase) {
      // Insert in batches of 50
      const BATCH_SIZE = 50;
      console.log(`⚡ Insertando ${transformed.length} ejercicios en Supabase en lotes de ${BATCH_SIZE}...`);

      for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
        const batch = transformed.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('exercises')
          .upsert(batch, { onConflict: 'external_id' });

        if (error) {
          console.error(`❌ Error al insertar lote ${i / BATCH_SIZE + 1}:`, error.message);
        } else {
          console.log(`   ✔️ Lote ${i / BATCH_SIZE + 1} (${batch.length} registros) insertado con éxito.`);
        }
      }

      console.log('🎉 ¡Migración a Supabase completada con éxito!');
    } else {
      // Generate SQL Seed File
      console.log('📝 Generando archivo SQL de migración local...');
      const sqlStatements = transformed.map((ex) => {
        const primaryMusclesArr = `ARRAY[${ex.primary_muscles.map((m) => `'${m.replace(/'/g, "''")}'`).join(',')}]`;
        const secondaryMusclesArr = `ARRAY[${ex.secondary_muscles.map((m) => `'${m.replace(/'/g, "''")}'`).join(',')}]`;
        const instructionsArr = `ARRAY[${ex.instructions.map((ins) => `'${ins.replace(/'/g, "''")}'`).join(',')}]`;
        const imagesArr = `ARRAY[${ex.image_urls.map((img) => `'${img.replace(/'/g, "''")}'`).join(',')}]`;

        return `INSERT INTO public.exercises (external_id, name, force, level, mechanic, equipment, primary_muscles, secondary_muscles, instructions, image_urls, gym_id)
VALUES ('${ex.external_id}', '${ex.name.replace(/'/g, "''")}', ${ex.force ? `'${ex.force}'` : 'NULL'}, '${ex.level}', ${ex.mechanic ? `'${ex.mechanic}'` : 'NULL'}, ${ex.equipment ? `'${ex.equipment.replace(/'/g, "''")}'` : 'NULL'}, ${primaryMusclesArr}, ${secondaryMusclesArr}, ${instructionsArr}, ${imagesArr}, NULL)
ON CONFLICT (external_id) DO UPDATE SET
  name = EXCLUDED.name,
  force = EXCLUDED.force,
  level = EXCLUDED.level,
  mechanic = EXCLUDED.mechanic,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  image_urls = EXCLUDED.image_urls;`;
      });

      const fullSqlContent = `-- GYMMASTER PRO - SEED EXERCISES DATASET\n-- Generated on ${new Date().toISOString()}\n\n` + sqlStatements.join('\n\n');
      
      const outputPath = path.join(process.cwd(), 'supabase', 'exercises_seed.sql');
      fs.writeFileSync(outputPath, fullSqlContent, 'utf8');
      console.log(`✅ Archivo de seed generado exitosamente en: ${outputPath}`);
      console.log('👉 Puedes ejecutar este script en la consola SQL de Supabase para poblar el catálogo.');
    }
  } catch (err) {
    console.error('❌ Error catastrófico en la migración:', err);
    process.exit(1);
  }
}

runImport();
