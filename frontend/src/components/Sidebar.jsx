import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Music, PlusSquare, Disc, Plus, ListMusic, Clock } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);

    const fetchPlaylists = async () => {
        if (!user) return;
        try {
            const res = await api.get('/playlists');
            setPlaylists(res.data.playlists);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [user]);

    const createPlaylist = async () => {
        try {
            const res = await api.post('/playlists');
            const newPlaylist = res.data.playlist;
            setPlaylists(prev => [newPlaylist, ...prev]);
            navigate(`/playlist/${newPlaylist._id}`);
        } catch (err) {
            console.error("Failed to create playlist", err);
            alert("Failed to create playlist");
        }
    };

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
                <Link to="/history" className={`sidebar-link ${isActive('/history') ? 'active' : ''}`}>
                    <Clock size={24} />
                    <span>History</span>
                </Link>
            </div>

            <div className="sidebar-section" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
                    <p className="sidebar-label" style={{ marginBottom: 0 }}>PLAYLISTS & MORE</p>
                    <button onClick={createPlaylist} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Create Playlist">
                        <Plus size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                    {playlists.map(pl => (
                        <Link key={pl._id} to={`/playlist/${pl._id}`} className={`sidebar-link ${isActive(`/playlist/${pl._id}`) ? 'active' : ''}`} style={{ padding: '0.5rem 1rem' }}>
                            <ListMusic size={20} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                        </Link>
                    ))}
                </div>

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
