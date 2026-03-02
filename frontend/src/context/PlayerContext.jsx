import { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // { _id, title, artist, uri }
    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);   // 0-100
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const audioRef = useRef(new Audio());

    // ── sync volume immediately ──────────────────────────────────────────────
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // ── when track changes, load + autoplay ─────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!currentTrack?.uri) return;

        audio.src = currentTrack.uri;
        audio.load();
        audio.play().then(() => setIsPlaying(true)).catch(console.error);

        const onTimeUpdate = () =>
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        const onDurationChange = () => setDuration(audio.duration || 0);
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            // Auto-advance queue
            setQueue(prev => {
                if (prev.length === 0) return prev;
                const [next, ...rest] = prev;
                setCurrentTrack(next);
                return rest;
            });
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
        };
    }, [currentTrack]);

    // ── controls ─────────────────────────────────────────────────────────────
    const play = (track, trackQueue = []) => {
        if (track._id === currentTrack?._id) {
            togglePlay();
            return;
        }
        setQueue(trackQueue.filter(t => t._id !== track._id));
        setCurrentTrack(track);
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const seek = (pct) => {
        const audio = audioRef.current;
        if (!audio.duration) return;
        audio.currentTime = (pct / 100) * audio.duration;
        setProgress(pct);
    };

    const skipNext = () => {
        if (queue.length === 0) return;
        const [next, ...rest] = queue;
        setQueue(rest);
        setCurrentTrack(next);
    };

    const skipPrev = () => {
        const audio = audioRef.current;
        audio.currentTime = 0;
        setProgress(0);
    };

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                progress,
                duration,
                volume,
                queue,
                play,
                togglePlay,
                seek,
                skipNext,
                skipPrev,
                setVolume,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};
