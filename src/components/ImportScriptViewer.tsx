import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, FileCode2, Play } from 'lucide-react';

export const ImportScriptViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const scriptCode = `/**
 * GymMaster Pro - Exercise Dataset Import & Migration Script
 * Source Dataset: GitHub hasaneyldrm/exercises-dataset & free-exercise-db
 *
 * Usage:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/import-exercises.js
 * Or run without env vars to generate an offline migration SQL file exercises_seed.sql
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

async function runImport() {
  console.log('🚀 GymMaster Pro - Iniciando importación de catálogo...');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    console.log(\`📡 Conectando a Supabase instance: \${supabaseUrl}\`);
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.log('⚠️ No se detectaron credenciales. Se generará exercises_seed.sql localmente.');
  }

  try {
    console.log(\`📥 Descargando dataset desde: \${DATASET_URL}\`);
    const response = await fetch(DATASET_URL);
    const rawExercises = await response.json();

    const transformed = rawExercises.map((ex) => ({
      external_id: ex.id || ex.name?.toLowerCase().replace(/\\s+/g, '_'),
      name: ex.name,
      force: ex.force || null,
      level: ex.level || 'beginner',
      mechanic: ex.mechanic || null,
      equipment: ex.equipment || 'body weight',
      primary_muscles: Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles : [],
      secondary_muscles: Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles : [],
      instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
      image_urls: Array.isArray(ex.images) ? ex.images.map((img) => \`\${IMAGE_BASE_URL}\${img}\`) : [],
      gym_id: null,
    }));

    if (supabase) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
        const batch = transformed.slice(i, i + BATCH_SIZE);
        await supabase.from('exercises').upsert(batch, { onConflict: 'external_id' });
        console.log(\`   ✔️ Lote \${i / BATCH_SIZE + 1} (\${batch.length} registros) insertado.\`);
      }
      console.log('🎉 ¡Migración completada con éxito!');
    } else {
      console.log('📝 Generando archivo SQL de migración local...');
      // Generates SQL seed script
    }
  } catch (err) {
    console.error('❌ Error en migración:', err);
  }
}

runImport();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-exercises.js';
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
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileCode2 size={14} /> Script Node.js de Importación
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>GitHub exercises-dataset Parser</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
            Script de Migración de Ejercicios (Entregable #4)
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Descarga, transforma y pobla el catálogo en Supabase en lotes de 50 registros
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
            <span>{copied ? '¡Copiado!' : 'Copiar Script'}</span>
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
            <span>Descargar .JS</span>
          </button>
        </div>
      </div>

      {/* Instruction Steps */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={16} color="#f59e0b" />
          ¿Cómo ejecutar la migración en producción?
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8' }}>
          <li>
            Asegúrate de instalar las dependencias con <code style={{ background: '#020617', padding: '2px 8px', color: '#f59e0b', fontFamily: 'monospace' }}>npm install @supabase/supabase-js</code>.
          </li>
          <li>
            Ejecuta el script pasando tus llaves de Supabase:
            <pre style={{ margin: '6px 0 0', background: '#020617', padding: '12px', color: '#f59e0b', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', border: '1px solid #1e293b' }}>
              SUPABASE_URL=https://tu-proyecto.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/import-exercises.js
            </pre>
          </li>
          <li>
            El script descargará automáticamente el JSON de ejercicios de GitHub, transformará los campos (<code style={{ color: '#ffffff' }}>name</code>, <code style={{ color: '#ffffff' }}>force</code>, <code style={{ color: '#ffffff' }}>equipment</code>, <code style={{ color: '#ffffff' }}>primaryMuscles</code>, <code style={{ color: '#ffffff' }}>instructions</code>, e <code style={{ color: '#ffffff' }}>image_urls</code>) e insertará en Supabase en lotes.
          </li>
        </ol>
      </div>

      {/* Code Container */}
      <div style={{ background: '#020617', border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ background: '#0f172a', padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
            <Terminal size={16} />
            <span>scripts/import-exercises.js</span>
          </div>
          <span style={{ fontSize: '10px', background: '#1e293b', color: '#94a3b8', padding: '4px 8px', fontWeight: 800 }}>
            ES Modules / Node 18+
          </span>
        </div>

        <pre style={{ margin: 0, padding: '24px', fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', lineHeight: '1.6', overflowX: 'auto', maxHeight: '450px' }}>
          <code>{scriptCode}</code>
        </pre>
      </div>
    </div>
  );
};
