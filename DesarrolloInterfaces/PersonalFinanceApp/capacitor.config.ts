
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roberto.finflow',
  appName: 'FinFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
