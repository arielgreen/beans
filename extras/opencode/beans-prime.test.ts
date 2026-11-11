import { afterAll, expect, mock, spyOn, test } from 'bun:test';
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

mock.module('@opencode/plugin', () => ({ Plugin: { define: (plugin: unknown) => plugin } }));
const { default: plugin } = await import('../../.opencode/plugins/beans-prime');
const directory = await mkdtemp(join(tmpdir(), 'beans-prime-'));
const originalPath = process.env.PATH;
afterAll(async () => {
  process.env.PATH = originalPath;
  await rm(directory, { recursive: true });
});

test('injects prime into context and compaction, and skips unavailable projects', async () => {
  const hooks = new Map<string, (event: { system: unknown[] }) => void>();
  const ctx = { location: { directory }, session: { hook: async (name: string, hook: any) => { hooks.set(name, hook); } } };
  const consoleError = spyOn(console, 'error').mockImplementation(() => {});
  process.env.PATH = directory;
  await plugin.setup(ctx);
  expect(hooks.size).toBe(0);

  await writeFile(join(directory, 'beans'), '#!/bin/sh\nexit 0\n');
  await chmod(join(directory, 'beans'), 0o755);
  await plugin.setup(ctx);
  expect(hooks.size).toBe(0);

  await writeFile(join(directory, 'beans'), '#!/bin/sh\nexit 1\n');
  await plugin.setup(ctx);
  expect(hooks.size).toBe(0);
  expect(consoleError).toHaveBeenCalledTimes(1);

  await writeFile(join(directory, 'beans'), '#!/bin/sh\npwd\n');
  const nested = join(directory, 'nested');
  await mkdir(nested);
  ctx.location.directory = nested;
  await plugin.setup(ctx);
  for (const name of ['context', 'compaction']) {
    const event = { system: [] };
    hooks.get(name)!(event);
    expect(event.system).toEqual([{ type: 'text', text: expect.stringMatching(/\/nested\n$/) }]);
  }
  consoleError.mockRestore();
});
