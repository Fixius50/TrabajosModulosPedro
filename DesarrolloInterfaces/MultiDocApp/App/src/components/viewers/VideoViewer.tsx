import { useState, useRef, useEffect } from 'react'
import type { Document } from '../../lib/schemas'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Captions, Gauge, FileText } from 'lucide-react'

interface VideoViewerProps {
    doc: Document
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoViewer({ doc }: VideoViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [showSettings, setShowSettings] = useState(false)
    const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'subtitles'>('main')
    const [showControls, setShowControls] = useState(true)

    const src = doc.url || doc.content

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => setCurrentTime(video.currentTime)
        const handleLoadedMetadata = () => setDuration(video.duration)
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
        }
    }, [])

    // Auto-hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handleMouseMove = () => {
            setShowControls(true)
            clearTimeout(timeout)
            if (isPlaying) {
                timeout = setTimeout(() => setShowControls(false), 3000)
            }
        }
        containerRef.current?.addEventListener('mousemove', handleMouseMove)
        return () => {
            containerRef.current?.removeEventListener('mousemove', handleMouseMove)
            clearTimeout(timeout)
        }
    }, [isPlaying])

    const togglePlay = () => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.pause() : videoRef.current.play()
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.volume = val
            setVolume(val)
            setIsMuted(val === 0)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = val
            setCurrentTime(val)
        }
    }

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed
            setPlaybackSpeed(speed)
            setSettingsTab('main')
        }
    }

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
        } else {
            document.exitFullscreen()
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
                <p className="text-muted-foreground">No se puede reproducir este video</p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="relative flex items-center justify-center h-full bg-black group"
            onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'VIDEO') {
                    togglePlay()
                }
            }}
        >
            <video
                ref={videoRef}
                className="max-w-full max-h-full"
                src={src}
            />

            {/* Controls overlay */}
            <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress bar */}
                <div className="px-4 pb-2">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 appearance-none bg-white/30 rounded cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #ef4444 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
                        }}
                    />
                </div>

                {/* Control bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Left controls */}
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:scale-110 transition">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={() => skip(-10)} className="text-white hover:scale-110 transition">
                            <SkipBack size={20} />
                        </button>
                        <button onClick={() => skip(10)} className="text-white hover:scale-110 transition">
                            <SkipForward size={20} />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-white">
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/vol:w-20 transition-all appearance-none h-1 bg-white/30 rounded cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>

                        {/* Time */}
                        <span className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-3 relative">
                        {/* Speed indicator */}
                        {playbackSpeed !== 1 && (
                            <span className="text-white text-sm font-medium bg-white/20 px-2 py-0.5 rounded">
                                {playbackSpeed}x
                            </span>
                        )}

                        {/* Settings button */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-white hover:scale-110 transition"
                        >
                            <Settings size={20} />
                        </button>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition">
                            <Maximize size={20} />
                        </button>

                        {/* Settings menu */}
                        {showSettings && (
                            <div className="absolute bottom-12 right-0 bg-zinc-900 rounded-lg shadow-xl overflow-hidden min-w-48 z-50">
                                {settingsTab === 'main' && (
                                    <>
                                        <button
                                            onClick={() => setSettingsTab('subtitles')}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-left"
                                        >
                                            <Captions size={18} />
                                            <span>Subtítulos</span>
                                            <span className="ml-auto text-sm text-white/60">Desactivados</span>
                                        </button>
                                        <button
                                            onClick={() => setSettingsTab('speed')}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-left"
                                        >
                                            <Gauge size={18} />
                                            <span>Velocidad</span>
                                            <span className="ml-auto text-sm text-white/60">{playbackSpeed}x</span>
                                        </button>
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-left opacity-50 cursor-not-allowed"
                                        >
                                            <FileText size={18} />
                                            <span>Transcripción</span>
                                            <span className="ml-auto text-xs text-white/40">Próximamente</span>
                                        </button>
                                    </>
                                )}

                                {settingsTab === 'speed' && (
                                    <>
                                        <button
                                            onClick={() => setSettingsTab('main')}
                                            className="w-full flex items-center gap-2 px-4 py-2 border-b border-white/10 text-white text-sm"
                                        >
                                            ← Velocidad
                                        </button>
                                        {PLAYBACK_SPEEDS.map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => handleSpeedChange(speed)}
                                                className={`w-full px-4 py-2 text-left hover:bg-white/10 ${playbackSpeed === speed ? 'text-red-500' : 'text-white'}`}
                                            >
                                                {speed === 1 ? 'Normal' : `${speed}x`}
                                            </button>
                                        ))}
                                    </>
                                )}

                                {settingsTab === 'subtitles' && (
                                    <>
                                        <button
                                            onClick={() => setSettingsTab('main')}
                                            className="w-full flex items-center gap-2 px-4 py-2 border-b border-white/10 text-white text-sm"
                                        >
                                            ← Subtítulos
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-red-500 hover:bg-white/10">
                                            Desactivados
                                        </button>
                                        <p className="px-4 py-2 text-white/40 text-xs">
                                            No hay subtítulos disponibles
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Center play button when paused */}
            {!isPlaying && showControls && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center">
                        <Play size={40} className="text-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    )
}
