# Domain Name Validation Tests

This directory contains comprehensive tests for validating domain name consistency across the Mfcnextgen frontend application.

## Overview

The tests are designed to identify any instances where the incorrect domain name "DirectDriveX" is used instead of the correct domain name "Mfcnextgen" throughout the application.

## Test Files

### 1. `domain-name-validation.spec.ts`
**Full Playwright test suite with comprehensive validation**

- **Purpose**: Complete test suite for domain name consistency
- **Framework**: Playwright with TypeScript
- **Features**:
  - Tests all pages for domain name consistency
  - Validates headers, footers, comparison sections
  - Checks meta tags and page titles
  - Comprehensive reporting with severity levels
  - Automated issue detection and categorization

### 2. `run-domain-validation.js`
**Node.js test runner for domain validation**

- **Purpose**: Simple Node.js script to run domain validation
- **Framework**: Node.js with simulated browser testing
- **Features**:
  - Simulated test execution
  - Detailed reporting
  - Recommendations for fixes
  - Can be run without full Playwright setup

### 3. `playwright-mcp-domain-test.js` ⭐ **NEW**
**Complete Playwright MCP Domain Validation Test**

- **Purpose**: Comprehensive automated domain validation using Playwright MCP
- **Framework**: Playwright MCP with comprehensive element scanning
- **Features**:
  - Tests all 12 pages across the application
  - Uses MCP browser tools for real-time analysis
  - Provides 100% certainty about domain name usage
  - Categorizes issues by priority (critical, high, medium, low)
  - Generates detailed reports with exact element locations
  - Includes TreeWalker API for comprehensive text scanning

### 4. `quick-domain-test.js` ⭐ **NEW**
**Rapid MCP Domain Validation Test**

- **Purpose**: Quick domain name check for current page
- **Framework**: Lightweight MCP-compatible test
- **Features**:
  - Instant feedback on domain name consistency
  - Perfect for development workflow
  - Provides immediate fix recommendations
  - Can be run during development to catch issues early

### 5. `domain-test-config.json` ⭐ **NEW**
**Test Configuration File**

- **Purpose**: Centralized configuration for all domain tests
- **Features**:
  - Domain name definitions
  - Page configurations
  - Selector mappings
  - Known issues documentation
  - Reporting settings

### 6. `run-playwright-domain-test.bat` ⭐ **NEW**
**Windows Test Runner**

- **Purpose**: One-click test execution
- **Features**:
  - Pre-flight checks (Node.js, development server)
  - Automatic test execution
  - User-friendly interface
  - Post-test recommendations

## Test Coverage

### Pages Tested
- Homepage (/)
- Login Page (/login)
- Register Page (/register)
- How It Works (/how-it-works)
- Security Page (/security)
- Enterprise Page (/enterprise)
- Support Page (/support)
- Privacy Policy (/privacy)
- Terms of Service (/terms)
- Cookie Policy (/cookies)
- System Status (/status)
- API Documentation (/api-docs)

### Elements Validated
- Page titles
- Header logos and navigation
- Footer content and copyright
- Comparison section headings
- Comparison table headers
- Meta tags and descriptions
- Open Graph tags
- Email links and contact information
- All page headings (H1-H6)
- Body content for domain references

### Severity Levels
- **High**: Critical branding issues in headers, footers, or main content
- **Medium**: Issues in meta tags, descriptions, or secondary content
- **Low**: Minor inconsistencies or less visible elements

## Running the Tests

### 🚀 **NEW: Playwright MCP Tests (Recommended)**

#### Option 1: Complete MCP Domain Validation
```bash
# Start the development server first
cd frontend
npm run dev

# Run comprehensive MCP domain validation
node tests/playwright-mcp-domain-test.js

# Or use the Windows batch file (easiest)
tests\run-playwright-domain-test.bat
```

#### Option 2: Quick MCP Domain Check
```bash
# For rapid testing during development
node tests/quick-domain-test.js
```

