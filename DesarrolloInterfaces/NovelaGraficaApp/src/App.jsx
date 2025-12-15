import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import MainMenu from './pages/MainMenu';
// import StoryReader from './pages/StoryReader';
// import Login from './pages/Login';
// import Marketplace from './pages/Marketplace';
// import AuthGuard from './components/auth/AuthGuard';
// import ThemeManager from './components/ThemeManager';
import './App.css';

function App() {
  console.log("App.jsx: Rendering dummy...");
  return (
    <Router>
      {/* <ThemeManager /> */}
      <div style={{ padding: 50, color: 'lime', background: 'black', height: '100vh' }}>
        <h1>APP IS ALIVE (ZOMBIE MODE)</h1>
        <p>If you see this, the core is fine. The crash is in the imports.</p>
      </div>
    </Router>
  );
}

export default App;
