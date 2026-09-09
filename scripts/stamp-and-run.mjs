import { spawnSync } from 'node:child_process';
import path from 'node:path';

const STAMP_MESSAGE_FLAG = '--stamp-message';

const kind = process.argv[2];
if (kind !== 'build' && kind !== 'update') {
  console.error(
    `Usage: node ./scripts/stamp-and-run.mjs <build|update> eas ... ${STAMP_MESSAGE_FLAG} [message]`,
  );
  process.exit(1);
}

const args = process.argv.slice(3);
const stampMessageIndex = args.indexOf(STAMP_MESSAGE_FLAG);
const easArgs = stampMessageIndex >= 0 ? args.slice(0, stampMessageIndex) : args;
const label =
  stampMessageIndex >= 0 ? args.slice(stampMessageIndex + 1).join(' ').trim() || null : null;

if (easArgs[0] !== 'eas') {
  console.error('Expected an eas command after the stamp kind.');
  process.exit(1);
}

const stampScript = path.join(process.cwd(), 'scripts/stamp-build-info.mjs');
const stampArgs = [stampScript, kind, ...(label ? [label] : [])];
const stampResult = spawnSync(process.execPath, stampArgs, { stdio: 'inherit' });
if (stampResult.status !== 0) {
  process.exit(stampResult.status ?? 1);
}

const finalEasArgs = [...easArgs];
if (kind === 'update' && label) {
  finalEasArgs.push('--message', label);
}

const quoteWindowsArg = (value) =>
  /[\s"&|<>^]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
const easResult = process.platform === 'win32'
  ? spawnSync(finalEasArgs.map(quoteWindowsArg).join(' '), {
      stdio: 'inherit',
      // Global npm CLIs are .cmd shims on Windows and need the command shell.
      shell: true,
    })
  : spawnSync(finalEasArgs[0], finalEasArgs.slice(1), { stdio: 'inherit' });
if (easResult.error) {
  console.error(`Could not start EAS CLI: ${easResult.error.message}`);
}
process.exit(easResult.status ?? 1);
