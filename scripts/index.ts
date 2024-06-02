import path from 'path';
import { fileURLToPath } from 'url';
import { updateReadme } from './updateReadme.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// ES 모듈에서 __dirname 및 __filename 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI 옵션 설정
const argv = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to the config file',
  })
  .help()
  .argv as { config?: string };

// 설정 파일 경로 결정
const configPath = argv.config || path.resolve(process.cwd(), 'readmeConfig.json');

// updateReadme 함수 호출
updateReadme(configPath).catch(console.error);
