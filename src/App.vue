<script setup>
import { onMounted, ref, watch } from 'vue'
const screenSize = { width: 992, height: 744 };

//後々で中身を定義してあげる子たち
let media
let mediaSize = screenSize//screenSizeは仮置き
let canvasCtx

let rect
//document.getElementByClassNameするやつ
let video
let canvas
onMounted(() => {
  //有言実行。letを埋めます
  video = document.getElementsByClassName('video')[0]
  canvas = document.getElementsByClassName('canvas')[0]
  //コンテキストを定義
  canvasCtx = canvas.getContext('2d');
})

const canvasOnClick = (e) => {
  rect =     rect = e.target.getBoundingClientRect();
  //ブラウザ上のクリック座標を求めるのです。
  const viewX = e.clientX - rect.left
  const viewY = e.clientY - rect.top
  //キャンバスの表示サイズと実sizeの比も求めましょ。
  const scaleWidth = canvas.clientWidth / canvas.width
  const scaleHeight = canvas.clientHeight / canvas.height
  //ブラウザ上のクリック座標をキャンバス上の座標に変換するよ。
  const canvasX = Math.floor(viewX / scaleWidth)
  const canvasY = Math.floor(viewY / scaleHeight)

  console.log(canvasX, canvasY)
}


// video要素に画面の映像を表示するよ
function startBtnOnClick() {
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

  requestAnimationFrame(_canvasUpdate)
};

</script>

<template>
  <div id="videoPreview">
    <video class="video" style="display:none;" :width="screenSize.width" :height="screenSize.height" autoplay />
  </div>
  <div id="canvasPreview">
    <canvas class="canvas" @click="canvasOnClick" :width="screenSize.width" :height="screenSize.height" />
  </div>
  <button class="startBtn" @click="startBtnOnClick">解析開始</button>
  <button class="calibrateBtn" @click="calibration">キャリブレーション</button>

</template>

<style scoped>
.canvas {
  width:70vw;
  min-width: 480px;
}
</style>

