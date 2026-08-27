import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000/gymmaster-app/');
  
  try {
    const loginBtns = await page.$$('button');
    for (const btn of loginBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Ingresar al Sistema')) {
        await btn.click();
        break;
      }
    }
  } catch (e) {
    console.log('No login button found or already logged in');
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  try {
    const tabs = await page.$$('div, button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text === 'Cobros') {
        await tab.click();
        console.log('Clicked Cobros tab');
        break;
      }
    }
  } catch (e) {
    console.log('Could not click Cobros tab');
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
