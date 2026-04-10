#!/usr/bin/env python3

import subprocess
import os
import sys
import time
from pathlib import Path

work_dir = r'C:\Users\Dell\Downloads\court-connect-main\court-connect-main'
timeout_sec = 15
output_file = os.path.join(work_dir, 'ATTEMPT_RESULTS.txt')

# Change to the working directory
os.chdir(work_dir)

output_lines = []

def log(msg):
    output_lines.append(msg)
    print(msg)

log('=' * 80)
log('EXECUTING 4 SEQUENTIAL NPM RUN DEV ATTEMPTS (15 SECONDS EACH)')
log('=' * 80)
log('')

def run_attempt(attempt_num, cmd, desc):
    """Run a command with 15-second timeout and capture output"""
    log('')
    log(f'[ATTEMPT {attempt_num}] {desc}')
    log('-' * 80)
    
    stdout_text = ''
    stderr_text = ''
    exit_code = None
    
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=work_dir,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        try:
            stdout_text, stderr_text = proc.communicate(timeout=timeout_sec)
            exit_code = proc.returncode
        except subprocess.TimeoutExpired:
            proc.kill()
            stdout_text, stderr_text = proc.communicate()
            exit_code = proc.returncode
    
    except Exception as e:
        exit_code = 1
        stderr_text = str(e)
    
    combined = (stdout_text + stderr_text).upper()
    has_marker = any(x in combined for x in ['LOCALHOST', 'VITE', '5173'])
    
    log(f'EXIT CODE: {exit_code}')
    log(f'CONTAINS MARKER (localhost/VITE/5173): {has_marker}')
    log('')
    log('=== STDOUT ===')
    log(stdout_text if stdout_text else '[EMPTY]')
    log('')
    log('=== STDERR ===')
    log(stderr_text if stderr_text else '[EMPTY]')
    log('-' * 80)
    
    return {
        'attempt': attempt_num,
        'cmd': cmd,
        'exit_code': exit_code,
        'has_marker': has_marker,
        'stdout': stdout_text,
        'stderr': stderr_text
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

results = []

# Attempt 1
results.append(run_attempt(1, 'npm run dev', 'npm run dev'))

# Attempt 2
results.append(run_attempt(2, 'npm.cmd run dev', 'npm.cmd run dev'))

# Attempt 3
results.append(run_attempt(3, 'cmd /c npm run dev', 'cmd /c npm run dev'))

# Attempt 4
log('')
log(f'[ATTEMPT 4] Detecting npm-cli.js and running with node')
log('-' * 80)

npm_cli_path = detect_npm_cli()

if npm_cli_path:
    log(f'Found npm-cli.js at: {npm_cli_path}')
    log('')
    results.append(run_attempt(4, f'node "{npm_cli_path}" run dev', f'node "{npm_cli_path}" run dev'))
else:
    log('npm-cli.js NOT FOUND in expected locations:')
    appdata = os.environ.get('APPDATA', 'N/A')
    log(f'  - {appdata}\\npm\\node_modules\\npm\\bin\\npm-cli.js')
    log('  - C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
    log('  - C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
    log(f'EXIT CODE: 127')
    log('CONTAINS MARKER (localhost/VITE/5173): False')
    log('=== STDOUT ===')
    log('[EMPTY]')
    log('=== STDERR ===')
    log('[FILE NOT FOUND]')
    log('-' * 80)
    results.append({
        'attempt': 4,
        'cmd': 'node <npm-cli-path> run dev',
        'exit_code': 127,
        'has_marker': False,
        'stdout': '',
        'stderr': 'npm-cli.js not found'
    })

log('')
log('=' * 80)
log('SUMMARY')
log('=' * 80)
for r in results:
    marker_status = '[✓ MARKER FOUND]' if r['has_marker'] else '[✗ NO MARKER]'
    log(f'Attempt {r["attempt"]}: exit_code={r["exit_code"]} {marker_status}')

# Write to file
with open(output_file, 'w') as f:
    f.write('\n'.join(output_lines))

print(f'\n\nOutput written to: {output_file}')
sys.exit(0)
