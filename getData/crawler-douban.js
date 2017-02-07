// https://movie.douban.com/people/149725856/collect?start=0&sort=time&rating=all&filter=all&mode=list
// https://movie.douban.com/people/149725856/collect?start=30&sort=time&rating=all&filter=all&mode=list

var https = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var afterUrl = '&sort=time&rating=all&filter=all&mode=list';
var ctrlVar = 0;
var increase = 30;
// 需要更改的两个地方
var movieCount = 10;//改数量
var beforeUrl = 'https://movie.douban.com/people/149725856/collect?start=';//改id

/*----------------------这一部分把看过的电影id和名字全部取到放入myAllMovie.txt---------------------*/
var failCount = 0;
var succCount = 0;
function getUrlHTML(url, succ, fail){
	https.get(url, function(res){
		let html = '';
		if (res.statusCode !== 200) {
			fail();
			console.log(res.statusCode);
			return;
		}
		res.on('data', function(data){
			html += data;
		});
		res.on('end', function(){
			succ(html);
		});
	}).on('error', function(err){
		console.log('error');
	});
}

function succ(html){
	let $ = cheerio.load(html);
	let movies = $('.list-view .item');
	let arr = [];
	movies.each(function (){
		let id = $(this).attr('id').substring(4);
		let title = $(this).find('.title a').text().trim();
		arr.push({
			id:id,
			title:title
		});
	});
	handleData(arr);
	succCount++;
}

function fail(){
	failCount++;
	start();
}

function handleData(arr){
	start();
	let i = 0;
	let a = () => {
		if(i < arr.length){
			fs.appendFile('./middleData/myAllMovie.txt', `${arr[i].id}|${arr[i].title}\n`, ()=>{
				i++;
				a();
			});
		}
	};
	a();
}

function start(){
	if(ctrlVar > movieCount){
		console.log('over');
		console.log('失败: '+failCount);
		console.log('成功: '+succCount);
		console.log('************第一阶段完成，开始第二阶段**********');
		// 刚请求好多次，缓一下，按照请求次数计算等待时长，这里触发开始获取所有电影的详细数据
		setTimeout(function (){
			movieDataFilter('./middleData/myAllMovie.txt');
		}, movieCount/30*30000);
		return;
	}
	getUrlHTML(beforeUrl + ctrlVar + afterUrl, succ, fail);
	ctrlVar += increase;
}

start();

/*----------------------------这一部分根据myAllMovie.txt文件的内容不断拉取每个电影的数据-----------------*/

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
				}, 29000);
				fs.writeFile('./middleData/AllMovie/'+d.title+'.json', JSON.stringify(d), function (){});
			});
		}).on('error', function(err){
			console.log('error');
		});
	}else{
		console.log('over');
		console.log('************第二阶段完成，开始第三阶段**********');
		// 开始整理类型信息
		generateTargetData();
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

/*--------------------------------把每个电影详细信息中的类型全部取出来整理--------------------------------*/
function generateTargetData(){
	var type = new Map();
	let len;
	let p = [];
	let typeDuli = [];
	fs.readdir('./middleData/AllMovie', (e, files) => {
		len = files.length;
		for(let i of files){
			p.push(new Promise(function (resolve, reject){
				fs.readFile('./middleData/AllMovie/'+i, (err, data) => {
					if(err) reject();
					var d = JSON.parse(data);
					for(let i = 0; i < d.genres.length; i++){
						if(type.has(d.genres[i])){
							let j = type.get(d.genres[i]);
							j++;
							type.set(d.genres[i], j);
							for(let k = 0; k < typeDuli.length; k++){
								if(typeDuli[k].type == d.genres[i]){
									typeDuli[k].data.push({
										title:d.title,
										id:d.id
									});
								}
							}
						}else{
							type.set(d.genres[i], 1);
							typeDuli.push({
								type:d.genres[i],
								data:[{title:d.title, id:d.id}]
							});
						}
					}
					resolve();
				});
			}));
		}
		Promise.all(p).then(() => {
			let t = [];
			for(let i of type){
				t.push({
					Name:i[0],
					Count:i[1]
				});
			}
			for(let k = 0; k < typeDuli.length; k++){
				fs.writeFile('./targetData/'+typeDuli[k].type+'.json', JSON.stringify(typeDuli[k].data), () => {});
			}
			fs.writeFile('./targetData/type.json', JSON.stringify(t), () => {
				console.log('************第三阶段完成**********');
			});
		}).catch((err) => {
			console.log(err);
		});
	});
}