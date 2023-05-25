// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require("fs");

const rootDir = `${__dirname}/executions/`;
let file = "";
file= `${rootDir}${(new Date().getTime()).toString().substring(0,7)}`;
  if (!fs.existsSync(rootDir)){
    fs.mkdirSync(rootDir);
  }
  if (!fs.existsSync(file)){
    fs.mkdirSync(file);
  }

test('table test', async ({ page, browserName }) => {
  await page.goto('http://localhost:4200');
  await page.waitForSelector('canvas#chartBig1');

  await page.click('li a[href=\\#\\/tables]');

  await page.waitForSelector('table.tablesorter');
  await page.screenshot({ path: `${file}/${browserName}-tables.png`, fullPage: true });

  const tables = await page.$$('table.tablesorter tbody');

  const num = await tables[0].$$('tr');
  await expect(num.length).toEqual(10);
});

test('sidebar color change', async ({ page, browserName }) => {
  await page.goto('http://localhost:4200');
  await page.waitForSelector('canvas#chartBig1');

  await page.screenshot({ path: file+'/dashboard.png', fullPage: true });
  // Click the get started link.
  await page.click('div.fixed-plugin a');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${file}/${browserName}-dropdown.png`, fullPage: true });

  const colors = await page.$$('div.badge-colors span');
  await colors[colors.length-1].click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${file}/${browserName}-newcolor.png`, fullPage: true });

  const menu = await page.$('div.sidebar');
  const color = await menu?.getAttribute('data');
  await expect(color).toEqual('green');
});
