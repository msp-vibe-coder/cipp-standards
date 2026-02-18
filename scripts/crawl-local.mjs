import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:3001';

// Use __dirname equivalent for ESM, then navigate to screenshots dir relative to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'screenshots');

async function main() {
  console.log('Launching Chromium (headless)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // ── Step 1: Navigate and wait for full load ──
  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Extra wait for client-side hydration
  await page.waitForTimeout(2000);

  // ── Step 2: Full-page screenshot ──
  const fullPath = join(SCREENSHOTS_DIR, 'local-full.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`Full-page screenshot saved: ${fullPath}`);

  // ── Step 3: Viewport screenshot (1280x900) ──
  const vpPath = join(SCREENSHOTS_DIR, 'local-viewport.png');
  await page.screenshot({ path: vpPath, fullPage: false });
  console.log(`Viewport screenshot saved: ${vpPath}`);

  // ── Step 4: Extract structured info ──
  console.log('\nExtracting page info...');
  const info = await page.evaluate(() => {
    const result = {};

    // Page title
    result.pageTitle = document.title;

    // Header text content
    const header = document.querySelector('header');
    result.headerText = header ? header.textContent.trim().replace(/\s+/g, ' ') : null;

    // Hero section text
    const heroSection = document.querySelector('section');
    if (heroSection) {
      const h1 = heroSection.querySelector('h1');
      const p = heroSection.querySelector('p');
      result.heroTitle = h1 ? h1.textContent.trim() : null;
      result.heroSubtitle = p ? p.textContent.trim() : null;
    } else {
      result.heroTitle = null;
      result.heroSubtitle = null;
    }

    // Dashboard cards - the Dashboard component uses a grid with 3 cards
    const dashboardGrid = document.querySelector('.grid.gap-4');
    const dashboardCards = dashboardGrid ? dashboardGrid.children : [];
    result.dashboardCardCount = dashboardCards.length;
    result.dashboardCardTitles = Array.from(dashboardCards).map(card => {
      const heading = card.querySelector('h2, h3, [class*="font-semibold"], [class*="font-bold"]');
      return heading ? heading.textContent.trim() : card.textContent.trim().substring(0, 80);
    });

    // Standard cards - they are in <div class="space-y-3"> and each has a rounded-xl border
    const standardsContainer = document.querySelector('.space-y-3');
    const standardCards = standardsContainer
      ? standardsContainer.querySelectorAll('[class*="rounded-xl"][class*="border"][class*="bg-surface"]')
      : [];
    result.standardCardCount = standardCards.length;

    // First 3 standard card titles
    result.firstThreeStandardTitles = Array.from(standardCards).slice(0, 3).map(card => {
      const h3 = card.querySelector('h3');
      return h3 ? h3.textContent.trim() : null;
    });

    // Filter bar buttons/labels
    const filterBar = document.querySelector('.flex.flex-wrap.items-center.gap-3');
    if (filterBar) {
      const buttons = filterBar.querySelectorAll('button');
      result.filterBarLabels = Array.from(buttons).map(btn => btn.textContent.trim()).filter(t => t.length > 0);
      // Also get search input placeholder
      const searchInput = filterBar.querySelector('input');
      result.searchPlaceholder = searchInput ? searchInput.placeholder : null;
    } else {
      result.filterBarLabels = [];
      result.searchPlaceholder = null;
    }

    return result;
  });

  // Log extracted info
  console.log('\n=== Extracted Page Info ===');
  console.log(`Page Title: ${info.pageTitle}`);
  console.log(`Header Text: ${info.headerText}`);
  console.log(`Hero Title: ${info.heroTitle}`);
  console.log(`Hero Subtitle: ${info.heroSubtitle}`);
  console.log(`Dashboard Cards: ${info.dashboardCardCount}`);
  console.log(`Dashboard Card Titles: ${JSON.stringify(info.dashboardCardTitles)}`);
  console.log(`Standard Cards Count: ${info.standardCardCount}`);
  console.log(`First 3 Standard Titles: ${JSON.stringify(info.firstThreeStandardTitles)}`);
  console.log(`Filter Bar Labels: ${JSON.stringify(info.filterBarLabels)}`);
  console.log(`Search Placeholder: ${info.searchPlaceholder}`);

  // ── Step 5: Click/expand first standard card ──
  console.log('\nExpanding first standard card...');
  try {
    // The expand button is inside each standard card with aria-expanded attribute
    const expandButton = page.locator('[aria-expanded]').first();
    await expandButton.click();
    // Wait for the accordion animation
    await page.waitForTimeout(500);

    const expandedPath = join(SCREENSHOTS_DIR, 'local-expanded.png');
    // Scroll to the expanded card first
    await expandButton.scrollIntoViewIfNeeded();
    await page.screenshot({ path: expandedPath, fullPage: false });
    console.log(`Expanded card screenshot saved: ${expandedPath}`);
  } catch (err) {
    console.error(`Failed to expand first standard card: ${err.message}`);
    // Try alternative: click the first button in the standards list
    try {
      const firstCard = page.locator('.space-y-3 > div').first();
      await firstCard.locator('button').first().click();
      await page.waitForTimeout(500);
      const expandedPath = join(SCREENSHOTS_DIR, 'local-expanded.png');
      await page.screenshot({ path: expandedPath, fullPage: false });
      console.log(`Expanded card screenshot saved (fallback): ${expandedPath}`);
    } catch (err2) {
      console.error(`Fallback also failed: ${err2.message}`);
    }
  }

  // ── Step 6: Save all info to JSON ──
  const jsonPath = join(SCREENSHOTS_DIR, 'local-info.json');
  const jsonData = {
    ...info,
    crawledAt: new Date().toISOString(),
    url: BASE_URL,
  };
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
  console.log(`\nInfo saved to: ${jsonPath}`);

  await browser.close();
  console.log('\nDone! Browser closed.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
