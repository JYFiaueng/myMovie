### gh-page
[我的影展](https://jyfiaueng.github.io/myMovie/)

### 作用
		根据豆瓣id将用户的电影数据抓取根据类型整理数据到targetData文件夹中。
		将targetData文件夹中的数据全部复制到gh-page的data中即可自动展示。
		数据爬的比较慢，豆瓣一小时只让请求150次，因此命令行未结束之前只能等着。
		cli > node crawler-douban.js即可自动运行。