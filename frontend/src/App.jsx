import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAlbum from './pages/CreateAlbum';
import UploadMusic from './pages/UploadMusic';
import AlbumDetails from './pages/AlbumDetails';
import Playlist from './pages/Playlist';
import History from './pages/History';
import ProfileSettings from './pages/ProfileSettings';
import LikedSongs from './pages/LikedSongs';

const ProtectedRoute = ({ children, requireArtist }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader"></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireArtist && user.role !== 'artist') return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`app-container ${user ? 'logged-in' : ''}`}>
      {user && <Sidebar isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      <div className="main-content">
        {user && <Navbar setMobileMenuOpen={setMobileMenuOpen} />}
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
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked-songs"
            element={
              <ProtectedRoute>
                <LikedSongs />
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
            path="/playlist/:id"
            element={
              <ProtectedRoute>
                <Playlist />
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
