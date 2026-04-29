const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function convertWithMaxQuality() {
    const inputDir = './modules';
    const outputDir = './pdfs';
    await fs.ensureDir(outputDir);
    const files = (await fs.readdir(inputDir)).filter(f => f.endsWith('.html'));

    console.log(`🚀 Processing ${files.length} modules with optimized settings...`);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Enhances text rendering quality without bloating file size
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

    for (const file of files) {
        const filePath = path.join(__dirname, inputDir, file);
        const outputFileName = file.replace(/\.html$/i, '.pdf');
        
        console.log(`✨ Converting: ${outputFileName}`);

        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
        
        // Triggers the specific high-quality print CSS in your files
        await page.emulateMediaType('print');

        await page.pdf({
            path: path.join(outputDir, outputFileName),
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true, // Uses Notion's internal @page margin rules
            displayHeaderFooter: false,
            scale: 0.95, // Slightly scales down to prevent unnecessary page breaks
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });
    }

    await browser.close();
    console.log('✅ Success! Check the /pdfs folder.');
}

convertWithMaxQuality().catch(console.error);