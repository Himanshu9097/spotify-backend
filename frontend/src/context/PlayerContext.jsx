import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import api from '../api';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);   // 0-100
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [error, setError] = useState('');
    const audioRef = useRef(null);

    // Create Audio element once
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
    }

    // ── Sync volume ────────────────────────────────────────────────
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // ── Load & play when track changes ─────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!currentTrack) return;

        if (!currentTrack.uri) {
            setError('This track has no playable URL.');
            return;
        }

        setError('');
        setProgress(0);
        setDuration(0);

        // Stop any currently playing audio first
        audio.pause();
        audio.src = currentTrack.uri;

        const onCanPlay = () => {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error('Playback error:', err);
                    setError('Could not play this track. Check the audio URL or browser restrictions.');
                    setIsPlaying(false);
                });
        };

        const onTimeUpdate = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const onDurationChange = () => {
            if (!isNaN(audio.duration)) setDuration(audio.duration);
        };

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

        const onError = (e) => {
            console.error('Audio error:', audio.error);
            const msg = audio.error
                ? `Audio error (code ${audio.error.code}): ${audio.error.message}`
                : 'Unknown audio error/format not supported';
            setError(msg);
            setIsPlaying(false);
        };

        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        audio.load();

        return () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };

    }, [currentTrack]);

    // ── Controls ───────────────────────────────────────────────────
    const play = useCallback((track, trackQueue = []) => {
        if (!track) return;
        setError('');

        // Same track — toggle play/pause
        if (track._id === currentTrack?._id) {
            togglePlay();
            return;
        }

        setQueue(trackQueue.filter(t => t._id !== track._id));
        setCurrentTrack(track);

        // Record History
        api.post('/music/history', {
            musicId: track._id,
            title: track.title,
            artistName: track.artist?.username || track.artist || 'Unknown Artist',
            uri: track.uri,
            image: track.image,
            isExternal: track.isExternal || false
        }).catch(err => console.error("Could not record history", err));
    }, [currentTrack]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio.src) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error('Resume error:', err);
                    setIsPlaying(false);
                });
        }
    }, [isPlaying]);

    const seek = useCallback((pct) => {
        const audio = audioRef.current;
        if (!audio.duration || isNaN(audio.duration)) return;
        audio.currentTime = (pct / 100) * audio.duration;
        setProgress(pct);
    }, []);

    const skipNext = useCallback(() => {
        setQueue(prev => {
            if (prev.length === 0) return prev;
            const [next, ...rest] = prev;
            setCurrentTrack(next);
            return rest;
        });
    }, []);

    const skipPrev = useCallback(() => {
        const audio = audioRef.current;
        audio.currentTime = 0;
        setProgress(0);
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                progress,
                duration,
                volume,
                queue,
                error,
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
