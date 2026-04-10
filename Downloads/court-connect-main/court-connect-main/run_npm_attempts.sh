#!/bin/bash

cd /c/Users/Dell/Downloads/court-connect-main/court-connect-main

echo ""
echo "============================================================"
echo "TESTING NPM RUN DEV WITH FALLBACKS (15-SECOND TIMEOUT EACH)"
echo "============================================================"
echo ""
echo "Current Directory: $(pwd)"
echo ""

# Function to run command with 15-second timeout
run_attempt() {
    local attempt_num=$1
    local cmd=$2
    local desc=$3
    
    echo ""
    echo "[ATTEMPT $attempt_num] Running: $desc"
    echo "============================================================"
    echo ""
    
    # Run the command in background and capture output
    timeout 15s bash -c "$cmd" 2>&1 &
    local pid=$!
    
    # Wait for process to finish or timeout (timeout command handles this)
    wait $pid 2>/dev/null
    local exit_code=$?
    
    echo ""
    if [ $exit_code -eq 124 ]; then
        echo "Exit Code: 124 (Timeout - process still running after 15 seconds)"
    else
        echo "Exit Code: $exit_code"
    fi
    echo "=== END ATTEMPT $attempt_num ==="
    echo ""
}

# Attempt 1: npm run dev
run_attempt 1 "npm run dev" "npm run dev"

# Attempt 2: npm.cmd run dev (may not work on non-Windows)
run_attempt 2 "npm.cmd run dev" "npm.cmd run dev"

# Attempt 3: cmd /c npm run dev (may not work on non-Windows)
run_attempt 3 'cmd /c "npm run dev"' 'cmd /c npm run dev'

# Attempt 4: detect npm-cli.js and run with node
echo ""
echo "[ATTEMPT 4] Detecting npm-cli.js and running with node"
echo "============================================================"
echo ""

NPM_CLI_PATH=""
if [ -f "$APPDATA/npm/node_modules/npm/bin/npm-cli.js" ]; then
    NPM_CLI_PATH="$APPDATA/npm/node_modules/npm/bin/npm-cli.js"
elif [ -f "/c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" ]; then
    NPM_CLI_PATH="/c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"
elif [ -f "/c/Program Files (x86)/nodejs/node_modules/npm/bin/npm-cli.js" ]; then
    NPM_CLI_PATH="/c/Program Files (x86)/nodejs/node_modules/npm/bin/npm-cli.js"
fi

if [ -n "$NPM_CLI_PATH" ]; then
    echo "Found npm-cli.js at: $NPM_CLI_PATH"
    echo "Running: node \"$NPM_CLI_PATH\" run dev"
    echo ""
    
    timeout 15s bash -c "node \"$NPM_CLI_PATH\" run dev" 2>&1 &
    local pid=$!
    wait $pid 2>/dev/null
    local exit_code=$?
    
    echo ""
    if [ $exit_code -eq 124 ]; then
        echo "Exit Code: 124 (Timeout - process still running after 15 seconds)"
    else
        echo "Exit Code: $exit_code"
    fi
    echo "=== END ATTEMPT 4 ==="
else
    echo "npm-cli.js not found in expected locations:"
    echo "  - $APPDATA/npm/node_modules/npm/bin/npm-cli.js"
    echo "  - /c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"
    echo "  - /c/Program Files (x86)/nodejs/node_modules/npm/bin/npm-cli.js"
    echo "Exit Code: 1"
    echo "=== END ATTEMPT 4 ==="
fi

echo ""
