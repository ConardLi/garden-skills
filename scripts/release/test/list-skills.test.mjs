import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'garden-release-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const release = path.join(root, 'scripts/release');
  mkdirSync(release, { recursive: true });
  cpSync(path.join(scripts, 'lib'), path.join(release, 'lib'), { recursive: true });
  cpSync(path.join(scripts, 'list-skills.mjs'), path.join(release, 'list-skills.mjs'));
  mkdirSync(path.join(root, 'skills'));
  return {
    root,
    skill(name = 'example-skill', { manifest = true, skill = true, compat = ['codex-cli'] } = {}) {
      const dir = path.join(root, 'skills', name);
      mkdirSync(dir);
      if (manifest) writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
        name, version: '1.0.0', category: 'Testing', description: 'A fixture used to verify release validation.', compat,
      }));
      if (skill) writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: A fixture used to verify release validation.\n---\n`);
    },
    run(...args) {
      return spawnSync(process.execPath, ['scripts/release/list-skills.mjs', ...args], { cwd: root, encoding: 'utf8' });
    },
  };
}

for (const args of [[], ['--json']]) {
  test(`missing manifests fail discovery (${args.length ? 'JSON' : 'text'})`, t => {
    const f = fixture(t);
    f.skill('valid-skill');
    f.skill('forgotten-skill', { manifest: false });
    const result = f.run(...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /forgotten-skill: missing required file manifest\.json/);
  });
}

test('JSON output retains invalid manifest diagnostics and fails', t => {
  const f = fixture(t);
  f.skill('invalid-skill', { compat: ['unknown-agent'] });
  const result = f.run('--json');
  assert.equal(result.status, 1);
  const [row] = JSON.parse(result.stdout);
  assert.equal(row.ok, false);
  assert.match(row.errors.join('\n'), /unknown agent/);
});

test('JSON output retains missing SKILL.md diagnostics and fails', t => {
  const f = fixture(t);
  f.skill('invalid-skill', { skill: false });
  const result = f.run('--json');
  assert.equal(result.status, 1);
  assert.match(JSON.parse(result.stdout)[0].errors.join('\n'), /missing required file SKILL\.md/);
});

test('valid skills still succeed in both output modes', t => {
  const f = fixture(t);
  f.skill();
  const text = f.run();
  assert.equal(text.status, 0);
  assert.match(text.stdout, /OK/);
  const json = f.run('--json');
  assert.equal(json.status, 0);
  assert.equal(JSON.parse(json.stdout)[0].ok, true);
});

test('hidden directories and ordinary files remain excluded', t => {
  const f = fixture(t);
  f.skill();
  mkdirSync(path.join(f.root, 'skills/.cache'));
  writeFileSync(path.join(f.root, 'skills/README.md'), 'Collection notes');
  const result = f.run('--json');
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout).map(row => row.name), ['example-skill']);
});

test('empty collections remain valid', t => {
  const f = fixture(t);
  const result = f.run('--json');
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout), []);
});
