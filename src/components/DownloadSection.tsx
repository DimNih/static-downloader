import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { downloadService, VideoInfo, VideoFormat } from '../services/downloadService';
import VideoPreview from './VideoPreview';
import { Download, Link, Copy, Check, AlertCircle, Loader } from 'lucide-react';

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

  const handleAnalyze = async () => {
    if (!url || !selectedPlatform) return;

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);

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
  };

  if (!selectedPlatform) {
    return (
      <section className={`py-16 px-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="container mx-auto text-center">
          <div className={`backdrop-blur-md rounded-2xl p-8 md:p-12 border max-w-2xl mx-auto ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/70 border-slate-200 shadow-lg'}`}>
            <Link className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {t.selectPlatformFirst}
            </h3>
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.selectPlatformDesc}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className={`backdrop-blur-md rounded-3xl p-6 md:p-8 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/70 border-slate-200 shadow-lg'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
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
                  className={`w-full px-4 md:px-6 py-3 md:py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-700' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:bg-slate-50'}`}
                />
                <button
                  onClick={handlePaste}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!url || isLoading}
                  className={`flex-1 py-3 md:py-4 px-8 rounded-2xl font-semibold text-lg ${!url || isLoading ? isDarkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'}`}
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
                    className={`px-6 py-3 md:py-4 rounded-2xl font-semibold ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    {t.newVideo || 'New Video'}
                  </button>
                )}
              </div>

              {error && (
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {videoInfo && (
                <VideoPreview
                  videoInfo={videoInfo}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                  downloadProgress={downloadProgress}
                />
              )}

              {isDownloading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                  <p className="text-center mt-2">{downloadProgress}%</p>
                </div>
              )}

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
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
