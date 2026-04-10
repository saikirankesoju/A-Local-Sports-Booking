#!/usr/bin/env python3
"""
NPM RUN DEV - 4 Sequential Attempts with Detailed Output Capture

Tests these methods with 15-second capture window each:
1) npm run dev
2) npm.cmd run dev  
3) cmd /c npm run dev
4) node <npm-cli.js-path> run dev

Each attempt captures:
- Full stdout and stderr (verbatim)
- Exit code
- Presence of "localhost" (case-insensitive)
- Presence of "VITE" (case-insensitive)
- Presence of "5173"
- Elapsed time
"""

import subprocess
import os
import sys
import time
from pathlib import Path
from datetime import datetime

WORK_DIR = r'C:\Users\Dell\Downloads\court-connect-main\court-connect-main'
TIMEOUT_SEC = 15

def print_separator(title=""):
    """Print a separator line"""
    if title:
        print(f"\n{'=' * 60}")
        print(f"{title}")
        print('=' * 60)
    else:
        print('=' * 60)

def run_attempt(attempt_num, cmd, desc):
    """
    Run a command with 15-second timeout and capture complete output
    
    Returns: dict with results
    """
    print(f"\n[ATTEMPT {attempt_num}] {desc}")
    print_separator()
    print(f"\nCommand: {cmd}\n")
    
    start_time = time.time()
    stdout_text = ''
    stderr_text = ''
    exit_code = None
    timed_out = False
    
    try:
        # Run the command with timeout
        result = subprocess.run(
            cmd,
            cwd=WORK_DIR,
            shell=True,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SEC
        )
        exit_code = result.returncode
        stdout_text = result.stdout
        stderr_text = result.stderr
        
    except subprocess.TimeoutExpired as e:
        # Timeout - process ran longer than limit
        timed_out = True
        exit_code = 124  # Standard timeout exit code
        stdout_text = e.stdout if e.stdout else ''
        stderr_text = e.stderr if e.stderr else ''
        
    except Exception as e:
        # Other error
        exit_code = 1
        stderr_text = str(e)
    
    elapsed_time = time.time() - start_time
    
    # Print captured output
    if stdout_text or stderr_text:
        print("--- OUTPUT START ---")
        if stdout_text:
            print("=== STDOUT ===")
            print(stdout_text)
        if stderr_text:
            print("=== STDERR ===")
            print(stderr_text)
        print("--- OUTPUT END ---")
    else:
        print("[No output captured]")
    
    print()
    
    # Print status
    if timed_out:
        print(f"Exit Code: 124 (TIMEOUT - process still running after {TIMEOUT_SEC}s)")
    else:
        print(f"Exit Code: {exit_code}")
    print(f"Elapsed Time: {elapsed_time:.2f}s")
    
    # Check for key indicators (case-insensitive)
    combined_output = (stdout_text + stderr_text).lower()
    has_localhost = 'localhost' in combined_output
    has_vite = 'vite' in combined_output
    has_5173 = '5173' in (stdout_text + stderr_text)
    
    # Print findings
    print("\nFindings:")
    if has_localhost:
        print("  ✓ Contains 'localhost'")
    else:
        print("  ✗ Does NOT contain 'localhost'")
    
    if has_vite:
        print("  ✓ Contains 'VITE'")
    else:
        print("  ✗ Does NOT contain 'VITE'")
    
    if has_5173:
        print("  ✓ Contains '5173'")
    else:
        print("  ✗ Does NOT contain '5173'")
    
    print(f"\n=== END ATTEMPT {attempt_num} ===\n")
    
    return {
        'attempt': attempt_num,
        'command': desc,
        'cmd_text': cmd,
        'stdout': stdout_text,
        'stderr': stderr_text,
        'exit_code': exit_code,
        'timed_out': timed_out,
        'elapsed_time': elapsed_time,
        'has_localhost': has_localhost,
        'has_vite': has_vite,
        'has_5173': has_5173
    }

