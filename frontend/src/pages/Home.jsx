import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Disc, Music, Play, Pause } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

function Home() {
    const [albums, setAlbums] = useState([]);
    const [musics, setMusics] = useState([]);
    const [globalMusics, setGlobalMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [albumRes, musicRes, globalRes] = await Promise.all([
                    api.get('/music/albums'),
                    api.get('/music/'),
                    api.get('/music/external/itunes?q=2024 hits&limit=10')
                ]);
                setAlbums(albumRes.data.albums);
                setMusics(musicRes.data.musics);
                setGlobalMusics(globalRes.data.musics);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loader"></div>;

    const isTrackPlaying = (track) =>
        currentTrack?._id === track._id && isPlaying;

    return (
        <div className="content-wrapper fade-in">

            {/* ── Albums ──────────────────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Disc size={24} color="var(--primary-color)" /> Featured Albums
                </h2>
                {albums.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No albums available.</p>
                ) : (
                    <div className="card-grid">
                        {albums.map(album => (
                            <div
                                key={album._id}
                                className="album-card"
                                onClick={() => navigate(`/album/${album._id}`)}
                            >
                                <div className="album-image-placeholder">
                                    <Disc size={64} color="rgba(255,255,255,0.1)" />
                                </div>
                                <div>
                                    <div className="album-title">{album.title}</div>
                                    <div className="album-artist">{album.artist?.username || 'Unknown Artist'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Recent Tracks ───────────────────────────────────── */}
            <section>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Music size={24} color="var(--primary-color)" /> Recent Tracks
                </h2>
                {musics.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No tracks available.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {musics.map((music, i) => {
                            const active = currentTrack?._id === music._id;
                            const playing = active && isPlaying;
                            return (
                                <div
                                    key={music._id}
                                    className={`album-card ${active ? 'track-row-active' : ''}`}
                                    style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                    onClick={() => play(music, musics)}
                                >
                                    {/* index / playing indicator */}
                                    <div style={{ width: '28px', textAlign: 'center', color: active ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {playing ? <Pause size={16} /> : (active ? <Play size={16} /> : i + 1)}
                                    </div>

                                    {/* track icon */}
                                    <div style={{ width: '40px', height: '40px', background: active ? 'var(--primary-color)' : '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.3s' }}>
                                        <Music size={20} color={active ? '#000' : 'rgba(255,255,255,0.6)'} />
                                    </div>

                                    {/* info */}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div className="album-title" style={{ color: active ? 'var(--primary-color)' : 'white' }}>{music.title}</div>
                                        <div className="album-artist">{music.artist?.username || 'Unknown Artist'}</div>
                                    </div>

                                    {/* play overlay hint */}
                                    <div style={{ opacity: 0.5 }}>
                                        {playing ? <Pause size={18} color="var(--primary-color)" /> : <Play size={18} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Global Hits (iTunes API) ───────────────────────────────────── */}
            {globalMusics.length > 0 && (
                <section style={{ marginTop: '3rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Play size={24} color="var(--primary-color)" /> Global Hits (Previews)
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {globalMusics.map((music, i) => {
                            const active = currentTrack?._id === music._id;
                            const playing = active && isPlaying;
                            return (
                                <div
                                    key={music._id}
                                    className={`album-card ${active ? 'track-row-active' : ''}`}
                                    style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                    onClick={() => play(music, globalMusics)}
                                >
                                    <div style={{ width: '28px', textAlign: 'center', color: active ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {playing ? <Pause size={16} /> : (active ? <Play size={16} /> : i + 1)}
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                        {music.image ? <img src={music.image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%', height:'100%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center'}}><Music size={20} color='rgba(255,255,255,0.6)'/></div>}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div className="album-title" style={{ color: active ? 'var(--primary-color)' : 'white' }}>{music.title}</div>
                                        <div className="album-artist">{music.artist?.username || 'Unknown Artist'}</div>
                                    </div>
                                    <div style={{ opacity: 0.5 }}>
                                        {playing ? <Pause size={18} color="var(--primary-color)" /> : <Play size={18} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

        </div>
    );
}

export default Home;
