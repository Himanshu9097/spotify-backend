import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Disc, Music, Play, Pause, TrendingUp, Heart, Clock } from 'lucide-react';
import { PlayerContext } from '../context/PlayerContext';

// Reusable Playlist Row Component
function PlaylistRow({ title, icon, tracks, likedSongs = [], toggleLike }) {
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);
    
    if (!tracks || tracks.length === 0) return null;
    
    return (
        <section style={{ marginTop: '3rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                {icon} {title}
            </h2>
            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                {tracks.slice(0, 6).map((music) => {
                    const active = currentTrack?._id === music._id;
                    const playing = active && isPlaying;
                    return (
                        <div
                            key={music._id}
                            className={`album-card ${active ? 'track-row-active' : ''}`}
                            onClick={() => play(music, tracks)}
                            style={{ position: 'relative' }}
                        >
                            <div className="album-image-placeholder" style={{ background: 'transparent', height: '180px', marginBottom: '1rem', position: 'relative' }}>
                                {music.image ? (
                                    <img src={music.image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{width:'100%', height:'100%', background:'#333', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}><Music size={40} color='rgba(255,255,255,0.6)'/></div>
                                )}
                                
                                {/* Hover Play Button */}
                                <div className="play-btn-overlay" style={{
                                    position: 'absolute', right: '10px', bottom: '10px', width: '48px', height: '48px',
                                    borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', opacity: active ? 1 : 0, transition: 'var(--transition)',
                                    boxShadow: '0 8px 8px rgba(0,0,0,0.3)', transform: active ? 'translateY(0)' : 'translateY(8px)'
                                }}>
                                    {playing ? <Pause size={24} color="#000" fill="#000" /> : <Play size={24} color="#000" fill="#000" style={{marginLeft: '4px'}} />}
                                </div>
                                
                                {/* Like Icon */}
                                {toggleLike && (
                                <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:10, cursor:'pointer' }} onClick={(e) => toggleLike(e, music)}>
                                    <Heart 
                                        fill={likedSongs.some(s => s._id === music._id) ? "var(--primary-color)" : "transparent"} 
                                        color={likedSongs.some(s => s._id === music._id) ? "var(--primary-color)" : "rgba(255,255,255,0.8)"} 
                                        size={22} 
                                        style={{ transition: 'transform 0.2s', ...(!likedSongs.some(s => s._id === music._id) && { opacity: 0.7 }) }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'}}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'}}
                                    />
                                </div>
                                )}
                            </div>
                            <div>
                                <div className="album-title" style={{ color: active ? 'var(--primary-color)' : 'white' }}>{music.title}</div>
                                <div className="album-artist">{music.artist?.username || 'Unknown Artist'}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Home() {
    const [albums, setAlbums] = useState([]);
    const [musics, setMusics] = useState([]);
    const [trendingIndian, setTrendingIndian] = useState([]);
    const [romanticIndian, setRomanticIndian] = useState([]);
    const [latestBollywood, setLatestBollywood] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [history, setHistory] = useState([]);
    const [pinnedPlaylists, setPinnedPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [albumRes, musicRes, indianRes, romanticRes, bollywoodRes, likedRes, historyRes, playlistRes] = await Promise.all([
                    api.get('/music/albums'),
                    api.get('/music/'),
                    api.get('/music/external/spotify?q=indian top hits&limit=10'),
                    api.get('/music/external/spotify?q=romantic hindi song&limit=10'),
                    api.get('/music/external/spotify?q=latest bollywood 2024&limit=10'),
                    api.get('/music/liked-songs').catch(() => ({ data: { musics: [] } })),
                    api.get('/music/history').catch(() => ({ data: { musics: [] } })),
                    api.get('/playlists').catch(() => ({ data: { playlists: [] } }))
                ]);
                setAlbums(albumRes.data.albums);
                setMusics(musicRes.data.musics);
                setTrendingIndian(indianRes.data.musics);
                setRomanticIndian(romanticRes.data.musics);
                setLatestBollywood(bollywoodRes.data.musics);
                setLikedSongs(likedRes.data?.musics || []);
                setHistory(historyRes.data?.musics || []);
                setPinnedPlaylists(playlistRes.data?.playlists?.filter(p => p.isPinned) || []);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loader"></div>;

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
                // Add to liked songs list at position 0
                setLikedSongs(prev => [{...music}, ...prev]);
            } else {
                setLikedSongs(prev => prev.filter(s => s._id !== music._id));
            }
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    const isTrackPlaying = (track) =>
        currentTrack?._id === track._id && isPlaying;

    // Build Quick Links Array mimicking top Spotify shortcuts
    const quickLinks = [];
    if (likedSongs.length > 0) quickLinks.push({ id: 'liked', name: 'Liked Songs', type: 'playlist', image: null, icon: <Heart fill="white" color="white" size={28} /> });
    
    pinnedPlaylists.slice(0, 4).forEach(pl => {
        quickLinks.push({ id: pl._id, name: pl.name, type: 'custom', image: pl.songs?.[0]?.image, icon: <Disc size={28} color="white" />, link: `/playlist/${pl._id}` });
    });
    
    history.slice(0, 8 - quickLinks.length).forEach(h => {
        quickLinks.push({ id: h._id, name: h.title, type: 'history', image: h.image, icon: <Music size={28} color="white" />, trackInfo: h });
    });

    return (
        <div className="content-wrapper fade-in" style={{ paddingTop: '1rem' }}>
            
            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button style={{ background: '#fff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem' }}>All</button>
                <button style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.3s' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.2)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.1)'}>Music</button>
                <button style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.3s' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.2)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.1)'}>Podcasts</button>
            </div>

            {/* Quick Links Grid */}
            {quickLinks.length > 0 && (
                <div className="quick-links-grid">
                    {quickLinks.map((link, idx) => {
                        const active = link.type === 'history' && currentTrack?._id === link.id && isPlaying;
                        return (
                            <div 
                                key={link.id + idx} 
                                className="quick-link-card"
                                onClick={() => {
                                    if (link.link) navigate(link.link);
                                    else if (link.type === 'history') play(link.trackInfo, history);
                                    else if (link.type === 'playlist') document.getElementById('liked-songs-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {link.image ? (
                                    <img src={link.image} alt={link.name} />
                                ) : (
                                    <div className="icon-placeholder" style={{ background: link.id === 'liked' ? 'linear-gradient(135deg, #450af5, #c4efd9)' : '#333' }}>
                                        {link.icon}
                                    </div>
                                )}
                                <div className="quick-link-title">{link.name}</div>
                                <div className="quick-link-play-btn">
                                    {active ? <Pause size={20} fill="#000" color="#000" /> : <Play size={20} fill="#000" color="#000" style={{marginLeft: '2px'}} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Albums ──────────────────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>It's New Music Friday!</h2>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>Show all</span>
                </div>
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

            {/* ── iTunes / Spotify / History Playlists ───────────────────────────────────── */}
            {history.length > 0 && (
                <PlaylistRow title="Recently Played" icon={<Clock size={28} color="var(--primary-color)" />} tracks={history} likedSongs={likedSongs} toggleLike={handleToggleLike} />
            )}
            {history.length === 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.5rem', opacity: 0.5 }}>
                        <Clock size={28} color="white" /> Recently Played
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Play some songs to build your history!</p>
                </div>
            )}
            
            <div id="liked-songs-section">
                {likedSongs.length > 0 && (
                    <PlaylistRow title="Liked Songs" icon={<Heart size={28} fill="var(--primary-color)" color="var(--primary-color)" />} tracks={likedSongs} likedSongs={likedSongs} toggleLike={handleToggleLike} />
                )}
                {likedSongs.length === 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.5rem', opacity: 0.5 }}>
                            <Heart size={28} color="white" /> Liked Songs
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>Tap the heart on any song to save it here!</p>
                    </div>
                )}
            </div>

            {/* Render any pinned user Custom Playlists */}
            {pinnedPlaylists.map(pl => (
                <PlaylistRow 
                    key={pl._id} 
                    title={pl.name} 
                    icon={<Disc size={28} color="var(--primary-color)" />} 
                    tracks={pl.songs.map(s => ({ ...s, _id: s.musicId }))}
                    likedSongs={likedSongs} 
                    toggleLike={handleToggleLike} 
                />
            ))}

            <PlaylistRow title="Trending Indian Hits" icon={<TrendingUp size={28} color="var(--primary-color)" />} tracks={trendingIndian} likedSongs={likedSongs} toggleLike={handleToggleLike} />
            <PlaylistRow title="Romantic Hindi Songs" icon={<Heart size={28} color="#e91429" />} tracks={romanticIndian} likedSongs={likedSongs} toggleLike={handleToggleLike} />
            <PlaylistRow title="Latest Bollywood" icon={<Play size={28} color="var(--primary-color)" />} tracks={latestBollywood} likedSongs={likedSongs} toggleLike={handleToggleLike} />

        </div>
    );
}

export default Home;
