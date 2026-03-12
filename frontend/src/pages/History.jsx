import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Play, Pause, Music, Clock, Heart } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

function History() {
    const [history, setHistory] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [historyRes, likedRes] = await Promise.all([
                    api.get('/music/history'),
                    api.get('/music/liked-songs').catch(() => ({ data: { musics: [] } }))
                ]);
                setHistory(historyRes.data.musics || []);
                setLikedSongs(likedRes.data?.musics || []);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleToggleLike = async (e, music) => {
        e.stopPropagation();
        try {
            const res = await api.post('/music/liked-songs', {
                musicId: music._id,
                title: music.title,
                artistName: music.artist?.username || music.artist || 'Unknown Artist',
                uri: music.uri,
                image: music.image,
                isExternal: music.isExternal || false
            });
            if (res.data.liked) {
                setLikedSongs(prev => [{...music}, ...prev]);
            } else {
                setLikedSongs(prev => prev.filter(s => s._id !== music._id));
            }
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div className="content-wrapper fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ width: '200px', height: '200px', background: 'var(--card-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    {history.length > 0 && history[0].image ? (
                        <img src={history[0].image} alt="History Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    ) : (
                        <Clock size={64} color="var(--text-muted)" />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Playlist</p>
                    <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>Recently Played</h1>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        {history.length} {history.length === 1 ? 'song' : 'songs'}
                    </p>
                </div>
            </div>

            {/* Existing History */}
            {history.length > 0 ? (
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {history.map((music, i) => {
                            const active = currentTrack?._id === music._id;
                            const playing = active && isPlaying;
                            return (
                                <div
                                    key={music._id + i}
                                    className={`album-card ${active ? 'track-row-active' : ''}`}
                                    style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                    onClick={() => play(music, history)}
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
                                        <div className="album-artist">{music.artist?.username || music.artist || 'Unknown Artist'}</div>
                                    </div>

                                    {/* Like Button */}
                                    <div style={{ marginRight: '1rem', cursor: 'pointer' }} onClick={(e) => handleToggleLike(e, music)}>
                                        <Heart 
                                            fill={likedSongs.some(s => s._id === music._id) ? "var(--primary-color)" : "transparent"} 
                                            color={likedSongs.some(s => s._id === music._id) ? "var(--primary-color)" : "var(--text-muted)"} 
                                            size={20} 
                                        />
                                    </div>

                                    <div style={{ opacity: 0.5 }}>
                                        {playing ? <Pause size={18} color="var(--primary-color)" /> : <Play size={18} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.2rem' }}>You haven't played anything recently.</p>
                </div>
            )}
        </div>
    );
}

export default History;
