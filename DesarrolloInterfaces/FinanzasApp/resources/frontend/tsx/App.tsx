import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import MainTabs from './MainTabs';
import Menu from './Menu';
import Layout from './Layout';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import '../css/variables.css';
import '../css/index.css'; // Global Tailwind Styles

import { recurringService } from '../ts/recurring.service';
import { supabase } from '../ts/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AuthPage from './AuthPage';
import SceneCanvas from './Scene3D/SceneCanvas';


setupIonicReact({
  mode: 'md',
  animated: false
});

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false); // State for 3D animation

  useEffect(() => {
    let mounted = true;
    console.log("[APP v3.0] Initialization starting (Prisma Redesign)");

    // Force Logout on Mount (Disable Persistence requested by User)
    // DISABLED FOR TESTING
    // const forceLogout = async () => {
    //   console.log("[DEV] Disabling persistence: forcing sign out.");
    //   await supabase.auth.signOut();
    // };
    // forceLogout();

    const forceLoadTimeout = setTimeout(() => {
      console.warn("[TIMEOUT] Forcing app load.");
      if (mounted) setLoading(false);
    }, 1500);

    const initApp = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (mounted) {
          if (error) console.error("Session error:", error);
          setSession(initialSession);
        }

        recurringService.processDueRecurrences().catch(e => console.warn("Recurring:", e));

      } catch (err: any) {
        console.error("Init error:", err);
        // If refresh token is invalid, clear session to prevent crash loop
        if (err?.message?.includes("Refresh Token")) {
          console.warn("Invalid Refresh Token detected. Logging out.");
          await supabase.auth.signOut();
          setSession(null);
        }
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
        // Reset transition when session changes (e.g. logout)
        if (!newSession) setIsTransitioning(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceLoadTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Handle successful login with animation delay
  const handleLoginSuccess = () => {
    setIsTransitioning(true);
    // Wait for the 3D 'Zoom/Die Roll' animation to finish before showing the Dashboard
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000); // Faster transition (2s)
  };

  return (
    <IonApp>
      {/* 3D Scene - Visible only during Loading, Login, or Transition */}
      {(loading || !session || isTransitioning) && (
        <SceneCanvas
          className="pointer-events-auto"
          isTransitioning={isTransitioning}
          isLoading={loading}
        />
      )}

      {loading ? (
        // Minimal Loading Overlay (Replacing OracleSync)
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-20 pointer-events-none">
          <h2 className="text-[#d4af37] font-[Cinzel] text-xl tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            SINCRONIZANDO...
          </h2>
        </div>
      ) : (
        <BrowserRouter>
          {session && !isTransitioning ? (
            <Layout>
              {/* Note: Menu might need redesign or removal if Layout handles nav. Keeping for now but hidden if needed. */}
              <div className="hidden"><Menu /></div>
              <Routes>
                <Route path="/app/*" element={<MainTabs />} />
                <Route path="/" element={<Navigate to="/app/dashboard" />} />
                <Route path="/login" element={<Navigate to="/app/dashboard" />} />
                <Route path="/register" element={<Navigate to="/app/dashboard" />} />
                <Route path="*" element={<Navigate to="/app/dashboard" />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Navigate to="/login" />} />
              <Route path="/app/*" element={<Navigate to="/login" />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </BrowserRouter>
      )}
    </IonApp>
  );
};

export default App;
