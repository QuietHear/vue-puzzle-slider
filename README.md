# vue版 滑动拼图

## 安装
	npm i vue-puzzle-slider

## 0. 使用前提
* 将包中的static文件夹下的文件放到本地static文件夹下
* 安装了axios请求方式，并在全局封装了$get(get方式)和$post(post方式)

## 1. 参数
* `url1`：向后台发送r（圆弧最大半径）、squareX（方块边长）、width（当前画布的宽）和height（当前画布的高）【提前商定好：默认内边距--10px】,获取code（token）、width（假）、height（假）以及位置信息x，y的接口-->String;必传
* `url2`：向后台发送x（验证数据以）及code（token）的接口【提前商量好超时时间、检测误差±10px以及超时（成功、非人为）状态码】，获取到检测结果-->String;必传
* `v-model`：v-model双向绑定数据-->String;非必传
* `showBtn`：是否显示点击按钮-->Boolean;非必传;默认*true*
* `w`：按钮显示时的宽-->String;非必传;默认*'100%'*
* `h`：按钮显示时的高-->String;非必传;默认*'100%'*
* `imgList`：图片路径列表-->Array;非必传;默认组建中static下的图片路径

## 2. 方法
* `change`：触发验证监听-->第一个参数返回true/false，第二个参数返回验证加密码
* `initPop`：手动触发验证-->建议showBtn为false时使用

## 3.注意
	xMin = 10 + r + squareX / 2;
	xMax = width - r - 10 - squareX;
	yMin = 10 + r;
	yMax = height - r - 10 - squareX;

## 4.待开发
* url1时，三张验证图片传输（后台开发）
* url2时，传递用户的行为数据分析（前端获取，后端验证）
* url2时，传递用户的时长占比（后端验证）

