# Playwright MCP Integration Guide

## Overview
Playwright MCP provides comprehensive browser automation capabilities through accessibility tree snapshots, enabling reliable web interaction without relying on screenshots.

## Installation Status
✅ **Installed**: `claude mcp add playwright npx @playwright/mcp@latest`
✅ **Connected**: MCP server is running and ready to use

## Available Tools

### Navigation & Control
- `browser_navigate` - Navigate to URLs
- `browser_navigate_back` - Go back in browser history
- `browser_close` - Close the current page
- `browser_resize` - Resize browser window

### Interaction & Input
- `browser_click` - Click on elements
- `browser_fill_form` - Fill multiple form fields
- `browser_hover` - Hover over elements
- `browser_press_key` - Press keyboard keys
- `browser_select_option` - Select dropdown options
- `browser_file_upload` - Upload files
- `browser_drag` - Drag and drop between elements

### Debugging & Analysis
- `browser_snapshot` - Capture accessibility snapshots
- `browser_take_screenshot` - Take screenshots
- `browser_console_messages` - Get console messages
- `browser_network_requests` - List network requests
- `browser_evaluate` - Execute JavaScript
- `browser_handle_dialog` - Handle browser dialogs

## Quick Start Examples

### Basic Navigation
```bash
# Navigate to a website
claude "Navigate to https://example.com using browser_navigate"

# Take an accessibility snapshot
claude "Take a snapshot of the current page using browser_snapshot"
```

### Form Interaction
```bash
# Fill a login form
claude "Fill the login form with username: user@example.com and password: mypassword using browser_fill_form"

# Click the submit button
claude "Click the login button using browser_click"
```

### Debugging
```bash
# Take a screenshot
claude "Take a screenshot of the current page using browser_take_screenshot"

# Check console messages
claude "Get console messages using browser_console_messages"
```

## Configuration
The MCP server is configured with optimal settings in `playwright-mcp-config.json`:
- Browser: Chromium (headless)
- Viewport: 1280x720
- Timeout: 30 seconds
- HTTPS errors ignored for testing

## Best Practices
1. **Use accessibility snapshots** instead of visual inspection for element location
2. **Wait for navigation** before attempting to interact with new pages
3. **Handle dialogs** and pop-ups proactively
4. **Use timeouts** appropriately for different page load times
5. **Test locally** before running on production sites

## Troubleshooting
- If MCP tools are not available, restart Claude Code CLI
- Check browser compatibility for target websites
- Use headless mode for faster automation
- Enable screenshot debugging for visual verification