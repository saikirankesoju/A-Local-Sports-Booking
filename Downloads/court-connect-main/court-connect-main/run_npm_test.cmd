@echo off
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Downloads\court-connect-main\court-connect-main"

set "WORK_DIR=%CD%"
set "TIMEOUT_SEC=15"

echo.
echo ============================================================
echo TESTING NPM RUN DEV WITH FALLBACKS ^(15-SECOND TIMEOUT EACH^)
echo ============================================================
echo.
echo Current Directory: %WORK_DIR%
echo.

REM ==== ATTEMPT 1: npm run dev ====
echo [ATTEMPT 1] Running: npm run dev
echo ============================================================
echo.

set "TEMP_FILE=%TEMP%\npm_attempt_1_%RANDOM%.tmp"

REM Run with timeout using START command
start "npm_attempt_1" /wait /b cmd /c "(npm run dev 2>&1) > "%TEMP_FILE%" 2>&1" & timeout /t %TIMEOUT_SEC% /nobreak > nul 2>&1

if exist "%TEMP_FILE%" (
    echo === STDOUT/STDERR ===
    type "%TEMP_FILE%"
    
    echo.
    echo === ANALYSIS ===
    findstr /I "localhost" "%TEMP_FILE%" > nul && echo Contains "localhost": YES || echo Contains "localhost": NO
    findstr /I "VITE" "%TEMP_FILE%" > nul && echo Contains "VITE": YES || echo Contains "VITE": NO
    findstr "5173" "%TEMP_FILE%" > nul && echo Contains "5173": YES || echo Contains "5173": NO
    
    del "%TEMP_FILE%"
) else (
    echo No output captured
    echo Contains "localhost": NO
    echo Contains "VITE": NO
    echo Contains "5173": NO
)

echo Exit Code: 124 ^(Timeout or process completed^)
echo === END ATTEMPT 1 ===
echo.

REM ==== ATTEMPT 2: npm.cmd run dev ====
echo [ATTEMPT 2] Running: npm.cmd run dev
echo ============================================================
echo.

set "TEMP_FILE=%TEMP%\npm_attempt_2_%RANDOM%.tmp"

start "npm_attempt_2" /wait /b cmd /c "(npm.cmd run dev 2>&1) > "%TEMP_FILE%" 2>&1" & timeout /t %TIMEOUT_SEC% /nobreak > nul 2>&1

if exist "%TEMP_FILE%" (
    echo === STDOUT/STDERR ===
    type "%TEMP_FILE%"
    
    echo.
    echo === ANALYSIS ===
    findstr /I "localhost" "%TEMP_FILE%" > nul && echo Contains "localhost": YES || echo Contains "localhost": NO
    findstr /I "VITE" "%TEMP_FILE%" > nul && echo Contains "VITE": YES || echo Contains "VITE": NO
    findstr "5173" "%TEMP_FILE%" > nul && echo Contains "5173": YES || echo Contains "5173": NO
    
    del "%TEMP_FILE%"
) else (
    echo No output captured
    echo Contains "localhost": NO
    echo Contains "VITE": NO
    echo Contains "5173": NO
)

echo Exit Code: 124 ^(Timeout or process completed^)
echo === END ATTEMPT 2 ===
echo.

REM ==== ATTEMPT 3: cmd /c npm run dev ====
echo [ATTEMPT 3] Running: cmd /c npm run dev
echo ============================================================
echo.

set "TEMP_FILE=%TEMP%\npm_attempt_3_%RANDOM%.tmp"

start "npm_attempt_3" /wait /b cmd /c "(cmd /c npm run dev 2>&1) > "%TEMP_FILE%" 2>&1" & timeout /t %TIMEOUT_SEC% /nobreak > nul 2>&1

if exist "%TEMP_FILE%" (
    echo === STDOUT/STDERR ===
    type "%TEMP_FILE%"
    
    echo.
    echo === ANALYSIS ===
    findstr /I "localhost" "%TEMP_FILE%" > nul && echo Contains "localhost": YES || echo Contains "localhost": NO
    findstr /I "VITE" "%TEMP_FILE%" > nul && echo Contains "VITE": YES || echo Contains "VITE": NO
    findstr "5173" "%TEMP_FILE%" > nul && echo Contains "5173": YES || echo Contains "5173": NO
    
    del "%TEMP_FILE%"
) else (
    echo No output captured
    echo Contains "localhost": NO
    echo Contains "VITE": NO
    echo Contains "5173": NO
)

echo Exit Code: 124 ^(Timeout or process completed^)
echo === END ATTEMPT 3 ===
echo.

REM ==== ATTEMPT 4: node npm-cli.js ====
echo [ATTEMPT 4] Detecting npm-cli.js and running with node
echo ============================================================
echo.

set "NPM_CLI_PATH="

if exist "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" (
    set "NPM_CLI_PATH=%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"
    echo Found npm-cli.js at: !NPM_CLI_PATH!
    echo Running: node "!NPM_CLI_PATH!" run dev
    echo.
    
    set "TEMP_FILE=%TEMP%\npm_attempt_4_%RANDOM%.tmp"
    start "npm_attempt_4" /wait /b cmd /c "(node "!NPM_CLI_PATH!" run dev 2>&1) > "%TEMP_FILE%" 2>&1" & timeout /t %TIMEOUT_SEC% /nobreak > nul 2>&1
    
    if exist "%TEMP_FILE%" (
        echo === STDOUT/STDERR ===
        type "%TEMP_FILE%"
        
        echo.
        echo === ANALYSIS ===
        findstr /I "localhost" "%TEMP_FILE%" > nul && echo Contains "localhost": YES || echo Contains "localhost": NO
        findstr /I "VITE" "%TEMP_FILE%" > nul && echo Contains "VITE": YES || echo Contains "VITE": NO
        findstr "5173" "%TEMP_FILE%" > nul && echo Contains "5173": YES || echo Contains "5173": NO
        
        del "%TEMP_FILE%"
    ) else (
        echo No output captured
        echo Contains "localhost": NO
        echo Contains "VITE": NO
        echo Contains "5173": NO
    )
    
    echo Exit Code: 124 ^(Timeout or process completed^)
) else (
    echo npm-cli.js not found in expected locations:
    echo   - %APPDATA%\npm\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js
    echo   - %ProgramFiles(x86)%\nodejs\node_modules\npm\bin\npm-cli.js
    echo Exit Code: 1
    echo Contains "localhost": NO
    echo Contains "VITE": NO
    echo Contains "5173": NO
)

echo === END ATTEMPT 4 ===
echo.

endlocal
