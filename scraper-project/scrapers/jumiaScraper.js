import puppeteer from 'puppeteer';
import Product from '../models/Product.js';

const scrapeJumia = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.jumia.ma/category/electronics/', { waitUntil: 'networkidle2' });

  const products = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.sldr._img').forEach(el => {
      const title = el.querySelector('h1.-fs20')?.innerText.trim();
      const price = el.querySelector('span.-b')?.innerText.trim();
      const link = el.querySelector('a')?.href;
      if (title && price && link) items.push({ title, price, link, source: 'Jumia' });
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

export default scrapeJumia;
