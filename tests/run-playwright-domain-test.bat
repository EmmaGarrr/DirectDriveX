@echo off
REM Playwright MCP Domain Validation Test Runner
REM ===========================================

echo Starting Playwright MCP Domain Validation Test...
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
echo Checking if development server is running on port 4200...
curl -s http://localhost:4200 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Development server is not running on port 4200
    echo.
    echo Please start the development server:
    echo   cd frontend
    echo   npm run dev
    echo.
    echo After starting the server, press any key to continue with tests...
    pause >nul
)

echo ✅ Development server check completed
echo.

REM Run the Playwright MCP domain validation test
echo Running Comprehensive Domain Validation Test...
echo ===========================================
echo.

node "%~dp0playwright-mcp-domain-test.js"

echo.
echo.
echo Test completed!
echo.
echo 💡 For best results, run this test:
echo   - Before deploying to production
echo   - After making branding changes
echo   - As part of your CI/CD pipeline
echo   - Regularly to prevent domain name drift
echo.
pause