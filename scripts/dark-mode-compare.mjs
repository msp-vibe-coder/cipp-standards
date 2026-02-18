import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'screenshots');

const LOCAL_URL = 'http://localhost:3001';
const ORIGINAL_URL = 'https://standards.cipp.app/';

// CSS variables to extract from <html>
const CSS_VARS = [
  '--color-surface',
  '--color-surface-secondary',
  '--color-page-bg',
  '--color-border',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-tertiary',
  '--color-code-bg',
  '--color-brand-primary',
  '--color-brand-primary-light',
  '--color-brand-accent-light',
  '--color-impact-badge-high-bg',
  '--color-impact-badge-high-text',
  '--color-impact-badge-medium-bg',
  '--color-impact-badge-medium-text',
  '--color-impact-badge-low-bg',
  '--color-impact-badge-low-text',
  '--color-impact-high',
  '--color-impact-medium',
  '--color-impact-low',
];

// Elements to compare computed styles on
const ELEMENT_SELECTORS = {
  body: 'body',
  header: 'header',
  headerButton: 'header button',
  heroTitle: 'section h1',
  heroSubtitle: 'section p',
  dashboardCard1: '.grid.gap-4 > div:nth-child(1)',
  dashboardCard2: '.grid.gap-4 > div:nth-child(2)',
  dashboardCard3: '.grid.gap-4 > div:nth-child(3)',
  searchInput: 'input[placeholder*="Search"]',
  firstStandardCard: '.space-y-3 > div:first-child, .space-y-3 > button:first-child',
};

async function activateDarkMode(page, url) {
  // Navigate first to set localStorage on the correct origin
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  // Set dark mode in localStorage
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
  });
  // Reload so the inline <script> in <head> picks it up
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Verify dark mode is active
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  console.log(`  Dark class on <html>: ${hasDarkClass}`);
  return hasDarkClass;
}

async function extractDarkStyles(page) {
  return await page.evaluate(({ vars, selectors }) => {
    const result = { cssVars: {}, elements: {} };

    // Extract CSS custom properties from <html>
    const htmlStyles = getComputedStyle(document.documentElement);
    for (const v of vars) {
      result.cssVars[v] = htmlStyles.getPropertyValue(v).trim();
    }

    // Extract computed styles from key elements
    for (const [name, selector] of Object.entries(selectors)) {
      const el = document.querySelector(selector);
      if (!el) {
        result.elements[name] = null;
        continue;
      }
      const cs = getComputedStyle(el);
      result.elements[name] = {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderColor,
        background: cs.background?.substring(0, 300),
        classes: el.className?.substring?.(0, 300) || '',
      };
    }

    // Also grab impact row buttons and category buttons
    const impactCard = (() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"]');
      for (const card of cards) {
        if (card.textContent.includes('Impact Distribution')) {
          const buttons = card.querySelectorAll('button');
          return [...buttons].map(b => {
            const cs = getComputedStyle(b);
            return {
              text: b.textContent.trim().replace(/\s+/g, ' '),
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              borderColor: cs.borderColor,
            };
          });
        }
      }
      return [];
    })();
    result.elements.impactButtons = impactCard;

    const categoryCard = (() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"]');
      for (const card of cards) {
        if (card.textContent.includes('Category Distribution')) {
          const buttons = card.querySelectorAll('button');
          return [...buttons].slice(0, 4).map(b => {
            const cs = getComputedStyle(b);
            return {
              text: b.textContent.trim().replace(/\s+/g, ' '),
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              borderColor: cs.borderColor,
            };
          });
        }
      }
      return [];
    })();
    result.elements.categoryButtons = categoryCard;

    // First standard card details (h3, impact badge, help text)
    const standardCardDetails = (() => {
      const h3s = [...document.querySelectorAll('h3')];
      const cardH3 = h3s.find(h => !['Impact Distribution', 'Category Distribution', 'Filtered Standards'].includes(h.textContent.trim()));
      if (!cardH3) return null;
      const cs = getComputedStyle(cardH3);
      // Find nearby impact badge
      const card = cardH3.closest('[class*="rounded"]') || cardH3.parentElement;
      const badge = card?.querySelector('[class*="impact"], [class*="badge"], span[class*="text-impact"]');
      const badgeStyles = badge ? {
        backgroundColor: getComputedStyle(badge).backgroundColor,
        color: getComputedStyle(badge).color,
        text: badge.textContent.trim(),
      } : null;
      return {
        h3Color: cs.color,
        h3Text: cardH3.textContent.trim().substring(0, 80),
        badge: badgeStyles,
      };
    })();
    result.elements.standardCardDetails = standardCardDetails;

    return result;
  }, { vars: CSS_VARS, selectors: ELEMENT_SELECTORS });
}

