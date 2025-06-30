import axios from 'axios';

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
  previewUrl?: string;
}

export interface VideoFormat {
  quality: string;
  format: string;
  size: string;
  url: string;
  type: 'video' | 'audio';
}

class DownloadService {
  private BACKEND_URL = 'https://bekend-downloader-production.up.railway.app';

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const response = await axios.post<VideoInfo>(`${this.BACKEND_URL}/api/video-info`, { url });
    return response.data;
  }

  async downloadFile(
    url: string,
    filename: string,
    type: 'video' | 'audio',
    quality: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const videoInfo = await this.getVideoInfo(url);
    const isValidQuality = videoInfo.formats.some(f => f.type === type && f.quality === quality);
    if (!isValidQuality) {
      throw new Error(`Invalid quality: ${quality}.`);
    }
    if (type === 'audio' && quality !== 'Best Audio') {
      throw new Error('Audio downloads only support "Best Audio" quality.');
    }

    const response = await axios({
      url: `${this.BACKEND_URL}/api/download`,
      method: 'POST',
      data: { url, filename, type, quality },
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percent);
        }
      }
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${filename}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

 validateUrl(url: string, platform: string): boolean {
  const patterns = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
    facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
    tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com)\/.+/
  };
  return patterns[platform as keyof typeof patterns]?.test(url) || false;
}
}

export const downloadService = new DownloadService();
