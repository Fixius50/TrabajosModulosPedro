import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import MainTabs from './components/MainTabs';
import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { recurringService } from './services/recurring.service';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AuthPage from './pages/AuthPage';

setupIonicReact({
  mode: 'md', // Material Design mode (no iOS swipe animations)
  animated: false // Disable ALL transition animations
});

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("[APP v2.0] Initialization starting - FIREFOX FIX");

    // ULTRA-AGGRESSIVE 1 SECOND TIMEOUT - FIREFOX EDITION
    const forceLoadTimeout = setTimeout(() => {
      console.error("[FIREFOX FIX] FORCING APP LOAD NOW!");
      if (mounted) {
        setLoading(false);
      }
    }, 1000);

    const initApp = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (mounted) {
          if (error) console.error("Session error:", error);
          setSession(initialSession);
        }

        recurringService.processDueRecurrences().catch(e => console.warn("Recurring:", e));

      } catch (err) {
        console.error("Init error:", err);
      } finally {
        if (mounted) {
          clearTimeout(forceLoadTimeout);
          setLoading(false);
        }
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceLoadTimeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <IonApp>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', flexDirection: 'column', backgroundColor: '#121212' }}>
          {/* Use standard HTML spinner to avoid Ionic Portal issues sticking on screen */}
          <div className="simple-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #333',
            borderTop: '4px solid #3880ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <p style={{ marginTop: '20px', color: '#666', fontFamily: 'sans-serif' }}>Iniciando...</p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <BrowserRouter>
        {session ? (
          <>
            <Menu />
            <div id="main" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
              <Routes>
                <Route path="/app/*" element={<MainTabs />} />
                <Route path="/" element={<Navigate to="/app/dashboard" />} />
                <Route path="/login" element={<Navigate to="/app/dashboard" />} />
                <Route path="/register" element={<Navigate to="/app/dashboard" />} />
                <Route path="*" element={<Navigate to="/app/dashboard" />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<Navigate to="/login" />} />
            <Route path="/app/*" element={<Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </IonApp>
  );
};

export default App;
