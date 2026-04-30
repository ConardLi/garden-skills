#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';

const checks = [];

function run(cmd, args = []) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d.toString()));
    p.stderr.on('data', (d) => (stderr += d.toString()));
    p.on('error', (error) => resolve({ ok: false, code: 127, error: error.message, stdout, stderr }));
    p.on('close', (code) => resolve({ ok: code === 0, code: code ?? 1, stdout, stderr }));
  });
}

async function checkCommand(name) {
  const which = await run('which', [name]);
  if (!which.ok) {
    checks.push({ name: `command:${name}`, ok: false, code: 'E_TOOL_NOT_FOUND', detail: `${name} not found in PATH` });
    return;
  }

  const version = await run(name, ['--version']);
  checks.push({
    name: `command:${name}`,
    ok: version.ok,
    code: version.ok ? 'OK' : 'E_TOOL_VERSION_FAILED',
    detail: version.ok ? `${which.stdout.trim()} :: ${version.stdout.trim() || version.stderr.trim()}` : version.stderr.trim(),
  });
}

async function checkWritableDir(dir) {
  try {
    await access(dir, constants.W_OK);
    checks.push({ name: `writable:${dir}`, ok: true, code: 'OK', detail: 'directory writable' });
  } catch (error) {
    checks.push({ name: `writable:${dir}`, ok: false, code: 'E_OUTPUT_NOT_WRITABLE', detail: error.message });
  }
}

async function checkPathExists(pathValue, label) {
  try {
    await access(pathValue, constants.F_OK);
    checks.push({ name: `exists:${label}`, ok: true, code: 'OK', detail: `${pathValue}` });
  } catch (error) {
    checks.push({ name: `exists:${label}`, ok: false, code: 'E_AUTH_MISSING', detail: error.message });
  }
}

async function main() {
  const outputRoot = process.env.OUTPUT_ROOT ?? 'public/case';
  const authPath = process.env.CHATGPT_AUTH_PATH;

  await checkCommand('opencli');
  await checkCommand('playwright');
  await checkWritableDir(outputRoot);

  if (authPath) {
    await checkPathExists(authPath, 'chatgpt-auth');
  } else {
    checks.push({
      name: 'exists:chatgpt-auth',
      ok: false,
      code: 'E_AUTH_MISSING',
      detail: 'CHATGPT_AUTH_PATH not provided (set this env var if your workflow requires persisted login state).',
    });
  }

  console.log('=== automation doctor report ===');
  for (const c of checks) {
    console.log(`${c.ok ? '✅' : '❌'} ${c.name} [${c.code}] - ${c.detail}`);
  }

  const hasFailure = checks.some((c) => !c.ok && c.code !== 'E_AUTH_MISSING');
  process.exit(hasFailure ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ doctor failed', error);
  process.exit(1);
});
