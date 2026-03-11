import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { User, Library as LibraryIcon, StopCircle } from 'lucide-react';
import api from '../api';

function Library() {
    const { user } = useContext(AuthContext);
    const { currentTrack, play, isPlaying } = useContext(PlayerContext);

    const [myAlbums, setMyAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    // Here, ideally, there'd be an endpoint to fetch User's own library.
    // We'll filter the global catalogue for their uploads if they are an artist.

    useEffect(() => {
        const fetchMyItems = async () => {
            try {
                const res = await api.get('/music/albums');
                // filter purely albums where the artist matches the logged in user
                const selfAlbums = res.data.albums.filter(a => a.artist?._id === user.id);
                setMyAlbums(selfAlbums);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'artist') {
            fetchMyItems();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="content-wrapper fade-in">

            {/* Header Profile */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '150px', height: '150px', background: 'linear-gradient(135deg, var(--primary-color), #095924)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                    <User size={80} color="#000" />
                </div>
                <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Profile</span>
                    <h1 style={{ fontSize: '4rem', marginTop: '0.25rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>{user.username}</h1>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        {user.email} • <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                </div>
            </div>

            {/* Content specific to library/activity */}
            {user.role === 'user' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
                    <LibraryIcon size={64} color="var(--text-muted)" />
                    <h2 style={{ color: 'var(--text-main)' }}>Your Library is Empty</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>Upload features are only available for artist accounts right now. Start exploring some featured albums on the Home page!</p>
                </div>
            ) : (
                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Created Albums</h2>
                    {myAlbums.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>You haven't created any albums yet.</p>
                    ) : (
                        <div className="card-grid">
                            {myAlbums.map(album => (
                                <div key={album._id} className="album-card" onClick={() => window.location.href = `/album/${album._id}`}>
                                    <div className="album-image-placeholder">
                                        <StopCircle size={48} color="rgba(255,255,255,0.1)" />
                                    </div>
                                    <div>
                                        <div className="album-title">{album.title}</div>
                                        <div className="album-artist">{album.musics?.length || 0} tracks</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default Library;
