<script setup>
import { onMounted, ref, watch } from 'vue'
import { get, set } from 'idb-keyval';

const screenSize = { width: 992, height: 744 };

//後々で中身を定義してあげる子たち
let media
let mediaSize = screenSize//screenSizeは仮置き
let canvasCtx
let canvasId

//キャンバス上のポインターの座標が入る
let canvasX
let canvasY

//document.getElementByClassNameするやつ
let video
let canvas

let selectRectangle = ref({
  startX: 0,
  startY: 0,
  width: 0,
  height: 0,
  clear: function () {
    this.startY = 0;
    this.startX = 0;
    this.height = 0;
    this.width = 0;
  }
})

//キャリブレーション中かどうかのフラグ
const isCalibrating = ref(false)

// バッタン入力配列
// [y][x]
let battan_input = Array(11);
for (var i = 0; i < battan_input.length; i++) {
  battan_input[i] = [false, false, false, false, false];
}

onMounted(() => {
  //有言実行。letした変数を埋めます
  video = document.getElementsByClassName('video')[0]
  canvas = document.getElementsByClassName('canvas')[0]
  //コンテキストを定義
  canvasCtx = canvas.getContext('2d');
})

function calibrate() {
  if(isCalibrating.value){
    _canvasUpdate()
    isCalibrating.value = false
    console.log('isCalibrating == ', isCalibrating.value)
    return
  }
  isCalibrating.value = true
  console.log('isCalibrating == ', isCalibrating.value)
  cancelAnimationFrame(canvasId)
  //半透明の四角形を配置
  canvasCtx.fillStyle = "rgba(" + [255, 255, 255, 0.3] + ")";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
}

function getPointerOnCanvas(mouseEvent){
  const rect = mouseEvent.target.getBoundingClientRect();
  //ブラウザ上のクリック座標を求めるのです。
  const viewX = mouseEvent.clientX - rect.left
  const viewY = mouseEvent.clientY - rect.top
  //キャンバスの表示サイズと実sizeの比も求めましょ。
  const scaleWidth = canvas.clientWidth / canvas.width
  const scaleHeight = canvas.clientHeight / canvas.height
  //ブラウザ上のクリック座標をキャンバス上の座標に変換するよ。
  canvasX = Math.floor(viewX / scaleWidth)
  canvasY = Math.floor(viewY / scaleHeight)
}

//キャンバス上のクリック座標を求め、矩形選択の始点を決定
function canvasOnMouseDown(e){
  getPointerOnCanvas(e)
  console.log(canvasX, canvasY)

  if(isCalibrating.value) {
    selectRectangle.value.startX = canvasX
    selectRectangle.value.startY = canvasY
    canvas.addEventListener('mousemove', onMouseMove)
  }
}
//選択範囲に枠線を引く
function onMouseMove(e){
  getPointerOnCanvas(e)
  selectRectangle.value.width = canvasX - selectRectangle.value.startX
  selectRectangle.value.height = canvasY - selectRectangle.value.startY
  videoRendering()
  //videoRendering()に枠線を書く処理が含まれてる
}
function canvasOnMouseUp(e){
  canvas.removeEventListener('mousemove', onMouseMove)
  isCalibrating.value = false
  console.log('isCalibrating ==', isCalibrating.value)
  _canvasUpdate()
}

// video要素に画面の映像を表示するよ
function onWindowSelect() {
  console.log('start')
  media = navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true
  }).then(function (stream) {
    video.srcObject = stream

    //mediaの縦と横のピクセル数を代入。このgetVideoTracks()[0].getSettings().widthってやつ探すの死ぬほど大変だったんだけど！！！！
    mediaSize.width = video.srcObject.getVideoTracks()[0].getSettings().width
    mediaSize.height = video.srcObject.getVideoTracks()[0].getSettings().height
  });

  // video要素の映像をcanvasに描画する
  _canvasUpdate()
}

function _canvasUpdate() {
  videoRendering()
  canvasId = requestAnimationFrame(_canvasUpdate)
};

//キャプチャ画面をレンダリングする関数
function videoRendering(){
  //まず画面全体を白でリセット
  canvasCtx.fillStyle = "white";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

  //縦横比を合わせつつキャンバスの大きさに合うよう拡大縮小
  if (canvas.width / mediaSize.width * mediaSize.height <= canvas.height) {//縦幅がcanvasの範囲に収まったら
    //横幅を固定して縦幅を調節する
    let fixedHeight = canvas.width / mediaSize.width * mediaSize.height
    //画面中央に表示
    canvasCtx.drawImage(video, 0, (canvas.height - fixedHeight) / 2, canvas.width, fixedHeight)
  } else {
    let fixedWidth = canvas.height / mediaSize.height * mediaSize.width
    canvasCtx.drawImage(video, (canvas.width - fixedWidth) / 2, 0, fixedWidth, canvas.height)
  }
  //キャリブレーション中なら画面を白くする
  if(isCalibrating.value){
    canvasCtx.fillStyle = "rgba(" + [255, 255, 255, 0.3] + ")";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
  }
  canvasCtx.strokeStyle = "rgb(255, 0, 0)"
  canvasCtx.strokeRect(selectRectangle.value.startX, selectRectangle.value.startY, selectRectangle.value.width, selectRectangle.value.height)
}
watch(selectRectangle.value, ()=>{
  if(!isCalibrating.value){
    console.log('changed!')
    canvasCtx.strokeStyle = "rgb(255, 0, 0)"
    canvasCtx.strokeRect(selectRectangle.value.startX, selectRectangle.value.startY, selectRectangle.value.width, selectRectangle.value.height)
  }
})

</script>

<template>
  <div class="videoPreview">
    <video class="video" style="display:none;" :width="screenSize.width" :height="screenSize.height" autoplay />
  </div>
  <div id="canvasPreview">
    <canvas class="canvas" @mousedown="canvasOnMouseDown" @mouseup="canvasOnMouseUp" width="992" height="744" />
  </div>
  <button class="startBtn" @click="onWindowSelect">ウィンドウ選択</button>
  <button class="calibrateBtn" @click="calibrate" v-if="!isCalibrating">キャリブレーション</button>
  <button class="calibrateBtn" @click="calibrate" v-else>キャリブレーションをキャンセル</button>
  <br />
  <label>始点X<input type="text" v-model="selectRectangle.startX" /></label> <label>横幅<input type="text" v-model="selectRectangle.width" /></label>
  <br />
  <label>始点Y<input type="text" v-model="selectRectangle.startY"/></label> <label>縦幅<input type="text" v-model="selectRectangle.height"/></label>
</template>

<style scoped>
.canvas {
  width: 70vw;
  min-width: 480px;
}
label {
  margin: 1em;
}
</style>

