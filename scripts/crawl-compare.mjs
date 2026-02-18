import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'screenshots');

const LOCAL_URL = 'http://localhost:3001';
const ORIGINAL_URL = 'https://standards.cipp.app/';

async function extractPageData(page) {
  return await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    };

    // Page title
    const title = document.title;

    // Header
    const header = document.querySelector('header');
    const headerText = header ? header.textContent.trim().replace(/\s+/g, ' ') : null;

    // Hero
    const h1 = document.querySelector('h1');
    const heroTitle = h1 ? h1.textContent.trim() : null;
    const heroP = h1 ? h1.parentElement.querySelector('p') : null;
    const heroSubtitle = heroP ? heroP.textContent.trim() : null;

    // All buttons with their text
    const allButtons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);

    // Impact rows - find buttons that contain "Impact" text
    const impactButtons = allButtons.filter(t => t.includes('Impact'));

    // Category buttons - find buttons after "All Categories"
    const categoryButtons = allButtons.filter(t =>
      t.includes('All Categories') || t.includes('Standards') || t === 'Templates' ||
      t.includes('Device Management')
    );

    // Standard cards count - look for cards in the main content
    // Try multiple selectors
    let standardCardCount = 0;
    const cardSelectors = [
      '.space-y-3 > [class*="rounded"]',
      '[class*="rounded-xl"][class*="border"][class*="bg-"]',
      '[class*="accordion"]',
    ];
    for (const sel of cardSelectors) {
      const cards = document.querySelectorAll(sel);
      if (cards.length > standardCardCount) {
        standardCardCount = cards.length;
      }
    }

    // First 3 card titles
    const h3s = [...document.querySelectorAll('h3')];
    const cardTitles = h3s
      .filter(h => !['Impact Distribution', 'Category Distribution', 'Filtered Standards'].includes(h.textContent.trim()))
      .slice(0, 5)
      .map(h => h.textContent.trim());

    // First card help text (to check bold rendering)
    const firstCardBody = (() => {
      // Find the first standard card's expanded content or description
      const allSpans = [...document.querySelectorAll('span')];
      for (const span of allSpans) {
        const text = span.textContent;
        if (text && text.includes('Some features require')) {
          // Check if it contains a <strong> element
          const strong = span.querySelector('strong');
          return {
            text: text.substring(0, 200),
            hasBoldElement: !!strong,
            boldText: strong ? strong.textContent : null,
          };
        }
      }
      return null;
    })();

    // Dashboard layout info
    const dashboardGrid = document.querySelector('.grid');
    const dashboardClasses = dashboardGrid ? dashboardGrid.className : null;

    // Impact card details
    const impactCard = (() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"]');
      for (const card of cards) {
        if (card.textContent.includes('Impact Distribution')) {
          const rows = card.querySelectorAll('button');
          return {
            rowCount: rows.length,
            rows: [...rows].map(r => ({
              text: r.textContent.trim().replace(/\s+/g, ' '),
              classes: r.className,
              hasBorder: r.className.includes('border'),
            })),
          };
        }
      }
      return null;
    })();

    // Category card details
    const categoryCard = (() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"]');
      for (const card of cards) {
        if (card.textContent.includes('Category Distribution')) {
          const container = card.querySelector('.grid, .flex');
          const buttons = card.querySelectorAll('button');
          return {
            layout: container ? container.className : null,
            isGrid: container ? container.className.includes('grid') : false,
            buttonCount: buttons.length,
            buttons: [...buttons].slice(0, 3).map(b => ({
              text: b.textContent.trim().replace(/\s+/g, ' '),
              classes: b.className,
            })),
          };
        }
      }
      return null;
    })();

    // Filtered Standards card - new standards section
    const filteredCard = (() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"]');
      for (const card of cards) {
        if (card.textContent.includes('Filtered Standards')) {
          const newSection = card.querySelector('.border-t');
          return {
            mainCount: getText('.text-4xl') || getText('[class*="text-4xl"]'),
            newSectionLayout: newSection ? newSection.className : null,
            newSectionText: newSection ? newSection.textContent.trim().replace(/\s+/g, ' ') : null,
          };
        }
      }
      return null;
    })();

    // Filter bar layout
    const filterBar = (() => {
      // Look for the container with search + filters
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (!searchInput) return null;
      const container = searchInput.closest('.space-y-3, .flex, div');
      const parentContainer = container ? container.parentElement : null;
      return {
        containerClasses: container ? container.className : null,
        parentClasses: parentContainer ? parentContainer.className : null,
        hasSearchOnOwnRow: parentContainer ? parentContainer.className.includes('space-y') : false,
      };
    })();

    // Theme toggle
    const themeToggle = (() => {
      const btn = document.querySelector('header button');
      if (!btn) return null;
      return {
        classes: btn.className,
        isRoundedSquare: btn.className.includes('rounded-lg'),
        isRoundedFull: btn.className.includes('rounded-full'),
        hasBlue: btn.className.includes('blue'),
      };
    })();

    // Header brand layout
    const headerBrand = (() => {
      const headerEl = document.querySelector('header');
      if (!headerEl) return null;
      const brandContainer = headerEl.querySelector('.flex-col, .flex');
      return {
        classes: brandContainer ? brandContainer.className : null,
        isStacked: brandContainer ? brandContainer.className.includes('flex-col') : false,
      };
    })();

    // Body/page background classes
    const bodyClasses = document.body.className;
    const htmlClasses = document.documentElement.className;
    const bodyBg = window.getComputedStyle(document.body).background;

    // Hero spacing
    const heroSection = document.querySelector('section');
    const heroClasses = heroSection ? heroSection.className : null;

    // Dashboard margin
    const dashboardNegMargin = (() => {
      const els = document.querySelectorAll('[class*="-mt-"]');
      return [...els].map(el => el.className).slice(0, 3);
    })();

    return {
      title,
      headerText,
      heroTitle,
      heroSubtitle,
      heroClasses,
      allButtons,
      impactButtons,
      categoryButtons,
      standardCardCount,
      cardTitles,
      firstCardBody,
      dashboardClasses,
      impactCard,
      categoryCard,
      filteredCard,
      filterBar,
      themeToggle,
      headerBrand,
      bodyClasses,
      htmlClasses,
      bodyBg: bodyBg.substring(0, 200),
      dashboardNegMargin,
    };
  });
}

