// 2017年2月2日 14:54:03

// 这个是多myMovieDataName文件夹下的所有文件进行读取截取信息

var fs = require('fs');
var type = new Map();
let len;
let rating = 0;
let p = [];
fs.readdir('./myMovieDataName', (e, files) => {
	len = files.length;
	for(let i of files){
		p.push(new Promise(function (resolve, reject){
			fs.readFile('./myMovieDataName/'+i, (err, data) => {
				if(err) reject();
				var d = JSON.parse(data);
				rating += parseInt(d.rating.average);
				for(let i = 0; i < d.genres.length; i++){
					if(type.has(d.genres[i])){
						let j = type.get(d.genres[i]);
						j++;
						type.set(d.genres[i], j);
					}else{
						type.set(d.genres[i], 1);
					}
				}
				resolve();
			});
		}));
	}
	Promise.all(p).then(() => {
		let arr = [];
		for(let i of type){
			arr[i[1]] = i[0];
		}
		let str = '';
		for(let i = arr.length-1; i >= 0; i--){
			if(arr[i]){
				str += arr[i] + '|' + i + '\n';
			}
		}
		str += '\n平均分|'+rating/len;
		fs.writeFile('./我的电影平均分和类型统计.txt', str, () => {});
	}).catch((err) => {
		console.log(err);
	});
});

/*
rating.average Number
genres []
*/