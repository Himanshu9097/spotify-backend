import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Play, Pause, Music, Disc } from 'lucide-react';
import api from '../api';
import { PlayerContext } from '../context/PlayerContext';

function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [albums, setAlbums] = useState([]);
    const [localMusics, setLocalMusics] = useState([]);
    const [externalMusics, setExternalMusics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const navigate = useNavigate();
    const { play, currentTrack, isPlaying } = useContext(PlayerContext);

    // Fetch local database ONCE
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [albumRes, musicRes] = await Promise.all([
                    api.get('/music/albums'),
                    api.get('/music/')
                ]);
                setAlbums(albumRes.data.albums);
                setLocalMusics(musicRes.data.musics);
            } catch (error) {
                console.error("Error fetching data for search:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Debounced Search for External Spotify API
    useEffect(() => {
        if (!query.trim()) {
            setExternalMusics([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await api.get(`/music/external/spotify?q=${encodeURIComponent(query)}&limit=15`);
                setExternalMusics(res.data.musics || []);
            } catch(e) {
                console.error("External search error:", e);
            } finally {
                setSearchLoading(false);
            }
        }, 600); // 600ms latency protection to prevent backend spam

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const filteredMusics = localMusics.filter(music =>
        music.title?.toLowerCase().includes(query.toLowerCase()) ||
        music.artist?.username?.toLowerCase().includes(query.toLowerCase())
    );

    const filteredAlbums = albums.filter(album =>
        album.title?.toLowerCase().includes(query.toLowerCase()) ||
        album.artist?.username?.toLowerCase().includes(query.toLowerCase())
    );

    // Merge internal + external music results and remove dupes
    const allCombinedMusics = [...filteredMusics, ...externalMusics];
    const uniqueMusics = Array.from(new Map(allCombinedMusics.map(item => [item._id, item])).values());

    return (
        <div className="content-wrapper fade-in" style={{ paddingTop: '1rem' }}>
            {/* Search Input removed: Now using top Navbar search seamlessly */}

            {loading ? <div className="loader"></div> : (
                <div style={{ marginTop: '3rem' }}>

                    {/* Top Result / Tracks */}
                    {uniqueMusics.length > 0 && (
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                Songs
                                {searchLoading && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>(Searching global database...)</span>}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {uniqueMusics.slice(0, 20).map((music, i) => {
                                    const active = currentTrack?._id === music._id;
                                    const playing = active && isPlaying;
                                    return (
                                        <div
                                            key={music._id}
                                            className={`album-card ${active ? 'track-row-active' : ''}`}
                                            style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                                            onClick={() => play(music, uniqueMusics)}
                                        >
                                            {/* start icon / play */}
                                            <div style={{ width: '40px', height: '40px', background: active ? 'var(--primary-color)' : '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                {music.image ? (
                                                    <img src={music.image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Music size={20} color={active ? '#000' : 'rgba(255,255,255,0.6)'} />
                                                )}
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

                    {/* Album Results */}
                    {filteredAlbums.length > 0 && (
                        <section>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Albums</h2>
                            <div className="card-grid">
                                {filteredAlbums.map(album => (
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
                        </section>
                    )}

                    {uniqueMusics.length === 0 && filteredAlbums.length === 0 && query !== '' && !searchLoading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
                            <h3>No results found for "{query}"</h3>
                            <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
