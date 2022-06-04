const axios = require("axios");

function checkIn(cookie) {
  return axios({
    method: "post",
    url: "https://glados.rocks/api/user/checkin",
    headers: {
      Cookie: cookie,
    },
    data: {
      token: "glados.network",
    },
  });
}

function getStatus(cookie) {
  return axios({
    method: "get",
    url: "https://glados.rocks/api/user/status",
    headers: {
      Cookie: cookie,
    },
  });
}

async function checkInAndGetStatus(cookie) {
  const checkInRes = await checkIn(cookie);
  const message = checkInRes?.data?.message;

  const statusRes = await getStatus(cookie);
  const userStatus = statusRes?.data?.data;
  const email = userStatus?.email;
  const leftDays = userStatus?.leftDays;

  return {
    email,
    leftDays,
    message,
  };
}

async function pushPlus(token, infos) {
  const content = infos.map(
    (info) =>
      `剩余天数：${+info?.leftDays}天，账号：${info?.email}，签到结果：${
        info?.message
      }`
  );

  const data = {
    token,
    title: content[0],
    content: content.join("\n"),
    template: "txt",
  };

  console.log(" pushPlus ~ data", data);
  return axios({
    method: "post",
    url: "http://www.pushplus.plus/send",
    data,
  });
}

const glaDosCheckIn = async () => {
  try {
    const env = process.env;
    const cookies = env.COOKIES.split("&&") ?? [];
    const token = env.plusToken;

    const res = await Promise.all(
      cookies.map((cookie) => checkInAndGetStatus(cookie))
    );
    console.log("~ glaDosCheckIn ~ res", res);
    const pushInfo = await pushPlus(token, res);
    console.log(" glaDosCheckIn ~ pushInfo", pushInfo?.data);
  } catch (error) {
    console.log(" glaDosCheckIn ~ error", error);
  }
};

glaDosCheckIn();