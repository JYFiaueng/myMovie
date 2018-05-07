const fs = require('fs');

const tags = ["热门","最新","经典","可播放","豆瓣高分","冷门佳片","华语","欧美","韩国","日本","动作","喜剧","爱情","科幻","悬疑","恐怖","动画"];

const readFile = (name) => {
  return new Promise((rel, rej) => {
    fs.readFile(`./douban/${name}`, (err, data) => {
      data = JSON.parse(data.toString());
      rel(data);
    });
  });
};

const readDir = () => {
  return new Promise((rel, rej) => {
    fs.readdir(`./douban`, (err, data) => {
      rel(data);
    });
  });
};

const saveData = async (data, rate1, rate2) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(`./result/${rate1}-${rate2}.json`, JSON.stringify(data, null, 2), (err) => {
      resolve();
    });
  });
};

const run = async () => {
  let files = await readDir();
  let result = {};
  for(let i = 0; i < files.length; i++) {
    let file = files[i];
    let tag = file.split('_')[0];
    if (!result[tag]) result[tag] = [];
    let fileData = await readFile(file);
    result[tag] = [...result[tag], ...fileData];
  }
  let ret = {};
  let rates = [6.0, 7.0, 8.0, 9.0, 10.0];
  for(let r = 0; r < rates.length - 1; r++) {
    for(let i in result) {
      ret[i] = [];
      result[i].sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
      for(let j = 0; j < result[i].length; j++) {
        if (parseFloat(result[i][j].rate) >= rates[r] && parseFloat(result[i][j].rate) <= rates[r+1]-0.1) {
          ret[i].push({
            rate: result[i][j].rate,
            title: result[i][j].title,
            id: result[i][j].id
          });
        }
      }
    }
    await saveData(ret, rates[r], rates[r+1]);
  }
};

run();