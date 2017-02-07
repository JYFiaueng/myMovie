// https://movie.douban.com/subject/6518638/
// 不需要授权公开api可以使用http，参数里面如果不包含apikey的话，限制单ip每小时150次，
// 带的话每小时500次。带apikey的例子为: http://api.douban.com/v2/user/1000001?apikey=XXX, XXX为你的apikey
// 更坑的是apikey的申请页面不存在了，不再开放申请了

// 这个是将myMovie中每一个电影的具体信息抓下来

var https = require('https');
var fs = require('fs');
var ctrlId = 0;
var movieUrl = 'https://api.douban.com/v2/movie/subject/';
var movieIdArr = [];

function getMovieData(getUrl){
	if(ctrlId < movieIdArr.length){
		https.get(getUrl, function(res){
			let str = '';
			if (res.statusCode !== 200) {
				console.log(movieIdArr[ctrlId]);
				fs.appendFile('./失败.txt/', movieIdArr[ctrlId]+'\n', function (){});
				ctrlId++;
				setTimeout(function (){
					getMovieData(movieUrl+movieIdArr[ctrlId]);
				}, 29000);
				return;
			}
			res.on('data', function(data){
				str += data;
			});
			res.on('end', function(){
				let d = JSON.parse(str);
				ctrlId++;
				console.log(movieIdArr[ctrlId]);
				setTimeout(function (){
					getMovieData(movieUrl+movieIdArr[ctrlId]);
				}, 39000);
				fs.writeFile('./middleData/AllMovie/'+d.title+'.json', JSON.stringify(d), function (){});
			});
		}).on('error', function(err){
			console.log('error');
		});
	}else{
		console.log('over');
	}
}

function movieDataFilter(file){
	fs.readFile(file, 'utf8', (err,data) => {
		if(err) throw err;
		var reg = /[0-9]*(?=\|)/g;
		let arr1 = data.match(reg), j = 0;
		for(let i = 0; i < arr1.length; i++){
			if(arr1[i] && arr1[i].length > 5){
				movieIdArr[j] = arr1[i];
				j++;
			}
		}
		getMovieData(movieUrl + movieIdArr[ctrlId]);
	});
}

movieDataFilter('./middleData/myAllMovie.txt');