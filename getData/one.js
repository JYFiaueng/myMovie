// 抓取一个电影的信息

var https = require('https');
var fs = require('fs');
var baseUrl = 'https://api.douban.com/v2/movie/subject/';

let ids = [
	1292444,
	1307528,
	1292000,
	1300299,
];

let index = 0;

function getMovieData(url){
	if (ids.length <= index) {
		return;
	}
	https.get(url, function(res){
		let str = '';
		if (res.statusCode !== 200) {
			console.log(res.statusCode + ids[index]);
			setTimeout(function(){
				getMovieData(baseUrl + ids[index++]);
			}, 3000);
			return;
		}
		res.on('data', function(data){
			str += data;
		});
		res.on('end', function(){
			let d = JSON.parse(str);
			fs.writeFile('./middleData/AllMovie/'+d.title+'.json', JSON.stringify(d), function (){
				console.log(d.title);
			});
			setTimeout(function(){
				getMovieData(baseUrl + ids[index++]);
			}, 3000);
		});
	}).on('error', function(err){
		console.log('error');
	});
}

getMovieData(baseUrl + ids[index]);