import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, AlertCircle
} from 'lucide-react';

function fmt(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function MusicPlayer() {
    const {
        currentTrack, isPlaying, progress, duration, volume, error,
        togglePlay, seek, skipNext, skipPrev, setVolume,
    } = useContext(PlayerContext);

    if (!currentTrack) return null;

    const elapsed = (progress / 100) * (duration || 0);

    return (
        <div className="music-player">
            {/* ── Track info ──────────────────────────────────────── */}
            <div className="player-track-info">
                <div className="player-track-icon" style={{ background: error ? '#e91429' : undefined }}>
                    {error
                        ? <AlertCircle size={18} color="#fff" />
                        : <Music size={18} color="#000" />
                    }
                </div>
                <div className="player-track-text" style={{ overflow: 'hidden' }}>
                    <div className="player-track-title">{currentTrack.title}</div>
                    {error
                        ? <div style={{ fontSize: '0.72rem', color: '#e91429', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{error}</div>
                        : <div className="player-track-artist">
                            {currentTrack.artist?.username || currentTrack.artist || ''}
                        </div>
                    }
                </div>
            </div>

            {/* ── Centre controls + progress ──────────────────────── */}
            <div className="player-centre">
                <div className="player-buttons">
                    <button className="player-icon-btn" onClick={skipPrev} title="Restart">
                        <SkipBack size={20} />
                    </button>
                    <button className="player-play-btn" onClick={togglePlay}>
                        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                    </button>
                    <button className="player-icon-btn" onClick={skipNext} title="Next">
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="player-progress-row">
                    <span className="player-time">{fmt(elapsed)}</span>
                    <input
                        type="range"
                        className="player-slider"
                        min={0} max={100} step={0.1}
                        value={progress}
                        onChange={e => seek(Number(e.target.value))}
                    />
                    <span className="player-time">{fmt(duration)}</span>
                </div>
            </div>

            {/* ── Volume ──────────────────────────────────────────── */}
            <div className="player-volume">
                <button
                    className="player-icon-btn"
                    onClick={() => setVolume(v => v > 0 ? 0 : 0.8)}
                >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                    type="range"
                    className="player-slider"
                    style={{ width: '90px' }}
                    min={0} max={1} step={0.01}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default MusicPlayer;
