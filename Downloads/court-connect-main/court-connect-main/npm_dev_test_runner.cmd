@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

set "OUTPUT_FILE=%TEMP%\npm_dev_results.txt"
set "TEMP_LOG=%TEMP%\npm_attempt.log"

(
echo.
echo ============================================================
echo TESTING NPM RUN DEV WITH FALLBACKS - 15 SECOND TIMEOUT EACH
echo ============================================================
echo.
echo Current Directory: %CD%
echo.

REM Attempt 1: npm run dev
echo [ATTEMPT 1] Running: npm run dev
echo ============================================================
echo.
(
  npm run dev 2>&1
) > "!TEMP_LOG!" 2>&1
timeout /t 15 /nobreak > nul
echo === OUTPUT ===
type "!TEMP_LOG!"
echo.
echo === END ATTEMPT 1 ===
echo.

REM Attempt 2: npm.cmd run dev
echo [ATTEMPT 2] Running: npm.cmd run dev
echo ============================================================
echo.
(
  npm.cmd run dev 2>&1
) > "!TEMP_LOG!" 2>&1
timeout /t 15 /nobreak > nul
echo === OUTPUT ===
type "!TEMP_LOG!"
echo.
echo === END ATTEMPT 2 ===
echo.

REM Attempt 3: cmd /c npm run dev
echo [ATTEMPT 3] Running: cmd /c npm run dev
echo ============================================================
echo.
(
  cmd /c "npm run dev" 2>&1
) > "!TEMP_LOG!" 2>&1
timeout /t 15 /nobreak > nul
echo === OUTPUT ===
type "!TEMP_LOG!"
echo.
echo === END ATTEMPT 3 ===
echo.

REM Attempt 4: detect npm-cli.js and run with node
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
    (
      node "!NPM_CLI_PATH!" run dev 2>&1
    ) > "!TEMP_LOG!" 2>&1
    timeout /t 15 /nobreak > nul
    echo === OUTPUT ===
    type "!TEMP_LOG!"
    echo.
    echo === END ATTEMPT 4 ===
) else (
    echo npm-cli.js not found in expected locations
    echo Checked:
    echo   - %APPDATA%\npm\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js
    echo.
    echo === END ATTEMPT 4 ===
)

REM Cleanup
if exist "!TEMP_LOG!" del "!TEMP_LOG!"

) > "!OUTPUT_FILE!" 2>&1

type "!OUTPUT_FILE!"

endlocal
