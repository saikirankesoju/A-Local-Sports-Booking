@echo off
REM Test npm install fallbacks
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

echo ============================================================
echo TESTING NPM INSTALL FALLBACKS
echo ============================================================
echo.

REM Attempt 1: npm install
echo [ATTEMPT 1] Running: npm install
echo ---
npm install 2>&1
set EXIT_CODE_1=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_1!
echo.

REM Attempt 2: npm.cmd install
echo [ATTEMPT 2] Running: npm.cmd install
echo ---
npm.cmd install 2>&1
set EXIT_CODE_2=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_2!
echo.

REM Attempt 3: cmd /c npm install
echo [ATTEMPT 3] Running: cmd /c npm install
echo ---
cmd /c npm install 2>&1
set EXIT_CODE_3=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_3!
echo.

REM Attempt 4: detect first existing npm-cli.js
echo [ATTEMPT 4] Detecting npm-cli.js and running with node
echo ---
set "NPM_CLI_PATH="
if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
    echo Found at: %NPM_CLI_PATH%
) else if exist "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found at: %NPM_CLI_PATH%
) else if exist "%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found at: %NPM_CLI_PATH%
) else (
    echo npm-cli.js not found in any expected location
    echo Expected locations:
    echo   - %APPDATA%\npm\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js
    set EXIT_CODE_4=1
)

if defined NPM_CLI_PATH (
    echo Running: node "!NPM_CLI_PATH!" install
    echo ---
    node "!NPM_CLI_PATH!" install 2>&1
    set EXIT_CODE_4=!ERRORLEVEL!
)
echo.
echo Exit Code: !EXIT_CODE_4!
echo.

echo ============================================================
echo TESTING NPM RUN DEV FALLBACKS
echo ============================================================
echo.

REM Attempt 1: npm run dev
echo [ATTEMPT 1] Running: npm run dev
echo ---
timeout /t 5 /nobreak >nul
npm run dev 2>&1 | timeout /t 15 /nobreak >nul
set EXIT_CODE_D1=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_D1!
echo.

REM Attempt 2: npm.cmd run dev
echo [ATTEMPT 2] Running: npm.cmd run dev
echo ---
timeout /t 5 /nobreak >nul
npm.cmd run dev 2>&1 | timeout /t 15 /nobreak >nul
set EXIT_CODE_D2=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_D2!
echo.

REM Attempt 3: cmd /c npm run dev
echo [ATTEMPT 3] Running: cmd /c npm run dev
echo ---
timeout /t 5 /nobreak >nul
cmd /c "npm run dev" 2>&1 | timeout /t 15 /nobreak >nul
set EXIT_CODE_D3=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_D3!
echo.

REM Attempt 4: detect first existing npm-cli.js and run dev
echo [ATTEMPT 4] Detecting npm-cli.js and running "run dev" with node
echo ---
set "NPM_CLI_PATH="
if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
) else if exist "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"
) else if exist "%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js"
)

if defined NPM_CLI_PATH (
    echo Running: node "!NPM_CLI_PATH!" run dev
    timeout /t 5 /nobreak >nul
    node "!NPM_CLI_PATH!" run dev 2>&1 | timeout /t 15 /nobreak >nul
    set EXIT_CODE_D4=!ERRORLEVEL!
) else (
    set EXIT_CODE_D4=1
)
echo.
echo Exit Code: !EXIT_CODE_D4!
echo.

echo ============================================================
echo SUMMARY
echo ============================================================
echo npm install Attempt 1 (npm install): !EXIT_CODE_1!
echo npm install Attempt 2 (npm.cmd install): !EXIT_CODE_2!
echo npm install Attempt 3 (cmd /c npm install): !EXIT_CODE_3!
echo npm install Attempt 4 (node npm-cli.js install): !EXIT_CODE_4!
echo.
echo npm run dev Attempt 1 (npm run dev): !EXIT_CODE_D1!
echo npm run dev Attempt 2 (npm.cmd run dev): !EXIT_CODE_D2!
echo npm run dev Attempt 3 (cmd /c npm run dev): !EXIT_CODE_D3!
echo npm run dev Attempt 4 (node npm-cli.js run dev): !EXIT_CODE_D4!
echo.

endlocal
