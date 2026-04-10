@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

echo.
echo ============================================================
echo TESTING NPM RUN DEV WITH FALLBACKS (15-SECOND TIMEOUT EACH)
echo ============================================================
echo.
echo Current Directory: !CD!
echo.

REM Create a temp file to capture output
set "TEMP_OUT=%TEMP%\npm_attempt.log"

REM Attempt 1: npm run dev
echo.
echo [ATTEMPT 1] Running: npm run dev
echo ============================================================
echo.

set "START_TIME=%time%"
(npm run dev 2>&1) > "!TEMP_OUT!" &
set "PID=!ERRORLEVEL!"

REM Wait 15 seconds
timeout /t 15 /nobreak > nul

REM Show captured output
echo === OUTPUT (first 15 seconds) ===
type "!TEMP_OUT!"
echo.
echo === END ATTEMPT 1 ===
echo.

REM Attempt 2: npm.cmd run dev
echo [ATTEMPT 2] Running: npm.cmd run dev
echo ============================================================
echo.

(npm.cmd run dev 2>&1) > "!TEMP_OUT!" &
timeout /t 15 /nobreak > nul

echo === OUTPUT (first 15 seconds) ===
type "!TEMP_OUT!"
echo.
echo === END ATTEMPT 2 ===
echo.

REM Attempt 3: cmd /c npm run dev
echo [ATTEMPT 3] Running: cmd /c npm run dev
echo ============================================================
echo.

(cmd /c "npm run dev" 2>&1) > "!TEMP_OUT!" &
timeout /t 15 /nobreak > nul

echo === OUTPUT (first 15 seconds) ===
type "!TEMP_OUT!"
echo.
echo === END ATTEMPT 3 ===
echo.

REM Attempt 4: detect first existing npm-cli.js and run dev
echo [ATTEMPT 4] Detecting npm-cli.js and running with node
echo ============================================================
echo.

set "NPM_CLI_PATH="
if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
) else if exist "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"
) else if exist "%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js"
)

if defined NPM_CLI_PATH (
    echo Found npm-cli.js at: !NPM_CLI_PATH!
    echo Running: node "!NPM_CLI_PATH!" run dev
    echo.
    (node "!NPM_CLI_PATH!" run dev 2>&1) > "!TEMP_OUT!" &
    timeout /t 15 /nobreak > nul
    
    echo === OUTPUT (first 15 seconds) ===
    type "!TEMP_OUT!"
    echo.
    echo === END ATTEMPT 4 ===
) else (
    echo npm-cli.js not found in expected locations:
    echo   - %APPDATA%\npm\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js
)

REM Cleanup
if exist "!TEMP_OUT!" del "!TEMP_OUT!"

endlocal
