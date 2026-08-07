import React from 'react';
import { FolderTree, FileCode, Folder, CheckCircle, Database, Shield, Zap } from 'lucide-react';

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
    <div id="folder-structure-viewer-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase flex items-center">
            <FolderTree className="w-3.5 h-3.5 mr-1" /> Arquitectura de Software
          </span>
          <span className="text-xs text-slate-400">GymMaster Pro Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Estructura de Carpetas del Proyecto (Entregable #2)
        </h1>
        <p className="text-xs text-slate-400">
          Diseño modular, desacoplado y optimizado para escalabilidad SaaS Multi-tenant en React + Supabase + Capacitor
        </p>
      </div>

      {/* Tree Visualization Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Directorio Raíz del Proyecto React
          </span>
          <span className="text-xs text-slate-400 font-mono">/ (Raíz Workspace)</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {structureTree.map((item, index) => (
            <div
              key={index}
              className={`p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                item.isDir ? 'bg-slate-950 font-bold text-amber-300' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                {item.isDir ? (
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans font-normal truncate max-w-xs sm:max-w-md">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
