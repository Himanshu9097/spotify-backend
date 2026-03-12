import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Play, Pause, Music, Edit2, Plus, Search } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

function Playlist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { play, currentTrack, isPlaying } = useContext(PlayerContext);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await api.get(`/playlists/${id}`);
                setPlaylist(res.data.playlist);
                setEditName(res.data.playlist.name);
            } catch (err) {
                console.error("Failed to load playlist", err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id, navigate]);

    const handleRename = async () => {
        if (!editName.trim()) return;
        try {
            const res = await api.put(`/playlists/${id}`, { name: editName });
            setPlaylist(res.data.playlist);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to rename playlist", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            // Check own backend uploads
            const localRes = await api.get('/music');
            const localMusics = localRes.data.musics.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
            
            // Checks Spotify via Backend Proxy safely
            const spotifyRes = await api.get(`/music/external/spotify?q=${encodeURIComponent(searchQuery)}&limit=5`);
            const spotifyMusics = spotifyRes.data.musics || [];
            
            setSearchResults([...localMusics, ...spotifyMusics]);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddSong = async (music) => {
        try {
            const res = await api.post(`/playlists/${id}/add-song`, {
                musicId: music._id,
                title: music.title,
                artistName: music.artist?.username || music.artist || 'Unknown Artist',
                uri: music.uri,
                image: music.image,
                isExternal: music.isExternal || false
            });
            setPlaylist(res.data.playlist);
            setSearchResults(prev => prev.filter(m => m._id !== music._id));
        } catch (err) {
            console.error("Failed to add song", err);
            alert(err.response?.data?.message || "Failed to add song");
        }
    };

    if (loading) return <div className="loader"></div>;
    if (!playlist) return null;

    return (
        <div className="content-wrapper fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ width: '200px', height: '200px', background: 'var(--card-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    {playlist.songs.length > 0 && playlist.songs[0].image ? (
                        <img src={playlist.songs[0].image} alt="Playlist Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    ) : (
                        <Music size={64} color="var(--text-muted)" />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Playlist</p>
                    
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                autoFocus
                                style={{
                                    fontSize: '4rem', fontWeight: 800, background: 'transparent',
                                    border: 'none', color: '#fff', borderBottom: '2px solid var(--primary-color)',
                                    outline: 'none', width: '100%'
                                }}
                            />
                        </div>
                    ) : (
                        <h1 
                            onClick={() => setIsEditing(true)} 
                            style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1.1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                            title="Click to rename"
                        >
                            {playlist.name}
                            <Edit2 size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                        </h1>
                    )}
                    
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                    </p>
                </div>
            </div>

            {/* Existing Songs in Playlist */}
            {playlist.songs.length > 0 && (
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {playlist.songs.map((music, i) => {
                            const active = currentTrack?._id === music.musicId;
                            const playing = active && isPlaying;
                            return (
                                <div
                                    key={music.musicId + i}
                                    className={`album-card ${active ? 'track-row-active' : ''}`}
                                    style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                    onClick={() => play({ ...music, _id: music.musicId }, playlist.songs.map(s => ({ ...s, _id: s.musicId })))}
                                >
                                    <div style={{ width: '28px', textAlign: 'center', color: active ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {playing ? <Pause size={16} /> : (active ? <Play size={16} /> : i + 1)}
                                    </div>
                                    <div style={{ width: '40px', height: '40px', background: active ? 'var(--primary-color)' : '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {music.image ? (
                                            <img src={music.image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Music size={20} color={active ? '#000' : 'rgba(255,255,255,0.6)'} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div className="album-title" style={{ color: active ? 'var(--primary-color)' : 'white' }}>{music.title}</div>
                                        <div className="album-artist">{music.artistName || 'Unknown Artist'}</div>
                                    </div>
                                    <div style={{ opacity: 0.5 }}>
                                        {playing ? <Pause size={18} color="var(--primary-color)" /> : <Play size={18} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add More Songs Section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Let's find something for your playlist</h2>
                
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem', borderRadius: '50px', maxWidth: '400px', marginBottom: '2rem' }}>
                    <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
                    <input 
                        type="text" 
                        placeholder="Search for songs or episodes" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }}
                    />
                </form>

                {isSearching && <p style={{ color: 'var(--text-muted)' }}>Searching...</p>}
                
                {searchResults.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {searchResults.map((result) => (
                            <div key={result._id} className="album-card" style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {result.image ? (
                                        <img src={result.image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Music size={20} color="rgba(255,255,255,0.6)" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="album-title">{result.title}</div>
                                    <div className="album-artist">{result.artist?.username || result.artist || 'Unknown Artist'}</div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAddSong(result); }}
                                    style={{
                                        background: 'transparent', border: '1px solid var(--text-muted)', color: '#fff', 
                                        borderRadius: '50px', padding: '0.25rem 1rem', cursor: 'pointer', transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = '#fff'}
                                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--text-muted)'}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

export default Playlist;
