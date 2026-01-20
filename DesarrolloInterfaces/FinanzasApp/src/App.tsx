import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonLoading } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
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
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

setupIonicReact();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: 3 seconds max loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Session error:", error);
      setSession(session);
      setLoading(false);
      clearTimeout(timeout);
    }).catch(err => {
      console.error("Unexpected session error:", err);
      setLoading(false);
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // 3. Process recurring transactions on startup
    import('./services/recurring.service').then(({ recurringService }) => {
      recurringService.processDueRecurrences().catch(e => console.error("Recurring error:", e));
    }).catch(err => console.error("Failed to load recurring service:", err));

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <IonLoading isOpen={true} message="Iniciando..." duration={5000} />
        <p style={{ marginTop: '20px', color: '#666' }}>Cargando sistema...</p>
      </div>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        {session ? (
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <Route path="/app" component={MainTabs} />
              {/* Redirect root to Dashboard if logged in */}
              <Route exact path="/" render={() => <Redirect to="/app/dashboard" />} />
              {/* Redirect login/register to Dashboard if logged in */}
              <Route path="/login" render={() => <Redirect to="/app/dashboard" />} exact={true} />
              <Route path="/register" render={() => <Redirect to="/app/dashboard" />} exact={true} />
            </IonRouterOutlet>
          </IonSplitPane>
        ) : (
          <IonRouterOutlet>
            <Route path="/login" component={Login} exact={true} />
            <Route path="/register" component={Register} exact={true} />
            {/* Redirect any other route to Login if not logged in */}
            <Route path="/app" render={() => <Redirect to="/login" />} />
            <Route exact path="/" render={() => <Redirect to="/login" />} />
          </IonRouterOutlet>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
