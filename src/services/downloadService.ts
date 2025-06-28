import axios from 'axios';

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
}

export interface VideoFormat {
  quality: string;
  format: string;
  size: string;
  url: string;
  type: 'video' | 'audio';
}

class DownloadService {
  private BACKEND_URL = 'http://localhost:4000';
  private ws: WebSocket | null = null;

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:4000');
    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
    this.ws.onclose = () => console.log('WebSocket closed');
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const response = await axios.post<VideoInfo>(`${this.BACKEND_URL}/api/video-info`, { url });
      const hasAudio = response.data.formats.some(f => f.type === 'audio' && f.quality === 'Best Audio');
      if (!hasAudio) {
        console.warn('No "Best Audio" option found in video info.');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching video info:', error);
      throw new Error(error.response?.data?.error || 'Failed to get video information.');
    }
  }

  async downloadFile(url: string, filename: string, type: 'video' | 'audio', quality: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const downloadId = Date.now().toString();
      const videoInfo = await this.getVideoInfo(url);
      const isValidQuality = videoInfo.formats.some(f => f.type === type && f.quality === quality);
      if (!isValidQuality) {
        throw new Error(`Invalid quality: ${quality}.`);
      }
      if (type === 'audio' && quality !== 'Best Audio') {
        throw new Error('Audio downloads only support "Best Audio" quality.');
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ downloadId }));
      }

      if (this.ws && onProgress) {
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.downloadId === downloadId) {
              onProgress(data.progress);
            }
          } catch (err) {
            console.error('WebSocket message parse error:', err);
          }
        };
      }

      const response = await axios({
        url: `${this.BACKEND_URL}/api/download`,
        method: 'POST',
        data: {
          url,
          filename,
          type,
          quality,
          downloadId
        },
        responseType: 'blob'
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

    } catch (error: any) {
      console.error('Download failed:', error);
      throw new Error(error.response?.data?.error || 'Download failed.');
    }
  }

  validateUrl(url: string, platform: string): boolean {
    const patterns = {
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/
    };
    return patterns[platform as keyof typeof patterns]?.test(url) || false;
  }

  extractVideoId(url: string, platform: string): string | null {
    try {
      switch (platform) {
        case 'youtube':
          const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          return ytMatch ? ytMatch[1] : null;
        case 'facebook':
          const fbMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
          return fbMatch ? fbMatch[1] : null;
        case 'instagram':
          const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
          return igMatch ? igMatch[1] : null;
        case 'tiktok':
          const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
          return ttMatch ? ttMatch[1] : null;
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}

export const downloadService = new DownloadService();