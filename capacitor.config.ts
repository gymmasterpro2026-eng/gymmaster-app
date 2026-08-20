import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymmaster.pro',
  appName: 'GymAmano',
  webDir: 'dist',
  server: {
    url: 'https://gymmasterpro2026-eng.github.io/gymmaster-app/',
    cleartext: true
  }
};

export default config;
