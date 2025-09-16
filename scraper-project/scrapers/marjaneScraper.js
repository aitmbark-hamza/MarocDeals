import puppeteer from 'puppeteer';
import Product from '../models/Product.js';

const scrapeMarjane = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.marjane.ma/category/electronics/', { waitUntil: 'networkidle2' });

  const products = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.product-item').forEach(el => {
      const title = el.querySelector('.product-title')?.innerText.trim();
      const price = el.querySelector('.product-price')?.innerText.trim();
      const link = el.querySelector('a')?.href;
      if (title && price && link) items.push({ title, price, link, source: 'Marjane' });
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

export default scrapeMarjane;
