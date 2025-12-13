import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import StoryReader from './pages/StoryReader';
import Login from './pages/Login';
import AuthGuard from './components/auth/AuthGuard';
import './App.css';

function App() {
  return (
    <Router>
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
