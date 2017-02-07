// 2017年2月6日 12:52:50

// type.json
// 剧情.json

var fs = require('fs');
var type = new Map();
let len;
let p = [];
// let typeDuli = [ {type:'', data:[{title:'', id:}]} ];
let typeDuli = [];
fs.readdir('./myMovieDataName', (e, files) => {
	len = files.length;
	for(let i of files){
		p.push(new Promise(function (resolve, reject){
			fs.readFile('./myMovieDataName/'+i, (err, data) => {
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
		// 有的电影数量一样多
		for(let i of type){
			t.push({
				Name:i[0],
				Count:i[1]
			});
		}
		console.log(t.length);
		// 发什么神经写下面这些东西i
		// for(let i = arr.length-1; i >= 0; i--){
		// 	if(arr[i]){
		// 		t.push({
		// 			Name:arr[i],
		// 			Count:i
		// 		});
		// 	}
		// }
		for(let k = 0; k < typeDuli.length; k++){
			fs.writeFile('./myMovieNeed/'+typeDuli[k].type+'.json', JSON.stringify(typeDuli[k].data), () => {});
		}
		fs.writeFile('./myMovieNeed/type.json', JSON.stringify(t), () => {});
	}).catch((err) => {
		console.log(err);
	});
});