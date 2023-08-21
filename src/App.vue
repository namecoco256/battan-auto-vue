<script setup>
import { onMounted, ref, watch } from 'vue'
const screenSize = { width: 1280, height: 720 };

//後々で中身を定義してあげる子たち
let media
let mediaSize = screenSize//screenSizeは仮置き
let canvasCtx
onMounted(() => {
  // コンテキストを定義
  canvasCtx = canvas.getContext('2d');
})

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
    <video id="video" style="display:none;" :width="screenSize.width" :height="screenSize.height" autoplay />
  </div>
  <div id="canvasPreview">
    <canvas id="canvas" :width="screenSize.width" :height="screenSize.height" />
  </div>
  <button id="startBtn" @click="startBtnOnClick">解析開始</button>

</template>

<style scoped>
#canvas {
  margin-top:5px;
  width:50%;
}
</style>

