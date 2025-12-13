import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import StoryReader from './pages/StoryReader';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/read/:seriesId" element={<StoryReader />} />
        {/* Fallback route */}
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
