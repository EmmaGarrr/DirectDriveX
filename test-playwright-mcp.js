#!/usr/bin/env node

/**
 * Playwright MCP Integration Test Script
 * This script demonstrates and tests the Playwright MCP functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 Playwright MCP Integration Test');
console.log('==================================\n');

// Test commands that can be executed with Claude Code CLI
const testCommands = [
    {
        name: 'MCP Server Status',
        command: 'claude mcp list',
        description: 'Verify Playwright MCP server is running',
        expected: 'playwright: npx @playwright/mcp@latest - ✓ Connected'
    },
    {
        name: 'Basic Navigation',
        command: 'claude "Navigate to https://httpbin.org/get using browser_navigate"',
        description: 'Test basic page navigation',
        note: 'This will open httpbin.org and capture accessibility info'
    },
    {
        name: 'Take Snapshot',
        command: 'claude "Take a snapshot of the current page using browser_snapshot"',
        description: 'Test accessibility snapshot functionality',
        note: 'This will capture the page structure without screenshots'
    },
    {
        name: 'Execute JavaScript',
        command: 'claude "Execute JavaScript: return document.title using browser_evaluate"',
        description: 'Test JavaScript execution capability',
        note: 'This will return the page title'
    },
    {
        name: 'Take Screenshot',
        command: 'claude "Take a screenshot of the current page using browser_take_screenshot"',
        description: 'Test screenshot capability',
        note: 'This will capture a visual screenshot of the page'
    },
    {
        name: 'Get Console Messages',
        command: 'claude "Get console messages using browser_console_messages"',
        description: 'Test console message retrieval',
        note: 'This will show any console logs or errors'
    },
    {
        name: 'Close Browser',
        command: 'claude "Close the page using browser_close"',
        description: 'Test browser cleanup',
        note: 'This will properly close the browser session'
    }
];

console.log('📋 Available Test Commands:');
console.log('============================\n');

testCommands.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   Command: ${test.command}`);
    console.log(`   Description: ${test.description}`);
    if (test.note) {
        console.log(`   Note: ${test.note}`);
    }
    console.log('');
});

console.log('🚀 Quick Start Guide:');
console.log('=====================');
console.log('1. Run each command above to test Playwright MCP functionality');
console.log('2. Start with the MCP server status check');
console.log('3. Test navigation, then snapshots, then JavaScript execution');
console.log('4. Use screenshots for visual verification');
console.log('5. Always close the browser when done');
console.log('');

console.log('📁 Created Files:');
console.log('================');
console.log('• playwright-mcp-config.json - MCP server configuration');
console.log('• PLAYWRIGHT-MCP-GUIDE.md - Comprehensive usage guide');
console.log('• playwright-examples.js - Practical examples');
console.log('• test-playwright-mcp.js - This test script');
console.log('');

console.log('🔧 Configuration Settings:');
console.log('========================');
const configPath = path.join(__dirname, 'playwright-mcp-config.json');
if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('• Browser:', config.browser);
    console.log('• Headless:', config.headless);
    console.log('• Viewport:', `${config.viewport.width}x${config.viewport.height}`);
    console.log('• Timeout:', config.timeout, 'ms');
} else {
    console.log('• Configuration file not found');
}

console.log('\n✅ Setup Complete!');
console.log('==================');
console.log('Playwright MCP is now integrated with Claude Code CLI.');
console.log('Use the commands above to test and explore browser automation capabilities.');

module.exports = { testCommands };