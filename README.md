## 프로젝트 설정 및 스크립트 설명

## example
  - [description](./src/example/description.md)


### 설치환경

- **Node.js 버전: 20.13.1**

### 폴더 구조

```sh
scripts/
├── hooks/
│   ├── pre-commit
│   └── setup-hooks.sh
├── cli-setup-hooks.ts
├── cli-update-readme.ts
├── index.ts
├── updateReadme.test.ts
└── updateReadme.ts
src/
├── example/
│   └── description.md
README.md
readmeConfig.json
templateReadme.md
```

- `scripts/`: 스크립트 파일들을 저장하는 디렉토리입니다.
  - `hooks/`: Git 훅 스크립트 파일들을 저장하는 디렉토리입니다.
    - `pre-commit`: 커밋 전에 실행되는 Git 훅 스크립트입니다.
    - `setup-hooks.sh`: Git 훅을 설정하는 스크립트입니다.
  - `cli-setup-hooks.ts`: Git 훅 설정을 위한 CLI 스크립트입니다.
  - `cli-update-readme.ts`: `README.md` 업데이트를 위한 CLI 스크립트입니다.
  - `index.ts`: 엔트리 포인트 스크립트입니다.
  - `updateReadme.test.ts`: `updateReadme.ts` 스크립트의 테스트 파일입니다.
  - `updateReadme.ts`: `README.md` 파일을 업데이트하는 TypeScript 스크립트입니다.

### 설치 및 초기 설정

#### `package.json` 설치 스크립트

프로젝트의 `package.json` 파일에는 다음과 같은 스크립트가 포함되어 있습니다:

```json
{
  "scripts": {
    "build": "node build.js",
    "test": "node --es-module-specifier-resolution=node dist/index.js --config ./readmeConfig.json",
    "update-readme": "node --no-warnings=ExperimentalWarning --loader ts-node/esm scripts/cli-update-readme.ts",
    "setup-hooks": "sh scripts/setup-hooks.sh"
  }
}
```

- **build**: TypeScript 파일을 컴파일합니다.
- **test**: 컴파일된 파일을 테스트합니다.
- **update-readme**: `README.md` 파일을 업데이트합니다.
- **setup-hooks**: `setup-hooks.sh` 스크립트를 실행하여 Git 훅을 설정합니다.

#### 설치 방법

프로젝트를 처음 설정할 때, 다음 명령을 실행하여 필요한 패키지를 설치합니다:

```sh
yarn install
```

그 후, Git 훅을 설정하기 위해 다음 명령을 실행합니다:

```sh
yarn run setup-hooks
```

#### 추가 설정 파일

프로젝트의 루트 경로에 다음 파일들을 추가해야 합니다:

##### `templateReadme.md`

이 파일은 `README.md` 파일의 템플릿으로 사용됩니다. `{updateReadme}` 플레이스홀더는 `updateReadme.ts` 스크립트를 통해 동적 콘텐츠로 대체됩니다.

```markdown
# Project Title

Some initial project information.

# Table of Contents
{updateReadme}

## Footer

Some footer information.
```

##### `readmeConfig.json`

이 파일은 `updateReadme.ts` 스크립트의 설정을 정의합니다. `baseUrl`은 README 파일 생성을 시작할 기본 경로를 지정하고, `exclude`는 제외할 폴더들을, `order`는 콘텐츠의 폴더 순서를 정의합니다. 또한 `readmePath`와 `templatePath`를 지정할 수 있습니다.

```json
{
  "baseUrl": "./src",
  "exclude": ["scripts"],
  "order": ["troubleshooting", "dev_notes"],
  "readmePath": "./README.md",
  "templatePath": "./templateReadme.md"
}
```

### 각 파일 설명

#### `pre-commit`

이 스크립트는 Git의 `pre-commit` 훅으로, 커밋 전에 실행됩니다. 변경된 파일 중 `.md` 확장자를 가진 파일이 있는지 검사하여, 있으면 `updateReadme` 스크립트를 실행하여 `README.md` 파일을 업데이트합니다.

