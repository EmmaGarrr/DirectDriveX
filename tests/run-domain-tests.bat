@echo off
REM Domain Name Validation Test Runner for Windows
REM =============================================

echo Starting Domain Name Validation Tests...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js to run these tests
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

REM Check if development server is running
echo Checking if development server is running...
curl -s http://localhost:4200 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Development server may not be running on port 4200
    echo Starting development server...
    echo.
    echo In a separate terminal, run:
    echo cd frontend ^&^& npm run dev
    echo.
    echo Press any key to continue with tests anyway...
    pause >nul
)

echo ✅ Development server check completed
echo.

REM Run the domain validation test
echo Running MCP Domain Validation Test...
echo =================================
node "%~dp0mcp-domain-test.js"

echo.
echo Tests completed!
pause