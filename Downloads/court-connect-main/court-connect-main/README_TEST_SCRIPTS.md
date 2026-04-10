# NPM Run Dev - 4 Sequential Test Scripts

## Quick Start

### Option 1: Python (Recommended)
```bash
python test_npm_dev_4_ways.py
```

### Option 2: Batch Script  
```batch
RUN_NPM_DEV_TEST.cmd
```

### Option 3: Original Batch
```batch
npm_dev_test_runner.cmd
```

---

## What Gets Tested

All 3 scripts test these 4 npm run dev methods sequentially:

| # | Command | Purpose |
|---|---------|---------|
| 1 | `npm run dev` | Direct npm in PATH |
| 2 | `npm.cmd run dev` | Windows cmd wrapper |
| 3 | `cmd /c npm run dev` | Explicit cmd.exe |
| 4 | `node npm-cli.js run dev` | Direct Node.js invocation |

## What Gets Captured (Per Attempt)

✅ Complete stdout (all text output)
✅ Complete stderr (all error output)
✅ Exit code (0 = success, other = failure)
✅ Elapsed time (how long before 15-second timeout)
✅ Presence of "localhost" (case-insensitive)
✅ Presence of "VITE" (case-insensitive)
✅ Presence of "5173" (port number)

## 15-Second Timeout Behavior

Each attempt runs for 15 seconds max:
- **0-15s:** Captures all output
- **15s+:** Process may continue (normal for dev servers)
- **Timeout (15s) = NOT necessarily failure** if output shows VITE/localhost

## Success Indicators

Look for these in output:

✓ **localhost** - Server is bound to localhost
✓ **VITE** - Vite dev server started  
✓ **5173** - The configured port number

Example successful output:
```
VITE v5.4.19  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## File Descriptions

| File | Type | Use When |
|------|------|----------|
| `test_npm_dev_4_ways.py` | Python | Want detailed analysis and best output |
| `RUN_NPM_DEV_TEST.cmd` | Batch | Prefer Windows native solution |
| `npm_dev_test_runner.cmd` | Batch | Want simple batch script |
| `NPM_DEV_TEST_INSTRUCTIONS.md` | Doc | Need detailed instructions |
| `ENVIRONMENT_DIAGNOSTIC.md` | Doc | Need troubleshooting help |
| `TEST_EXECUTION_SUMMARY.md` | Doc | Want full technical details |

## Python Script Output Example

```
============================================================
NPM RUN DEV - 4 SEQUENTIAL ATTEMPTS WITH DETAILED OUTPUT
============================================================

Current Directory: C:\Users\Dell\Downloads\court-connect-main\court-connect-main
Timeout per attempt: 15 seconds

Expected indicators of successful startup:
  - Output contains 'localhost'
  - Output contains 'VITE'
  - Output contains '5173' (default Vite port)

[ATTEMPT 1] npm run dev
============================================================

Command: npm run dev

--- OUTPUT START ---
=== STDOUT ===
VITE v5.4.19  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
--- OUTPUT END ---

Exit Code: 124 (TIMEOUT - process still running after 15s)
Elapsed Time: 15.02s

Findings:
  ✓ Contains 'localhost'
  ✓ Contains 'VITE'
  ✓ Contains '5173'

=== END ATTEMPT 1 ===

[ATTEMPT 2] npm.cmd run dev
============================================================
...

[ATTEMPT 3] cmd /c npm run dev
============================================================
...

[ATTEMPT 4] Detecting npm-cli.js and running with node
============================================================

Found npm-cli.js at:
  C:\Users\<user>\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js

Command: node "C:\Users\<user>\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js" run dev

...

============================================================
SUMMARY OF RESULTS
============================================================

Attempt 1: TIMEOUT [localhost, VITE, 5173]
Attempt 2: TIMEOUT [localhost, VITE, 5173]
Attempt 3: TIMEOUT [localhost, VITE, 5173]
Attempt 4: TIMEOUT [localhost, VITE, 5173]

✓ DEV SERVER STARTED SUCCESSFULLY
  Successful attempt(s): 1, 2, 3, 4
  
  Recommended: Use 'npm run dev' to start dev server
```

## Troubleshooting

### Error: "npm is not found"
```bash
# Reinstall Node.js (includes npm)
# Download: https://nodejs.org/
```

### Error: "Port 5173 already in use"
```bash
# Kill process using port
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 5174
```

### Error: "Cannot find module"
```bash
# Install dependencies
npm install

# Try again
npm run dev
```

### npm-cli.js not found (Attempt 4)
```bash
# Check where npm is installed
where npm

# Check global modules
npm root -g
```

## Project Info

- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.19
- **Language:** TypeScript
- **Port:** 5173
- **Script:** `npm run dev` → runs `vite`

## Environment

- **OS:** Windows
- **Directory:** `C:\Users\Dell\Downloads\court-connect-main\court-connect-main`
- **Node.js:** Required (check with `node --version`)
- **npm:** Required (check with `npm --version`)

## Documentation

For more information, see:
- `NPM_DEV_TEST_INSTRUCTIONS.md` - Complete test guide
- `ENVIRONMENT_DIAGNOSTIC.md` - System & project diagnostics
- `TEST_EXECUTION_SUMMARY.md` - Technical details

## Next Steps

1. Run: `python test_npm_dev_4_ways.py`
2. Review output for successful attempt
3. Use the working command for development
4. Check documentation if issues occur

---

**Version:** 1.0
**Created:** 2025
**Purpose:** Test and diagnose npm run dev execution methods
