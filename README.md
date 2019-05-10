# vue版 滑动拼图

## 安装
	npm i vue-puzzle-slider

## 0. 使用前提
将包中的static文件夹下的文件放到本地static文件夹下

## 1. 参数
* `v-model`：v-model双向绑定数据-->Boolean;非必传
* `showBtn`：是否显示点击按钮-->Boolean;非必传;默认*true*
* `w`：按钮显示时的宽-->String;非必传;默认*'100%'*
* `h`：按钮显示时的高-->String;非必传;默认*'100%'*
* `imgList`：图片路径列表-->Array;非必传;默认组建中static下的图片路径

## 2. 方法
* `change`：触发验证监听-->第一个参数返回true/false
* `initPop`：手动触发验证-->建议showBtn为false时使用

