/**
 * FFmpeg / FFprobe utilities
 */
import { execFile, execFileSync } from 'child_process';

function resolveExe(program) {
  return process.platform === 'win32' ? `${program}.exe` : program;
}

export function checkFFmpeg() {
  try {
    execFileSync(resolveExe('ffmpeg'), ['-version'], { stdio: 'ignore' });
    execFileSync(resolveExe('ffprobe'), ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Get media file duration in seconds via ffprobe. */
export function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    const exe = resolveExe('ffprobe');
    execFile(
      exe,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', filePath],
      { timeout: 10000 },
      (error, stdout, stderr) => {
        if (error) return reject(new Error(`ffprobe failed: ${error.message}\n${stderr}`));
        try {
          const data = JSON.parse(stdout);
          const duration = parseFloat(data.format?.duration);
          if (!Number.isFinite(duration) || duration <= 0) {
            reject(new Error(`Invalid duration from ffprobe: ${stdout}`));
          } else {
            resolve(duration);
          }
        } catch (e) {
          reject(new Error(`ffprobe parse error: ${e.message}\n${stdout}`));
        }
      },
    );
  });
}

/** Escape path for ffmpeg subtitles filter (Windows drive-letter colon). */
export function escapeFilterPath(filePath) {
  let p = filePath;
  if (process.platform === 'win32') {
    p = p.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '$1\\:');
  }
  return p;
}

export function runFFmpeg(args, options = {}) {
  return new Promise((resolve, reject) => {
    const exe = resolveExe('ffmpeg');
    execFile(exe, args, { timeout: 300000, ...options }, (error, stdout, stderr) => {
      if (error) return reject(new Error(`FFmpeg failed: ${error.message}\n${stderr}`));
      resolve(stdout || stderr);
    });
  });
}
