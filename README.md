# vue版 滑动拼图

## 安装
	npm i vue-puzzle-slider

## 0. 使用前提
* 将包中的static文件夹下的文件放到本地static文件夹下
* 安装了axios请求方式，并在全局封装了$get(get方式)和$post(post方式)
* 范围值计算方式推荐
>
	xMin = space + r + squareX / 2;
	xMax = width - r - space - squareX;
	yMin = space + r;
	yMax = height - r - space - squareX;
>

## 1. 参数
* `dev`：前端调试模式，临时修改url1与url2返回的值-->Boolean;非必传;默认*false*

* `space`：抠图到图形边沿的距离-->Number;非必传;默认*10*

* `url1`：向后台传参`r（圆弧最大半径）`、
`squareX（方块边长）`、
`width（当前画布的宽）`、
`height（当前画布的高）`和
`space（内边距）`,需要返回`code（请求状态码）`、
`token（唯一校验）`、
`width（假）`、
`height（假）`和
`抠图位置信息x，y`的接口-->String;必传

* `url1Type`：url1的http请求方式-->String;非必传;默认*'get'*

* `url2`：向后台传参`x（验证数据）`、
`time（验证时间）`和
`token（唯一校验）`,需要返回`code（请求状态码,123为拼接错误）`、`percentage（完成效率）`和
`result（完成后的唯一值）`的接口-->String;必传

* `url2Type`：url2的http请求方式-->String;非必传;默认*'post'*

* `v-model`：v-model双向绑定数据-->String;非必传

* `showBtn`：是否显示点击按钮-->Boolean;非必传;默认*true*

* `w`：显示按钮的宽-->String;非必传;默认*'100%'*

* `h`：显示按钮的高-->String;非必传;默认*'100%'*

* `imgList`：拼图随机的图片路径列表-->Array;非必传;

* `@change`：触发验证监听-->第一个参数返回true/false，第二个参数返回验证加密码

## 2. 方法
* `initPop`：手动触发验证-->建议showBtn为false时使用


## 3.待开发
* url1时，三张验证图片传输（后台开发）
* url2时，传递用户的行为数据分析（前端获取，后端验证）
* url2时，传递用户的时长占比（后端验证）