import React from 'react';
import { FolderTree, FileCode, Folder } from 'lucide-react';

export const FolderStructureViewer: React.FC = () => {
  const structureTree = [
    { name: 'supabase/', desc: 'Configuración SQL, migraciones y esquemas de base de datos', isDir: true },
    { name: '  ├── schema.sql', desc: 'Entregable #1: Tablas (profiles, exercises, routines, routine_logs), Triggers y Políticas RLS', isDir: false },
    { name: '  └── exercises_seed.sql', desc: 'Dataset de ejercicios de respaldo en formato SQL INSERT', isDir: false },
    { name: 'scripts/', desc: 'Scripts de backend y utilidades CLI de Node.js', isDir: true },
    { name: '  └── import-exercises.js', desc: 'Entregable #4: Script Node.js de parseo e inserción por lotes desde GitHub dataset', isDir: false },
    { name: 'src/', desc: 'Código fuente de la aplicación React con TypeScript', isDir: true },
    { name: '  ├── types/', desc: 'Definición de interfaces TypeScript y tipos de dominio', isDir: true },
    { name: '  │   └── index.ts', desc: 'Tipos: UserRole, Profile, Exercise, Routine, RoutineLog', isDir: false },
    { name: '  ├── services/', desc: 'Capa de datos y cliente Supabase', isDir: true },
    { name: '  │   ├── supabaseClient.ts', desc: 'Instancia cliente Supabase con soporte para RLS y Auth', isDir: false },
    { name: '  │   └── dataService.ts', desc: 'Motor de estado reactivo y simulación de RLS / Time-Hack server side check', isDir: false },
    { name: '  ├── data/', desc: 'Mocks iniciales y dataset local', isDir: true },
    { name: '  │   ├── exerciseDatasetMock.ts', desc: 'Muestras de ejercicios transformados del repositorio de GitHub', isDir: false },
    { name: '  │   └── mockDatabase.ts', desc: 'Perfiles de Coach y Alumnos con fechas de vencimiento', isDir: false },
    { name: '  ├── components/', desc: 'Componentes de interfaz UI modularizada', isDir: true },
    { name: '  │   ├── DashboardAlumno.tsx', desc: 'Entregable #3: Modo Entrenamiento interactivo para la sala de pesas con log de KG', isDir: false },
    { name: '  │   ├── DashboardCoach.tsx', desc: 'Panel de control de Coach, alumnos y fechas de vencimiento de planes', isDir: false },
    { name: '  │   ├── RoutineBuilder.tsx', desc: 'Diseñador de rutinas personalizadas y asignación de peso objetivo', isDir: false },
    { name: '  │   ├── ExerciseCatalog.tsx', desc: 'Buscador de catálogo con imágenes/GIFs e instrucciones de máquinas', isDir: false },
    { name: '  │   ├── SqlSchemaViewer.tsx', desc: 'Visor y exportador interactivo del script SQL de Supabase', isDir: false },
    { name: '  │   ├── ImportScriptViewer.tsx', desc: 'Visor y exportador interactivo del script Node.js', isDir: false },
    { name: '  │   └── Navbar.tsx', desc: 'Barra superior con conmutador de roles (Coach vs Alumno) y estado del SaaS', isDir: false },
    { name: '  ├── App.tsx', desc: 'Componente principal con enrutamiento de pestañas y sincronización', isDir: false },
    { name: '  └── main.tsx', desc: 'Punto de entrada de React 19 / Vite', isDir: false },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #451a03)',
        border: '1px solid #334155',
        padding: '24px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderTree size={14} /> Arquitectura de Software
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>GymMaster Pro Architecture</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
          Estructura de Carpetas del Proyecto (Entregable #2)
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Diseño modular, desacoplado y optimizado para escalabilidad SaaS Multi-tenant en React + Supabase + Capacitor
        </p>
      </div>

      {/* Tree Visualization Card */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase' }}>
            Directorio Raíz del Proyecto React
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>/ (Raíz Workspace)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
          {structureTree.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '10px 14px',
                background: item.isDir ? '#020617' : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${item.isDir ? 'rgba(245, 158, 11, 0.2)' : '#1e293b'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: item.isDir ? '#f59e0b' : '#cbd5e1',
                fontWeight: item.isDir ? 800 : 400
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {item.isDir ? (
                  <Folder size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                ) : (
                  <FileCode size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                )}
                <span style={{ whiteSpace: 'pre' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: "'Inter', sans-serif", fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
