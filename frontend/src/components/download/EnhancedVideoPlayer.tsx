"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsService } from '@/services/analyticsService';

interface EnhancedVideoPlayerProps {
  src: string;
  fileName: string;
  fileId?: string;
}

export function EnhancedVideoPlayer({ src, fileName, fileId }: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
    };
    const setVideoDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
        if (fileId && typeof window !== 'undefined') analyticsService.trackVideoControl(fileId, 'play', videoRef.current.currentTime);
      } else {
        videoRef.current.pause();
        if (fileId && typeof window !== 'undefined') analyticsService.trackVideoControl(fileId, 'pause', videoRef.current.currentTime);
      }
    } catch (error) {
      // Handle AbortError silently - this happens when play() is interrupted by pause()
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Video play/pause error:', error);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
    if (videoRef.current) videoRef.current.currentTime = seekTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) setVolume(1);
    }
  };

  const toggleFullScreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const skip = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += time;
      if (fileId && typeof window !== 'undefined') analyticsService.trackVideoControl(fileId, time > 0 ? 'skip_forward' : 'skip_backward', videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group overflow-hidden rounded-2xl shadow-2xl shadow-bolt-black/20 bg-gradient-to-br from-bolt-black to-bolt-black/90">
      <video 
        ref={videoRef} 
        src={src} 
        className="w-full aspect-video object-cover" 
        onClick={togglePlay}
        onError={() => console.error('Video failed to load')}
      />
      
      {/* Center play button overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => skip(-10)} 
            className="p-4 bg-bolt-cyan/20 rounded-full backdrop-blur-md hover:bg-bolt-cyan/30 transition-all duration-200 hover:scale-110"
            title="Skip backward 10s"
          >
            <SkipBack className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={togglePlay} 
            className="p-6 bg-bolt-blue/80 rounded-full backdrop-blur-md hover:bg-bolt-blue transition-all duration-200 hover:scale-110 shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
          </button>
          <button 
            onClick={() => skip(10)} 
            className="p-4 bg-bolt-cyan/20 rounded-full backdrop-blur-md hover:bg-bolt-cyan/30 transition-all duration-200 hover:scale-110"
            title="Skip forward 10s"
          >
            <SkipForward className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bolt-black/80 via-bolt-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress bar */}
        <div className="w-full h-2 bg-bolt-black/40 rounded-full cursor-pointer mb-3" onClick={handleSeek}>
          <div 
            className="h-full bg-gradient-to-r from-bolt-cyan via-bolt-blue to-bolt-purple rounded-full transition-all duration-200" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="w-20 h-1 accent-bolt-cyan bg-bolt-black/40 rounded-full"
                title="Volume"
              />
            </div>
            
            <div className="text-xs font-mono bg-bolt-black/40 px-2 py-1 rounded">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium truncate max-w-xs bg-bolt-black/40 px-3 py-1 rounded">
              {fileName}
            </div>
            <button 
              onClick={toggleFullScreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}