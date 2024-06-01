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
    expect(markdown).toContain('- [example1](./src/troubleshooting/example1.md)');
    expect(markdown).toContain('- [example2](./src/dev_notes/example2.md)');
  });

  it('should update README.md correctly', async () => {
    await updateReadme(configFilePath);
    const readmeContent = await fs.readFile(mockConfig.readmePath, 'utf-8');
    expect(readmeContent).toContain('# Project Title');
    expect(readmeContent).toContain('## troubleshooting');
    expect(readmeContent).toContain('- [example1](./src/troubleshooting/example1.md)');
    expect(readmeContent).toContain('## dev_notes');
    expect(readmeContent).toContain('- [example2](./src/dev_notes/example2.md)');
    expect(readmeContent).toContain('## Footer');
  });
});
