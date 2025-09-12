"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsService } from '@/services/analyticsService';

interface EnhancedAudioPlayerProps {
  src: string;
  fileName: string;
  fileId?: string;
}

export function EnhancedAudioPlayer({ src, fileName, fileId }: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    };
    
    const setAudioDuration = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setIsLoading(false);
    };

    const handleLoadingStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (fileId && typeof window !== 'undefined') {
        analyticsService.trackVideoControl(fileId, 'ended', audio.currentTime);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('loadstart', handleLoadingStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('loadstart', handleLoadingStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [fileId]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        if (fileId && typeof window !== 'undefined') {
          analyticsService.trackVideoControl(fileId, 'play', audioRef.current.currentTime);
        }
      } else {
        audioRef.current.pause();
        if (fileId && typeof window !== 'undefined') {
          analyticsService.trackVideoControl(fileId, 'pause', audioRef.current.currentTime);
        }
      }
    } catch (error) {
      // Handle AbortError silently - this happens when play() is interrupted by pause()
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Audio play/pause error:', error);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
    audioRef.current.currentTime = seekTime;
    if (fileId && typeof window !== 'undefined') {
      analyticsService.trackVideoControl(fileId, 'seek', seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) setVolume(1);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (fileId && typeof window !== 'undefined') {
        analyticsService.trackVideoControl(fileId, 'restart', 0);
      }
    }
  };

  const skip = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += time;
      if (fileId && typeof window !== 'undefined') {
        analyticsService.trackVideoControl(fileId, time > 0 ? 'skip_forward' : 'skip_backward', audioRef.current.currentTime);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group overflow-hidden rounded-2xl shadow-2xl shadow-bolt-black/20 bg-gradient-to-br from-bolt-black to-bolt-black/90">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata"
        onError={() => console.error('Audio failed to load')}
      />

      {/* Visual waveform/visualization area */}
      <div className="relative h-32 bg-gradient-to-b from-bolt-black/60 to-bolt-black/40 flex items-center justify-center overflow-hidden">
        {/* Animated waveform visualization */}
        <div className="flex items-center gap-1 h-16">
          {Array.from({ length: 40 }, (_, i) => (
            <div 
              key={i}
              className={cn(
                "w-1 bg-bolt-blue/30 rounded-full transition-all duration-300",
                isPlaying && "animate-pulse"
              )}
              style={{ 
                height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 20}px`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bolt-black/60">
            <Loader2 className="w-8 h-8 text-bolt-blue animate-spin" />
          </div>
        )}
      </div>

      {/* Controls overlay */}
      <div className="p-6 space-y-4">
        {/* Progress bar */}
        <div className="relative">
          <div 
            className="w-full h-2 bg-bolt-black/40 rounded-full cursor-pointer pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
          >
            <div 
              className="h-full bg-bolt-blue rounded-full transition-all duration-200 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
            </div>
          </div>
          
          {/* Time display */}
          <div className="flex justify-between items-center mt-2 text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Skip backward */}
            <button 
              onClick={(e) => { e.stopPropagation(); skip(-10); }} 
              className="p-2 bg-bolt-cyan/20 rounded-full backdrop-blur-md hover:bg-bolt-cyan/30 transition-all duration-200 hover:scale-110"
              title="Skip backward 10s"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>

            {/* Play/Pause */}
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="p-3 bg-bolt-blue/80 rounded-full backdrop-blur-md hover:bg-bolt-blue transition-all duration-200 hover:scale-110 shadow-lg"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>

            {/* Skip forward */}
            <button 
              onClick={(e) => { e.stopPropagation(); skip(10); }} 
              className="p-2 bg-bolt-cyan/20 rounded-full backdrop-blur-md hover:bg-bolt-cyan/30 transition-all duration-200 hover:scale-110"
              title="Skip forward 10s"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>

            {/* Restart */}
            <button 
              onClick={(e) => { e.stopPropagation(); restart(); }} 
              className="p-2 bg-bolt-cyan/20 rounded-full backdrop-blur-md hover:bg-bolt-cyan/30 transition-all duration-200 hover:scale-110"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }} 
                className="w-24 h-1 accent-bolt-blue bg-bolt-black/40 rounded-full"
                title="Volume"
              />
            </div>

            {/* File name */}
            <div className="text-sm font-medium text-white truncate max-w-xs bg-bolt-black/40 px-3 py-1 rounded">
              {fileName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}