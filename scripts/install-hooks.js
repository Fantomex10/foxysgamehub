import process from 'node:process';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = dirname(__dirname);
const gitDir = join(projectRoot, '.git');
const hooksSourceDir = join(__dirname, 'git-hooks');
const hooksTargetDir = join(gitDir, 'hooks');

const log = (message) => {
  process.stdout.write(`${message}\n`);
};

if (!existsSync(gitDir) || !statSync(gitDir).isDirectory()) {
  log('No .git directory detected. Skipping hook installation.');
  process.exit(0);
}

if (!existsSync(hooksTargetDir)) {
  mkdirSync(hooksTargetDir, { recursive: true });
}

const entries = existsSync(hooksSourceDir) ? readdirSync(hooksSourceDir) : [];

if (entries.length === 0) {
  log('No hook scripts found to install.');
  process.exit(0);
}

entries.forEach((entry) => {
  const sourcePath = join(hooksSourceDir, entry);
  const stats = statSync(sourcePath);
  if (!stats.isFile()) {
    return;
  }

  const targetPath = join(hooksTargetDir, basename(entry));
  const contents = readFileSync(sourcePath);
  writeFileSync(targetPath, contents, { mode: 0o755 });
  chmodSync(targetPath, 0o755);
  log(`Installed ${basename(entry)} hook.`);
});

log('Git hooks installed. Use SKIP_HOOKS=1 to bypass locally if needed.');
