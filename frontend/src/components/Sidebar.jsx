import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Music, PlusSquare, Disc, Plus, ListMusic, Clock, ArrowRight, List, Heart, Pin } from 'lucide-react';
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
        <aside className="sidebar" style={{ background: '#000', padding: '0.5rem', paddingBottom: '0' }}>
            {/* The main box */}
            <div style={{ background: '#121212', borderRadius: '8px', padding: '1rem 0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a7a7a7', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a7a7a7'}>
                        <Library size={24} /> <span>Your Library</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={createPlaylist} style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a7a7a7'; }} title="Create Playlist or folder">
                            <Plus size={20} />
                        </button>
                        <button style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a7a7a7'; }}>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                    <span style={{ background: '#2a2a2a', color: '#fff', fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '50px', fontWeight: 600 }}>Playlists</span>
                    <span style={{ background: '#2a2a2a', color: '#fff', fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '50px', fontWeight: 600 }}>Podcasts</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', marginBottom: '0.75rem' }}>
                    <Search size={16} color="#a7a7a7" />
                    <span style={{ fontSize: '0.85rem', color: '#a7a7a7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Recents <List size={16} /></span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    
                    {/* Liked Songs Static Link */}
                    <Link to="/liked-songs" className={`sidebar-link ${isActive('/liked-songs') ? 'active' : ''}`} style={{ padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #450af5, #c4efd9)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Heart size={20} fill="#fff" color="#fff" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Liked Songs</span>
                            <span style={{ color: '#a7a7a7', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}><Pin size={12} fill="#1DB954" color="#1DB954" style={{marginRight: '4px'}}/> Playlist • {user?.username}</span>
                        </div>
                    </Link>

                    {/* History Static Link */}
                    <Link to="/history" className={`sidebar-link ${isActive('/history') ? 'active' : ''}`} style={{ padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                        <div style={{ width: '48px', height: '48px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Clock size={20} color="#fff" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>History</span>
                            <span style={{ color: '#a7a7a7', fontSize: '0.8rem' }}>Playlist • Auto</span>
                        </div>
                    </Link>

                    {/* Custom Playlists List mapped to look like Spotify's cards */}
                    {playlists.map(pl => (
                        <Link key={pl._id} to={`/playlist/${pl._id}`} className={`sidebar-link ${isActive(`/playlist/${pl._id}`) ? 'active' : ''}`} style={{ padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#282828', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                {pl.songs?.[0]?.image ? <img src={pl.songs[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={20} color="#b3b3b3" />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                                <span style={{ color: isActive(`/playlist/${pl._id}`) ? '#1DB954' : '#fff', fontWeight: isActive(`/playlist/${pl._id}`) ? 700 : 600, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                                <span style={{ color: '#a7a7a7', fontSize: '0.8rem', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                    {pl.isPinned && <Pin size={12} fill="#1DB954" color="#1DB954" style={{marginRight: '4px', flexShrink: 0}}/>}
                                    Playlist • {user?.username}
                                </span>
                            </div>
                        </Link>
                    ))}

                    <div style={{ padding: '1rem' }}>
                        {user?.role === 'artist' && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#a7a7a7', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Artist Tools</p>
                                <Link to="/create-album" className={`sidebar-link ${isActive('/create-album') ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                                    <PlusSquare size={16} /> Create Album
                                </Link>
                                <Link to="/upload-music" className={`sidebar-link ${isActive('/upload-music') ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                                    <Music size={16} /> Upload Music
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
