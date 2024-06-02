#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { updateReadme } from './updateReadme.js';
import path from 'path';

interface Arguments {
  config?: string;
}

// CLI 옵션 설정 및 타입 지정
const argv = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to the config file',
  })
  .help()
  .argv as Arguments;

const configPath = argv.config ? path.resolve(process.cwd(), argv.config) : path.resolve(process.cwd(), 'readmeConfig.json');

updateReadme(configPath)
  .then(() => {
    console.log('README.md has been successfully updated');
  })
  .catch((err) => {
    console.error('As error ocurred while updating the README.md filee', err);
  });
