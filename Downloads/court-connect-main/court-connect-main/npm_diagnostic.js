#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const TIMEOUT = 15000; // 15 seconds in milliseconds
const workDir = process.cwd();

console.log('='.repeat(80));
console.log('NPM DEV SERVER DIAGNOSTIC - 4 SEQUENTIAL ATTEMPTS (15s each)');
console.log('='.repeat(80));
console.log(`Working Directory: ${workDir}\n`);

async function runAttempt(attemptNum, command, args, description) {
  return new Promise((resolve) => {
    console.log('='.repeat(80));
    console.log(`ATTEMPT ${attemptNum}: ${description}`);
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';
    let hasTimedOut = false;
    
    try {
      const proc = spawn(command, args, {
        cwd: workDir,
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      proc.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      // Set timeout
      const timeoutHandle = setTimeout(() => {
        hasTimedOut = true;
        proc.kill('SIGTERM');
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
        }, 2000);
      }, TIMEOUT);
      
      proc.on('close', (code) => {
        clearTimeout(timeoutHandle);
        const elapsed = Date.now() - startTime;
        
        console.log(`\nCOMMAND: ${command} ${args.join(' ')}`);
        console.log(`EXIT CODE: ${code}`);
        console.log(`ELAPSED TIME: ${(elapsed / 1000).toFixed(2)}s`);
        if (hasTimedOut) {
          console.log(`NOTE: Process timeout after 15 seconds (output below is partial)`);
        }
        
        console.log('\n--- STDOUT ---');
        if (stdoutData) {
          console.log(stdoutData);
        } else {
          console.log('(empty)');
        }
        
        console.log('\n--- STDERR ---');
        if (stderrData) {
          console.log(stderrData);
        } else {
          console.log('(empty)');
        }
        
        const fullOutput = stdoutData + stderrData;
        const hasLocalhost = fullOutput.toLowerCase().includes('localhost');
        const hasVite = fullOutput.toLowerCase().includes('vite');
        const has5173 = fullOutput.includes('5173');
        
        console.log(`\nCONTAINS 'localhost': ${hasLocalhost}`);
        console.log(`CONTAINS 'VITE': ${hasVite}`);
        console.log(`CONTAINS '5173': ${has5173}`);
        
        resolve({
          attemptNum,
          description,
          command: `${command} ${args.join(' ')}`,
          exitCode: code,
          stdout: stdoutData,
          stderr: stderrData,
          timedOut: hasTimedOut,
          elapsed: elapsed / 1000,
          hasLocalhost,
          hasVite,
          has5173
        });
      });
      
      proc.on('error', (err) => {
        clearTimeout(timeoutHandle);
        const elapsed = Date.now() - startTime;
        
        console.log(`\nCOMMAND: ${command} ${args.join(' ')}`);
        console.log(`EXIT CODE: -1`);
        console.log(`ELAPSED TIME: ${(elapsed / 1000).toFixed(2)}s`);
        console.log(`ERROR: ${err.message}`);
        
        resolve({
          attemptNum,
          description,
          command: `${command} ${args.join(' ')}`,
          exitCode: -1,
          stdout: '',
          stderr: err.message,
          timedOut: false,
          elapsed: elapsed / 1000,
          hasLocalhost: false,
          hasVite: false,
          has5173: false
        });
      });
    } catch (err) {
      const elapsed = Date.now() - startTime;
      
      console.log(`\nCOMMAND: ${command} ${args.join(' ')}`);
      console.log(`EXIT CODE: -1`);
      console.log(`ELAPSED TIME: ${(elapsed / 1000).toFixed(2)}s`);
      console.log(`ERROR: ${err.message}`);
      
      resolve({
        attemptNum,
        description,
        command: `${command} ${args.join(' ')}`,
        exitCode: -1,
        stdout: '',
        stderr: err.message,
        timedOut: false,
        elapsed: elapsed / 1000,
        hasLocalhost: false,
        hasVite: false,
        has5173: false
      });
    }
  });
}

async function main() {
  const results = [];
  
  // Attempt 1: npm run dev
  const result1 = await runAttempt(1, 'npm', ['run', 'dev'], 'npm run dev');
  results.push(result1);
  console.log('\n');
  
  // Attempt 2: npm.cmd run dev
  const result2 = await runAttempt(2, 'npm.cmd', ['run', 'dev'], 'npm.cmd run dev');
  results.push(result2);
  console.log('\n');
  
  // Attempt 3: cmd /c npm run dev
  const result3 = await runAttempt(3, 'cmd', ['/c', 'npm', 'run', 'dev'], 'cmd /c npm run dev');
  results.push(result3);
  console.log('\n');
  
  // Attempt 4: Detect npm-cli.js and run with node
  console.log('='.repeat(80));
  console.log('ATTEMPT 4: Detecting npm-cli.js and running with node');
  console.log('='.repeat(80));
  
  const appData = process.env.APPDATA || '';
  const npmCliPaths = [
    path.join(appData, 'npm', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join('C:', 'Program Files', 'nodejs', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join('C:', 'Program Files (x86)', 'nodejs', 'node_modules', 'npm', 'bin', 'npm-cli.js')
  ];
  
  let npmCliFound = null;
  for (const npmCliPath of npmCliPaths) {
    console.log(`Checking: ${npmCliPath}`);
    if (fs.existsSync(npmCliPath)) {
      npmCliFound = npmCliPath;
      console.log(`  → FOUND`);
      break;
    } else {
      console.log(`  → Not found`);
    }
  }
  
  let result4;
  if (npmCliFound) {
    console.log('');
    result4 = await runAttempt(4, 'node', [npmCliFound, 'run', 'dev'], `node ${npmCliFound} run dev`);
  } else {
    console.log('\nERROR: npm-cli.js not found in any expected location');
    console.log('Searched paths:');
    npmCliPaths.forEach(p => console.log(`  - ${p}`));
    result4 = {
      attemptNum: 4,
      description: 'npm-cli.js detection',
      command: 'node npm-cli.js run dev',
      exitCode: 1,
      stdout: '',
      stderr: 'npm-cli.js not found',
      timedOut: false,
      elapsed: 0,
      hasLocalhost: false,
      hasVite: false,
      has5173: false
    };
  }
  results.push(result4);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  results.forEach(r => {
    let status = r.timedOut ? 'TIMEOUT' : (r.exitCode === 0 ? 'SUCCESS' : `FAILED(${r.exitCode})`);
    let serverFound = (r.hasVite || r.hasLocalhost || r.has5173) ? ' [FOUND VITE/LOCALHOST/5173]' : '';
    console.log(`Attempt ${r.attemptNum}: ${status}${serverFound}`);
  });
  
  const successful = results.find(r => r.hasVite || r.hasLocalhost || r.has5173);
  if (successful) {
    console.log('\n✓ DEV SERVER STARTED SUCCESSFULLY');
    console.log(`  Successful attempt: ${successful.attemptNum}`);
  } else {
    console.log('\n✗ DEV SERVER DID NOT START');
    console.log('  Check the output above for errors');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
