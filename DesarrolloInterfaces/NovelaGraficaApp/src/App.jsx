import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import StoryReader from './pages/StoryReader';
import Login from './pages/Login';
import Marketplace from './components/Marketplace';
import AuthGuard from './components/auth/AuthGuard';
import ThemeManager from './components/ThemeManager';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeManager />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <AuthGuard>
            <MainMenu />
          </AuthGuard>
        } />

        <Route path="/read/:seriesId" element={
          <AuthGuard>
            <StoryReader />
          </AuthGuard>
        } />

        <Route path="/marketplace" element={
          <AuthGuard>
            <Marketplace />
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
