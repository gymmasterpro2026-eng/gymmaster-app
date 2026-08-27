import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Wrapper que oculta el Splash Screen DESPUÉS de que React pintó el DOM.
// Solo se ejecuta en plataformas nativas (Android/iOS), nunca en web.
function Root() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {
        // Fallo silencioso: el launchShowDuration de 3s sirve de red de seguridad
      });
    }
  }, []);
  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root />);
