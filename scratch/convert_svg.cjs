const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convert() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const svgPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  await page.setViewport({ width: 1200, height: 500, deviceScaleFactor: 2 });
  
  await page.setContent(svgContent);
  
  const pngPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.png');
  const pdfPath = path.resolve(__dirname, '../paper/figures/fig2_recommendation_to_remediation.pdf');
  
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
