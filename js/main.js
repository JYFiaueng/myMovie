$(function (){
	// 缓存
	var poster = $('#poster');
	var info = $('#info');
	var describe = $('#describe');
	var movieListP = $('#movieListP');
	var showMovieP = $('#showMovieP');
	var typeList = $('#typeList');
	var movieList = $('#movieList');
	var load = $('#load');
	// 豆瓣的电影数据地址
	var URL = 'https://api.douban.com/v2/movie/subject/';
	// 全屏插件设置
	$('#dowebok').fullpage({
			sectionsColor: ['#f4f4f4', '#f2f2f2', '#efefef'],
			continuousVertical:true,
			onLeave:function(index){
				if(index === 3){
					poster.fadeOut(400, function (){
						poster.html('');
					});
					info.fadeOut(400, function (){
						info.html('');
					});
					describe.fadeOut(400, function (){
						describe.html('');
					});
				}
			},
			afterRender:function (){
				setTimeout(function (){
				    $('#mark').fadeOut(400);
				}, 1000);
				movieListP.css('height', $('html').height());
				showMovieP.css('height', $('html').height());
				poster.fadeOut();
				info.fadeOut();
				describe.fadeOut();
			},
	});
	//节流函数
	function throttle(method,context){
		clearTimeout(method.tId);
		method.tId=setTimeout(function(){
				method.call(context);
		},500);
	}
	// 窗口size变化
	$(window).resize(function(){
		throttle(function (){
			movieListP.css('height', $('html').height());
			showMovieP.css('height', $('html').height());
		}, window);
	});
	// 删除键盘和滚轮对全屏切换的控制
	$.fn.fullpage.setKeyboardScrolling();
	$.fn.fullpage.setAllowScrolling();
	// 拿到电影类型数据
	$.get('./data/type.json', function (data){
		var html = '';
		typeList.fadeIn(400);
		for(var i = 0; i < data.length; i++){
			html += '<div>'+data[i].Name+'</div>';
		}
		typeList.html(html);
	});
	// 为电影类型添加点击事件
	typeList.on('click', 'div', function (e){
		var typeName = e.target.innerHTML;
		$.get('./data/'+typeName+'.json', function (data){
			var html = '';
			for(var i = 0; i < data.length; i++){
				html += '<div data-id="'+data[i].id+'">'+data[i].title+'</div>';
			}
			movieList.html(html);
			$.fn.fullpage.moveSectionDown();
		});
	});
	// 电影名点击
	movieList.on('click', 'div', function (e){
		var movieId = $(e.target).attr('data-id');
		$.ajax({
			url:URL + movieId,
			cache:true,
			type:'get',
			dataType:'jsonp',
			crossDomain:true,
			jsonp:'callback',
			success:function (data){
				load.fadeOut(0);
				poster.fadeIn(400);
				info.fadeIn(400);
				describe.fadeIn(400);
				poster.html('<img class="img-responsive" src="'+data.images.large+'"/>');
				var html = '';
				html += '<dt>名字 :</dt><dd>&nbsp;&nbsp;'+data.title+'</dd>';
				html += '<dt>原名 :</dt><dd>&nbsp;&nbsp;'+(data.current_title?data.current_title:'&nbsp;')+'</dd>';
				html += '<dt>评分 :</dt><dd>&nbsp;&nbsp;'+data.rating.average+'</dd>';
				html += '<dt>导演 :</dt><dd>&nbsp;&nbsp;'+(data.directors[0].name?data.directors[0].name:'&nbsp;')+'</dd>';
				html += '<dt>主演 :</dt><dd>&nbsp;&nbsp;'+(data.casts[0]?data.casts[0].name:'&nbsp;')+'</dd>';
				html += '<dt>年份 :</dt><dd>&nbsp;&nbsp;'+data.year+'</dd>';
				html += '<dt>豆瓣 :</dt><dd>&nbsp;&nbsp;<a target="blank" href="'+data.alt+'">点这里</a></dd>';
				html += '<dt>国家 :</dt><dd>&nbsp;&nbsp;'+data.countries.join('/')+'</dd>';
				html += '<dt>类型 :</dt><dd>&nbsp;&nbsp;'+data.genres.join('/')+'</dd>';
				info.html(html);
				describe.html(data.summary.split('\n').join('<br/>'));
			}
		});
		load.fadeIn(0);
		$.fn.fullpage.moveSectionDown();
	});
	// 按钮事件
	$('#MoviesGoTypes').click(function (){
		$.fn.fullpage.moveSectionUp();
	});
	$('#MovieGoMovies').click(function (){
		$.fn.fullpage.moveSectionUp();
	});
	$('#MovieGoTypes').click(function (){
		$.fn.fullpage.moveSectionDown();
	});
});