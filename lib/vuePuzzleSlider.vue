/*
* @Author: aFei
* @Date: 2019-04-30 14:11:53
*/
/*
 * @LastEditors: afei
 * @LastEditTime: 2020-12-09 14:09:48
*/
<template>
  <div class="vue-puzzle-slider" :style="{ width: w, height: h }">
    <div class="load-btn" v-if="loadBtn && showBtn">
      <div class="ding">
        <div></div>
        <div></div>
        <div></div>
      </div>
      加载中
    </div>
    <div
      class="test-btn"
      @click="initPop"
      v-if="testBtn && !showPop && showBtn"
    >
      <div class="ding">
        <div class="out"></div>
        <div class="in"></div>
      </div>
      点击按钮进行验证
    </div>
    <div class="testing-btn" v-if="showPop && showBtn">验证中</div>
    <div class="success-btn" v-if="successBtn && showBtn">
      <span class="source"></span>验证成功
    </div>
    <div
      class="reg-pop"
      v-if="showPop"
      @mousemove="dragMove"
      @mouseup="dragUp"
      :class="[
        popAnimate,
        ending === true ? 'ending' : '',
        testContent === true ? 'test-pop' : '',
        timesContent === true ? 'times-pop' : '',
        successContent === true ? 'success-pop' : '',
      ]"
    >
      <div class="load-content" v-if="loadContent">
        <div></div>
        <p>智能验证检测中</p>
      </div>
      <div class="test-content" v-if="testContent">
        <div class="img-top">
          <div class="bg">
            <div class="source nothing"></div>
            <p>加载中...</p>
          </div>
          <div
            class="test"
            :class="[
              refresh === true ? 'hide' : '',
              popAnimate === 'success' ? 'none' : '',
            ]"
          >
            <canvas ref="testLost" width="260px" height="156px"></canvas>
            <canvas ref="testOne" width="260px" height="156px"></canvas>
          </div>
          <div
            class="right"
            :class="[
              refresh === true ? 'hide' : '',
              popAnimate === 'success' ? 'bright' : 'none',
            ]"
          >
            <canvas ref="right" width="260px" height="156px"></canvas>
          </div>
          <div
            class="result-msg"
            :class="[
              testStatus !== 0 ? 'show' : '',
              testSuccess === true ? 'success' : '',
            ]"
          >
            <span v-if="testSuccess === true"
              >{{ time }} 秒的速度超过 {{ percentage }}% 的用户</span
            >
            <span v-else-if="testSuccess === false && percentage < 0"
              >动作太慢，方块被怪兽吃掉了</span
            >
            <span v-else>拖动滑块将悬浮图像正确拼合</span>
          </div>
        </div>
        <div class="btn-middle source">
          <div
            class="source drag-btn"
            ref="dragBtn"
            :class="
              moveBtnStatus === 1
                ? 'drag'
                : moveBtnStatus === 2
                ? 'drag-end'
                : ''
            "
            @mousedown="dragDown"
          ></div>
          <span
            :class="
              moveTxtStatus === 1 ? 'hide' : moveTxtStatus === 2 ? 'none' : ''
            "
            >拖动左边滑块完成上方拼图</span
          >
        </div>
        <div class="operate-bottom">
          <div class="source close" @click="closePop">
            <div class="msg">关闭验证</div>
          </div>
          <div class="source refresh" @click="drawImg">
            <div class="msg">刷新验证</div>
          </div>
        </div>
      </div>
      <div class="success-content" v-if="successContent">
        <div class="container">
          <div class="out">
            <div class="pie"></div>
            <div class="filter"></div>
            <div class="mask"></div>
          </div>
          <div class="in">
            <div class="source"></div>
          </div>
        </div>
        <p>通过验证</p>
      </div>
      <div class="times-content" v-if="timesContent">
        <div class="source"></div>
        <p>{{ errMsg }}</p>
        <div class="error-msg">
          <span @click="doAgain">请点击此处重试</span>
          <em v-if="errMsg !== '尝试过多'"> or </em>
          <span @click="elseClose" v-if="errMsg !== '尝试过多'">关闭验证</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "vue-puzzle-slider",
  data() {
    return {
      loadBtn: true, // 加载按钮
      testBtn: false, // 加载按钮
      successBtn: false, // 成功按钮
      showPop: false,
      ending: false, // 关闭弹窗
      testWidth: 50, // 碎片儿宽
      testHeight: 50, // 碎片儿高
      testX: 0, // 碎片儿距离左边距离
      testXMin: 0, // 碎片儿距离左边距离最小值
      testXMax: 0, // 碎片儿距离左边距离最大值
      testY: 0, // 碎片儿距离右边距离
      testYMin: 0, // 碎片儿距离右边距离最小值
      testYMax: 0, // 碎片儿距离右边距离最大值
      testr: 0, // 碎片儿圆圈实际半径
      testrMin: 7, // 碎片儿圆圈最小半径
      testrMax: 12, // 碎片儿圆圈最大半径
      testPath: [], // 碎片儿缺口方向
      moveMin: 0, // 碎片儿移动最小偏移
      moveMax: 0, // 碎片儿移动最大偏移
      moveBtnStatus: 0, // 碎片儿移动--按钮状态
      moveTxtStatus: 0, // 碎片儿移动--文字状态
      beginPageX: 0, // 页面偏移量
      beginOffsetX: 0, // 父元素偏移量
      testStatus: 0, // 测试结果状态 0 未进行，1 已进行
      testSuccess: false, // 测试结果
      popAnimate: "", // 测试结果
      loadContent: false, // 加载时展示内容（需转换）
      testContent: false, // 运行时展示内容（需转换）,
      successContent: false, // 成功后展示内容（需转换）
      timesContent: false, // 超过次数后展示内容（需转换）
      timesMax: 6, // 最大尝试次数
      times: 0, // 当前次数
      time: 0, // 拼图时间
      percentage: 0, // 拼图效率百分比
      timeInit: null, // 拼图时间
      refresh: false, // 刷新中
      errMsg: "尝试过多", // 错误信息
      token: "", // 当前唯一值
    };
  },
  model: {
    prop: "value",
    event: "changeValue",
  },
  props: {
    dev: {
      type: Boolean,
      default: false,
    },
    space: {
      type: Number,
      default: 10,
    },
    url1: {
      type: String,
      required: true,
    },
    url1Type: {
      type: String,
      default: "get",
    },
    url2: {
      type: String,
      required: true,
    },
    url2Type: {
      type: String,
      default: "post",
    },
    value: {
      type: String,
      default: "",
    },
    w: {
      type: String,
      default: "100%",
    },
    h: {
      type: String,
      default: "100%",
    },
    showBtn: {
      type: Boolean,
      default: true,
    },
    imgList: {
      type: Array,
      default: () => {
        return [
          require("../lib/source/img1.png"),
          require("../lib/source/img2.png"),
          require("../lib/source/img3.png"),
          require("../lib/source/img4.png"),
          require("../lib/source/img5.png"),
          require("../lib/source/img6.png"),
          require("../lib/source/img7.png"),
          require("../lib/source/img8.png"),
          require("../lib/source/img9.png"),
          require("../lib/source/img10.png"),
        ];
      },
    },
  },
  mounted() {
    let it = this;
    setTimeout(() => {
      it.loadBtn = false;
      it.testBtn = true;
    }, 500);
  },
  methods: {
    initPop() {
      window.addEventListener("click", this.popListener, false);
    },
    closest(el, selector) {
      // 实现closest()方法
      let matchesSelector =
        el.matches ||
        el.webkitMatchesSelector ||
        el.mozMatchesSelector ||
        el.msMatchesSelector;
      while (el) {
        if (matchesSelector.call(el, selector)) {
          break;
        }
        el = el.parentElement;
      }
      return el;
    },
    popListener(e) {
      // 监听关闭弹窗事件
      if (
        this.closest(e.target, ".reg-pop") === null &&
        this.popAnimate !== "success"
      ) {
        if (!this.showPop) {
          this.showPop = true;
          this.testContent = false;
          this.loadContent = true;
          this.times = 0;
          let it = this;
          setTimeout(() => {
            it.loadContent = false;
            it.testContent = true;
            it.$nextTick(() => {
              it.drawImg();
            });
          }, 1000);
        } else {
          this.closePop();
        }
      }
    },
    doAgain() {
      // 重试
      this.times = 0;
      this.timesContent = false;
      this.testContent = true;
      let it = this;
      this.$nextTick(() => {
        it.drawImg();
      });
    },
    drawImg() {
      // 画布重写
      this.times += 1;
      if (this.times > this.timesMax) {
        this.testContent = false;
        this.errMsg = "尝试过多";
        this.timesContent = true;
      } else {
        this.refresh = true;
        this["$" + this.url1Type](this.url1, {
          r: this.testrMax,
          squareX: this.testWidth,
          width: this.$refs.right.width,
          height: this.$refs.right.height,
          space: this.space,
        }).then((res) => {
          if (this.dev) {
            res.code = 200;
          }
          if (res.code === 200) {
            this.token = res.data.token;
            let it = this;
            setTimeout(() => {
              it.refresh = false;
              let c = it.$refs.right,
                c_lost = it.$refs.testLost,
                c_one = it.$refs.testOne,
                ctx = c.getContext("2d"),
                ctx_lost = c_lost.getContext("2d"),
                ctx_one = c_one.getContext("2d"),
                img = it.newImg();
              it.testPath = [...it.randomPath()];
              it.testr = Math.floor(
                Math.random() * (it.testrMax - it.testrMin + 1) + it.testrMin
              ); // （左开右闭区间，+1）
              it.testXMin = it.space + it.testWidth / 2;
              it.testXMax = c.width - it.space - it.testWidth;
              it.testYMin = it.space;
              it.testYMax = c.height - it.space - it.testHeight;
              for (let i = 0; i < it.testPath.length; i++) {
                if (
                  it.testPath[i].direction === "left" &&
                  it.testPath[i].much === "outside"
                ) {
                  it.testXMin = it.space + it.testr + it.testWidth / 2;
                } else if (
                  it.testPath[i].direction === "right" &&
                  it.testPath[i].much === "outside"
                ) {
                  it.testXMax = c.width - it.testr - it.space - it.testWidth;
                } else if (
                  it.testPath[i].direction === "top" &&
                  it.testPath[i].much === "outside"
                ) {
                  it.testYMin = it.space + it.testr;
                } else if (
                  it.testPath[i].direction === "bottom" &&
                  it.testPath[i].much === "outside"
                ) {
                  it.testYMax = c.height - it.testr - it.space - it.testHeight;
                }
              }
              if (this.dev) {
                it.testX = Math.floor(
                  Math.random() * (it.testXMax - it.testXMin + 1) + it.testXMin
                ); //（左开右闭区间，+1）
                it.testY = Math.floor(
                  Math.random() * (it.testYMax - it.testYMin + 1) + it.testYMin
                ); //（左开右闭区间，+1）
              } else {
                it.testX = this.decResult(res.data.x);
                it.testY = res.data.y;
              }
              it.moveMin = -it.testX + it.testXMin - it.testWidth / 2;
              it.moveMax = it.testXMax - it.testX;
              c_one.style.left = it.moveMin + "px";
              ctx.clearRect(0, 0, c.width, c.height);
              ctx_lost.clearRect(0, 0, c_lost.width, c_lost.height);
              ctx_lost.clearRect(0, 0, c_lost.width, c_lost.height);
              ctx_one.clearRect(0, 0, c_one.width, c_one.height);
              img.onload = () => {
                // 画正确图片
                ctx.drawImage(
                  img,
                  0,
                  0,
                  img.width,
                  img.height,
                  0,
                  0,
                  c.width,
                  c.height
                );
                // 画缺口图片
                ctx_lost.save();
                ctx_lost.drawImage(
                  img,
                  0,
                  0,
                  img.width,
                  img.height,
                  0,
                  0,
                  c.width,
                  c.height
                );
                ctx_lost.strokeStyle = "rgba(255,255,255,.4)";
                ctx_lost.lineWidth = 1;
                ctx_lost.beginPath();
                ctx_lost.moveTo(it.testX, it.testY);
                it.testPath.forEach((item) => {
                  item.direction === "top" ? it.drawCircle(ctx_lost, item) : "";
                });
                ctx_lost.lineTo(it.testX + it.testWidth, it.testY);
                it.testPath.forEach((item) => {
                  item.direction === "right"
                    ? it.drawCircle(ctx_lost, item)
                    : "";
                });
                ctx_lost.lineTo(
                  it.testX + it.testWidth,
                  it.testY + it.testHeight
                );
                it.testPath.forEach((item) => {
                  item.direction === "bottom"
                    ? it.drawCircle(ctx_lost, item)
                    : "";
                });
                ctx_lost.lineTo(it.testX, it.testY + it.testHeight);
                it.testPath.forEach((item) => {
                  item.direction === "left"
                    ? it.drawCircle(ctx_lost, item)
                    : "";
                });
                ctx_lost.lineTo(it.testX, it.testY);
                ctx_lost.closePath();
                ctx_lost.stroke();
                ctx_lost.restore();
                ctx_lost.save();
                ctx_lost.fillStyle = "rgba(0,0,0,.65)";
                ctx_lost.fill();
                ctx_lost.restore();
                // 画碎片
                ctx_one.strokeStyle = "#F6F152";
                ctx_one.lineWidth = 3.5;
                ctx_one.shadowBlur = 5;
                ctx_one.shadowOffsetX = 0;
                ctx_one.shadowOffsetY = 0;
                ctx_one.shadowColor = "black";
                ctx_one.save();
                ctx_one.beginPath();
                ctx_one.moveTo(it.testX, it.testY);
                it.testPath.forEach((item) => {
                  item.direction === "top" ? it.drawCircle(ctx_one, item) : "";
                });
                ctx_one.lineTo(it.testX + it.testWidth, it.testY);
                it.testPath.forEach((item) => {
                  item.direction === "right"
                    ? it.drawCircle(ctx_one, item)
                    : "";
                });
                ctx_one.lineTo(
                  it.testX + it.testWidth,
                  it.testY + it.testHeight
                );
                it.testPath.forEach((item) => {
                  item.direction === "bottom"
                    ? it.drawCircle(ctx_one, item)
                    : "";
                });
                ctx_one.lineTo(it.testX, it.testY + it.testHeight);
                it.testPath.forEach((item) => {
                  item.direction === "left" ? it.drawCircle(ctx_one, item) : "";
                });
                ctx_one.lineTo(it.testX, it.testY);
                ctx_one.closePath();
                ctx_one.stroke();
                ctx_one.stroke();
                ctx_one.stroke();
                ctx_one.clip();
                ctx_one.drawImage(
                  img,
                  0,
                  0,
                  img.width,
                  img.height,
                  0,
                  0,
                  c.width,
                  c.height
                );
                ctx_one.restore();
              };
            }, 1000);
          } else {
            try {
              throw new ReferenceError(data.message ? data.message : data.msg);
            } catch (e) {
              alert(e);
            } finally {
              this.token = "";
              this.testContent = false;
              this.errMsg = "网络超时";
              this.timesContent = true;
            }
          }
        });
      }
    },
    decResult(x) {
      // 解密
      let result = window.atob(result);
      result = parseInt(result, 8);
      result = Math.sqrt(result + 64);
      return result;
    },
    newImg() {
      // 输出图片
      let img = new Image();
      img.src = this.imgList[Math.floor(Math.random() * this.imgList.length)];
      return img;
    },
    randomPath() {
      // 方向不重复的组合
      const direction = ["top", "right", "bottom", "left"],
        much = ["outside", "inside"];
      let lin = [...direction],
        result = [];
      for (let i = 0; i < 2; i++) {
        let x = Math.floor(Math.random() * lin.length);
        result[i] = {
          direction: lin[x],
          much: much[Math.floor(Math.random() * much.length)],
        };
        lin.splice(x, 1);
      }
      return result;
    },
    drawCircle(ctx, path) {
      // 画缺角
      let changeX = this.testr,
        changeY = this.testr;
      switch (path.direction) {
        case "top":
          changeY = path.much === "inside" ? changeY : -changeY;
          ctx.lineTo(this.testX + this.testWidth / 2 - changeX, this.testY);
          ctx.arcTo(
            this.testX + this.testWidth / 2 - changeX,
            this.testY + changeY,
            this.testX + this.testWidth / 2,
            this.testY + changeY,
            this.testr
          );
          ctx.arcTo(
            this.testX + this.testWidth / 2 + changeX,
            this.testY + changeY,
            this.testX + this.testWidth / 2 + changeX,
            this.testY,
            this.testr
          );
          break;
        case "right":
          changeX = path.much === "inside" ? -changeX : changeX;
          ctx.lineTo(
            this.testX + this.testWidth,
            this.testY + this.testHeight / 2 - changeY
          );
          ctx.arcTo(
            this.testX + this.testWidth + changeX,
            this.testY + this.testHeight / 2 - changeY,
            this.testX + this.testWidth + changeX,
            this.testY + this.testHeight / 2,
            this.testr
          );
          ctx.arcTo(
            this.testX + this.testWidth + changeX,
            this.testY + this.testHeight / 2 + changeY,
            this.testX + this.testWidth,
            this.testY + this.testHeight / 2 + changeY,
            this.testr
          );
          break;
        case "bottom":
          changeY = path.much === "inside" ? -changeY : changeY;
          ctx.lineTo(
            this.testX + this.testWidth / 2 + changeX,
            this.testY + this.testHeight
          );
          ctx.arcTo(
            this.testX + this.testWidth / 2 + changeX,
            this.testY + this.testHeight + changeY,
            this.testX + this.testWidth / 2,
            this.testY + this.testHeight + changeY,
            this.testr
          );
          ctx.arcTo(
            this.testX + this.testWidth / 2 - changeX,
            this.testY + this.testHeight + changeY,
            this.testX + this.testWidth / 2 - changeX,
            this.testY + this.testHeight,
            this.testr
          );
          break;
        case "left":
          changeX = path.much === "inside" ? changeX : -changeX;
          ctx.lineTo(this.testX, this.testY + this.testHeight / 2 + changeY);
          ctx.arcTo(
            this.testX + changeX,
            this.testY + this.testHeight / 2 + changeY,
            this.testX + changeX,
            this.testY + this.testHeight / 2,
            this.testr
          );
          ctx.arcTo(
            this.testX + changeX,
            this.testY + this.testHeight / 2 - changeY,
            this.testX,
            this.testY + this.testHeight / 2 - changeY,
            this.testr
          );
          break;
      }
    },
    dragDown(e) {
      // 开始拖拽
      if (this.moveTxtStatus === 0 && this.refresh === false) {
        this.moveBtnStatus = 1;
        this.moveTxtStatus = 1;
        let it = this;
        this.time = 0;
        this.timeInit = setInterval(() => {
          it.time = Math.round((it.time + 0.1) * 10) / 10;
        }, 100);
        setTimeout(() => {
          it.moveTxtStatus = 2;
        }, 50);
        this.beginPageX = e.pageX;
        this.beginOffsetX = e.offsetX;
      }
    },
    dragMove(e) {
      // 拖拽进行中
      if (this.moveBtnStatus === 1) {
        if (e.pageX - this.beginPageX < 0) {
          this.$refs.dragBtn.style.left = "0px";
          this.$refs.testOne.style.left = this.moveMin + "px";
        } else if (e.pageX - this.beginPageX > 260 - 56) {
          // 根据实际CSS调整
          this.$refs.dragBtn.style.left = "204px";
          this.$refs.testOne.style.left = this.moveMax + "px";
        } else {
          this.$refs.testOne.style.left =
            this.moveMin +
            ((this.moveMax - this.moveMin) * (e.pageX - this.beginPageX)) /
              (260 - 56) +
            "px";
          this.$refs.dragBtn.style.left = e.pageX - this.beginPageX + "px";
        }
      }
    },
    dragUp() {
      // 拖拽结束
      if (this.moveBtnStatus === 1) {
        clearInterval(this.timeInit);
        this.timeInit = null;
        this.moveBtnStatus = 2;
        this.testStatus = 1;
        this.moveTxtStatus = 1;
        this.checkResult();
      }
    },
    checkResult() {
      // 检测结果
      this["$" + this.url2Type](this.url2, {
        x: this.encResult(
          parseInt(this.$refs.testOne.style.left) - this.moveMin
        ),
        time: this.time,
        token: this.token,
      }).then((res) => {
        if (this.dev) {
          res.code = 200;
          res.data.percentage = 100 - Math.round((this.time / 5) * 100);
        }
        this.percentage = res.data.percentage;
        if (res.code === 200) {
          if (this.percentage > 0) {
            this.testSuccess = true;
            this.popAnimate = "success";
            let it = this;
            setTimeout(() => {
              it.testStatus = 0;
              it.testContent = false;
              it.successContent = true;
              setTimeout(() => {
                window.removeEventListener("click", it.popListener, false);
                it.testBtn = false;
                it.ending = true;
                setTimeout(() => {
                  this.ending = false;
                  it.showPop = false;
                  it.successBtn = true;
                  it.$emit("changeValue", res.data.result);
                  it.$emit("change", true, res.data.result);
                }, 1000);
              }, 1100);
            }, 1000);
          } else {
            // 超时
            this.testSuccess = false;
            this.popAnimate = "wrong";
            let it = this;
            setTimeout(() => {
              it.$refs.testOne.style.opacity = 0;
              setTimeout(() => {
                it.popAnimate = "";
                it.testStatus = 0;
                it.$refs.dragBtn.style.left = "0px";
                it.$refs.testOne.style.left = this.moveMin + "px";
                it.$refs.testOne.style.opacity = 1;
                setTimeout(() => {
                  it.moveTxtStatus = 0;
                  it.moveBtnStatus = 0;
                }, 500);
              }, 500);
            }, 1000);
          }
        } else if (res.code === 123) {
          // 拼接错误
          this.times += 1;
          if (this.times > this.timesMax) {
            this.testContent = false;
            this.errMsg = "尝试过多";
            this.timesContent = true;
          } else {
            this.percentage = 1; // 临时修改数据，区别超时的情况
            this.testSuccess = false;
            this.popAnimate = "wrong";
            let it = this;
            setTimeout(() => {
              it.$refs.testOne.style.opacity = 0;
              setTimeout(() => {
                it.popAnimate = "";
                it.testStatus = 0;
                it.$refs.dragBtn.style.left = "0px";
                it.$refs.testOne.style.left = this.moveMin + "px";
                it.$refs.testOne.style.opacity = 1;
                setTimeout(() => {
                  it.moveTxtStatus = 0;
                  it.moveBtnStatus = 0;
                }, 500);
              }, 500);
            }, 1000);
          }
        } else {
          try {
            throw new ReferenceError(res.message ? res.message : res.msg);
          } catch (e) {
            alert(e);
          } finally {
            this.token = "";
            this.testContent = false;
            this.errMsg = "网络超时";
            this.timesContent = true;
          }
        }
      });
    },
    encResult(x) {
      // 加密
      let result = (x + 4) * (x - 4);
      result = result.toString(4);
      result = window.btoa(result);
      return result;
    },
    closePop() {
      // 关闭弹窗
      if (this.testContent === true && this.popAnimate !== "success") {
        window.removeEventListener("click", this.popListener, false);
        this.ending = true;
        clearInterval(this.timeInit);
        this.timeInit = null;
        let it = this;
        setTimeout(() => {
          it.testStatus = 0;
          it.moveTxtStatus = 0;
          it.moveBtnStatus = 0;
          this.ending = false;
          it.showPop = false;
          this.$emit("changeValue", "");
          this.$emit("change", false, "");
        }, 1000);
      }
    },
    elseClose() {
      // 错误弹窗的关闭
      window.removeEventListener("click", this.popListener, false);
      this.showPop = false;
      this.timesContent = false;
      this.$emit("changeValue", "");
      this.$emit("change", false, "");
    },
  },
};
</script>

<style scoped>
@import "style/vuePuzzleSlider.css";
</style>