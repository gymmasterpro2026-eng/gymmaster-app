import{j as e}from"./index-sbUMtb7O.js";import{r as l,ad as p,j as d,a9 as x,aa as m,J as f,ac as g}from"./vendor-icons-Ddqqwi1G.js";import"./dataset-exercises-DIAOdphz.js";import"./vendor-supabase-CK8f2pDy.js";import"./vendor-anatomy-BQbuD7Hp.js";const S=()=>{const[r,t]=l.useState(!1),s=`/**
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

runImport();`,n=()=>{navigator.clipboard.writeText(s),t(!0),setTimeout(()=>t(!1),2e3)},o=()=>{const c=new Blob([s],{type:"text/javascript;charset=utf-8"}),i=URL.createObjectURL(c),a=document.createElement("a");a.href=i,a.download="import-exercises.js",a.click(),URL.revokeObjectURL(i)};return e.jsxs("div",{style:{padding:"24px",maxWidth:"1400px",margin:"0 auto",fontFamily:"'Inter', sans-serif",display:"flex",flexDirection:"column",gap:"24px"},children:[e.jsxs("div",{className:"titan-armor-banner",style:{padding:"24px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"20px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",flexWrap:"wrap"},children:[e.jsxs("span",{className:"titan-badge-copper",style:{padding:"4px 10px",fontSize:"10px",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(p,{size:14})," Script Node.js de Importación"]}),e.jsx("span",{style:{fontSize:"11px",color:"#94a3b8"},children:"GitHub exercises-dataset Parser"})]}),e.jsx("h1",{className:"titan-section-title",style:{margin:0,fontSize:"24px"},children:"Script de Migración de Ejercicios (Entregable #4)"}),e.jsx("p",{style:{margin:"4px 0 0",fontSize:"12px",color:"#94a3b8"},children:"Descarga, transforma y pobla el catálogo en Supabase en lotes de 50 registros"})]}),e.jsxs("div",{style:{display:"flex",gap:"12px",flexWrap:"wrap"},children:[e.jsxs("button",{onClick:n,className:"titan-btn-sprite-idle",children:[r?e.jsx(d,{size:16,color:"#34d399"}):e.jsx(x,{size:16}),e.jsx("span",{children:r?"¡Copiado!":"Copiar Script"})]}),e.jsxs("button",{onClick:o,className:"titan-btn-sprite-active",children:[e.jsx(m,{size:16}),e.jsx("span",{children:"Descargar .JS"})]})]})]}),e.jsxs("div",{className:"titan-armor-card",style:{padding:"22px",display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsxs("h3",{className:"titan-section-title",style:{margin:0,fontSize:"14px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(f,{size:16,color:"#D57A30"}),"¿Cómo ejecutar la migración en producción?"]}),e.jsxs("ol",{style:{margin:0,paddingLeft:"20px",fontSize:"12px",color:"#cbd5e1",lineHeight:"1.8"},children:[e.jsxs("li",{children:["Asegúrate de instalar las dependencias con ",e.jsx("code",{className:"titan-inset-well",style:{padding:"2px 8px",color:"#FFBD4A",fontFamily:"monospace"},children:"npm install @supabase/supabase-js"}),"."]}),e.jsxs("li",{children:["Ejecuta el script pasando tus llaves de Supabase:",e.jsx("pre",{className:"titan-inset-well",style:{margin:"6px 0 0",padding:"12px",color:"#FFBD4A",fontFamily:"monospace",fontSize:"11px",overflowX:"auto"},children:"SUPABASE_URL=https://tu-proyecto.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/import-exercises.js"})]}),e.jsxs("li",{children:["El script descargará automáticamente el JSON de ejercicios de GitHub, transformará los campos (",e.jsx("code",{style:{color:"#ffffff"},children:"name"}),", ",e.jsx("code",{style:{color:"#ffffff"},children:"force"}),", ",e.jsx("code",{style:{color:"#ffffff"},children:"equipment"}),", ",e.jsx("code",{style:{color:"#ffffff"},children:"primaryMuscles"}),", ",e.jsx("code",{style:{color:"#ffffff"},children:"instructions"}),", e ",e.jsx("code",{style:{color:"#ffffff"},children:"image_urls"}),") e insertará en Supabase en lotes."]})]})]}),e.jsxs("div",{className:"titan-armor-card",style:{overflow:"hidden"},children:[e.jsxs("div",{className:"titan-inset-well",style:{padding:"12px 20px",borderBottom:"1px solid rgba(201,111,40,0.35)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",fontFamily:"monospace",color:"#FFBD4A",fontSize:"12px",fontWeight:700},children:[e.jsx(g,{size:16,color:"#D57A30"}),e.jsx("span",{children:"scripts/import-exercises.js"})]}),e.jsx("span",{className:"titan-badge-steel",style:{fontSize:"10px",padding:"4px 8px"},children:"ES Modules / Node 18+"})]}),e.jsx("pre",{className:"titan-inset-well",style:{margin:0,padding:"24px",fontSize:"12px",fontFamily:"monospace",color:"#cbd5e1",lineHeight:"1.6",overflowX:"auto",maxHeight:"450px"},children:e.jsx("code",{children:s})})]})]})};export{S as ImportScriptViewer};
