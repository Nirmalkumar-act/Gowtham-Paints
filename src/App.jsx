/* ============================================
   APP - Gowtham Paints
   ============================================ */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminBookings from './pages/AdminBookings';
import Gallery from './pages/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Profile from './pages/Profile';
import SplashScreen from './components/SplashScreen';

function App() {
  return (
    <AuthProvider>
      <SplashScreen />
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected - User + Admin */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/booking" element={
            <ProtectedRoute>
              <Booking />
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/gallery" element={
            <ProtectedRoute>
              <Gallery />
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/gallery/:id" element={
            <ProtectedRoute>
              <GalleryDetail />
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Only */}
          <Route path="/admin/bookings" element={
            <AdminRoute>
              <AdminBookings />
              <Footer />
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
