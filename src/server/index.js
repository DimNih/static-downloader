// src/server/index.js
import express from 'express';
import { promisify } from 'util';
import { exec } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gunakan /tmp untuk Vercel
const DOWNLOADS_DIR = path.join('/tmp', 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const execAsync = promisify(exec);

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\.mp3\.mp3$|\.mp4\.mp4$|\.mp3$|\.mp4$/g, '');
};

app.post('/api/video-info', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    console.log('No URL provided');
    return res.status(400).json({ error: 'URL is required' });
  }

  const ytDlpPath = process.env.YT_DLP_PATH || 'yt-dlp'; // Gunakan env untuk Vercel
  const command = `${ytDlpPath} --dump-json --no-warnings "${url}"`;
  console.log(`Executing command: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 1024 * 1024 * 5 });
    if (stderr) console.error(`stderr: ${stderr}`);
    const data = JSON.parse(stdout);
    const formats = [];

    const bitrateEstimates = {
      '1080p': 4000,
      '720p': 2500,
      '480p': 1000,
      '360p': 700,
      '240p': 400,
      '144p': 150,
      '72p': 100,
    };

    const videoQualities = new Set();
    data.formats
      .filter((f) => f.vcodec !== 'none' && f.height)
      .sort((a, b) => b.height - a.height)
      .forEach((f) => {
        const quality = `${f.height}p`;
        if (!videoQualities.has(quality)) {
          let size = 'Unknown Size';
          if (f.filesize) {
            size = (f.filesize / (1024 * 1024)).toFixed(2) + 'MB';
          } else if (data.duration && bitrateEstimates[quality]) {
            size = ((bitrateEstimates[quality] * data.duration) / 8 / (1024 * 1024)).toFixed(2) + 'MB';
          }
          formats.push({
            quality: quality,
            format: 'MP4',
            size: size,
            url: data.webpage_url || url,
            type: 'video',
          });
          videoQualities.add(quality);
        }
      });

    const bestAudioSource = data.formats
      .filter((f) => f.acodec !== 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0) || (b.filesize || 0) - (a.filesize || 0))[0];
    if (bestAudioSource) {
      let audioSize = 'Unknown Size';
      if (bestAudioSource.filesize) {
        audioSize = (bestAudioSource.filesize / (1024 * 1024)).toFixed(2) + 'MB';
      } else if (data.duration) {
        audioSize = (data.duration * 0.1).toFixed(2) + 'MB';
      }
      formats.push({
        quality: 'Best Audio',
        format: 'MP3',
        size: audioSize,
        url: data.webpage_url || url,
        type: 'audio',
      });
    }

    const sortedFormats = formats.sort((a, b) => {
      if (a.type === 'video' && b.type === 'audio') return -1;
      if (a.type === 'audio' && b.type === 'video') return 1;
      if (a.type === 'video' && b.type === 'video') {
        const qualityA = parseInt(a.quality.replace('p', '')) || 0;
        const qualityB = parseInt(b.quality.replace('p', '')) || 0;
        return qualityB - qualityA;
      }
      return 0;
    });

    res.json({
      title: data.title || 'Unknown Title',
      thumbnail: data.thumbnail || '',
      duration: data.duration ? new Date(data.duration * 1000).toISOString().substr(11, 8) : '00:00:00',
      formats: sortedFormats,
    });
  } catch (error) {
    console.error(`Video info error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch video information.', details: error.message });
  }
});

app.post('/api/download', async (req, res) => {
  const { url, filename, type, quality } = req.body;

  if (!url || !filename || !type || !quality) {
    console.log('Invalid download request:', { url, filename, type, quality });
    return res.status(400).json({ error: 'URL, filename, type, and quality are required.' });
  }

  const sanitizedFilename = sanitizeFilename(filename);
  let outputFilePath;
  let command;

  try {
    const files = await fs.promises.readdir(DOWNLOADS_DIR);
    if (files.length > 5) {
      console.log('Cleaning old download files...');
      await Promise.all(
        files.map((file) =>
          fs.promises.unlink(path.join(DOWNLOADS_DIR, file)).catch((err) => console.warn(`Failed to delete ${file}:`, err))
        )
      );
    }
  } catch (cleanError) {
    console.warn('Failed to clean old download files:', cleanError);
  }

  const ytDlpPath = process.env.YT_DLP_PATH || 'yt-dlp';
  if (type === 'audio') {
    outputFilePath = path.join(DOWNLOADS_DIR, `${sanitizedFilename}.mp3`);
    command = `${ytDlpPath} -f "bestaudio/best[ext=mp4]" --extract-audio --audio-format mp3 -o "${outputFilePath}" "${url}"`;
  } else if (type === 'video') {
    const height = parseInt(quality.replace('p', ''));
    const formatSelection = height
      ? `bestvideo[height=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height=${height}]/best[ext=mp4]`
      : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
    outputFilePath = path.join(DOWNLOADS_DIR, `${sanitizedFilename}.mp4`);
    command = `${ytDlpPath} -f "${formatSelection}" --merge-output-format mp4 -o "${outputFilePath}" "${url}"`;
  } else {
    return res.status(400).json({ error: 'Invalid download type.' });
  }

  console.log(`Executing download command: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, { cwd: DOWNLOADS_DIR });
    console.log(`yt-dlp stdout: ${stdout}`);
    if (stderr) console.error(`yt-dlp stderr: ${stderr}`);

    const actualDownloadedFile = (await fs.promises.readdir(DOWNLOADS_DIR)).find((file) =>
      file.startsWith(sanitizedFilename) && file.endsWith(`.${type === 'audio' ? 'mp3' : 'mp4'}`)
    );

    if (!actualDownloadedFile) {
      console.log('Downloaded file not found:', sanitizedFilename);
      return res.status(500).json({ error: 'Downloaded file not found.' });
    }

    const fullDownloadedPath = path.join(DOWNLOADS_DIR, actualDownloadedFile);

    res.download(fullDownloadedPath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (fs.existsSync(fullDownloadedPath)) {
          fs.unlinkSync(fullDownloadedPath);
        }
        return res.status(500).json({ error: 'Failed to send file to client.' });
      }
      fs.promises.unlink(fullDownloadedPath).catch((unlinkErr) => {
        console.error('Failed to delete file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error(`Download error: ${error.message}`);
    return res.status(500).json({ error: 'Failed to download file.', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;