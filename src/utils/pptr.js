const puppeteer = require('puppeteer-core');
let browser;

let taskState = 'Ready';

async function launch() {
  const options = {
    headless: false, //process.env.NODE_ENV === 'local' ? false : true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: './.chromeuserdir3',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled'],
  };
  if (process.env.NODE_ENV === 'production') {
    options.headless = true;
    options.userDataDir = './.chromeuserdir3'
    options.executablePath = '/usr/bin/google-chrome-stable';
  }
  browser = await puppeteer.launch(options);
  console.log('browser launched');
}

function getBrowser() {
  return browser;
}

async function newPreparedPage() {
  if (!browser) {
    await launch()
  }
  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 875,
    deviceScaleFactor: 1,
  });
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
  )
  await prepare(page);

  return page;
}

async function prepare(page) {
  await page.evaluateOnNewDocument(() => {
    // Object.defineProperty(navigator, 'webdriver', { get: () => false });
    const newProto = navigator.__proto__;
    delete newProto.webdriver;
    navigator.__proto__ = newProto;
    delete Object.getPrototypeOf(navigator).webdriver;
  });
}


async function scrollPage(page) {
  await page.evaluate(async () => {
    window.scrollTo(0, 0)
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 200;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight - 300) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function getScreenshot(pageIndex) {
  const pages = await browser.pages()
  const page = pages[pageIndex || pages.length - 1]
  const filename = new Date().getTime();
  const path = `screenshots/${filename}.png`
  await page.screenshot({
    path,
    fullPage: true,
  });
  return filename;
}

async function getPages() {
  const pages = await browser.pages()
  const res = []
  for (const page of pages) {
    res.push(await page.title())
  }
  return res
}

// (async () => {
//   await launch();
// })();

module.exports = {
  getBrowser,
  prepare,
  newPreparedPage,
  scrollPage,
  getScreenshot,
  getPages,
  getTaskState() {
    return taskState;
  },

  taskStart() {
    taskState = 'Working';
  },

  taskEnd() {
    taskState = 'Ready';
  },
};