```sh
#!/bin/sh

echo "Running pre-commit hook..."

repo_root=$(git rev-parse --show-toplevel)

md_files=$(git diff --cached --name-only | grep '\.md$')

if [ -z "$md_files" ]; then
    echo "No .md files detected, skipping update-readme script"
else
    echo ".md files detected:"
    echo "$md_files"
    echo "Running update-readme script..."

    yarn npx update-readme

    if [ $? -eq 0 ]; then
        echo "update-readme script executed successfully"
        readme_path=$(node -e "const config = require('${repo_root}/readmeConfig.json'); console.log(`${repo_root}/${config.readmePath || 'README.md'}`)")
        echo "Updating README.md at $readme_path"
        git add "$readme_path"

        if [ $? -eq 0 ]; then
            echo "$readme_path successfully added to the staging area"
        else
            echo "Failed to add $readme_path to the staging area"
            exit 1
        fi
    else
        echo "update-readme script failed"
        exit 1
    fi
fi
```

#### `setup-hooks.sh`

이 스크립트는 Git 훅을 설정하는 스크립트로, `pre-commit` 훅을 `.git/hooks` 디렉토리에 복사하고 운영 체제에 따라 적절한 실행 권한을 설정합니다.

```sh
#!/bin/sh

# Git 훅 디렉토리가 존재하지 않으면 생성
mkdir -p .git/hooks

# pre-commit 훅을 복사
cp scripts/hooks/pre-commit .git/hooks/pre-commit

# 운영 체제에 따라 권한 설정
OS="$(uname -s)"
case "${OS}" in
    CYGWIN*|MINGW*|MSYS*)
        echo "Detected Windows environment"
        # Git Bash에서 실행 권한을 설정하는 방법 (Windows)
        chmod +x .git/hooks/pre-commit
        ;;
    *)
        echo "Detected Unix-like environment"
        # Unix-like 시스템 (Linux, MacOS 등)에서 실행 권한 설정
        chmod +x .git/hooks/pre-commit
        ;;
esac
```

#### `updateReadme.test.ts`

이 파일은 `updateReadme.ts` 스크립트의 테스트를 위한 파일입니다.

```typescript
import mock from 'mock-fs';
import { promises as fs } from 'fs';
import path from 'path';
import { generateMarkdownEntry, updateReadme } from './updateReadme';

const mockConfig = {
  baseUrl: './src',
  exclude: ['scripts'],
  order: ['troubleshooting', 'dev_notes'],
  readmePath: './README.md',
  templatePath: './templateReadme.md'
};

const mockTemplate = `
# Project Title

Some initial project information.

# Table of Contents
{updateReadme}

## Footer

Some footer information.
`;

describe('updateReadme functions', () => {
  const configFilePath = 'readmeConfig.json';

  beforeEach(() => {
    mock({
      'src/troubleshooting': {
        'example1.md': 'Content of example1',
      },
      'src/dev_notes': {
        'example2.md': 'Content of example2',
      },
      'readmeConfig.json': JSON.stringify(mockConfig),
      'templateReadme.md': mockTemplate,
      'README.md': '',
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should generate markdown entries correctly', async () => {
    const markdown = await generateMarkdownEntry(
      'src',
      '',
      './src',
      1,
      mockConfig.exclude,
      mockConfig.order,
    );
    expect(markdown).toContain('## troubleshooting');
    expect(markdown).toContain('## dev_notes');
    expect(markdown).toContain(
      '- [example1](./src/troubleshooting/example1.md)',
    );
    expect(markdown).toContain('- [example2](./src/dev_notes/example2.md)');
  });

  it('should update README.md correctly', async () => {
    await updateReadme(configFilePath);
    const readmeContent = await fs.readFile(mockConfig.readmePath, 'utf-8');
    expect(readmeContent).toContain('# Project Title');
    expect(readmeContent).toContain('## troubleshooting');
    expect(readmeContent).toContain(
      '- [example1](./src/troubleshooting/example1.md)',
    );
    expect(readmeContent).toContain('## dev_notes');
    expect(readmeContent).toContain(
      '- [example2](./src/dev_notes/example2.md)',
    );
    expect(readmeContent).toContain('## Footer');
  });
});
```

#### `updateReadme.ts`

이 파일은 `README.md` 디렉토리 구조를 탐색하고, 특정 조건에 따라 `README.md` 파일을 갱신합니다.

