import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Disc, Music } from 'lucide-react';

function Home() {
    const [albums, setAlbums] = useState([]);
    const [musics, setMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [albumRes, musicRes] = await Promise.all([
                    api.get('/music/albums'),
                    api.get('/music/')
                ]);
                setAlbums(albumRes.data.albums);
                setMusics(musicRes.data.musics);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="content-wrapper fade-in">

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Disc size={24} color="var(--primary-color)" /> Featured Albums
                </h2>
                {albums.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No albums available.</p>
                ) : (
                    <div className="card-grid">
                        {albums.map(album => (
                            <div key={album._id} className="album-card" onClick={() => navigate(`/album/${album._id}`)}>
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

            <section>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Music size={24} color="var(--primary-color)" /> Recent Tracks
                </h2>
                {musics.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No tracks available.</p>
                ) : (
                    <div className="card-grid">
                        {musics.map(music => (
                            <div key={music._id} className="album-card" style={{ padding: '0.75rem', flexDirection: 'row', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Music size={20} color="#000" />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="album-title">{music.title}</div>
                                    <div className="album-artist">{music.artist?.username || 'Unknown Artist'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

export default Home;
