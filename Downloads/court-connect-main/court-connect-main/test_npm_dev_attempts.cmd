@echo off
REM Test npm run dev with 4 fallback attempts and proper output capture
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

echo.
echo ============================================================
echo TESTING NPM RUN DEV WITH FALLBACKS (15-SECOND TIMEOUT EACH)
echo ============================================================
echo.

REM Attempt 1: npm run dev
echo [ATTEMPT 1] Running: npm run dev
echo ---
echo.
(
  timeout /t 15 /nobreak & npm run dev
) 2>&1 | findstr /C:"VITE" /C:"localhost" /C:"error" /C:"Error" /C:"npm"
set EXIT_CODE_1=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_1!
echo.

REM Attempt 2: npm.cmd run dev
echo [ATTEMPT 2] Running: npm.cmd run dev
echo ---
echo.
(
  timeout /t 15 /nobreak & npm.cmd run dev
) 2>&1 | findstr /C:"VITE" /C:"localhost" /C:"error" /C:"Error" /C:"npm"
set EXIT_CODE_2=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_2!
echo.

REM Attempt 3: cmd /c npm run dev
echo [ATTEMPT 3] Running: cmd /c npm run dev
echo ---
echo.
(
  timeout /t 15 /nobreak & cmd /c "npm run dev"
) 2>&1 | findstr /C:"VITE" /C:"localhost" /C:"error" /C:"Error" /C:"npm"
set EXIT_CODE_3=!ERRORLEVEL!
echo.
echo Exit Code: !EXIT_CODE_3!
echo.

REM Attempt 4: detect first existing npm-cli.js and run dev
echo [ATTEMPT 4] Detecting npm-cli.js and running with node
echo ---
echo.
set "NPM_CLI_PATH="
if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at: !NPM_CLI_PATH!
) else if exist "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at: !NPM_CLI_PATH!
) else if exist "%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at: !NPM_CLI_PATH!
) else (
    echo npm-cli.js not found in any expected location
    set EXIT_CODE_4=1
    echo Exit Code: !EXIT_CODE_4!
    goto end
)

if defined NPM_CLI_PATH (
    echo Running: node "!NPM_CLI_PATH!" run dev
    echo.
    (
      timeout /t 15 /nobreak & node "!NPM_CLI_PATH!" run dev
    ) 2>&1 | findstr /C:"VITE" /C:"localhost" /C:"error" /C:"Error" /C:"npm"
    set EXIT_CODE_4=!ERRORLEVEL!
)
echo.
echo Exit Code: !EXIT_CODE_4!
echo.

:end
echo ============================================================
echo SUMMARY
echo ============================================================
echo npm run dev Attempt 1 (npm run dev): !EXIT_CODE_1!
echo npm run dev Attempt 2 (npm.cmd run dev): !EXIT_CODE_D2!
echo npm run dev Attempt 3 (cmd /c npm run dev): !EXIT_CODE_D3!
echo npm run dev Attempt 4 (node npm-cli.js run dev): !EXIT_CODE_D4!
echo.

endlocal
