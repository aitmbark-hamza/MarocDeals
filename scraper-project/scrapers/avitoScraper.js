import puppeteer from 'puppeteer';
import Product from '../models/Product.js';

const scrapeAvito = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.avito.ma/fr/maroc/electronics', { waitUntil: 'networkidle2' });

  const products = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.listing-item').forEach(el => {
      const title = el.querySelector('.listing-title')?.innerText.trim();
      const price = el.querySelector('.listing-price')?.innerText.trim();
      const link = el.querySelector('a')?.href;
      if (title && price && link) items.push({ title, price, link, source: 'Avito' });
    });
    return items;
  });

  for (const product of products) {
    try {
      await Product.create(product);
      console.log('Product saved ✅', product.title);
    } catch (err) {
      console.error('Error saving product ❌', err);
    }
  }

  await browser.close();
};

export default scrapeAvito;
