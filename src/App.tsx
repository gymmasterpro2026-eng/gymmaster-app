/**
 * GymMaster Pro - Sistema SaaS de Gestión de Entrenamientos Personalizados Multi-Tenant
 * Basado en la Arquitectura de Aislamiento RLS de Anexo Cobro
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { UserRole, Profile, Exercise, GymTenant } from './types';
import { dataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { DashboardAlumno } from './components/DashboardAlumno';
import { DashboardCoach } from './components/DashboardCoach';
import { RunningTrainer } from './components/RunningTrainer';
import { GymGeneratorModal } from './components/GymGeneratorModal';
import { LandingPage } from './components/LandingPage';
import { WorkoutStats } from './components/WorkoutStats';

const ExerciseCatalog = lazy(() => import('./components/ExerciseCatalog').then((m) => ({ default: m.ExerciseCatalog })));
const CreateGymView = lazy(() => import('./components/GymManager').then((m) => ({ default: m.CreateGymView })));
const GymListView = lazy(() => import('./components/GymManager').then((m) => ({ default: m.GymListView })));
const SqlSchemaViewer = lazy(() => import('./components/SqlSchemaViewer').then((m) => ({ default: m.SqlSchemaViewer })));
const ImportScriptViewer = lazy(() => import('./components/ImportScriptViewer').then((m) => ({ default: m.ImportScriptViewer })));
const FolderStructureViewer = lazy(() => import('./components/FolderStructureViewer').then((m) => ({ default: m.FolderStructureViewer })));
const DietPlanner = lazy(() => import('./components/DietPlanner').then((m) => ({ default: m.DietPlanner })));
const AlumnosCuotas = lazy(() => import('./components/AlumnosCuotas').then((m) => ({ default: m.AlumnosCuotas })));
const CobrosMes = lazy(() => import('./components/CobrosMes').then((m) => ({ default: m.CobrosMes })));

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('alumno');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [initialCatalogSearch, setInitialCatalogSearch] = useState<string>('');
  const [isGymModalOpen, setIsGymModalOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const initial = dataService.getProfiles();
    if (!initial || initial.length === 0) {
      dataService.resetToDefault();
      return dataService.getProfiles();
    }
    return initial;
  });

  const [gyms, setGyms] = useState<GymTenant[]>(() => dataService.getGyms());
  const [activeGym, setActiveGym] = useState<GymTenant | null>(() => dataService.getGyms()[0] || null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const all = dataService.getProfiles();
    return all.find((p) => p.role === 'coach') || all[0] || null;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => dataService.getExercises());
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('alumno-101');

  useEffect(() => {
    refreshData();
    const unsub = dataService.subscribe(() => {
      refreshData();
    });
    return () => {
      unsub();
    };
  }, [activeGym?.id]);

  const refreshData = (targetGymId?: string) => {
    const allProfiles = dataService.getProfiles();
    const allExercises = dataService.getExercises();
    const allGyms = dataService.getGyms();

    setProfiles(allProfiles);
    setExercises(allExercises);
    setGyms([...allGyms]);

    const effectiveGymId = targetGymId || activeGym?.id;
    if (effectiveGymId) {
      const updatedActiveGym = allGyms.find((g) => g.id === effectiveGymId);
      if (updatedActiveGym) {
        setActiveGym({ ...updatedActiveGym });
      }
    } else if (allGyms.length > 0) {
      setActiveGym({ ...allGyms[0] });
    }

    const alumnos = allProfiles.filter((p) => p.role === 'alumno' && (!effectiveGymId || p.gym_id === effectiveGymId));
    if (alumnos.length > 0 && !alumnos.some((a) => a.id === selectedAlumnoId)) {
      setSelectedAlumnoId(alumnos[0].id);
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de demostración a su estado inicial?')) {
      dataService.resetToDefault();
      refreshData('gym-titan-001');
      setActiveGym(dataService.getGyms()[0] || null);
      const defaultUser = dataService.getProfiles()[0] || null;
      setCurrentUser(defaultUser);
      if (defaultUser) setCurrentRole(defaultUser.role);
    }
  };

  const handleGymGeneratedOrLoggedIn = (gym: GymTenant, userProfile: Profile) => {
    setActiveGym(gym);
    setCurrentUser(userProfile);
    setCurrentRole(userProfile.role);
    setCurrentTab('home');
    refreshData(gym.id);

    if (userProfile.role === 'alumno') {
      setSelectedAlumnoId(userProfile.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLanding(true);
  };

  // Filter profiles scoped strictly to current Active Gym tenant (Multi-Tenant Isolation)
  const currentGymProfiles = activeGym
    ? profiles.filter((p) => p.gym_id === activeGym.id)
    : profiles;

  const coachProfile =
    (currentUser && currentUser.role === 'coach' && (!activeGym || currentUser.gym_id === activeGym.id)
      ? profiles.find((p) => p.id === currentUser.id)
      : null) ||
    currentGymProfiles.find((p) => p.role === 'coach') ||
    null;

  const alumnosList = currentGymProfiles.filter(
    (p) => p.role === 'alumno' && (!coachProfile || !p.managed_by || p.managed_by === coachProfile.id)
  );

  const activeAlumnoProfile =
    (currentUser && currentUser.role === 'alumno' && (!activeGym || currentUser.gym_id === activeGym.id)
      ? profiles.find((p) => p.id === currentUser.id)
      : null) ||
    alumnosList.find((p) => p.id === selectedAlumnoId) ||
    alumnosList[0] ||
    null;

  const checkIsPlanExpired = (profile: Profile | null) => {
    if (!profile || profile.role !== 'alumno' || !profile.plan_active_until) return false;
    return new Date() > new Date(profile.plan_active_until);
  };

  const isMasterAdmin = Boolean(
    currentRole === 'coach' &&
    activeGym?.id === 'gym-titan-001' &&
    currentUser?.gym_id === 'gym-titan-001' &&
    (currentUser?.id === 'coach-001' || currentUser?.full_name?.toLowerCase().includes('master'))
  );

  const isAlumnoBlocked = currentRole === 'alumno' && checkIsPlanExpired(activeAlumnoProfile);

  if (showLanding) {
    return (
      <LandingPage 
        onEnterApp={(gym, coach) => {
          handleGymGeneratedOrLoggedIn(gym, coach);
          setShowLanding(false);
        }}
      />
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100vh', 
      width: '100%', 
      overflow: 'hidden', 
      background: '#06080B',
      position: 'relative', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#E2E8F0'
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; } ::selection { background: #D57A30; color: #06080B; }`}</style>
      
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedAlumnoId={selectedAlumnoId}
        setSelectedAlumnoId={setSelectedAlumnoId}
        alumnos={alumnosList}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onResetData={handleResetData}
        onOpenGymGenerator={() => setIsGymModalOpen(true)}
        activeGym={activeGym}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Scrollable Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', position: 'relative', zIndex: 10, background: '#06080B' }}>

        <main id="main-content-area" className="main-content-area">
          {isAlumnoBlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div className="titan-armor-card titan-armor-card-danger" style={{ padding: '40px', maxWidth: '500px' }}>
                <h2 className="titan-section-title" style={{ color: '#FCA5A5', margin: '0 0 16px 0', fontSize: '24px' }}>Acceso Denegado</h2>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                  Tu plan de entrenamiento ha vencido el <strong>{new Date(activeAlumnoProfile!.plan_active_until).toLocaleDateString()}</strong>.
                  <br /><br />
                  Por favor, comunícate con tu entrenador para renovar tu suscripción y recuperar el acceso a Tu Mejor Versión Te Espera.
                </p>
              </div>
            </div>
          ) : (
          <>
            {currentTab === 'home' && (
          <>
            {currentRole === 'alumno' ? (
              activeAlumnoProfile ? (
                <DashboardAlumno 
                  alumno={activeAlumnoProfile} 
                  onRefreshData={refreshData}
                  onBackToCoach={currentUser?.role === 'coach' ? () => setCurrentRole('coach') : undefined}
                />
              ) : (
                <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                  Cargando información del alumno...
                </div>
              )
            ) : coachProfile ? (
              <DashboardCoach 
                coach={coachProfile} 
                exercises={exercises} 
                onRefreshData={refreshData} 
                onViewStudentProfile={(alumnoId) => {
                  setSelectedAlumnoId(alumnoId);
                  setCurrentRole('alumno');
                }}
              />
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                Cargando información del entrenador...
              </div>
            )}
          </>
        )}

        <Suspense fallback={<div className="p-10 text-center font-titan text-xs tracking-widest uppercase text-amber-400">Cargando módulo...</div>}>
        {currentTab === 'create-gym' && isMasterAdmin && (
          <CreateGymView onGymCreated={(gym, coach) => {
            handleGymGeneratedOrLoggedIn(gym, coach);
            setCurrentTab('home');
          }} />
        )}
        
        {currentTab === 'list-gyms' && isMasterAdmin && (
          <GymListView onEnterGym={(gym, coach) => {
            handleGymGeneratedOrLoggedIn(gym, coach);
            setCurrentTab('home');
          }} />
        )}

        {currentTab === 'catalog' && (
          <ExerciseCatalog exercises={exercises} onRefreshData={refreshData} initialSearchQuery={initialCatalogSearch} />
        )}

        {currentTab === 'alumnos-cuotas' && (
          <AlumnosCuotas alumnos={alumnosList} onRefreshData={refreshData} />
        )}

        {currentTab === 'cobros' && (
          <CobrosMes onRefreshData={refreshData} coachId={currentUser?.id} />
        )}

        {currentTab === 'running' && <RunningTrainer />}

        {currentTab === 'sql' && isMasterAdmin && <SqlSchemaViewer />}

        {currentTab === 'import' && isMasterAdmin && <ImportScriptViewer />}

        {currentTab === 'structure' && isMasterAdmin && <FolderStructureViewer />}

        {currentTab === 'diet' && <DietPlanner />}
        </Suspense>

        {currentTab === 'stats' && activeAlumnoProfile && (
          <WorkoutStats alumno={activeAlumnoProfile} />
        )}
          </>
          )}
      </main>

      {/* Gym Generator & Login Modal */}
      <GymGeneratorModal
        isOpen={isGymModalOpen}
        onClose={() => setIsGymModalOpen(false)}
        onGymGeneratedOrLoggedIn={handleGymGeneratedOrLoggedIn}
        defaultTab="login"
      />
      </div>
    </div>
  );
}
