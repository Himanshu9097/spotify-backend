import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Music, PlusSquare, Disc } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
                    <Home size={24} />
                    <span>Home</span>
                </Link>
                <Link to="/search" className={`sidebar-link ${isActive('/search') ? 'active' : ''}`}>
                    <Search size={24} />
                    <span>Search</span>
                </Link>
                <Link to="/library" className={`sidebar-link ${isActive('/library') ? 'active' : ''}`}>
                    <Library size={24} />
                    <span>Your Library</span>
                </Link>
            </div>

            <div className="sidebar-section" style={{ marginTop: '2rem' }}>
                <p className="sidebar-label">PLAYLISTS & MORE</p>

                {user?.role === 'artist' && (
                    <>
                        <Link to="/create-album" className={`sidebar-link ${isActive('/create-album') ? 'active' : ''}`}>
                            <PlusSquare size={24} />
                            <span>Create Album</span>
                        </Link>
                        <Link to="/upload-music" className={`sidebar-link ${isActive('/upload-music') ? 'active' : ''}`}>
                            <Music size={24} />
                            <span>Upload Music</span>
                        </Link>
                    </>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
