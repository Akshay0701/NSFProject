// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilesPage from './pages/ProfilePage';
import TeamPage from './pages/TeamPage';
import TeamsWithProposalPage from './pages/TeamsWithProposalPage';
import RegisterPage from './pages/RegisterPage';
import IntroPage from './pages/IntroPage/IntroPage';
import RoomPage from './pages/RoomPage/RoomPage';
import ProtectedRoute from './ProtectedRoutes';
import { isAuthenticated } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path based on auth status */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/intro" replace /> : <LoginPage />}
        />

        {/* Public routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="/intro" element={<ProtectedRoute element={<IntroPage />} />} />

        {/* Room routes */}
        <Route path="/room/:roomId" element={<ProtectedRoute element={<RoomPage />} />} />
        <Route path="/room/:roomId/profiles" element={<ProtectedRoute element={<ProfilesPage />} />} />
        <Route path="/room/:roomId/teams" element={<ProtectedRoute element={<TeamPage />} />} />
        <Route path="/room/:roomId/teamswithproposal" element={<ProtectedRoute element={<TeamsWithProposalPage />} />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} />
    </Router>
  );
}

export default App;