```typescript
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// ES 모듈에서 __dirname 및 __filename 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI 옵션 설정
const argv = yargs(h

ideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to the config file',
  })
  .help()
  .argv as { config?: string };

// 설정 파일 경로 결정
const configPath = argv.config || path.resolve('./readmeConfig.json');

async function loadConfig(configPath: string) {
  const configContent = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configContent);
}

export async function generateMarkdownEntry(
  dirPath: string,
  basePath: string = '',
  srcBasePath: string = '',
  level: number = 1,
  exclude: string[] = [],
  order: string[] = [],
): Promise<string> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const sortedFolders = [...folders].sort((a, b) => {
    const orderA = order.indexOf(a);
    const orderB = order.indexOf(b);
    if (orderA === -1 && orderB === -1) return a.localeCompare(b);
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;
    return orderA - orderB;
  });

  let markdown = '';

  for (const folder of sortedFolders) {
    if (exclude.includes(folder)) {
      continue;
    }
    const filePath = path.join(dirPath, folder);
    const nestedMarkdown = await generateMarkdownEntry(
      filePath,
      path.join(basePath, folder),
      srcBasePath,
      level + 1,
      exclude,
      order,
    );
    if (nestedMarkdown) {
      if (level === 1) {
        markdown += `## ${folder}\n${nestedMarkdown}`;
      } else if (level === 2) {
        markdown += `### ${folder}\n${nestedMarkdown}`;
      } else {
        markdown += `\n#### ${folder}\n${nestedMarkdown}`;
      }
    }
  }

  for (const file of files) {
    const relativePath = path
      .join(srcBasePath, basePath, file)
      .replace(/\\/g, '/')
      .replace(/ /g, '%20');
    const markdownLink = `[${file.replace('.md', '')}](./${relativePath})`;
    markdown += `  - ${markdownLink}\n`;
  }

  return markdown;
}

export async function updateReadme(configPath: string) {
  const config = await loadConfig(configPath);
  const { baseUrl, exclude, order, readmePath: configReadmePath, templatePath: configTemplatePath } = config;

  const rootDir = path.resolve(); // 현재 작업 디렉토리
  const srcDir = path.join(rootDir, baseUrl);

  const readmePath = configReadmePath ? path.resolve(rootDir, configReadmePath) : path.join(rootDir, 'README.md');
  const templatePath = configTemplatePath ? path.resolve(rootDir, configTemplatePath) : path.join(rootDir, 'templateReadme.md');

  const markdownContent = await generateMarkdownEntry(
    srcDir,
    '',
    baseUrl,
    1,
    exclude,
    order,
  );

  const templateContent = await fs.readFile(templatePath, 'utf-8');

  const readmeContent = templateContent.replace(
    '{updateReadme}',
    markdownContent,
  );

  await fs.writeFile(readmePath, readmeContent);
}

// 설정 파일 경로를 인자로 전달하여 updateReadme 호출
updateReadme(configPath).catch(console.error);
```

## CLI 스크립트

### `cli-update-readme.ts`

이 파일은 `README.md` 업데이트를 위한 CLI 스크립트입니다.

```typescript
#!/usr/bin/env node

import { updateReadme } from './updateReadme.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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
const configPath = argv.config || './readmeConfig.json';

// updateReadme 함수 호출
updateReadme(configPath).catch(console.error);
```

### `cli-setup-hooks.ts`

이 파일은 Git 훅 설정을 위한 CLI 스크립트입니다.

```typescript
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
const sourceHookPath = path.resolve(__dirname, '../hooks/pre-commit');

function setupHooks() {
  let hookContent = '';

  // 기존 훅이 있는 경우, 그 내용을 가져오고 백업
  if (fs.existsSync(preCommitHookPath)) {
    hookContent = fs.readFileSync(preCommitHookPath, 'utf8');
    fs.writeFileSync(`${preCommitHookPath}.bak`, hookContent);
    console.log('Existing pre-commit hook backed up.');
  }

  // 새 훅 내용을 추가
  const customHookContent = fs.readFileSync(sourceHookPath, 'utf8');
  hookContent += `\n\n${customHookContent}`;

  // 변경된 훅 저장
  fs.writeFileSync(preCommitHookPath, hookContent);
  execSync(`chmod +x "${preCommitHookPath}"`);

  console.log('Custom pre-commit hook added.');
}

rl.question('The .git/hooks directory is required for setup. Create it if not exist? [y/n]: ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    setupHooks();
  } else {
    console.log('Setup canceled by user.');
  }
  rl.close();
});
```

### bin 설정

`package.json`에 다음과 같이 `bin` 설정을 추가합니다.

```json
"bin": {
  "update-readme": "dist/cli-update-readme.js",
  "setup-hooks": "dist/cli-setup-hooks.js"
}
```
