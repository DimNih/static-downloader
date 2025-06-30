import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { downloadService, VideoInfo, VideoFormat } from '../services/downloadService';
import VideoPreview from './VideoPreview';
import { Download, Link, Copy, Check, AlertCircle, Loader, ImageOff, Play, Clock, FileVideo, Music } from 'lucide-react';

const DownloadSection: React.FC = () => {
  const { selectedPlatform, language, isDarkMode } = useApp();
  const t = translations[language];

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const handleAnalyze = async () => {
    if (!url || !selectedPlatform) return;

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    setShowPreview(false);
    setThumbnailFailed(false);

    try {
      if (!downloadService.validateUrl(url, selectedPlatform)) {
        throw new Error(t.invalidUrl || 'Invalid URL for selected platform');
      }
      const info = await downloadService.getVideoInfo(url);
      setVideoInfo(info);
    } catch (err) {
      console.error('Error during video analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: VideoFormat) => {
    if (!videoInfo) {
      setError('No video information available for download.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      const filename = `${videoInfo.title}_${format.quality}`;
      await downloadService.downloadFile(
        url,
        filename,
        format.type,
        format.quality,
        (percent) => setDownloadProgress(percent)
      );
    } catch (err: any) {
      console.error('Error during download:', err);
      setError(err.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleReset = () => {
    setUrl('');
    setVideoInfo(null);
    setError(null);
    setIsLoading(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setShowPreview(false);
    setThumbnailFailed(false);
  };

  const handleThumbnailError = () => {
    console.error('Thumbnail failed to load:', videoInfo?.thumbnail);
    setThumbnailFailed(true);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  if (!selectedPlatform) {
    return (
      <section className={`py-16 px-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="container mx-auto text-center">
          <div
            className={`backdrop-blur-md rounded-2xl p-8 md:p-12 border max-w-2xl mx-auto ${
              isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/70 border-slate-200 shadow-lg'
            }`}
          >
            <Link className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {t.selectPlatformFirst}
            </h3>
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.selectPlatformDesc}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div
            className={`backdrop-blur-md rounded-3xl p-6 md:p-8 border ${
              isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/70 border-slate-200 shadow-lg'
            }`}
          >
            <div className="text-center mb-8">
              <h2
                className={`text-2xl md:text-3xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {t.downloadFrom} {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
              </h2>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.pasteLink} {selectedPlatform} {t.linkHere}
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`${t.pasteLink} ${selectedPlatform} ${t.linkHere}`}
                  className={`w-full px-4 md:px-6 py-3 md:py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:bg-slate-50'
                  }`}
                />
                <button
                  onClick={handlePaste}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!url || isLoading}
                  className={`flex-1 py-3 md:py-4 px-8 rounded-2xl font-semibold text-lg ${
                    !url || isLoading
                      ? isDarkMode
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>{t.analyzing || 'Analyzing...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        <span>{t.analyzeVideo || 'Analyze Video'}</span>
                      </>
                    )}
                  </div>
                </button>

                {videoInfo && (
                  <button
                    onClick={handleReset}
                    className={`px-6 py-3 md:py-4 rounded-2xl font-semibold ${
                      isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {t.newVideo || 'New Video'}
                  </button>
                )}
              </div>

              {error && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {videoInfo && (
                <div className="mb-6">
                  {showPreview && videoInfo.previewUrl ? (
                    <VideoPreview
                      videoInfo={videoInfo}
                      onDownload={handleDownload}
                      isDownloading={isDownloading}
                      downloadProgress={downloadProgress}
                    />
                  ) : (
                    <>
                      <div className="relative">
                        {videoInfo.thumbnail && videoInfo.thumbnail !== '' && !thumbnailFailed ? (
                          <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="w-full h-auto rounded-2xl cursor-pointer"
                            onClick={togglePreview}
                            onError={handleThumbnailError}
                          />
                        ) : (
                          <div
                            className={`w-full h-48 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${
                              isDarkMode
                                ? 'from-slate-800 to-slate-900 text-slate-300'
                                : 'from-slate-200 to-slate-300 text-slate-600'
                            } transition-all duration-300 hover:shadow-xl`}
                          >
                            <ImageOff className="w-12 h-12 mb-2 opacity-70" />
                            <span className="text-lg font-semibold">{t.noThumbnail || 'No Thumbnail Available'}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                          <button
                            onClick={togglePreview}
                            className={`p-4 rounded-full ${
                              isDarkMode ? 'bg-slate-800/70 text-white' : 'bg-white/80 text-slate-900'
                            } hover:scale-110 transition-transform duration-200`}
                          >
                            <Play className="w-12 h-12" />
                          </button>
                        </div>
                        <div
                          className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                            isDarkMode ? 'bg-black/70 text-white' : 'bg-white/90 text-slate-900'
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {videoInfo.duration}
                        </div>
                      </div>
                      {/* Video Info */}
                      <div className="mt-6">
                        <h3
                          className={`text-xl font-semibold mb-2 line-clamp-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {videoInfo.title}
                        </h3>
                        <h4
                          className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {videoInfo.title}
                        </h4>
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
                        {/* Download Options */}
                        <div className="space-y-3">
                          <h4
                            className={`font-semibold mb-3 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {t.availableFormats || 'Available Formats'}
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
                                onClick={() => handleDownload(format)}
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
                                  <span>{t.download || 'Download'}</span>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div
                className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-slate-200'
                }`}
              >
                <p className={`text-sm text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong>{t.note}</strong> {t.noteDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;