def detect_npm_cli():
    """
    Detect npm-cli.js in standard locations
    
    Checks:
    1. %APPDATA%\\npm\\node_modules\\npm\\bin\\npm-cli.js
    2. C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js
    3. C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js
    """
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
    """Main test execution"""
    
    print_separator("NPM RUN DEV - 4 SEQUENTIAL ATTEMPTS WITH DETAILED OUTPUT")
    print(f"\nCurrent Directory: {WORK_DIR}")
    print(f"Timeout per attempt: {TIMEOUT_SEC} seconds")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("Expected indicators of successful startup:")
    print("  - Output contains 'localhost'")
    print("  - Output contains 'VITE'")
    print("  - Output contains '5173' (default Vite port)")
    
    results = []
    
    # ========================================
    # ATTEMPT 1: npm run dev
    # ========================================
    results.append(run_attempt(1, 'npm run dev', 'npm run dev'))
    
    # ========================================
    # ATTEMPT 2: npm.cmd run dev
    # ========================================
    results.append(run_attempt(2, 'npm.cmd run dev', 'npm.cmd run dev'))
    
    # ========================================
    # ATTEMPT 3: cmd /c npm run dev
    # ========================================
    results.append(run_attempt(3, 'cmd /c npm run dev', 'cmd /c npm run dev'))
    
    # ========================================
    # ATTEMPT 4: node npm-cli.js run dev
    # ========================================
    print('[ATTEMPT 4] Detecting npm-cli.js and running with node')
    print_separator()
    print()
    
    npm_cli_path = detect_npm_cli()
    
    if npm_cli_path:
        print(f"Found npm-cli.js at:")
        print(f"  {npm_cli_path}")
        print()
        results.append(run_attempt(4, f'node "{npm_cli_path}" run dev', f'node npm-cli.js run dev'))
    else:
        print('npm-cli.js NOT FOUND in expected locations:')
        appdata = os.environ.get('APPDATA', 'N/A')
        print(f'  - {appdata}\\npm\\node_modules\\npm\\bin\\npm-cli.js')
        print('  - C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
        print('  - C:\\Program Files (x86)\\nodejs\\node_modules\\npm\\bin\\npm-cli.js')
        print()
        print('Exit Code: 1 (File not found)')
        print('=== END ATTEMPT 4 ===')
        print()
        
        results.append({
            'attempt': 4,
            'command': 'npm-cli.js detection',
            'cmd_text': 'node npm-cli.js run dev',
            'exit_code': 1,
            'timed_out': False,
            'elapsed_time': 0,
            'has_localhost': False,
            'has_vite': False,
            'has_5173': False,
            'error': 'npm-cli.js not found'
        })
    
    # ========================================
    # SUMMARY
    # ========================================
    print_separator("SUMMARY OF RESULTS")
    print()
    
    successful = []
    for r in results:
        status = 'TIMEOUT' if r.get('timed_out') else ('SUCCESS' if r['exit_code'] == 0 else f'FAILED (Code: {r["exit_code"]})')
        indicators = []
        if r.get('has_localhost'):
            indicators.append('localhost')
        if r.get('has_vite'):
            indicators.append('VITE')
        if r.get('has_5173'):
            indicators.append('5173')
        
        indicator_str = f" [{', '.join(indicators)}]" if indicators else " [No indicators found]"
        
        print(f"Attempt {r['attempt']}: {status}{indicator_str}")
        
        if r.get('timed_out') and (r.get('has_vite') or r.get('has_localhost')):
            successful.append(r['attempt'])
    
    print()
    
    # Check for successful attempts
    if successful:
        print("✓ DEV SERVER STARTED SUCCESSFULLY")
        print(f"  Successful attempt(s): {', '.join(map(str, successful))}")
        print()
        for attempt_num in successful:
            r = results[attempt_num - 1]
            print(f"  Recommended: Use '{r['command']}' to start dev server")
    else:
        print("✗ DEV SERVER DID NOT START")
        print("  Check the detailed output above for error messages")
        print()
        
        # Show first error for debugging
        for r in results:
            if r['exit_code'] != 0:
                print(f"  Attempt {r['attempt']} error: Exit code {r['exit_code']}")
                if r.get('error'):
                    print(f"  Error: {r['error']}")
    
    print()
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}", file=sys.stderr)
        sys.exit(1)
