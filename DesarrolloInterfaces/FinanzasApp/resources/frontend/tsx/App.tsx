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

setupIonicReact({
  mode: 'md',
  animated: false
});

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("[APP v3.0] Initialization starting (Prisma Redesign)");

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
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0f0a0a] text-[#c5a059] font-[Cinzel]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#8a1c1c] border-t-[#c5a059] rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-[#4a4e5a] border-b-[#c5a059] rounded-full animate-spin-reverse opacity-50"></div>
          </div>
          <p className="mt-8 animate-pulse tracking-[0.3em] uppercase text-sm drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]">
            Abriendo Portal Dimensional...
          </p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <BrowserRouter>
        {session ? (
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