async function crawlSite(url, prefix) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Crawling: ${url}`);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Screenshots
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `${prefix}-full.png`), fullPage: true });
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `${prefix}-viewport.png`) });
  console.log(`Screenshots saved: ${prefix}-full.png, ${prefix}-viewport.png`);

  // Extract data
  const data = await extractPageData(page);

  // Try to expand first standard card
  try {
    const expandBtn = page.locator('button[aria-expanded]').first();
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    } else {
      // Click the first card-like element after the dashboard
      const cards = page.locator('.space-y-3 button, [class*="rounded-xl"] button');
      if (await cards.count() > 3) {
        await cards.nth(3).click();
        await page.waitForTimeout(500);
      }
    }
    await page.screenshot({ path: join(SCREENSHOTS_DIR, `${prefix}-expanded.png`), fullPage: false });

    // Re-extract to get expanded card content
    const expandedData = await page.evaluate(() => {
      const strongs = [...document.querySelectorAll('strong')];
      return {
        boldElementsCount: strongs.length,
        boldTexts: strongs.slice(0, 5).map(s => s.textContent.trim()),
      };
    });
    data.expandedCard = expandedData;
  } catch (e) {
    console.log(`Could not expand card: ${e.message}`);
  }

  // Save
  const jsonPath = join(SCREENSHOTS_DIR, `${prefix}-info.json`);
  writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`Data saved: ${prefix}-info.json`);

  await browser.close();
  return data;
}

function compare(original, local) {
  console.log('\n' + '='.repeat(60));
  console.log('COMPARISON RESULTS');
  console.log('='.repeat(60));

  const issues = [];
  const matches = [];

  // 1. Standard count
  const origCount = 159; // Known from original crawl
  if (local.standardCardCount === origCount) {
    matches.push(`Standard count: ${local.standardCardCount} (matches original)`);
  } else {
    issues.push(`Standard count: local=${local.standardCardCount}, original=${origCount}`);
  }

  // 2. Impact order
  const origImpactOrder = ['High Impact21', 'Low Impact90', 'Medium Impact48'];
  const localImpactOrder = local.impactButtons;
  const impactMatch = origImpactOrder.every((v, i) => localImpactOrder[i] && localImpactOrder[i].replace(/\s+/g, '') === v.replace(/\s+/g, ''));
  if (impactMatch) {
    matches.push(`Impact order: H/L/M with correct counts`);
  } else {
    issues.push(`Impact order mismatch: local=[${localImpactOrder.join(', ')}], original=[${origImpactOrder.join(', ')}]`);
  }

  // 3. Impact card borders
  if (local.impactCard?.rows?.every(r => r.hasBorder)) {
    matches.push('Impact rows: have borders');
  } else {
    issues.push('Impact rows: missing borders on some rows');
  }

  // 4. Category card layout
  if (local.categoryCard?.isGrid) {
    matches.push('Category card: uses grid layout');
  } else {
    issues.push(`Category card: not using grid layout (classes: ${local.categoryCard?.layout})`);
  }

  // 5. Bold rendering
  if (local.firstCardBody?.hasBoldElement || local.expandedCard?.boldElementsCount > 0) {
    matches.push(`Bold rendering: <strong> elements found (${local.expandedCard?.boldTexts?.join(', ')})`);
  } else {
    issues.push('Bold rendering: no <strong> elements found - **bold** may not be rendering');
  }

  // 6. Filter bar two-row layout
  if (local.filterBar?.hasSearchOnOwnRow) {
    matches.push('Filter bar: search on own row (two-row layout)');
  } else {
    issues.push(`Filter bar: may not be two-row layout (classes: ${local.filterBar?.parentClasses})`);
  }

  // 7. Theme toggle
  if (local.themeToggle?.isRoundedSquare && local.themeToggle?.hasBlue) {
    matches.push('Theme toggle: rounded square with blue tint');
  } else if (local.themeToggle?.isRoundedSquare) {
    matches.push('Theme toggle: rounded square');
    issues.push(`Theme toggle: may not have blue tint (classes: ${local.themeToggle?.classes})`);
  } else {
    issues.push(`Theme toggle: not rounded square (classes: ${local.themeToggle?.classes})`);
  }

  // 8. Header brand stacking
  if (local.headerBrand?.isStacked) {
    matches.push('Header brand: stacked vertically');
  } else {
    issues.push(`Header brand: not stacked (classes: ${local.headerBrand?.classes})`);
  }

  // 9. Dashboard negative margin
  if (local.dashboardNegMargin?.some(c => c.includes('-mt-'))) {
    matches.push('Dashboard: has negative top margin overlap');
  } else {
    issues.push('Dashboard: no negative margin overlap detected');
  }

  // 10. Page background gradient
  if (local.bodyBg?.includes('gradient') || local.bodyBg?.includes('linear')) {
    matches.push('Page background: gradient detected');
  } else {
    issues.push(`Page background: no gradient (bg: ${local.bodyBg})`);
  }

  // 11. Filtered Standards card - vertical layout
  if (local.filteredCard?.newSectionText) {
    const text = local.filteredCard.newSectionText;
    // In vertical layout, "New Standards" header comes before the count
    const hasVerticalOrder = text.includes('New Standards') && text.includes('of filtered');
    if (hasVerticalOrder) {
      matches.push('Filtered card: New Standards section has vertical layout');
    } else {
      issues.push(`Filtered card: New Standards section may not be vertical (text: ${text})`);
    }
  }

  // 12. Hero spacing
  if (local.heroClasses?.includes('pb-24') || local.heroClasses?.includes('pb-20')) {
    matches.push('Hero: has large bottom padding');
  } else {
    issues.push(`Hero: may not have enough bottom padding (classes: ${local.heroClasses})`);
  }

  // Print results
  console.log('\nMATCHES:');
  matches.forEach(m => console.log(`  ✓ ${m}`));

  if (issues.length > 0) {
    console.log('\nISSUES:');
    issues.forEach(i => console.log(`  ✗ ${i}`));
  } else {
    console.log('\nNo issues found! Local matches original.');
  }

  console.log(`\nScore: ${matches.length}/${matches.length + issues.length} checks passed`);

  return { matches, issues };
}

async function main() {
  // Crawl local
  const localData = await crawlSite(LOCAL_URL, 'local');

  // Crawl original
  let originalData;
  try {
    originalData = await crawlSite(ORIGINAL_URL, 'original');
  } catch (e) {
    console.log(`\nCould not crawl original (${e.message}), using saved data...`);
    originalData = JSON.parse(readFileSync(join(SCREENSHOTS_DIR, 'original-info.json'), 'utf8'));
  }

  // Compare
  const result = compare(originalData, localData);

  // Save comparison
  writeFileSync(
    join(SCREENSHOTS_DIR, 'comparison.json'),
    JSON.stringify({ original: originalData, local: localData, ...result, timestamp: new Date().toISOString() }, null, 2)
  );
  console.log('\nFull comparison saved to screenshots/comparison.json');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
