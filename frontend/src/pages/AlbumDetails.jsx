import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Disc, PlayCircle, PauseCircle, Music, Play, Pause } from 'lucide-react';
import api from '../api';
import { PlayerContext } from '../context/PlayerContext';

function AlbumDetails() {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { play, currentTrack, isPlaying, togglePlay } = useContext(PlayerContext);

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await api.get(`/music/albums/${id}`);
                setAlbum(res.data.album);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching album');
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    if (loading) return <div className="loader"></div>;
    if (error) return <div className="content-wrapper error-msg">{error}</div>;
    if (!album) return null;

    // is any track from this album currently playing?
    const albumIsPlaying =
        isPlaying && album.musics.some(t => t._id === currentTrack?._id);

    const handlePlayAll = () => {
        if (albumIsPlaying) {
            togglePlay();
            return;
        }
        if (album.musics.length === 0) return;
        play(album.musics[0], album.musics.slice(1));
    };

    return (
        <div className="content-wrapper fade-in">

            {/* ── Album header ──────────────────────────────────── */}
            <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg, #1f1f1f, #333333)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', flexShrink: 0 }}>
                    <Disc size={80} color="rgba(255,255,255,0.2)" />
                </div>
                <div style={{ padding: '1rem 0', flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Album</span>
                    <h1 style={{ fontSize: '3.5rem', marginTop: '0.25rem', marginBottom: '1rem', lineHeight: '1.2' }}>{album.title}</h1>
                    <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--primary-color)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Music size={12} color="#000" />
                        </div>
                        {album.artist?.username} &nbsp;•&nbsp; {album.musics.length} tracks
                    </div>
                </div>
            </div>

            {/* ── Play button ─────────────────────────────────────── */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    className="btn"
                    style={{ padding: '1rem 3rem', borderRadius: '500px', fontSize: '1.125rem', opacity: album.musics.length === 0 ? 0.4 : 1 }}
                    onClick={handlePlayAll}
                    disabled={album.musics.length === 0}
                >
                    {albumIsPlaying
                        ? <><PauseCircle size={24} /> Pause</>
                        : <><PlayCircle size={24} /> Play All</>
                    }
                </button>
            </div>

            {/* ── Track list ──────────────────────────────────────── */}
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', color: 'var(--text-muted)' }}>
                Tracklist
            </h3>

            {album.musics.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No tracks available for this album.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {album.musics.map((track, i) => {
                        const active = currentTrack?._id === track._id;
                        const playing = active && isPlaying;
                        return (
                            <div
                                key={track._id}
                                className={`album-card ${active ? 'track-row-active' : ''}`}
                                style={{ padding: '0.875rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                onClick={() => play(track, album.musics.slice(i + 1))}
                            >
                                {/* index / state icon */}
                                <div style={{ width: '28px', textAlign: 'center', color: active ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '1rem', fontWeight: 'bold' }}>
                                    {playing ? <Pause size={16} /> : (active ? <Play size={16} /> : i + 1)}
                                </div>

                                {/* track name */}
                                <div style={{ flex: 1, marginLeft: '0.5rem', fontWeight: playing ? '700' : '400', color: active ? 'var(--primary-color)' : 'white' }}>
                                    {track.title}
                                </div>

                                {/* external link if available */}
                                {track.uri && (
                                    <a
                                        href={track.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        Source ↗
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AlbumDetails;
