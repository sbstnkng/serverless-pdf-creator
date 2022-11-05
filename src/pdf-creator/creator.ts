import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer-core';
import { Browser, Page } from 'puppeteer-core';
import { Message, PdfFile } from '../types';

const chromium = require('@sparticuz/chromium');

const compileTemplate = (message: Message): string => {
  const filePath: string = path.join(
    __dirname,
    '..',
    'templates',
    'pdf-template.hbs'
  );
  const templateHtml: string = fs.readFileSync(filePath, 'utf-8');
  const template: HandlebarsTemplateDelegate = handlebars.compile(templateHtml);
  return template(message);
};

export const create = async (message: Message): Promise<PdfFile> => {
  let browser: Browser | null = null;
  const html: string = compileTemplate(message);

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page: Page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({ format: 'A4' });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
