// 抓取一个电影的信息

var https = require('https');
var fs = require('fs');
var url = 'https://api.douban.com/v2/movie/subject/';

function getMovieData(url){
	https.get(url, function(res){
		let str = '';
		if (res.statusCode !== 200) {
			console.log(res.statusCode);
			return;
		}
		res.on('data', function(data){
			str += data;
		});
		res.on('end', function(){
			let d = JSON.parse(str);
			fs.writeFile('./myMovieDataName/'+d.title+'.json', JSON.stringify(d), function (){console.log('over');});
		});
	}).on('error', function(err){
		console.log('error');
	});
}

getMovieData(url + '1485260');