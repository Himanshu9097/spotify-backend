import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Disc, PlayCircle, Music } from 'lucide-react';
import api from '../api';

function AlbumDetails() {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    return (
        <div className="content-wrapper fade-in">
            <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg, #1f1f1f, #333333)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                    <Disc size={80} color="rgba(255,255,255,0.2)" />
                </div>
                <div style={{ padding: '1rem 0', flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Album</span>
                    <h1 style={{ fontSize: '4rem', marginTop: '0.25rem', marginBottom: '1rem', lineHeight: '1.2' }}>{album.title}</h1>
                    <div style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--primary-color)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                            <Music size={12} />
                        </div>
                        {album.artist?.username} • {album.musics.length} tracks
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <button className="btn" style={{ padding: '1rem 3rem', borderRadius: '500px', fontSize: '1.125rem' }}>
                    <PlayCircle size={24} /> Play
                </button>
            </div>

            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', color: 'var(--text-muted)' }}>Tracklist</h3>

            {album.musics.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No tracks available for this album.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {album.musics.map((track, i) => (
                        <div key={track._id} className="album-card" style={{ padding: '0.875rem 1.25rem', flexDirection: 'row', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', width: '24px', textAlign: 'center', fontSize: '1.125rem' }}>{i + 1}</span>
                            <div style={{ flex: 1, marginLeft: '1rem' }}>
                                <div style={{ fontWeight: 'bold' }}>{track.title}</div>
                            </div>
                            {track.uri && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <a href={track.uri} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Listen Original</a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AlbumDetails;
