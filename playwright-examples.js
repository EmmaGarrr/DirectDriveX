// Playwright MCP Example Scripts
// These are example commands you can use with Claude Code CLI

// Basic Navigation Example
const navigationExample = `
claude "Navigate to https://www.google.com using browser_navigate"
claude "Take a snapshot of the page using browser_snapshot"
claude "Type 'Claude Code' in the search box using browser_fill_form"
claude "Press Enter using browser_press_key with key: Enter"
`;

// Form Filling Example
const formExample = `
claude "Navigate to https://github.com/login using browser_navigate"
claude "Fill login form with username: test@example.com and password: testpass123 using browser_fill_form"
claude "Take a screenshot using browser_take_screenshot"
claude "Click the sign-in button using browser_click"
`;

// File Upload Example
const uploadExample = `
claude "Navigate to https://example.com/upload using browser_navigate"
claude "Upload file: test.txt using browser_file_upload"
claude "Fill the form with title: Test Upload and description: This is a test using browser_fill_form"
claude "Click submit button using browser_click"
`;

// Testing and Debugging Example
const debugExample = `
claude "Navigate to https://example.com using browser_navigate"
claude "Take accessibility snapshot using browser_snapshot"
claude "Get console messages using browser_console_messages"
claude "List network requests using browser_network_requests"
claude "Execute JavaScript: return document.title using browser_evaluate"
`;

// Complex Workflow Example
const workflowExample = `
claude "Navigate to https://example.com using browser_navigate"
claude "Wait for page to load and take snapshot using browser_snapshot"
claude "Click on the products link using browser_click"
claude "Wait for navigation and take another snapshot using browser_snapshot"
claude "Click on the first product using browser_click"
claude "Take screenshot of product page using browser_take_screenshot"
claude "Get page title using browser_evaluate with script: return document.title"
`;

module.exports = {
  navigationExample,
  formExample,
  uploadExample,
  debugExample,
  workflowExample
};