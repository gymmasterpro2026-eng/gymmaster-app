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
      <div className="titan-armor-banner" style={{
        padding: '24px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className="titan-badge-copper" style={{ padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderTree size={14} /> Arquitectura de Software
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>GymMaster Pro Architecture</span>
        </div>
        <h1 className="titan-section-title" style={{ margin: 0, fontSize: '24px' }}>
          Estructura de Carpetas del Proyecto (Entregable #2)
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Diseño modular, desacoplado y optimizado para escalabilidad SaaS Multi-tenant en React + Supabase + Capacitor
        </p>
      </div>

      {/* Tree Visualization Card */}
      <div className="titan-armor-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <span className="titan-section-title" style={{ fontSize: '12px', color: '#FFBD4A' }}>
            Directorio Raíz del Proyecto React
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>/ (Raíz Workspace)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
          {structureTree.map((item, index) => (
            <div
              key={index}
              className="titan-inset-well"
              style={{
                padding: '10px 14px',
                borderColor: item.isDir ? 'rgba(213, 122, 48, 0.35)' : undefined,
                borderLeft: item.isDir ? '3px solid #D57A30' : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: item.isDir ? '#FFBD4A' : '#cbd5e1',
                fontWeight: item.isDir ? 800 : 400
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {item.isDir ? (
                  <Folder size={16} color="#D57A30" style={{ flexShrink: 0 }} />
                ) : (
                  <FileCode size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                )}
                <span style={{ whiteSpace: 'pre' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'Inter', sans-serif", fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '420px' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
