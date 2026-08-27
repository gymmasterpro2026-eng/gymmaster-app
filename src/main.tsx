import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// Wrapper que oculta el Splash Screen DESPUÉS de que React pintó el DOM.
function Root() {
  useEffect(() => {
    SplashScreen.hide({ fadeOutDuration: 300 });
  }, []);
  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root />);
