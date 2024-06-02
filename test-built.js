const { exec } = require('child_process');

exec('node dist/index.js --config ./readmeConfig.json', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing built file: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  console.log(`stdout: ${stdout}`);
});
