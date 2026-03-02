import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAlbum from './pages/CreateAlbum';
import UploadMusic from './pages/UploadMusic';
import AlbumDetails from './pages/AlbumDetails';

const ProtectedRoute = ({ children, requireArtist }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader"></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireArtist && user.role !== 'artist') return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      <div className="main-content">
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/album/:id"
            element={
              <ProtectedRoute>
                <AlbumDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-album"
            element={
              <ProtectedRoute requireArtist={true}>
                <CreateAlbum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-music"
            element={
              <ProtectedRoute requireArtist={true}>
                <UploadMusic />
              </ProtectedRoute>
            }
          />
        </Routes>
        {user && <MusicPlayer />}
      </div>
    </div>
  );
}

export default App;