async function crawlDarkMode(url, prefix) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Dark mode crawl: ${url}`);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });

  // Activate dark mode
  const darkActive = await activateDarkMode(page, url);
  if (!darkActive) {
    console.log('  WARNING: Dark mode class not detected on <html>!');
  }

  // Full page screenshot
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${prefix}-dark-full.png`),
    fullPage: true,
  });
  console.log(`  Screenshot: ${prefix}-dark-full.png`);

  // Viewport screenshot
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${prefix}-dark-viewport.png`),
  });
  console.log(`  Screenshot: ${prefix}-dark-viewport.png`);

  // Extract styles
  const styles = await extractDarkStyles(page);

  // Try to expand a standard card for expanded screenshot
  try {
    const expandBtn = page.locator('button[aria-expanded]').first();
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    } else {
      const cards = page.locator('.space-y-3 button, [class*="rounded-xl"] button');
      if (await cards.count() > 3) {
        await cards.nth(3).click();
        await page.waitForTimeout(500);
      }
    }
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, `${prefix}-dark-expanded.png`),
      fullPage: false,
    });
    console.log(`  Screenshot: ${prefix}-dark-expanded.png`);
  } catch (e) {
    console.log(`  Could not expand card: ${e.message}`);
  }

  await browser.close();
  return { darkActive, styles };
}

function parseColor(colorStr) {
  if (!colorStr) return null;
  // Normalize rgb/rgba strings for comparison
  return colorStr.replace(/\s+/g, '').toLowerCase();
}

function colorsMatch(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return parseColor(a) === parseColor(b);
}

function compareDarkModes(original, local) {
  console.log('\n' + '='.repeat(60));
  console.log('DARK MODE COMPARISON RESULTS');
  console.log('='.repeat(60));

  const mismatches = [];
  const matches = [];

  // 1. Compare CSS variables
  console.log('\n--- CSS Variable Comparison ---');
  const varTable = [];
  for (const varName of CSS_VARS) {
    const origVal = original.styles.cssVars[varName] || '(not set)';
    const localVal = local.styles.cssVars[varName] || '(not set)';
    const match = origVal === localVal;
    varTable.push({
      variable: varName,
      original: origVal,
      local: localVal,
      match: match ? 'YES' : 'NO',
    });
    if (match) {
      matches.push(`CSS var ${varName}: ${localVal}`);
    } else {
      mismatches.push({
        type: 'css-variable',
        name: varName,
        original: origVal,
        local: localVal,
      });
    }
  }
  console.table(varTable);

  // 2. Compare element computed styles
  console.log('\n--- Element Style Comparison ---');
  const elemTable = [];
  const simpleElements = ['body', 'header', 'headerButton', 'heroTitle', 'heroSubtitle',
    'dashboardCard1', 'dashboardCard2', 'dashboardCard3', 'searchInput', 'firstStandardCard'];

  for (const name of simpleElements) {
    const origEl = original.styles.elements[name];
    const localEl = local.styles.elements[name];

    if (!origEl && !localEl) {
      elemTable.push({ element: name, property: '-', original: '(not found)', local: '(not found)', match: 'SKIP' });
      continue;
    }
    if (!origEl || !localEl) {
      elemTable.push({ element: name, property: '-', original: origEl ? 'found' : '(not found)', local: localEl ? 'found' : '(not found)', match: 'NO' });
      mismatches.push({ type: 'element-missing', name, original: !!origEl, local: !!localEl });
      continue;
    }

    for (const prop of ['backgroundColor', 'color', 'borderColor']) {
      const match = colorsMatch(origEl[prop], localEl[prop]);
      elemTable.push({
        element: name,
        property: prop,
        original: origEl[prop] || '(none)',
        local: localEl[prop] || '(none)',
        match: match ? 'YES' : 'NO',
      });
      if (match) {
        matches.push(`${name}.${prop}: ${localEl[prop]}`);
      } else {
        mismatches.push({
          type: 'element-style',
          element: name,
          property: prop,
          original: origEl[prop],
          local: localEl[prop],
        });
      }
    }
  }
  console.table(elemTable);

  // 3. Compare impact buttons
  console.log('\n--- Impact Button Comparison ---');
  const origImpact = original.styles.elements.impactButtons || [];
  const localImpact = local.styles.elements.impactButtons || [];
  const impactTable = [];
  const maxImpact = Math.max(origImpact.length, localImpact.length);
  for (let i = 0; i < maxImpact; i++) {
    const o = origImpact[i];
    const l = localImpact[i];
    if (!o || !l) {
      impactTable.push({ index: i, text: o?.text || l?.text || '?', status: 'MISSING' });
      mismatches.push({ type: 'impact-button-missing', index: i });
      continue;
    }
    for (const prop of ['backgroundColor', 'color', 'borderColor']) {
      const match = colorsMatch(o[prop], l[prop]);
      impactTable.push({ index: i, text: o.text.substring(0, 20), property: prop, original: o[prop], local: l[prop], match: match ? 'YES' : 'NO' });
      if (!match) {
        mismatches.push({ type: 'impact-button-style', index: i, text: o.text, property: prop, original: o[prop], local: l[prop] });
      }
    }
  }
  if (impactTable.length > 0) console.table(impactTable);

  // 4. Compare category buttons
  console.log('\n--- Category Button Comparison ---');
  const origCat = original.styles.elements.categoryButtons || [];
  const localCat = local.styles.elements.categoryButtons || [];
  const catTable = [];
  const maxCat = Math.max(origCat.length, localCat.length);
  for (let i = 0; i < maxCat; i++) {
    const o = origCat[i];
    const l = localCat[i];
    if (!o || !l) {
      catTable.push({ index: i, text: o?.text || l?.text || '?', status: 'MISSING' });
      continue;
    }
    for (const prop of ['backgroundColor', 'color']) {
      const match = colorsMatch(o[prop], l[prop]);
      catTable.push({ index: i, text: o.text.substring(0, 20), property: prop, original: o[prop], local: l[prop], match: match ? 'YES' : 'NO' });
      if (!match) {
        mismatches.push({ type: 'category-button-style', index: i, text: o.text, property: prop, original: o[prop], local: l[prop] });
      }
    }
  }
  if (catTable.length > 0) console.table(catTable);

  // 5. Standard card details
  console.log('\n--- Standard Card Details ---');
  const origCard = original.styles.elements.standardCardDetails;
  const localCard = local.styles.elements.standardCardDetails;
  if (origCard && localCard) {
    if (!colorsMatch(origCard.h3Color, localCard.h3Color)) {
      mismatches.push({ type: 'card-h3-color', original: origCard.h3Color, local: localCard.h3Color });
    }
    if (origCard.badge && localCard.badge) {
      if (!colorsMatch(origCard.badge.backgroundColor, localCard.badge.backgroundColor)) {
        mismatches.push({ type: 'card-badge-bg', original: origCard.badge.backgroundColor, local: localCard.badge.backgroundColor });
      }
      if (!colorsMatch(origCard.badge.color, localCard.badge.color)) {
        mismatches.push({ type: 'card-badge-color', original: origCard.badge.color, local: localCard.badge.color });
      }
    }
    console.log(`  Original card h3 color: ${origCard.h3Color}`);
    console.log(`  Local card h3 color: ${localCard.h3Color}`);
    if (origCard.badge) console.log(`  Original badge: bg=${origCard.badge.backgroundColor} color=${origCard.badge.color}`);
    if (localCard.badge) console.log(`  Local badge: bg=${localCard.badge.backgroundColor} color=${localCard.badge.color}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Matches: ${matches.length}`);
  console.log(`  Mismatches: ${mismatches.length}`);

  if (mismatches.length > 0) {
    console.log('\n  MISMATCHES:');
    for (const m of mismatches) {
      if (m.type === 'css-variable') {
        console.log(`    CSS var ${m.name}: original="${m.original}" vs local="${m.local}"`);
      } else if (m.type === 'element-style') {
        console.log(`    ${m.element}.${m.property}: original="${m.original}" vs local="${m.local}"`);
      } else if (m.type === 'impact-button-style') {
        console.log(`    Impact[${m.index}] ${m.text} .${m.property}: original="${m.original}" vs local="${m.local}"`);
      } else if (m.type === 'category-button-style') {
        console.log(`    Category[${m.index}] ${m.text} .${m.property}: original="${m.original}" vs local="${m.local}"`);
      } else {
        console.log(`    ${JSON.stringify(m)}`);
      }
    }
  } else {
    console.log('\n  All dark mode styles match!');
  }

  return { matches, mismatches };
}

async function main() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  // Crawl local site in dark mode
  const localData = await crawlDarkMode(LOCAL_URL, 'local');

  // Crawl original site in dark mode
  let originalData;
  try {
    originalData = await crawlDarkMode(ORIGINAL_URL, 'original');
  } catch (e) {
    console.error(`\nCould not crawl original site: ${e.message}`);
    console.log('Make sure https://standards.cipp.app/ is accessible.');
    process.exit(1);
  }

  // Compare
  const result = compareDarkModes(originalData, localData);

  // Save full comparison JSON
  const output = {
    timestamp: new Date().toISOString(),
    original: originalData,
    local: localData,
    ...result,
  };
  writeFileSync(
    join(SCREENSHOTS_DIR, 'dark-mode-comparison.json'),
    JSON.stringify(output, null, 2)
  );
  console.log('\nFull comparison saved to screenshots/dark-mode-comparison.json');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
