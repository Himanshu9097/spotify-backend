import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { Play, Pause, Music, Heart, Trash2 } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

function LikedSongs() {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);

    useEffect(() => {
        const fetchLiked = async () => {
            try {
                const res = await api.get('/music/liked-songs');
                setLikedSongs(res.data.musics || []);
            } catch (err) {
                console.error("Failed to load liked songs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, []);

    const handleUnlike = async (e, music) => {
        e.stopPropagation();
        try {
            await api.post('/music/liked-songs', {
                musicId: music._id,
                title: music.title,
                artistName: music.artist?.username || music.artist || 'Unknown Artist',
                uri: music.uri,
                image: music.image,
                isExternal: music.isExternal || false
            });
            setLikedSongs(prev => prev.filter(s => s._id !== music._id));
        } catch (err) {
            console.error("Failed to unlike song", err);
        }
    };

    if (loading) return <div className="loader"></div>;

    const totalMs = likedSongs.length * 3.5 * 60 * 1000;
    const totalMins = Math.round(totalMs / 60000);

    return (
        <div className="content-wrapper fade-in">
            {/* Hero Header */}
            <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '2rem',
                background: 'linear-gradient(180deg, #4a00e0 0%, #8e2de2 50%, transparent 100%)',
                margin: '-2rem -2rem 2rem -2rem', padding: '3rem 2rem 2rem'
            }}>
                <div style={{
                    width: '200px', height: '200px', borderRadius: '8px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                    <Heart size={80} fill="white" color="white" />
                </div>
                <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Playlist</p>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, marginBottom: '1rem' }}>Liked Songs</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                        {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'} • about {totalMins} min
                    </p>
                </div>
            </div>

            {/* Controls Row */}
            {likedSongs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
                    <button
                        onClick={() => play(likedSongs[0], likedSongs)}
                        style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: '#1DB954', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.2s, background 0.2s',
                            boxShadow: '0 4px 12px rgba(29,185,84,0.4)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = '#1ed760'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#1DB954'; }}
                    >
                        <Play size={24} fill="#000" color="#000" style={{ marginLeft: '3px' }} />
                    </button>
                </div>
            )}

            {/* Track List */}
            {likedSongs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                    <Heart size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Songs you like will appear here</h2>
                    <p>Save songs by tapping the heart icon.</p>
                </div>
            ) : (
                <div>
                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: '1rem', padding: '0 1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <span style={{ textAlign: 'center' }}>#</span>
                        <span>Title</span>
                        <span style={{ paddingRight: '1rem' }}>Actions</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {likedSongs.map((music, i) => {
                            const active = currentTrack?._id === music._id;
                            const playing = active && isPlaying;
                            return (
                                <div
                                    key={music._id}
                                    className={`album-card ${active ? 'track-row-active' : ''}`}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '32px 1fr auto',
                                        gap: '1rem', padding: '0.6rem 1rem', alignItems: 'center',
                                        borderRadius: '8px', cursor: 'pointer',
                                        background: active ? 'rgba(29,185,84,0.1)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => play(music, likedSongs)}
                                >
                                    {/* Index / Play indicator */}
                                    <div style={{ textAlign: 'center', color: active ? '#1DB954' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {playing ? <Pause size={16} /> : (active ? <Play size={16} /> : i + 1)}
                                    </div>

                                    {/* Track info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '4px',
                                            background: active ? '#1DB954' : '#282828',
                                            overflow: 'hidden', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {music.image ? (
                                                <img src={music.image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Music size={20} color={active ? '#000' : '#b3b3b3'} />
                                            )}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ color: active ? '#1DB954' : '#fff', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {music.title}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {music.artist?.username || music.artist || 'Unknown Artist'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unlike button */}
                                    <div
                                        onClick={(e) => handleUnlike(e, music)}
                                        title="Remove from Liked Songs"
                                        style={{ color: '#1DB954', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s, transform 0.2s', display: 'flex', alignItems: 'center' }}
                                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <Heart size={20} fill="#1DB954" color="#1DB954" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LikedSongs;
