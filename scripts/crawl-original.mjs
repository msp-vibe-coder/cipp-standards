import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, '..', 'screenshots');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    console.log('Navigating to standards.cipp.app...');
    await page.goto('https://standards.cipp.app/', { waitUntil: 'networkidle', timeout: 60000 });
    console.log('Page loaded.');

    // Full page screenshot
    await page.screenshot({ path: join(screenshotDir, 'original-full.png'), fullPage: true });
    console.log('Full page screenshot saved.');

    // Viewport screenshot
    await page.screenshot({ path: join(screenshotDir, 'original-viewport.png') });
    console.log('Viewport screenshot saved.');

    // Extract page info
    const info = await page.evaluate(() => {
      const getText = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.textContent.trim() : null;
      };
      const getAllText = (sel) => {
        return [...document.querySelectorAll(sel)].map(el => el.textContent.trim());
      };

      // Try to find key page sections
      const header = document.querySelector('header');
      const h1 = document.querySelector('h1');
      const allButtons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);

      // Find cards - look for elements that could be standard cards
      // Try various selectors
      const possibleCards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="accordion"], [class*="standard"]');
      const cardTitles = [];
      possibleCards.forEach((card, i) => {
        if (i < 5) {
          const title = card.querySelector('h3, h4, [class*="title"], [class*="label"], strong');
          if (title) cardTitles.push(title.textContent.trim());
        }
      });

      // Get all text to understand page structure
      const bodyText = document.body.innerText.substring(0, 3000);

      return {
        title: document.title,
        headerText: header ? header.textContent.trim().substring(0, 200) : null,
        h1Text: h1 ? h1.textContent.trim() : null,
        heroSubtitle: getText('h1 + p') || getText('[class*="hero"] p') || getText('[class*="subtitle"]'),
        possibleCardCount: possibleCards.length,
        cardTitles: cardTitles,
        buttonLabels: allButtons.slice(0, 20),
        bodyTextPreview: bodyText,
        allClassNames: [...new Set([...document.querySelectorAll('*')].slice(0, 200).flatMap(el => [...el.classList]))].filter(Boolean).slice(0, 100),
      };
    });

    console.log('Extracted info:', JSON.stringify(info, null, 2));

    // Try to click the first expandable card
    try {
      const firstCard = await page.$('[class*="card"]:not(header *), [class*="Card"]:not(header *), [class*="accordion"]');
      if (firstCard) {
        await firstCard.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: join(screenshotDir, 'original-expanded.png'), fullPage: true });
        console.log('Expanded screenshot saved.');
      } else {
        console.log('Could not find a card to click.');
      }
    } catch (e) {
      console.log('Error expanding card:', e.message);
    }

    // Save info
    writeFileSync(join(screenshotDir, 'original-info.json'), JSON.stringify(info, null, 2));
    console.log('Info saved to original-info.json');

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
