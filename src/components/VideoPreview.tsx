import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { VideoInfo, VideoFormat } from '../services/downloadService';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Download, Play, Pause, Music, FileVideo, Clock, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface VideoPreviewProps {
  videoInfo: VideoInfo & { platform?: string };
  onDownload: (format: VideoFormat) => void;
  isDownloading: boolean;
  downloadProgress: number;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoInfo,
  onDownload,
  isDownloading,
  downloadProgress,
}) => {
  const { language, isDarkMode } = useApp();
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoInfo.previewUrl) {
      setVideoError('Tidak ada URL video yang tersedia.');
      return;
    }

    console.log('VideoInfo:', videoInfo);
    console.log('Preview URL:', videoInfo.previewUrl, 'Platform:', videoInfo.platform);

    let hls: Hls | null = null;

    const loadVideo = () => {
      const isHls = !!videoInfo.previewUrl && videoInfo.previewUrl.includes('.m3u8');
      if (isHls && Hls.isSupported()) {
        hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.setRequestHeader(
              'User-Agent',
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            );
            xhr.setRequestHeader(
              'Referer',
              videoInfo.platform === 'tiktok' ? 'https://www.tiktok.com/' :
              videoInfo.platform === 'instagram' ? 'https://www.instagram.com/' :
              videoInfo.platform === 'facebook' ? 'https://www.facebook.com/' :
              videoInfo.platform === 'youtube' ? 'https://www.youtube.com/' : ''
            );
            xhr.withCredentials = false;
          },
          enableWorker: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
        });

        hls.loadSource(videoInfo.previewUrl!);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest berhasil di-parse');
          video.play().then(() => {
            console.log('Pemutaran otomatis dimulai');
            setIsPlaying(true);
            setVideoError(null);
          }).catch((err) => {
            console.error('Kesalahan pemutaran otomatis:', err);
            setVideoError('Pemutaran otomatis gagal. Klik play untuk mencoba lagi.');
            setIsPlaying(false);
          });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('Kesalahan HLS:', data);
          if (data.fatal) {
            setVideoError('Gagal memuat stream video. Coba lagi nanti.');
          }
        });
      } else {
        video.src = videoInfo.previewUrl!;
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => {
            setIsPlaying(true);
            setVideoError(null);
          }).catch((err) => {
            console.error('Kesalahan pemutaran MP4:', err);
            setVideoError('Pemutaran otomatis gagal. Klik play untuk mencoba lagi.');
            setIsPlaying(false);
          });
        });
      }
    };

    loadVideo();

    const handleEnded = () => {
      setShowRestart(true);
      setIsPlaying(false);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', () => setVideoError('Pemutaran gagal. Coba lagi.'));

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', () => {});
      if (hls) hls.destroy();
    };
  }, [videoInfo.previewUrl, videoInfo.platform]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
        setVideoError(null);
        setShowRestart(false);
      }
    } catch (err) {
      console.error('Kesalahan pemutaran:', err);
      setVideoError('Pemutaran gagal. Coba lagi atau periksa sumber video.');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
      setShowRestart(false);
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`backdrop-blur-md rounded-3xl p-4 sm:p-6 border transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white/70 border-slate-200 shadow-lg'
      } max-w-4xl mx-auto w-full`}
    >
      {/* Bagian Pratinjau Video */}
      <div className="mb-6">
        <div
          className="relative rounded-2xl overflow-hidden bg-black aspect-video"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            poster={videoInfo.thumbnail || 'https://via.placeholder.com/640x360?text=Tidak+Ada+Thumbnail'}
            className="w-full h-full object-contain"
            muted={isMuted}
            controls={false}
          >
            {videoInfo.previewUrl && (
              <source
                src={videoInfo.previewUrl}
                type={videoInfo.previewUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'}
              />
            )}
            Browser Anda tidak mendukung tag video.
          </video>
          <div className="absolute inset-0 flex items-center justify-center">
            {showRestart ? (
              <button
                onClick={handleRestart}
                className="p-4 rounded-full bg-slate-800/70 text-white hover:scale-110"
              >
                <RotateCcw className="w-8 h-8 sm:w-12 sm:h-12" />
              </button>
            ) : (
              <button
                onClick={togglePlay}
                className={`p-4 rounded-full transition-opacity duration-200 ${
                  isPlaying && !showControls ? 'opacity-0' : 'opacity-100'
                } ${isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'} hover:scale-110`}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-12 sm:h-12" />
                ) : (
                  <Play className="w-8 h-8 sm:w-12 sm:h-12" />
                )}
              </button>
            )}
            <button
              onClick={toggleMute}
              className={`absolute bottom-4 right-4 p-2 rounded-full ${
                showControls ? 'opacity-100' : 'opacity-0'
              } ${isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'} hover:scale-110 transition-opacity duration-200`}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
          {videoError && (
            <div
              className={`absolute top-4 left-4 p-2 rounded-lg text-xs sm:text-sm ${
                isDarkMode ? 'bg-red-900/80 text-red-200' : 'bg-red-100/80 text-red-800'
              }`}
            >
              {videoError}
            </div>
          )}
        </div>
      </div>

      {/* Informasi Video */}
      <div className="mb-6">
        <h3
          className={`text-lg sm:text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {videoInfo.title}
        </h3>
        <div
          className={`flex items-center space-x-4 text-xs sm:text-sm mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{t.duration}: {videoInfo.duration}</span>
          </div>
        </div>

        {/* Progres Unduhan */}
        {isDownloading && (
          <div className="mb-4">
            <div
              className={`flex justify-between text-xs sm:text-sm mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>{t.downloading}...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div
              className={`w-full h-2 rounded-full ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            >
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Opsi Unduhan */}
      <div className="space-y-3">
        <h4
          className={`font-semibold text-base sm:text-lg mb-3 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t.availableFormats}
        </h4>
        {videoInfo.formats.map((format, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-700'
                : 'bg-white/50 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              {format.type === 'video' ? (
                <FileVideo className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              ) : (
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              )}
              <div>
                <div
                  className={`font-medium text-sm sm:text-base transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {format.format} - {format.quality}
                </div>
                <div
                  className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {format.size}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDownload(format)}
              disabled={isDownloading}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
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