import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymmaster.pro',
  appName: 'GymAmano',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,   // Red de seguridad: oculta a los 3s si hide() falla
      launchAutoHide: false,      // Mantener Splash Screen hasta que cargue React
      backgroundColor: '#0f172a', // Color oscuro del tema GymMaster
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
