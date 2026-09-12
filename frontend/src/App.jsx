import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Ponds from './pages/Ponds';
import PondDetails from './pages/PondDetails';
import WaterQuality from './pages/WaterQuality';
import Feed from './pages/Feed';
import Growth from './pages/Growth';
import Business from './pages/Business';
import MLPrediction from './pages/MLPrediction';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard"     element={<Protected><Dashboard /></Protected>} />
        <Route path="/ponds"         element={<Protected><Ponds /></Protected>} />
        <Route path="/ponds/:pondId" element={<Protected><PondDetails /></Protected>} />
        <Route path="/ponds/:pondId/water-quality" element={<Protected><WaterQuality /></Protected>} />
        <Route path="/ponds/:pondId/feed"           element={<Protected><Feed /></Protected>} />
        <Route path="/ponds/:pondId/growth"         element={<Protected><Growth /></Protected>} />
        <Route path="/ponds/:pondId/business"       element={<Protected><Business /></Protected>} />
        <Route path="/ponds/:pondId/ml"             element={<Protected><MLPrediction /></Protected>} />
        <Route path="/ml-prediction" element={<Protected><MLPrediction /></Protected>} />
        <Route path="/ai-assistant"  element={<Protected><AIAssistant /></Protected>} />
        <Route path="/profile"       element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
