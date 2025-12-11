import { useState, useRef, useEffect } from 'react'
import type { Document } from '../../lib/schemas'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Settings, Music, Gauge } from 'lucide-react'

interface AudioViewerProps {
    doc: Document
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function AudioViewer({ doc }: AudioViewerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [showSettings, setShowSettings] = useState(false)

    const src = doc.url || doc.content

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
        const handleLoadedMetadata = () => setDuration(audio.duration)
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
        }
    }, [])

    const togglePlay = () => {
        if (audioRef.current) {
            isPlaying ? audioRef.current.pause() : audioRef.current.play()
        }
    }

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        if (audioRef.current) {
            audioRef.current.volume = val
            setVolume(val)
            setIsMuted(val === 0)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        if (audioRef.current) {
            audioRef.current.currentTime = val
            setCurrentTime(val)
        }
    }

    const handleSpeedChange = (speed: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed
            setPlaybackSpeed(speed)
            setShowSettings(false)
        }
    }

    const skip = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds
        }
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (!src) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-muted-foreground">No se puede reproducir este audio</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 gap-8">
            <audio ref={audioRef} src={src} />

            {/* Visual representation */}
            <div className="relative">
                <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                        <Music size={48} className="text-primary" />
                    </div>
                </div>

                {/* Animated rings when playing */}
                {isPlaying && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                    </>
                )}
            </div>

            {/* Title */}
            <div className="text-center">
                <h3 className="text-lg font-medium">{doc.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                    {playbackSpeed !== 1 && <span className="ml-2 text-primary">({playbackSpeed}x)</span>}
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 appearance-none bg-muted rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) ${(currentTime / duration) * 100}%)`
                    }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Skip back */}
                <button onClick={() => skip(-10)} className="p-2 text-muted-foreground hover:text-foreground transition">
                    <SkipBack size={24} />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shadow-lg"
                >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>

                {/* Skip forward */}
                <button onClick={() => skip(10)} className="p-2 text-muted-foreground hover:text-foreground transition">
                    <SkipForward size={24} />
                </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center gap-6">
                {/* Volume */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1.5 appearance-none bg-muted rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>

                {/* Speed control */}
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition text-sm"
                    >
                        <Gauge size={16} />
                        <span>{playbackSpeed}x</span>
                    </button>

                    {showSettings && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="px-3 py-2 border-b text-xs text-muted-foreground font-medium">
                                Velocidad
                            </div>
                            {PLAYBACK_SPEEDS.map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`w-full px-4 py-2 text-left hover:bg-accent text-sm ${playbackSpeed === speed ? 'text-primary font-medium' : ''}`}
                                >
                                    {speed === 1 ? 'Normal' : `${speed}x`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings */}
                <button className="p-2 text-muted-foreground hover:text-foreground transition">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    )
}
