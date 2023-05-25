// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const separator = "||";
//Compartamos Móvil
const urlApp = "https://play.google.com/store/apps/details?id=com.compartamos.mobileApp&hl=es";
//const urlAppCop = "https://play.google.com/store/apps/details?id=mx.com.miapp&hl=es";
//Name file
const nameFile = 
`${new Date().getTime()}${urlApp.replace("https://play.google.com/store/apps/details?id=","").replace("&hl=es",'')}.csv`;

test('Collect reviews on Playstore example', async ({ page }) => {
  await page.route('**/*', route => {
    return route.request().resourceType().match(/(image)s?/) ?
        route.abort() : route.continue();
  });
  await page.goto(urlApp);
  /*
    await page.locator('text=Log in').click();
    ó
    var elem = page.locator('text=Log in');
    elem.click();
  */
  await page.click('c-wiz[jsrenderer=C7s1K] button');
  
  await page.waitForSelector('div.VfPpkd-cnG4Wd');
  
  let commentList = await page.$$('div.RHo1pe');
  let data = [];
  let content="";
  try{
    for (let index = 0; index < commentList.length; index++) {
      const comment = await commentList[index];
      let tmp = Object.create(Comment);

      const user = await comment.$('header div.X5PpBb');
      const rate = await comment.$('header div.iXRFPc');
      const date = await comment.$('header div.Jx4nYe span.bp9Aid');
      const msg = await comment.$('div.h3YV2d');
      const helpful = await comment.$('div[jscontroller=SWD8cc]');

      tmp.i = index;
      tmp.user = await user?.evaluate(el => el.textContent);
      tmp.rate = (await rate?.getAttribute('aria-label'))?.replace(/[^0-9]/g,'');
      tmp.date = await date?.evaluate(el => el.textContent);
      tmp.comment = await msg?.evaluate(el => el.textContent);
      tmp.helpful = await helpful?.getAttribute('data-original-thumbs-up-count');
      data.push(tmp);
      content+=`${tmp.user}${separator}${tmp.rate}${separator}${tmp.date}${separator}${tmp.comment}${separator}${tmp.helpful}\n`;
      if(index == commentList.length-1){
        try{
          console.log(content);
          fs.appendFileSync(nameFile, content, 'utf8');
          content="";
        }catch(e){
          console.log("Error on appendFile:"+e);
        }
         //clear comments
        /*let comm = await page.evaluate(() => document.querySelectorAll('div.RHo1pe').length);
        if(comm > 1000){
          await page.evaluate((comm) => 
            Array.from(document.querySelectorAll('div.RHo1pe')).slice(comm-40,comm-1).forEach(elem => elem.textContent=''), comm
          );
        }*/

        const container = page.locator('div.fysCi');
        if(await container.evaluate(e => e.clientHeight < e.scrollHeight)){
          await container.evaluate(e => e.scrollTop = e.scrollHeight);
          await delay(500);
          console.log('commentPage: '+(await page.$$('div.RHo1pe')).length);
          commentList = await page.$$('div.RHo1pe');

        }else{
          console.log("No scrolleable");
        }
      }
    }
  }catch(e){
    console.log("Exception:"+e);
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const Comment = {
  i:null,
  user: null,
  rate: null,
  date: null,
  comment: null,
  helpful: null
};
