const cookies = `bid=iGQhQcuVnZE; ll="108288"; __utma=30149280.867564806.1525621707.1525621707.1525621707.1; __utmc=30149280; __utmz=30149280.1525621707.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; __utmb=30149280.2.9.1525621707; _pk_ref.100001.4cf6=%5B%22%22%2C%22%22%2C1525621710%2C%22https%3A%2F%2Fwww.douban.com%2F%22%5D; _pk_ses.100001.4cf6=*; __utma=223695111.386520541.1525621710.1525621710.1525621710.1; __utmb=223695111.0.10.1525621710; __utmc=223695111; __utmz=223695111.1525621710.1.1.utmcsr=douban.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _vwo_uuid_v2=DB868C37580B499CB2A90C7AB2C0F367A|d3f209aa096edd88739e8feb730b7c4f; __yadk_uid=ULubtU8ls7VG4hrP6u81ZK4d1kfzhHZX; _pk_id.100001.4cf6=45abc498548e4b9e.1525621710.1.1525621720.1525621710.`;
const baseUrl = 'https://movie.douban.com/j/search_subjects?type=movie&tag=%E8%B1%86%E7%93%A3%E9%AB%98%E5%88%86&sort=rank&page_limit=20&page_start=0';
const request = require('request');
const fs = require('fs');

const tags = ["热门","最新","经典","可播放","豆瓣高分","冷门佳片","华语","欧美","韩国","日本","动作","喜剧","爱情","科幻","悬疑","恐怖","动画"];

const needFields = ['id', 'rate', 'title'];

const sleepTime = 1000;

const genUrl = (tag, pageStart) => {
  return `https://movie.douban.com/j/search_subjects?type=movie&tag=${encodeURIComponent(tag)}&sort=rank&page_limit=20&page_start=${pageStart}`;
};

const getPageData = (tag, pageStart) => {
  return new Promise((resolve, reject) => {
    const j = request.jar();
    const cookie = request.cookie(cookies);
    const url = genUrl(tag, pageStart);
    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (err, data) {
      let subjects = [];
      if (err) resolve(subjects);
      subjects = (JSON.parse(data.body)).subjects;
      resolve(subjects);
    });
  });
}

const sleep = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  })
};

const saveData = async (data, tag, number) => {
  return new Promise((resolve, reject) => {
    console.log(`${tag}_${number}.json`);
    fs.writeFile(`./douban/${tag}_${number}.json`, JSON.stringify(data, null, 2), (err) => {
      resolve();
    });
  });
};

const run = async () => {
  for(let i = 0; i < tags.length; i++) {
    let number = 0;
    while(true) {
      let ret = await getPageData(tags[i], number);
      console.log(ret.length);
      if (!ret.length) {
        break;
      }
      await saveData(ret, tags[i], number);
      number += 20;
      await sleep();
    }
  }
}

run();