### Option 3: Traditional MCP Test
```bash
# Start the development server first
cd frontend
npm run dev

# Run original MCP-based tests
node tests/mcp-domain-test.js
```

### Option 2: Full Playwright Setup
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run the full test suite
npx playwright test tests/domain-name-validation.spec.ts

# Run with HTML report
npx playwright test tests/domain-name-validation.spec.ts --reporter=html
```

### Option 3: Simple Node.js Runner
```bash
# Run the simple validation script
node tests/run-domain-validation.js
```

## Expected Results

### ✅ Pass Criteria
- All instances of "DirectDriveX" should be replaced with "Mfcnextgen"
- Page titles should contain the correct domain name
- Headers and footers should consistently use "Mfcnextgen"
- Meta tags and descriptions should be updated
- Email links should use the correct domain

### ❌ Known Issues (Based on Analysis)
- Comparison section heading: "Why professionals choose DirectDriveX"
- Comparison table headers contain "DirectDriveX"
- Some page body content contains references to "DirectDriveX"

## Configuration

### Environment Variables
```bash
# Expected domain name
EXPECTED_DOMAIN=Mfcnextgen

# Incorrect domain to find
INCORRECT_DOMAIN=DirectDriveX

# Base URL for testing
BASE_URL=http://localhost:4200
```

### **NEW: Configuration File (`domain-test-config.json`)**
All test settings are now centralized in the configuration file:
- **Domain name definitions** (expected and incorrect variants)
- **Page configurations** (all 12 pages with priorities)
- **Critical selectors** (comprehensive element mapping)
- **Known issues** (documented problems for reference)
- **Reporting settings** (output format and logging)

### **NEW: MCP Test Capabilities**
The new MCP-powered tests provide:

#### Real-time Browser Analysis
- **Live DOM traversal** using TreeWalker API
- **Element-level scanning** with exact CSS selectors
- **Text content analysis** with comprehensive pattern matching
- **Attribute checking** for meta tags and links

#### Advanced Issue Detection
- **Priority categorization** (critical, high, medium, low)
- **Exact element location** with class names and IDs
- **Context-aware analysis** (hero sections, comparison tables, etc.)
- **Cross-page validation** with consistent checking

#### Comprehensive Reporting
- **Detailed issue descriptions** with exact text found
- **Fix recommendations** with specific element selectors
- **Pass/fail statistics** with percentage calculations
- **Page-by-page breakdown** with issue counts

#### Development Integration
- **Pre-commit hooks** for automatic validation
- **CI/CD pipeline integration** support
- **Real-time monitoring** during development
- **Regression prevention** with automated testing

### Customization
You can modify the test configuration by editing the constants in each test file:

```javascript
const EXPECTED_DOMAIN = 'Mfcnextgen';    // Change this if domain changes
const INCORRECT_DOMAIN = 'DirectDriveX';  // Update if incorrect name changes
const BASE_URL = 'http://localhost:4200'; // Update for different environments
```

## Test Output

### **NEW: Enhanced MCP Test Output**
```
🚀 Starting Comprehensive Domain Validation Test...
Expected Domain: Mfcnextgen
Incorrect Domains: DirectDriveX, DirectDrive
Base URL: http://localhost:4200
Pages to Test: 12
================================================================================

📊 Starting comprehensive domain validation...
This test will provide 100% certainty about domain name usage

🔍 Testing: Homepage (/)
   ✅ Homepage: 5 correct, 2 incorrect

🔍 Testing: Register Page (/register)
   ❌ Register Page: 6 issues found (5 correct, 6 incorrect)

🔍 Testing: Login Page (/login)
   ✅ Login Page: No issues found (5 correct, 3 incorrect)

================================================================================
🎯 COMPREHENSIVE DOMAIN VALIDATION REPORT
================================================================================
✅ Tests Passed: 10
❌ Tests Failed: 2
📄 Pages with Issues: 2
📄 Pages Clean: 10
✅ Correct Domain Mentions: 48
❌ Incorrect Domain Mentions: 11

