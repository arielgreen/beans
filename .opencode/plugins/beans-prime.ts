import { Plugin } from '@opencode/plugin';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export default Plugin.define({
  id: 'beans-prime',
  async setup(ctx) {
    let prime: string;
    try {
      ({ stdout: prime } = await promisify(execFile)('beans', ['prime'], { cwd: ctx.location.directory, timeout: 10_000 }));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('beans-prime: `beans prime` failed', error);
      return;
    }

    if (!prime) return;
    await ctx.session.hook('context', (event) => {
      event.system.push({ type: 'text', text: prime });
    });
    await ctx.session.hook('compaction', (event) => {
      event.system.push({ type: 'text', text: prime });
    });
  },
});
