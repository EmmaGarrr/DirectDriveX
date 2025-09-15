import { test, expect } from '@playwright/test';

// Domain name validation configuration
const EXPECTED_DOMAIN = 'Mfcnextgen';
const INCORRECT_DOMAIN = 'DirectDriveX';
const BASE_URL = 'http://localhost:4200';

// Pages to test for domain name consistency
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login Page' },
  { path: '/register', name: 'Register Page' },
  { path: '/how-it-works', name: 'How It Works Page' },
  { path: '/security', name: 'Security Page' },
  { path: '/enterprise', name: 'Enterprise Page' },
  { path: '/support', name: 'Support Page' },
  { path: '/privacy', name: 'Privacy Policy Page' },
  { path: '/terms', name: 'Terms of Service Page' },
  { path: '/cookies', name: 'Cookie Policy Page' },
  { path: '/status', name: 'System Status Page' },
  { path: '/api-docs', name: 'API Documentation Page' }
];

test.describe('Domain Name Consistency Validation', () => {
  let domainIssues: Array<{
    page: string;
    location: string;
    found: string;
    expected: string;
    severity: 'high' | 'medium' | 'low';
  }> = [];

  test.beforeEach(async ({ page }) => {
    // Clear issues array before each test
    domainIssues = [];
  });

  test.afterAll(async () => {
    // Generate comprehensive report
    console.log('\n=== DOMAIN NAME CONSISTENCY REPORT ===\n');

    if (domainIssues.length === 0) {
      console.log('✅ All domain names are consistent with expected branding:', EXPECTED_DOMAIN);
      return;
    }

    // Group issues by severity
    const highSeverityIssues = domainIssues.filter(issue => issue.severity === 'high');
    const mediumSeverityIssues = domainIssues.filter(issue => issue.severity === 'medium');
    const lowSeverityIssues = domainIssues.filter(issue => issue.severity === 'low');

    console.log(`❌ Found ${domainIssues.length} domain name consistency issues:\n`);

    if (highSeverityIssues.length > 0) {
      console.log('🔴 HIGH SEVERITY ISSUES:');
      highSeverityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. Page: ${issue.page}`);
        console.log(`   Location: ${issue.location}`);
        console.log(`   Found: "${issue.found}"`);
        console.log(`   Expected: "${issue.expected}"`);
        console.log('');
      });
    }

    if (mediumSeverityIssues.length > 0) {
      console.log('🟡 MEDIUM SEVERITY ISSUES:');
      mediumSeverityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. Page: ${issue.page}`);
        console.log(`   Location: ${issue.location}`);
        console.log(`   Found: "${issue.found}"`);
        console.log(`   Expected: "${issue.expected}"`);
        console.log('');
      });
    }

    if (lowSeverityIssues.length > 0) {
      console.log('🟢 LOW SEVERITY ISSUES:');
      lowSeverityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. Page: ${issue.page}`);
        console.log(`   Location: ${issue.location}`);
        console.log(`   Found: "${issue.found}"`);
        console.log(`   Expected: "${issue.expected}"`);
        console.log('');
      });
    }

    console.log('=== END REPORT ===\n');
  });

  // Helper function to check domain name in text content
  async function checkDomainNameInText(
    page: any,
    selector: string,
    locationName: string,
    severity: 'high' | 'medium' | 'low' = 'high'
  ) {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        if (text) {
          if (text.includes(INCORRECT_DOMAIN)) {
            domainIssues.push({
              page: page.url(),
              location: locationName,
              found: INCORRECT_DOMAIN,
              expected: EXPECTED_DOMAIN,
              severity
            });
          }
          if (!text.includes(EXPECTED_DOMAIN) && text.includes(INCORRECT_DOMAIN)) {
            // Additional check for expected domain absence when incorrect is present
            domainIssues.push({
              page: page.url(),
              location: `${locationName} (missing expected domain)`,
              found: INCORRECT_DOMAIN,
              expected: EXPECTED_DOMAIN,
              severity
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Could not check ${locationName}:`, error);
    }
  }

  // Helper function to validate page title
  async function validatePageTitle(page: any, pageName: string) {
    const title = await page.title();
    if (!title.includes(EXPECTED_DOMAIN)) {
      domainIssues.push({
        page: pageName,
        location: 'Page Title',
        found: title,
        expected: `Should contain ${EXPECTED_DOMAIN}`,
        severity: 'high'
      });
    }
  }

  // Test all pages for domain name consistency
  for (const pageInfo of PAGES_TO_TEST) {
    test(`Domain name consistency on ${pageInfo.name}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Validate page title
      await validatePageTitle(page, pageInfo.name);

      // Check header logo
      await checkDomainNameInText(page, 'a[href="/"] span', 'Header Logo');

      // Check footer elements
      await checkDomainNameInText(page, 'footer a[href="/"] span', 'Footer Logo');
      await checkDomainNameInText(page, 'footer p', 'Footer Copyright');

      // Check comparison section (specific to homepage)
      if (pageInfo.path === '/') {
        await checkDomainNameInText(page, 'h2', 'Comparison Section Heading');
        await checkDomainNameInText(page, '.comparison-table', 'Comparison Table');
      }

      // Check all headings for domain names
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements: any[]) =>
        elements.map(el => el.textContent?.trim() || '')
      );

      headings.forEach((heading, index) => {
        if (heading.includes(INCORRECT_DOMAIN)) {
          domainIssues.push({
            page: pageInfo.name,
            location: `Heading H${index + 1}`,
            found: INCORRECT_DOMAIN,
            expected: EXPECTED_DOMAIN,
            severity: 'high'
          });
        }
      });

      // Check for domain name in page body content
      const bodyText = await page.textContent('body');
      const incorrectDomainCount = (bodyText.match(new RegExp(INCORRECT_DOMAIN, 'g')) || []).length;
      const correctDomainCount = (bodyText.match(new RegExp(EXPECTED_DOMAIN, 'g')) || []).length;

      if (incorrectDomainCount > 0) {
        domainIssues.push({
          page: pageInfo.name,
          location: 'Page Body Content',
          found: `Found ${incorrectDomainCount} instances of "${INCORRECT_DOMAIN}"`,
          expected: `Should use "${EXPECTED_DOMAIN}"`,
          severity: 'medium'
        });
      }

      // Log page-specific results
      console.log(`${pageInfo.name}: Correct domains: ${correctDomainCount}, Incorrect domains: ${incorrectDomainCount}`);
    });
  }

  // Specific test for comparison section components
  test('Comparison section domain validation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check if comparison section exists
    const comparisonSection = await page.$('h2:has-text("choose")');
    if (comparisonSection) {
      const sectionText = await comparisonSection.textContent();

      if (sectionText?.includes(INCORRECT_DOMAIN)) {
        domainIssues.push({
          page: 'Homepage',
          location: 'Comparison Section Heading',
          found: INCORRECT_DOMAIN,
          expected: EXPECTED_DOMAIN,
          severity: 'high'
        });
      }
    }

    // Check comparison table
    const tableHeaders = await page.$$eval('table th, .generic:contains("DirectDriveX"), .generic:contains("Mfcnextgen")',
      (elements: any[]) => elements.map(el => el.textContent?.trim() || '')
    );

    tableHeaders.forEach(header => {
      if (header.includes(INCORRECT_DOMAIN)) {
        domainIssues.push({
          page: 'Homepage',
          location: 'Comparison Table Header',
          found: INCORRECT_DOMAIN,
          expected: EXPECTED_DOMAIN,
          severity: 'high'
        });
      }
    });
  });

  // Test for domain name consistency in navigation
  test('Navigation domain name consistency', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check navigation links
    const navLinks = await page.$$eval('nav a, header a', (links: any[]) =>
      links.map(link => link.textContent?.trim() || '')
    );

    navLinks.forEach(linkText => {
      if (linkText.includes(INCORRECT_DOMAIN)) {
        domainIssues.push({
          page: 'Navigation',
          location: 'Navigation Link',
          found: INCORRECT_DOMAIN,
          expected: EXPECTED_DOMAIN,
          severity: 'high'
        });
      }
    });
  });

  // Test for domain name in meta tags and other HTML elements
  test('Meta tags and HTML elements domain validation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check meta description
    const metaDescription = await page.$eval('meta[name="description"]', (meta: any) =>
      meta.getAttribute('content') || ''
    );

    if (metaDescription.includes(INCORRECT_DOMAIN)) {
      domainIssues.push({
        page: 'Homepage',
        location: 'Meta Description',
        found: INCORRECT_DOMAIN,
        expected: EXPECTED_DOMAIN,
        severity: 'medium'
      });
    }

    // Check Open Graph tags
    const ogTitle = await page.$eval('meta[property="og:title"]', (meta: any) =>
      meta.getAttribute('content') || ''
    );

    if (ogTitle.includes(INCORRECT_DOMAIN)) {
      domainIssues.push({
        page: 'Homepage',
        location: 'Open Graph Title',
        found: INCORRECT_DOMAIN,
        expected: EXPECTED_DOMAIN,
        severity: 'medium'
      });
    }
  });

  // Test footer domain name consistency
  test('Footer domain name validation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check footer copyright
    await checkDomainNameInText(page, 'footer', 'Footer Content', 'high');

    // Check footer links
    const footerLinks = await page.$$eval('footer a', (links: any[]) =>
      links.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href') || ''
      }))
    );

    footerLinks.forEach(link => {
      if (link.text.includes(INCORRECT_DOMAIN)) {
        domainIssues.push({
          page: 'Footer',
          location: `Footer Link: ${link.text}`,
          found: INCORRECT_DOMAIN,
          expected: EXPECTED_DOMAIN,
          severity: 'high'
        });
      }

      // Check email links
      if (link.href.includes('mailto:') && link.href.includes(INCORRECT_DOMAIN.toLowerCase())) {
        domainIssues.push({
          page: 'Footer',
          location: `Email Link: ${link.href}`,
          found: INCORRECT_DOMAIN.toLowerCase(),
          expected: EXPECTED_DOMAIN.toLowerCase(),
          severity: 'high'
        });
      }
    });
  });
});

// Additional utility test for comprehensive domain name scanning
test.describe('Comprehensive Domain Name Scan', () => {
  test('Full text content domain scan', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Get all text content
    const allText = await page.textContent('body');

    // Find all instances of domain names
    const incorrectMatches = allText.match(new RegExp(INCORRECT_DOMAIN, 'g')) || [];
    const correctMatches = allText.match(new RegExp(EXPECTED_DOMAIN, 'g')) || [];

    console.log(`Domain Name Scan Results:`);
    console.log(`- Correct domain (${EXPECTED_DOMAIN}): ${correctMatches.length} instances`);
    console.log(`- Incorrect domain (${INCORRECT_DOMAIN}): ${incorrectMatches.length} instances`);

    if (incorrectMatches.length > 0) {
      throw new Error(`Found ${incorrectMatches.length} instances of incorrect domain name "${INCORRECT_DOMAIN}"`);
    }
  });
});

export { domainIssues };