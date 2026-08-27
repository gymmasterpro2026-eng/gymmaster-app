import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// Wrapper que oculta el Splash Screen DESPUÉS de que React pintó el DOM.
function Root() {
  useEffect(() => {
    try {
      SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (_) {
      // En navegador web Capacitor no tiene SplashScreen nativo; se ignora.
    }
  }, []);
  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root />);
