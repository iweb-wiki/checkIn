const puppeteer = require("puppeteer");
const axios = require("axios");

const env = process.env;

async function checkInAndGetStatus() {
  let result = {};
  try {
    const checkInRes = await fetch("https://glados.rocks/api/user/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "glados.network" }),
    });
    result.title =
      (await checkInRes.json())?.message || `status: ${checkInRes?.status}`;

    const status = await fetch("https://glados.rocks/api/user/status");
    result.content =
      status.status === 200
        ? `leftDays: ${parseFloat((await status.json())?.data?.leftDays)}`
        : `status: ${status.status}`;

    return result;
  } catch (error) {
    console.error(" checkInAndGetStatus ~ error", error);
    return { ...result, error };
  }
}

async function setCookie(cookie) {
  const cookies = cookie.split(";").reduce((res, c) => {
    const current = c.trim().split("=") || [];
    return [
      ...res,
      {
        name: current[0],
        value: current[1],
        domain: "glados.rocks",
        path: "/",
        httpOnly: true,
      },
    ];
  }, []);
  await this?.setCookie?.(...cookies);
}

async function pushPlus(token, info) {
  const data = {
    token,
    title: info.title,
    content: info.content,
    template: "txt",
  };

  return axios({
    url: "http://www.pushplus.plus/send",
    method: "POST",
    data,
  });
}

async function checkIn(cookie) {
  const browser = await puppeteer.launch({
    product: "chrome",
    // Make browser logs visible
    dumpio: true,
    ignoreDefaultArgs: ["--enable-automation"],
  });

  const page = await browser.newPage();
  try {
    await setCookie.call(page, cookie);
    await page.goto("https://glados.rocks/console/checkin", {
      waitUntil: ["load", "networkidle0"],
    });
    const pageTitle = await page.title();
    if (pageTitle === "Just a moment...") throw Error("Just a moment...");
    console.log("page--title", pageTitle);
    page.on("response", async (response) => {
      const status = response.status();
      const url = response.url();
      console.log(`${url}:  ${status}`);
    });
    return page.evaluate(checkInAndGetStatus);
  } catch (error) {
    console.error("🚀 ~ file: checkIn.js ~ line 27 ~ checkIn ~ error", error);
    browser.close();
    return { title: "error", content: error.message };
  } finally {
    setTimeout(async () => {
      browser.close().then(() => console.log("browser closed"));
    }, 2000);
  }
}

(async function glaDosCheckIn() {
  console.log("====start====");
  const cookie = env.COOKIES;
  const token = env.plusToken;
  const result = await checkIn(cookie);
  const pushResult = await pushPlus(token, result);
  console.log(" pushResult", result, pushResult.data);
})();
