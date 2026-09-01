import fs from 'node:fs';
import path from 'node:path';

const kind = process.argv[2];
if (kind !== 'build' && kind !== 'update') {
  console.error('Usage: node ./scripts/stamp-build-info.mjs <build|update> [message]');
  process.exit(1);
}

const label = process.argv.slice(3).join(' ').trim() || null;
const stampedAt = new Date().toISOString();
const payload = { kind, stampedAt, label };

const target = path.join(process.cwd(), 'src/constants/buildInfo.json');
fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Stamped ${kind} at ${stampedAt}${label ? ` (${label})` : ''}`);
