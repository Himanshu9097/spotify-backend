import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Music, UploadCloud, FolderPlus, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <Music size={28} color="#1DB954" />
                Spotify Backend App
            </Link>
            <div className="nav-links">
                {user?.role === 'artist' && (
                    <>
                        <Link to="/upload-music" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <UploadCloud size={16} /> Upload Music
                        </Link>
                        <Link to="/create-album" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <FolderPlus size={16} /> Create Album
                        </Link>
                    </>
                )}
                <span style={{ fontWeight: '600', marginRight: '1rem' }}>Welcome, {user?.username}</span>
                <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={logout}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
