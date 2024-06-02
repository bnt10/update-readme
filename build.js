import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryDir = path.join(__dirname, 'scripts');
const outDir = path.join(__dirname, 'dist');

async function getAllFiles(dir, ext, files = []) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      await getAllFiles(res, ext, files);
    } else {
      if (res.endsWith(ext) && !res.endsWith('.test.ts')) { 
        files.push(res);
      }
    }
  }
  return files;
}

async function copyHooks() {
  const hooksSourceDir = path.join(__dirname, 'scripts/hooks');
  const hooksDistDir = path.join(__dirname, 'dist/hooks');
  await fs.mkdir(hooksDistDir, { recursive: true });
  const hookFiles = await fs.readdir(hooksSourceDir);
  for (const file of hookFiles) {
      await fs.copyFile(path.join(hooksSourceDir, file), path.join(hooksDistDir, file));
  }
}


(async () => {
  try {
    console.log('start build');
    const files = await getAllFiles(entryDir, '.ts');
    const entryFiles = files.join(' ');
    const command = `npx swc ${entryFiles} -d ${outDir} --config-file .swcrc`;

    console.log(`Command: ${command}`);

    exec(command, async (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);

      await copyHooks();
     
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
})();
