import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convert() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const svgPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Set viewport to the width/height of the SVG to avoid clipping
  await page.setViewport({ width: 1200, height: 500, deviceScaleFactor: 2 });
  
  await page.setContent(svgContent);
  
  const pngPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.png');
  const pdfPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.pdf');
  
  // Wait for network idle or any fonts to load, though standard fonts are used
  await page.evaluateHandle('document.fonts.ready');
  
  const svgElement = await page.$('svg');
  await svgElement.screenshot({ path: pngPath });
  
  await page.pdf({
    path: pdfPath,
    width: '1200px',
    height: '500px',
    printBackground: true,
    pageRanges: '1'
  });
  
  await browser.close();
  console.log('Conversion successful!');
}

convert().catch(console.error);
