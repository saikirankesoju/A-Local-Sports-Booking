# NPM RUN DEV - 4 Sequential Test Methods

## Overview
This document explains how to execute the 4 sequential npm run dev attempts with detailed output capture (15-second window each) as requested.

## Environment Issue
Unfortunately, the primary command execution tool (PowerShell 6+) is not available in the current environment, which prevents direct execution. However, **three alternative test scripts have been created** for you to run locally.

## Test Scripts Created

### Option 1: Python Script (RECOMMENDED)
**File:** `test_npm_dev_4_ways.py`

Most reliable option with detailed analysis.

```bash
python test_npm_dev_4_ways.py
```

**Features:**
- ✓ Captures complete stdout and stderr verbatim
- ✓ Shows full output within 15-second windows
- ✓ Detects "localhost", "VITE", and "5173" in output
- ✓ Reports exit codes
- ✓ Shows elapsed time for each attempt
- ✓ Provides summary with success indicators

### Option 2: Batch Script
**File:** `RUN_NPM_DEV_TEST.cmd`

Windows batch file with similar functionality.

```batch
RUN_NPM_DEV_TEST.cmd
```

**Features:**
- ✓ Runs all 4 attempts sequentially
- ✓ Creates separate output files for each attempt
- ✓ Analyzes output for key indicators
- ✓ Native Windows implementation

### Option 3: Original Test Runner
**File:** `npm_dev_test_runner.cmd`

Simple batch runner with basic output capture.

```batch
npm_dev_test_runner.cmd
```

## What Each Attempt Tests

### Attempt 1: Direct npm Command
```
Command: npm run dev
```
Tests if `npm` is in the system PATH and can be executed directly.

### Attempt 2: npm.cmd (Windows Wrapper)
```
Command: npm.cmd run dev
```
Tests if the Windows command wrapper version of npm works.

### Attempt 3: Through Command Shell
```
Command: cmd /c npm run dev
```
Tests npm execution through the Windows command processor explicitly.

### Attempt 4: Node.js Direct Execution
```
Command: node "<path-to-npm-cli.js>" run dev
```
Tests running npm by directly invoking the npm-cli.js script with Node.js.

Checks these locations for npm-cli.js:
- `%APPDATA%\npm\node_modules\npm\bin\npm-cli.js`
- `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`
- `C:\Program Files (x86)\nodejs\node_modules\npm\bin\npm-cli.js`

## Expected Output Indicators

When the dev server starts successfully, you should see:

✓ **"localhost"** (case-insensitive) - indicates the server is listening
✓ **"VITE"** (case-insensitive) - confirms Vite dev server started
✓ **"5173"** - the default Vite development server port

Example successful startup output:
```
  VITE v5.4.19  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 15-Second Timeout Behavior

Each attempt is allocated **15 seconds** for output capture:

- If the server starts within 15 seconds → output is captured until timeout or process exit
- If a process doesn't respond within 15 seconds → it's considered a timeout (exit code 124)
- The timeout doesn't kill the actual development server; it just stops capturing output

Note: Vite dev servers are **long-running processes** that don't typically exit, so timeout behavior is expected and doesn't indicate failure. If "VITE" and "localhost" appear in the output, the server started successfully even with a timeout.

## Project Configuration

### Vite Config
**File:** `vite.config.ts`
- **Host:** 0.0.0.0 (listens on all network interfaces)
- **Port:** 5173 (default Vite development port)
- **HMR:** Hot Module Replacement enabled
- **Plugin:** React via @vitejs/plugin-react-swc

### Package.json
**Dev Command:**
```json
"dev": "vite"
```

**Build Details:**
- React 18.3.1
- Vite 5.4.19
- TypeScript support
- Tailwind CSS configured
- ESLint configured

## Troubleshooting

### If "npm is not found"
Check that Node.js is installed:
```bash
node --version
npm --version
```

### If Attempt 4 reports "npm-cli.js not found"
It means npm is not installed in the standard locations. You can find where npm is installed with:
```bash
where npm
```

### If no VITE output appears
Check that:
1. Node modules are installed: `npm install`
2. Vite config file exists and is valid
3. No port conflicts on 5173: `netstat -ano | findstr :5173`

## Next Steps

1. **Run one of the test scripts** using the commands above
2. **Examine the complete output** for each of the 4 attempts
3. **Identify which attempt succeeds** - look for "VITE", "localhost", and "5173"
4. **Use the successful method** going forward for your development workflow

The Python script is recommended because it provides the most detailed and reliable output analysis.

---

**Created by:** Automated diagnostic system
**Date:** 2025
**Purpose:** Diagnose npm run dev execution methods
