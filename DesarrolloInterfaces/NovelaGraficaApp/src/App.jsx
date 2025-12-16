import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import StoryReader from './pages/StoryReader';
import Login from './pages/Login';
import StoryDetails from './pages/StoryDetails';
import AppLayout from './components/layout/AppLayout';
import MyGamesView from './pages/MyGamesView';
import SettingsView from './pages/SettingsView';
import ProfileView from './pages/ProfileView';
import AuthGuard from './components/auth/AuthGuard';
import ThemeManager from './components/ThemeManager';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeManager />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Layout Routes */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/" element={<MainMenu />} />
          <Route path="/details/:seriesId" element={<StoryDetails />} />

          {/* New Sidebar/Menu Views */}
          <Route path="/saves" element={<MyGamesView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Route>

        {/* Standalone Reader (No Sidebar/Menu?) requested as 'full screen' usually.
            But 'Back' button in Reader usually goes to main menu. 
            User didn't specify Reader changes, so leaving it separate is safer for immersion.
        */}
        <Route path="/read/:seriesId" element={
          <AuthGuard>
            <StoryReader />
          </AuthGuard>
        } />

        {/* Fallback route */}
        <Route path="*" element={
          <AuthGuard>
            <MainMenu />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;
