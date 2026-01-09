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

        {/* Public Routes (Guest Access Allowed) */}
        <Route element={<AuthGuard allowGuest={true}><AppLayout /></AuthGuard>}>
          <Route path="/" element={<MainMenu />} />
          <Route path="/details/:seriesId" element={<StoryDetails />} />

          {/* Protected Routes (Login Required) */}
          <Route path="/saves" element={<AuthGuard><MyGamesView /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><SettingsView /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><ProfileView /></AuthGuard>} />
        </Route>

        {/* Standalone Reader (Guest Access Allowed) */}
        <Route path="/read/:seriesId" element={
          <AuthGuard allowGuest={true}>
            <StoryReader />
          </AuthGuard>
        } />

        {/* Fallback route */}
        <Route path="*" element={
          <AuthGuard allowGuest={true}>
            <MainMenu />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;
