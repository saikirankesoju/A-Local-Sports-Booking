#!/usr/bin/env python3

import subprocess
import os
import sys
from pathlib import Path
import time

work_dir = r'C:\Users\Dell\Downloads\court-connect-main\court-connect-main'
timeout_sec = 15

print('')
print('=' * 60)
print('TESTING NPM RUN DEV WITH FALLBACKS (15-SECOND TIMEOUT EACH)')
print('=' * 60)
print('')
print(f'Current Directory: {work_dir}')
print('')

def run_attempt(attempt_num, cmd, desc):
    """Run a command with 15-second timeout and capture output"""
    print('')
    print(f'[ATTEMPT {attempt_num}] Running: {desc}')
    print('=' * 60)
    print('')
    
    start_time = time.time()
    stdout_text = ''
    stderr_text = ''
    exit_code = None
    timed_out = False
    
    try:
        # Run the command
        result = subprocess.run(
            cmd,
            cwd=work_dir,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout_sec
        )
        exit_code = result.returncode
        stdout_text = result.stdout
        stderr_text = result.stderr
        
    except subprocess.TimeoutExpired as e:
        timed_out = True
        exit_code = 124
        stdout_text = e.stdout if e.stdout else ''
        stderr_text = e.stderr if e.stderr else ''
    except Exception as e:
        exit_code = 1
        stderr_text = str(e)
    
    elapsed_time = time.time() - start_time
    
    # Print captured output
    if stdout_text:
        print('=== STDOUT ===')
        print(stdout_text)
    if stderr_text:
        print('=== STDERR ===')
        print(stderr_text)
    
    print('')
    if timed_out:
        print(f'Exit Code: 124 (Timeout - process still running after {timeout_sec}s)')
    else:
        print(f'Exit Code: {exit_code}')
    print(f'Elapsed Time: {elapsed_time:.2f}s')
    print(f'=== END ATTEMPT {attempt_num} ===')
    print('')
    
    return {
        'attempt': attempt_num,
        'command': desc,
        'stdout': stdout_text,
        'stderr': stderr_text,
        'exit_code': exit_code,
        'timed_out': timed_out,
        'elapsed_time': elapsed_time,
        'success': 'localhost' in stdout_text or 'VITE' in stdout_text
    }

def detect_npm_cli():
    """Detect npm-cli.js path"""
    paths = [
        Path(os.environ.get('APPDATA', '')) / 'npm' / 'node_modules' / 'npm' / 'bin' / 'npm-cli.js',
        Path(r'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js'),
        Path(r'C:\Program Files (x86)\nodejs\node_modules\npm\bin\npm-cli.js'),
    ]
    
    for path in paths:
        if path.exists():
            return str(path)
    
    return None

def main():
    results = []
    
    # Attempt 1: npm run dev
    results.append(run_attempt(1, 'npm run dev', 'npm run dev'))
    
    # Attempt 2: npm.cmd run dev
    results.append(run_attempt(2, 'npm.cmd run dev', 'npm.cmd run dev'))
    
    # Attempt 3: cmd /c npm run dev
    results.append(run_attempt(3, 'cmd /c npm run dev', 'cmd /c npm run dev'))
    
    # Attempt 4: node npm-cli.js
    print('[ATTEMPT 4] Detecting npm-cli.js and running with node')
    print('=' * 60)
    print('')
    
    npm_cli_path = detect_npm_cli()
    
    if npm_cli_path:
        print(f'Found npm-cli.js at: {npm_cli_path}')
        results.append(run_attempt(4, f'node "{npm_cli_path}" run dev', f'node "{npm_cli_path}" run dev'))
    else:
        print('npm-cli.js not found in expected locations:')
        appdata = os.environ.get('APPDATA', 'N/A')
        print(f'  - {appdata}\\npm\\node_modules\\npm\\bin\\npm-cli.js')
        print('  - C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
        print('  - C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
        print('Exit Code: 1')
        print('=== END ATTEMPT 4 ===')
        print('')
        results.append({
            'attempt': 4,
            'command': 'npm-cli.js not found',
            'exit_code': 1,
            'success': False
        })
    
    # Summary
    print('')
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    for r in results:
        status = 'TIMEOUT' if r.get('timed_out') else ('SUCCESS' if r['exit_code'] == 0 else f'FAILED({r["exit_code"]})')
        server_found = ' [FOUND VITE/LOCALHOST]' if r.get('success') else ''
        print(f'Attempt {r["attempt"]}: {status}{server_found}')
    
    # Check if any succeeded
    successful = [r for r in results if r.get('success')]
    if successful:
        print('')
        print('✓ DEV SERVER STARTED SUCCESSFULLY')
        print(f'  Successful attempt: {successful[0]["attempt"]}')
    else:
        failed_attempts = [r for r in results if r['exit_code'] != 0 or r.get('timed_out')]
        if failed_attempts:
            print('')
            print('✗ DEV SERVER DID NOT START')
            print('  Check the output above for errors')

if __name__ == '__main__':
    main()
