#!/usr/bin/env node
import path from 'node:path';
import { args } from './lib/browser.mjs';
import { updateProgress, publishArtifact, publishPreview } from './lib/editor-progress.mjs';

const { pos, opt } = args(process.argv.slice(2));
try {
  if (opt.help) console.log(`Stage progress (optional, when the user wants to watch production):
  node editor.mjs <project> --progress
  node progress.mjs <project> --stage scenes --status running --done 2 --total 8 --message "已完成两个镜头"
  node progress.mjs <project> --stage style --preview qa/style.png --message "风格帧"
  node progress.mjs <project> --stage scenes --publish . --size 1920x1080 --fps 30
  node progress.mjs <project> --stage review --publish . --size 1920x1080 --fps 30 --final
Publication can also carry --audio and the same --workers/--subframes/--shutter/--dpr/--grain/--crf settings as editor.mjs.
Publish each checked shot immediately (independent scene directory, no full-film dependency):
  node progress.mjs <project> --stage scenes --shot s01 --total 8 --name "镜头1：种子" --publish shots/s01 --size 1920x1080 --fps 30
--preview also accepts .md/.txt/.json results; --status waiting means awaiting user feedback.
Stages: brief, style, narration, scenes, audio, review. Publishing validates an immutable copy; it does not encode MP4.`);
  else {
    if (pos.length !== 1 || !opt.stage) throw new Error('Supply a project directory and --stage');
    const qualityKeys = ['workers', 'subframes', 'shutter', 'dpr', 'grain', 'crf'];
    const allowed = ['stage', 'status', 'message', 'done', 'total', 'preview', 'publish', 'size', 'fps', 'duration', 'audio', 'final', 'shot', 'name', ...qualityKeys];
    for (const [key, value] of Object.entries(opt)) if (!allowed.includes(key) || (value === true && key !== 'final')) throw new Error(`Invalid --${key}`);
    if (opt.preview && opt.publish) throw new Error('Use --preview for an artifact or --publish for a playable project');
    if (opt.final && !opt.publish) throw new Error('--final requires --publish');
    if (opt.final !== undefined && opt.final !== true) throw new Error('--final is a flag');
    const root = path.resolve(pos[0]), options = { stage: opt.stage, shot: opt.shot, name: opt.name, status: opt.status, message: opt.message, done: opt.done === undefined ? undefined : +opt.done, total: opt.total === undefined ? undefined : +opt.total,
      quality: Object.fromEntries(qualityKeys.filter(k => opt[k] !== undefined).map(k => [k, +opt[k]])), audio: opt.audio,
      size: opt.size, fps: opt.fps === undefined ? 30 : +opt.fps, duration: opt.duration === undefined ? undefined : +opt.duration, final: !!opt.final };
    const state = opt.publish ? await publishPreview(root, opt.publish, options) : opt.preview ? await publishArtifact(root, opt.preview, options) : updateProgress(root, options);
    console.log(`${state.current}: ${state.stages.find(s => s.id === state.current).status}${state.preview ? ` · preview ${state.preview.id}` : ''}`);
  }
} catch (error) { console.error(`progress failed: ${error.message}`); process.exitCode = 1; }
