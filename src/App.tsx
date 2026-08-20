/**
 * GymMaster Pro - Sistema SaaS de Gestión de Entrenamientos Personalizados Multi-Tenant
 * Basado en la Arquitectura de Aislamiento RLS de Anexo Cobro
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Profile, Exercise, GymTenant } from './types';
import { dataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { DashboardAlumno } from './components/DashboardAlumno';
import { DashboardCoach } from './components/DashboardCoach';
import { ExerciseCatalog } from './components/ExerciseCatalog';
import { CreateGymView, GymListView } from './components/GymManager';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { ImportScriptViewer } from './components/ImportScriptViewer';
import { RunningTrainer } from './components/RunningTrainer';
import { FolderStructureViewer } from './components/FolderStructureViewer';
import { GymGeneratorModal } from './components/GymGeneratorModal';
import { LandingPage } from './components/LandingPage';

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
  }, []);

  const refreshData = () => {
    const allProfiles = dataService.getProfiles();
    const allExercises = dataService.getExercises();
    const allGyms = dataService.getGyms();

    setProfiles(allProfiles);
    setExercises(allExercises);
    setGyms(allGyms);

    if (!activeGym && allGyms.length > 0) {
      setActiveGym(allGyms[0]);
    }

    const alumnos = allProfiles.filter((p) => p.role === 'alumno');
    if (alumnos.length > 0 && !alumnos.some((a) => a.id === selectedAlumnoId)) {
      setSelectedAlumnoId(alumnos[0].id);
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de demostración a su estado inicial?')) {
      dataService.resetToDefault();
      refreshData();
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
    refreshData();

    if (userProfile.role === 'alumno') {
      setSelectedAlumnoId(userProfile.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLanding(true);
  };

  // Filter profiles scoped to current Active Gym tenant
  const currentGymProfiles = activeGym
    ? profiles.filter((p) => p.gym_id === activeGym.id)
    : profiles;

  const coachProfile =
    (currentUser && currentUser.role === 'coach' ? profiles.find(p => p.id === currentUser.id) : null) ||
    currentGymProfiles.find((p) => p.role === 'coach') ||
    profiles.find((p) => p.role === 'coach') ||
    profiles[0];

  const alumnosList = currentGymProfiles.filter((p) => p.role === 'alumno');

  const activeAlumnoProfile =
    (currentUser && currentUser.role === 'alumno' ? profiles.find(p => p.id === currentUser.id) : null) ||
    currentGymProfiles.find((p) => p.id === selectedAlumnoId) ||
    alumnosList[0] ||
    profiles.find((p) => p.id === selectedAlumnoId) ||
    profiles[0];

  const checkIsPlanExpired = (profile: Profile | null) => {
    if (!profile || profile.role !== 'alumno' || !profile.plan_active_until) return false;
    return new Date() > new Date(profile.plan_active_until);
  };

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
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%', overflow: 'hidden', background: '#cbd5e1', position: 'relative', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; }`}</style>
      
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedAlumnoId={selectedAlumnoId}
        setSelectedAlumnoId={setSelectedAlumnoId}
        alumnos={alumnosList.length > 0 ? alumnosList : profiles.filter((p) => p.role === 'alumno')}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onResetData={handleResetData}
        onOpenGymGenerator={() => setIsGymModalOpen(true)}
        activeGym={activeGym}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Scrollable Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '75%', height: '128px', background: '#f59e0b', borderRadius: '0', filter: 'blur(120px)', opacity: 0.02, pointerEvents: 'none' }} />

        <main id="main-content-area" style={{ flex: 1, padding: '32px 40px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {isAlumnoBlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ background: '#0f172a', border: '1px solid #ef4444', padding: '40px', borderRadius: '8px', maxWidth: '500px' }}>
                <h2 style={{ color: '#ef4444', margin: '0 0 16px 0', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase' }}>Acceso Denegado</h2>
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
                <DashboardAlumno alumno={activeAlumnoProfile} onRefreshData={refreshData} />
              ) : (
                <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                  Cargando información del alumno...
                </div>
              )
            ) : coachProfile ? (
              <DashboardCoach coach={coachProfile} exercises={exercises} onRefreshData={refreshData} />
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                Cargando información del entrenador...
              </div>
            )}
          </>
        )}

        {currentTab === 'create-gym' && (
          <CreateGymView onGymCreated={(gym, coach) => {
            handleGymGeneratedOrLoggedIn(gym, coach);
            setCurrentTab('home');
          }} />
        )}
        
        {currentTab === 'list-gyms' && (
          <GymListView onEnterGym={(gym, coach) => {
            handleGymGeneratedOrLoggedIn(gym, coach);
            setCurrentTab('home');
          }} />
        )}

        {currentTab === 'catalog' && (
          <ExerciseCatalog exercises={exercises} onRefreshData={refreshData} initialSearchQuery={initialCatalogSearch} />
        )}

        {currentTab === 'running' && <RunningTrainer />}

        {currentTab === 'sql' && <SqlSchemaViewer />}

        {currentTab === 'import' && <ImportScriptViewer />}

        {currentTab === 'structure' && <FolderStructureViewer />}
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
