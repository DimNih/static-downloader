import React, { useRef, useState, useEffect } from 'react';
import { VideoInfo, VideoFormat } from '../services/downloadService';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Download, Play, Pause, Music, FileVideo, Clock, Eye, Volume2, VolumeX } from 'lucide-react';

interface VideoPreviewProps {
  videoInfo: VideoInfo;
  onDownload: (format: VideoFormat) => void;
  isDownloading: boolean;
  downloadProgress: number;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoInfo,
  onDownload,
  isDownloading,
  downloadProgress
}) => {
  const { language, isDarkMode } = useApp();
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview && videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className={`backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/50 border-slate-700' 
        : 'bg-white/70 border-slate-200 shadow-lg'
    }`}>
      {/* Video Preview Section */}
      <div className="mb-6">
        {showPreview && videoInfo.previewUrl ? (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoInfo.previewUrl}
              poster={videoInfo.thumbnail}
              className="w-full h-auto max-h-96 object-contain"
              onClick={togglePlay}
              loop
              muted={isMuted}
            />
            
            {/* Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 ${
              isDarkMode ? 'bg-gradient-to-t from-slate-900/90 to-transparent' : 'bg-gradient-to-t from-white/90 to-transparent'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <button 
                  onClick={togglePlay} 
                  className={`p-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button 
                  onClick={toggleMute} 
                  className={`p-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: isDarkMode
                    ? `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
                    : `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%)`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={videoInfo.thumbnail || 'https://via.placeholder.com/320x180'}
              alt={videoInfo.title}
              className="w-full h-auto rounded-2xl cursor-pointer"
              onClick={togglePreview}
            />
            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
              <button 
                onClick={togglePreview}
                className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'} hover:scale-110 transition-transform`}
              >
                <Play className="w-12 h-12" />
              </button>
            </div>
            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
              isDarkMode ? 'bg-black/70 text-white' : 'bg-white/90 text-slate-900'
            }`}>
              <Clock className="w-3 h-3 inline mr-1" />
              {videoInfo.duration}
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mb-6">
        <h3 className={`text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          {videoInfo.title}
        </h3>
        
        <div className={`flex items-center space-x-4 text-sm mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{t.duration}: {videoInfo.duration}</span>
          </div>
        </div>

        {/* Download Progress */}
        {isDownloading && (
          <div className="mb-4">
            <div className={`flex justify-between text-sm mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <span>{t.downloading}...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
            }`}>
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Download Options */}
      <div className="space-y-3">
        <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          {t.availableFormats}
        </h4>
        
        {videoInfo.formats.map((format, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-700' 
                : 'bg-white/50 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              {format.type === 'video' ? (
                <FileVideo className="w-6 h-6 text-blue-500" />
              ) : (
                <Music className="w-6 h-6 text-green-500" />
              )}
              <div>
                <div className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {format.format} - {format.quality}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {format.size}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDownload(format)}
              disabled={isDownloading}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isDownloading
                  ? isDarkMode
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : format.type === 'video'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>{t.download}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPreview;