#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hooksDir = path.join(process.cwd(), '.git/hooks');
const preCommitHookPath = path.join(hooksDir, 'pre-commit');
const sourceHookPath = path.resolve(__dirname, './hooks/pre-commit');

function setupHooks() {
    if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  fs.copyFileSync(sourceHookPath, preCommitHookPath);

  if (process.platform === 'win32') {
    execSync(`icacls "${preCommitHookPath}" /grant Everyone:F`);
  } else {
    execSync(`chmod +x "${preCommitHookPath}"`);
  }

  console.log('Git pre-commit hook successfully set up.');
}

rl.question('The .git/hooks directory is required for setup. Create it if not exist? [y/n]: ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    setupHooks();
  } else {
    console.log('Setup canceled by user.');
  }
  rl.close();
});
