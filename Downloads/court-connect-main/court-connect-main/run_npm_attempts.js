#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const workDir = 'C:\\Users\\Dell\\Downloads\\court-connect-main\\court-connect-main';
const TIMEOUT_MS = 15000; // 15 seconds

console.log('');
console.log('============================================================');
console.log('TESTING NPM RUN DEV WITH FALLBACKS (15-SECOND TIMEOUT EACH)');
console.log('============================================================');
console.log('');
console.log(`Current Directory: ${workDir}`);
console.log('');

async function runAttempt(attemptNum, cmd, desc) {
  return new Promise((resolve) => {
    console.log('');
    console.log(`[ATTEMPT ${attemptNum}] Running: ${desc}`);
    console.log('============================================================');
    console.log('');

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Split command into parts
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    const proc = spawn(command, args, {
      cwd: workDir,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Collect output
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill();
    }, TIMEOUT_MS);

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      
      console.log('');
      if (timedOut) {
        console.log(`Exit Code: 124 (Timeout - process killed after ${TIMEOUT_MS}ms)`);
      } else {
        console.log(`Exit Code: ${code || 0}`);
      }
      console.log(`Elapsed Time: ${elapsedTime}ms`);
      console.log(`=== END ATTEMPT ${attemptNum} ===`);
      console.log('');
      
      resolve({
        attemptNum,
        command: desc,
        stdout,
        stderr,
        exitCode: code || 0,
        timedOut,
        elapsedTime
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      console.log(`Error: ${err.message}`);
      console.log('');
      console.log(`=== END ATTEMPT ${attemptNum} ===`);
      console.log('');
      
      resolve({
        attemptNum,
        command: desc,
        stdout,
        stderr,
        exitCode: 1,
        error: err.message,
        timedOut: false
      });
    });
  });
}

async function detectNpmCli() {
  const paths = [
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js',
    'C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'
  ];

  for (const npmPath of paths) {
    if (fs.existsSync(npmPath)) {
      return npmPath;
    }
  }
  
  return null;
}

async function main() {
  try {
    // Attempt 1: npm run dev
    const result1 = await runAttempt(1, 'npm run dev', 'npm run dev');

    // Attempt 2: npm.cmd run dev
    const result2 = await runAttempt(2, 'npm.cmd run dev', 'npm.cmd run dev');

    // Attempt 3: cmd /c npm run dev
    const result3 = await runAttempt(3, 'cmd /c npm run dev', 'cmd /c npm run dev');

    // Attempt 4: node npm-cli.js
    console.log('[ATTEMPT 4] Detecting npm-cli.js and running with node');
    console.log('============================================================');
    console.log('');

    const npmCliPath = await detectNpmCli();
    let result4;

    if (npmCliPath) {
      console.log(`Found npm-cli.js at: ${npmCliPath}`);
      result4 = await runAttempt(4, `node "${npmCliPath}" run dev`, `node "${npmCliPath}" run dev`);
    } else {
      console.log('npm-cli.js not found in expected locations:');
      console.log(`  - ${process.env.APPDATA || 'N/A'}\\npm\\node_modules\\npm\\bin\\npm-cli.js`);
      console.log('  - C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js');
      console.log('  - C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js');
      console.log('Exit Code: 1');
      console.log('=== END ATTEMPT 4 ===');
      console.log('');
      result4 = {
        attemptNum: 4,
        command: 'npm-cli.js not found',
        exitCode: 1
      };
    }

    // Summary
    console.log('');
    console.log('============================================================');
    console.log('SUMMARY');
    console.log('============================================================');
    const results = [result1, result2, result3, result4];
    results.forEach(r => {
      const status = r.timedOut ? 'TIMEOUT' : (r.exitCode === 0 ? 'SUCCESS' : 'FAILED');
      const lookingFor = r.stdout.includes('VITE') || r.stdout.includes('localhost') ? ' [FOUND VITE/LOCALHOST]' : '';
      console.log(`Attempt ${r.attemptNum}: ${status} (Code: ${r.exitCode})${lookingFor}`);
    });

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