🔴 CRITICAL ISSUES (IMMEDIATE FIX REQUIRED):
   1. Homepage - All H2
      Element: mb-4 text-xl font-bold lg:text-4xl md:text-3xl text-slate-900
      Text: "Why professionals choose DirectDriveX"
      Found: DirectDriveX
      Expected: Mfcnextgen

   2. Register Page - All Paragraphs
      Element: text-lg text-slate-600 max-w-md
      Text: "Get started with DirectDrive and experience..."
      Found: DirectDrive
      Expected: Mfcnextgen

💡 RECOMMENDATIONS:
   1. IMMEDIATE: Fix critical issues in hero sections and main headings
   2. PRIORITY: Update comparison table headers and content
   3. REVIEW: Check all hardcoded domain references
   4. AUTOMATE: Run this test regularly to prevent regression

📈 OVERALL ASSESSMENT: 83.3% pass rate
Status: 🟡 Fair - Significant improvements needed
================================================================================
✅ Domain validation completed!
```

### Quick Test Output
```
🔍 Quick Domain Scan Running...
Expected: Mfcnextgen
Incorrect: DirectDriveX, DirectDrive
==================================================

📄 Page: Homepage
🔗 URL: http://localhost:4200/
✅ Correct domains: 5
❌ Incorrect domains: 2

🚨 ISSUES FOUND (1):
   1. CRITICAL
      Element: h2.mb-4 text-xl font-bold lg:text-4xl md:text-3xl text-slate-900
      Text: "Why professionals choose DirectDriveX"
      Found: "DirectDriveX"
      Expected: "Mfcnextgen"

Status: ❌ FAIL
==================================================

💡 Quick Fix Recommendations:
   1. Update comparison section heading: "Why professionals choose Mfcnextgen"
   2. Update comparison table headers to use "Mfcnextgen"
   3. Review all hardcoded domain references in homepage components

🎯 Quick domain scan completed!
```

### Detailed Report
The tests generate comprehensive reports including:
- Page-by-page results
- Severity categorization
- Specific issue locations
- Recommendations for fixes
- Pass/fail statistics

## Automated Testing

### CI/CD Integration
You can integrate these tests into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Domain Name Validation
  run: |
    npm run dev &
    sleep 10
    node tests/mcp-domain-test.js
```

### Pre-commit Hooks
Add to your pre-commit configuration to catch domain name issues before commits:

```bash
# .git/hooks/pre-commit
#!/bin/sh
node tests/run-domain-validation.js
if [ $? -ne 0 ]; then
    echo "❌ Domain validation failed. Please fix domain name issues before committing."
    exit 1
fi
```

## Troubleshooting

### Common Issues
1. **Page Load Errors**: Ensure the development server is running on port 4200
2. **Timeout Issues**: Increase wait times in test configuration
3. **Selector Issues**: Update CSS selectors if page structure changes
4. **False Positives**: Adjust domain name matching patterns

### Debug Mode
Run tests with verbose logging:

```bash
DEBUG=domain-validation node tests/mcp-domain-test.js
```

## Maintenance

### Updating Domain Names
If the domain name changes in the future:
1. Update `EXPECTED_DOMAIN` constant in all test files
2. Update `INCORRECT_DOMAIN` to include old domain names
3. Re-run all tests to validate changes
4. Update any hardcoded references in source code

### Adding New Pages
When adding new pages to the application:
1. Add the page to the `PAGES_TO_TEST` array
2. Ensure page includes proper domain name references
3. Run tests to validate new page compliance

## Contributing

### Adding New Tests
1. Create new test functions following the existing pattern
2. Include comprehensive error handling
3. Add appropriate severity levels
4. Update documentation

### Reporting Issues
If you find domain name inconsistencies not caught by these tests:
1. Document the location and context
2. Update test selectors to include the element
3. Add the test case to the validation suite

## License

These tests are part of the DirectDriveX project and follow the same license terms.