import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { VideoInfo, VideoFormat } from '../services/downloadService';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Download, Play, Pause, Music, FileVideo, Clock, Volume2, VolumeX } from 'lucide-react';

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoInfo.previewUrl) {
      setVideoError('No video URL provided.');
      return;
    }

    console.log('VideoInfo:', videoInfo);
    console.log('Preview URL:', videoInfo.previewUrl, 'Platform:', videoInfo.platform);

    let hls: Hls | null = null;

    const loadVideo = () => {
      if (videoInfo.previewUrl && videoInfo.previewUrl.includes('.m3u8') && (videoInfo.platform === 'tiktok' || videoInfo.platform === 'instagram')) {
        if (Hls.isSupported()) {
          hls = new Hls({
            xhrSetup: (xhr) => {
              xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
              xhr.setRequestHeader('Referer', videoInfo.platform === 'instagram' ? 'https://www.instagram.com/' : 'https://www.tiktok.com/');
              xhr.withCredentials = false;
            },
            enableWorker: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
          });

          hls.loadSource(videoInfo.previewUrl!);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed');
            video.play().then(() => {
              console.log('Auto-play started');
              setIsPlaying(true);
              setVideoError(null);
            }).catch((err) => {
              console.error('Auto-play error:', err);
              setVideoError('Auto-play failed. Click play to try again.');
              setIsPlaying(false);
            });
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setVideoError('Network error: Failed to load video stream. Check the URL or server proxy.');
                  if (hls) {
                    hls.startLoad();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setVideoError('Media error: The video format may be unsupported.');
                  if (hls) {
                    hls.recoverMediaError();
                  }
                  break;
                default:
                  setVideoError('Failed to load video stream. The source may be restricted or unavailable.');
                  break;
              }
            } else {
              setVideoError('Non-fatal HLS error occurred. Playback may continue.');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoInfo.previewUrl!;
          video.addEventListener('loadedmetadata', () => {
            video.play().then(() => {
              setIsPlaying(true);
              setVideoError(null);
            }).catch((err) => {
              console.error('Native HLS auto-play error:', err);
              setVideoError('Auto-play failed. Click play to try again.');
              setIsPlaying(false);
            });
          });
        } else {
          setVideoError('HLS is not supported in this browser.');
        }
      } else {
        video.src = videoInfo.previewUrl!;
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => {
            setIsPlaying(true);
            setVideoError(null);
          }).catch((err) => {
            console.error('MP4 auto-play error:', err);
            setVideoError('Auto-play failed. Click play to try again.');
            setIsPlaying(false);
          });
        });
      }
    };

    loadVideo();

    const handleError = () => {
      setVideoError('Failed to load video. The source may be invalid or restricted.');
      setIsPlaying(false);
    };

    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
      video.pause();
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoInfo.previewUrl, videoInfo.platform]); // Removed isPlaying from dependencies

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
      }
    } catch (err) {
      console.error('Play error:', err);
      setVideoError('Playback failed. Try again or check the video source.');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div
      className={`backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white/70 border-slate-200 shadow-lg'
      }`}
    >
      {/* Video Preview Section */}
      <div className="mb-6">
        <div
          className="relative rounded-2xl overflow-hidden bg-black"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            poster={videoInfo.thumbnail}
            className="w-full h-auto max-h-96 object-contain"
            onClick={togglePlay}
            muted={isMuted}
            controls={false}
          >
            {videoInfo.previewUrl && (
              <source
                src={videoInfo.previewUrl}
                type={videoInfo.previewUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'}
              />
            )}
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className={`p-4 rounded-full transition-opacity duration-200 ${
                isPlaying && !showControls ? 'opacity-0' : 'opacity-100'
              } ${isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'} hover:scale-110`}
            >
              {isPlaying ? (
                <Pause className="w-12 h-12" />
              ) : (
                <Play className="w-12 h-12" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className={`absolute bottom-4 right-4 p-2 rounded-full ${
                showControls ? 'opacity-100' : 'opacity-0'
              } ${isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'} hover:scale-110 transition-opacity duration-200`}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
          </div>
          {videoError && (
            <div
              className={`absolute top-4 left-4 p-2 rounded-lg text-sm ${
                isDarkMode ? 'bg-red-900/80 text-red-200' : 'bg-red-100/80 text-red-800'
              }`}
            >
              {videoError}
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="mb-6">
        <h3
          className={`text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {videoInfo.title}
        </h3>
        <div
          className={`flex items-center space-x-4 text-sm mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{t.duration}: {videoInfo.duration}</span>
          </div>
        </div>

        {/* Download Progress */}
        {isDownloading && (
          <div className="mb-4">
            <div
              className={`flex justify-between text-sm mb-2 transition-colors duration-300 ${
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

      {/* Download Options */}
      <div className="space-y-3">
        <h4
          className={`font-semibold mb-3 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
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
                <div
                  className={`font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {format.format} - {format.quality}
                </div>
                <div
                  className={`text-sm transition-colors duration-300 ${
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