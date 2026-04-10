@echo off
REM ============================================================
REM NPM RUN DEV TEST - 4 SEQUENTIAL ATTEMPTS WITH DETAILED OUTPUT
REM ============================================================
REM This script tests 4 different methods to run npm dev:
REM 1) npm run dev
REM 2) npm.cmd run dev
REM 3) cmd /c npm run dev
REM 4) node <npm-cli.js-path> run dev
REM
REM Each attempt has a 15-second capture window
REM ============================================================

setlocal enabledelayedexpansion

cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

echo.
echo ============================================================
echo TESTING NPM RUN DEV WITH DETAILED OUTPUT CAPTURE
echo ============================================================
echo Current Directory: %CD%
echo.
echo Expected behavior:
echo   - Vite should start dev server on port 5173
echo   - Output should contain "localhost", "VITE", and "5173"
echo.
echo Each attempt has 15-second output capture window
echo ============================================================
echo.

set ATTEMPT_COUNT=0
set SUCCESS_COUNT=0

REM ============================================================
REM ATTEMPT 1: npm run dev
REM ============================================================
set /a ATTEMPT_COUNT+=1
echo.
echo [ATTEMPT !ATTEMPT_COUNT!] npm run dev
echo ============================================================
echo.
echo Command: npm run dev
echo.
echo --- OUTPUT START (15-second window) ---
call :run_with_timeout "npm run dev" 15 attempt1_output.txt
echo --- OUTPUT END ---
echo.
call :analyze_output attempt1_output.txt !ATTEMPT_COUNT! "npm run dev"
echo.
echo === END ATTEMPT !ATTEMPT_COUNT! ===
echo.

REM ============================================================
REM ATTEMPT 2: npm.cmd run dev
REM ============================================================
set /a ATTEMPT_COUNT+=1
echo.
echo [ATTEMPT !ATTEMPT_COUNT!] npm.cmd run dev
echo ============================================================
echo.
echo Command: npm.cmd run dev
echo.
echo --- OUTPUT START (15-second window) ---
call :run_with_timeout "npm.cmd run dev" 15 attempt2_output.txt
echo --- OUTPUT END ---
echo.
call :analyze_output attempt2_output.txt !ATTEMPT_COUNT! "npm.cmd run dev"
echo.
echo === END ATTEMPT !ATTEMPT_COUNT! ===
echo.

REM ============================================================
REM ATTEMPT 3: cmd /c npm run dev
REM ============================================================
set /a ATTEMPT_COUNT+=1
echo.
echo [ATTEMPT !ATTEMPT_COUNT!] cmd /c npm run dev
echo ============================================================
echo.
echo Command: cmd /c npm run dev
echo.
echo --- OUTPUT START (15-second window) ---
call :run_with_timeout "cmd /c npm run dev" 15 attempt3_output.txt
echo --- OUTPUT END ---
echo.
call :analyze_output attempt3_output.txt !ATTEMPT_COUNT! "cmd /c npm run dev"
echo.
echo === END ATTEMPT !ATTEMPT_COUNT! ===
echo.

REM ============================================================
REM ATTEMPT 4: node npm-cli.js run dev
REM ============================================================
set /a ATTEMPT_COUNT+=1
echo.
echo [ATTEMPT !ATTEMPT_COUNT!] Detecting npm-cli.js and running with node
echo ============================================================
echo.

set "NPM_CLI_PATH="
if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at:
    echo   %NPM_CLI_PATH%
) else if exist "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at:
    echo   %NPM_CLI_PATH%
) else if exist "%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at:
    echo   %NPM_CLI_PATH%
)

if defined NPM_CLI_PATH (
    echo.
    echo Command: node "!NPM_CLI_PATH!" run dev
    echo.
    echo --- OUTPUT START (15-second window) ---
    call :run_with_timeout "node "!NPM_CLI_PATH!" run dev" 15 attempt4_output.txt
    echo --- OUTPUT END ---
    echo.
    call :analyze_output attempt4_output.txt !ATTEMPT_COUNT! "node npm-cli.js run dev"
) else (
    echo.
    echo npm-cli.js NOT FOUND in expected locations:
    echo   - %APPDATA%\npm\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js
    echo.
    echo Exit Code: 1 (File not found)
)
echo.
echo === END ATTEMPT !ATTEMPT_COUNT! ===
echo.

REM ============================================================
REM SUMMARY
REM ============================================================
echo.
echo ============================================================
echo SUMMARY OF RESULTS
echo ============================================================
echo.
echo Total Attempts: !ATTEMPT_COUNT!
echo.
echo To view detailed output from each attempt, check:
echo   - attempt1_output.txt  (npm run dev)
echo   - attempt2_output.txt  (npm.cmd run dev)
echo   - attempt3_output.txt  (cmd /c npm run dev)
echo   - attempt4_output.txt  (node npm-cli.js run dev)
echo.
echo Key things to look for in output:
echo   ✓ Port 5173 mentioned
echo   ✓ "VITE" in output
echo   ✓ "localhost" in output
echo   ✓ "Local:" followed by a URL
echo.
echo ============================================================
echo Script Complete
echo ============================================================
echo.

goto :EOF

REM ============================================================
REM FUNCTION: run_with_timeout
REM Runs a command and captures output for N seconds
REM Parameters:
REM   %1 = Command to run
REM   %2 = Timeout in seconds
REM   %3 = Output file
REM ============================================================
:run_with_timeout
setlocal enabledelayedexpansion
set "CMD=%~1"
set "TIMEOUT_SEC=%~2"
set "OUTPUT_FILE=%~3"

REM Run command and capture output
%CMD% > "%OUTPUT_FILE%" 2>&1 &
set "PID=!ERRORLEVEL!"

REM Wait for specified timeout
timeout /t %TIMEOUT_SEC% /nobreak >nul

REM Display the output file
if exist "%OUTPUT_FILE%" (
    type "%OUTPUT_FILE%"
) else (
    echo [No output captured]
)

endlocal
goto :EOF

REM ============================================================
REM FUNCTION: analyze_output
REM Analyzes output file for key indicators
REM Parameters:
REM   %1 = Output file to analyze
REM   %2 = Attempt number
REM   %3 = Command description
REM ============================================================
:analyze_output
setlocal enabledelayedexpansion
set "OUTPUT_FILE=%~1"
set "ATTEMPT_NUM=%~2"
set "CMD_DESC=%~3"

if exist "%OUTPUT_FILE%" (
    set "CONTENT="
    for /f "usebackq delims=" %%A in ("%OUTPUT_FILE%") do (
        set "CONTENT=!CONTENT! %%A"
    )
    
    echo Analysis:
    
    if "!CONTENT!"=="" (
        echo   Status: No output captured (timeout or immediate completion)
    ) else (
        echo   Status: Output captured
        
        findstr /i "localhost" "%OUTPUT_FILE%" >nul 2>&1
        if !ERRORLEVEL! equ 0 (
            echo   ✓ Contains "localhost"
        ) else (
            echo   ✗ Does not contain "localhost"
        )
        
        findstr /i "vite" "%OUTPUT_FILE%" >nul 2>&1
        if !ERRORLEVEL! equ 0 (
            echo   ✓ Contains "VITE"
        ) else (
            echo   ✗ Does not contain "VITE"
        )
        
        findstr "5173" "%OUTPUT_FILE%" >nul 2>&1
        if !ERRORLEVEL! equ 0 (
            echo   ✓ Contains "5173"
        ) else (
            echo   ✗ Does not contain "5173"
        )
    )
) else (
    echo Analysis: Output file not created
)

endlocal
goto :EOF

endlocal
