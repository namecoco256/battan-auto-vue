<script setup>
import { onMounted, ref, watch } from 'vue'
import { get, set } from 'idb-keyval';
import PatternDisplay from './components/PatternDisplay.vue'

///// 変数・配列の定義 /////
const screenSize = { width: 992, height: 744 };
const canvasSize = { width: 992, height: 744 }
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

const patternDisplay = ref()

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
//スキャン中かどうかのフラグ
const isScanning = ref(false)
//ミニゲーム進行中か判定をするかしないか
const isJudgeGaming = ref(false)
//ミニゲーム進行中かどうかの判定
let isGaming = false
//
const isWindowSelected = ref(false)

// バッタン入力配列
// 0:未入力 1:バッタンあり
// [y][x]
let battan_input = ref(Array(11));
for (var i = 0; i < battan_input.value.length; i++) {
  battan_input.value[i] = [0, 0, 0, 0, 0];
}
// バッタン座標配列
// [y][x]['x':キャンバス上のバッタンx座標, 'y':キャンバス上のバッタンy座標]
let battan_position = Array(11);
for (var i = 0; i < battan_position.length; i++) {
  battan_position[i] = [{ 'x': 0, 'y': 0 }, { 'x': 0, 'y': 0 }, { 'x': 0, 'y': 0 }, { 'x': 0, 'y': 0 }, { 'x': 0, 'y': 0 }];
}

//バッタン色を指定。これを使ってバッタンがそこにいるかどうか判定する
const minColor = { r:60, g:60, b:60 }
const maxColor = { r:90, g:90, b:90 }
//ミニゲーム中かどうかを判断するためタイマーの色も指定。
const timerMinColor = [{ r: 80, g: 100, b: 80 }, { r: 1, g: 33, b: 84 }]
const timerMaxColor = [{ r: 155, g: 150, b: 118 }, { r: 20, g: 43, b: 58 }]

///// 変数・配列の定義ここまで /////

///// 起動時のセットアップ /////
onMounted(() => {
  //videoとcanvasを指定する
  video = document.getElementsByClassName('video')[0]
  canvas = document.getElementsByClassName('canvas')[0]
  //コンテキストを定義
  canvasCtx = canvas.getContext('2d');

  //ブラウザに選択範囲が保存されていれば代入
  get('selectRectangle').then((val) => {
    if(val){
      selectRectangle.value.startX = val[0]
      selectRectangle.value.startY = val[1]
      selectRectangle.value.width = val[2]
      selectRectangle.value.height = val[3]
    }
  })
})
///// 起動時のセットアップここまで /////

///// ボタン押下時の処理 /////
function onCalibrateBtn() {
  //キャリブレーションボタンを押したときの処理
  if(isCalibrating.value){
    //キャリブレーション中止時の処理
    _canvasUpdate()
    isCalibrating.value = false
    console.log('isCalibrating == ', isCalibrating.value)
    return
  }
  //キャリブレーション開始時の処理
  isCalibrating.value = true
  console.log('isCalibrating == ', isCalibrating.value)
  cancelAnimationFrame(canvasId)
  //半透明の四角形を配置
  canvasCtx.fillStyle = "rgba(" + [255, 255, 255, 0.3] + ")";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
}

function onScanBtn(){
  //スキャンボタンを押したときの処理
  if(isScanning.value){
    //スキャン停止時の処理
    isScanning.value = false
    return
  }
  isScanning.value = true
  reset()
  //スキャン開始時の処理
}
function reset() {
  console.log('battan_input.value has been reset')
  for (var i = 0; i < battan_input.value.length; i++) {
    battan_input.value[i] = [0, 0, 0, 0, 0];
  }
  isGaming = false
}
///// ボタン押下時の処理ここまで /////

///// 矩形選択系の処理 /////
function getPointerOnCanvas(mouseEvent){
  // キャンバスをクリックしたときのマウスの座標を求める
  const rect = mouseEvent.target.getBoundingClientRect();
  //ブラウザ上のクリック座標を求める
  const viewX = mouseEvent.clientX - rect.left
  const viewY = mouseEvent.clientY - rect.top
  //キャンバスの表示サイズと実sizeの比も求める
  const scaleWidth = canvas.clientWidth / canvas.width
  const scaleHeight = canvas.clientHeight / canvas.height
  //ブラウザ上のクリック座標をキャンバス上の座標に変換する
  canvasX = Math.floor(viewX / scaleWidth)
  canvasY = Math.floor(viewY / scaleHeight)
}

function canvasOnMouseDown(e){
  //キャンバス上のクリック座標を求め、矩形選択の始点を決定する
  getPointerOnCanvas(e)
  console.log(canvasX, canvasY)

  if(isCalibrating.value) {
    selectRectangle.value.startX = canvasX
    selectRectangle.value.startY = canvasY
    canvas.addEventListener('mousemove', onMouseMove)
  }
}

function onMouseMove(e){
  //マウスが動いた時にselectRectangleの横幅、縦幅を指定しなおす
  getPointerOnCanvas(e)
  selectRectangle.value.width = canvasX - selectRectangle.value.startX
  selectRectangle.value.height = canvasY - selectRectangle.value.startY
  videoRendering()
  //videoRendering()をここで呼ぶことで、選択範囲を示す赤線を書き直す
}
function canvasOnMouseUp(e){
  //ドラッグが終わったら後片付けをする
  canvas.removeEventListener('mousemove', onMouseMove)
  isCalibrating.value = false
  console.log('isCalibrating ==', isCalibrating.value)
  _canvasUpdate()

  onSetRectangle()
}

watch(selectRectangle.value, () => {
  if (!isCalibrating.value) {
    console.log('changed!')
    canvasCtx.strokeStyle = "rgb(255, 0, 0)"
    canvasCtx.strokeRect(selectRectangle.value.startX, selectRectangle.value.startY, selectRectangle.value.width, selectRectangle.value.height)

    onSetRectangle()
  }
})

function onSetRectangle() {
  //選択範囲の数字を確定した時に呼ばれる関数。たびたび出てきてたでしょ？
  
  //localstrageにselectRectangleの値を保存
  set('selectRectangle', [selectRectangle.value.startX, selectRectangle.value.startY, selectRectangle.value.width, selectRectangle.value.height])
  setBattanPosition()
}
function setBattanPosition() {
  //バッタンの位置を配列に代入する関数。

  //横向きバッタン同士の間隔を求め、代入する
  let HBattanHInterval = Math.floor(selectRectangle.value.width * 0.1540)
  let HBattanVInterval = Math.floor(selectRectangle.value.height * 0.6452)
  console.log('HBattanHInterval:', HBattanHInterval, 'HBattanVInterval:', HBattanVInterval)

  //[4][0]横向きバッタンの座標を求め、これを基準として他の横向きバッタンの座標も埋める
  const battanLandscapeOffset = { 'x': parseInt(selectRectangle.value.startX) + Math.floor(selectRectangle.value.width * 0.2636), 'y': parseInt(selectRectangle.value.startY) + Math.floor(selectRectangle.value.height * 0.1786) }
  battan_position[4][0] = battanLandscapeOffset
  for (let battanY = 0; battanY <= 10; battanY += 2) {
    for (let battanX = 0; battanX <= 3; battanX++) {
      battan_position[battanY][battanX].x = battanLandscapeOffset.x + (battanX * HBattanHInterval)
      battan_position[battanY][battanX].y = battanLandscapeOffset.y + (battanY / 2 * HBattanVInterval - HBattanVInterval * 2)
    }
  }

  //縦向きバッタン同士の間隔を求め、代入する
  let VBattanHInterval = Math.floor(selectRectangle.value.width * 0.1600)
  let VBattanVInterval = Math.floor(selectRectangle.value.height * 0.6250)
  console.log('VBattanHInterval:', VBattanHInterval, 'VBattanVInterval:', VBattanVInterval)

  //[3][0]の縦向きバッタンの座標を求め、これを基準として他の縦向きバッタンの座標も埋める
  const battanPortraitOffset = { 'x': parseInt(selectRectangle.value.startX) + Math.floor(selectRectangle.value.width * 0.1775), 'y': parseInt(selectRectangle.value.startY) - Math.floor(selectRectangle.value.height * 0.1160) }
  battan_position[3][0] = battanPortraitOffset
  for (let battanY = 1; battanY <= 9; battanY += 2) {
    for (let battanX = 0; battanX <= 4; battanX++) {
      battan_position[battanY][battanX].x = battanPortraitOffset.x + (battanX * VBattanHInterval)
      battan_position[battanY][battanX].y = battanPortraitOffset.y + ((battanY - 3) / 2 * VBattanVInterval)
    }
  }
  console.log(battan_position)

  console.log('battanLandscapeOffset:', battanLandscapeOffset, 'battanPortraitOffset', battanPortraitOffset)
}
///// 矩形選択系の処理ここまで /////

///// 画面取得とレンダリング /////
function onWindowSelect() {
  // video要素にキャプチャ画面を表示する
  console.log('start')
  media = navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true
  }).then(function (stream) {
    video.srcObject = stream

    //mediaの縦と横のピクセル数を代入。このgetVideoTracks()[0].getSettings().widthってやつ探すの死ぬほど大変だったんだけど！！！！
    mediaSize.width = video.srcObject.getVideoTracks()[0].getSettings().width
    mediaSize.height = video.srcObject.getVideoTracks()[0].getSettings().height
    console.log(mediaSize)
    //キャプチャ画面を表示
    isWindowSelected.value = true
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

  //バッタンをスキャン。スキャン中かつミニゲーム中じゃなければ点を表示
  if(isScanning.value) checkGaming()
  for(let battanY = 0; battanY < battan_position.length; battanY++){
    for(let battanX = 0; battanX < battan_position[battanY].length; battanX++) {
    if(isScanning.value && (isGaming || !isJudgeGaming.value )) {
        //スキャン中なら、battan_positionの座標の色をスキャンしてバッタンが出てるかどうかを確認する

        //タイマーと被る可能性のあるバッタンをスキップ
        if(battanY == 0) continue
        if(battanY == 1 && battanX == 2) continue
        if(battanY == 10) continue

        //まずbattanX, BattanYの色を取得
        const data = canvasCtx.getImageData(battan_position[battanY][battanX].x, battan_position[battanY][battanX].y, 1, 1).data
        const currentPosColor = { r:data[0], g:data[1], b:data[2] }

        if(checkTargetColor(currentPosColor, minColor, maxColor) == true)
        {
          //チェックした座標にバッタンがいた場合
          battan_input.value[battanY][battanX] = 1
          console.log('battanX',battanX,'battanY',battanY)
          console.log(battan_input.value)
        }
      } else {
        canvasCtx.strokeStyle = "rgb(255, 0, 0)"
        canvasCtx.fillRect(battan_position[battanY][battanX].x, battan_position[battanY][battanX].y, 2, 2)
      }
      
    }
  }
}

//ミニゲーム進行中かどうかの判定
function checkGaming() {
  const data = [
    canvasCtx.getImageData(battan_position[1][2].x, battan_position[1][2].y, 1, 1).data,
    canvasCtx.getImageData(battan_position[0][2].x, battan_position[0][2].y, 1, 1).data,
  ]
  const currentPosColor = [{ r: data[0][0], g: data[0][1], b: data[0][2]}, { r: data[1][0], g: data[1][1], b: data[1][2] }]

  for(let i=0;i<data.length;i++){
    for(let j=0;j<timerMaxColor.length;j++){
      if(checkTargetColor(currentPosColor[i],timerMinColor[j],timerMaxColor[j])){
        isGaming = true
        console.log('isGaming is',isGaming)
        break 
      } else if (i == data.length){
        isGaming = false
        console.log('isGaming is', isGaming)
        break
      }
    }
  }
}

function checkTargetColor(current, min, max) {
  //currentに入れた色が指定した範囲に収まっているかどうかの関数
  if (min.r >= current.r || current.r >= max.r) return false
  if (min.g >= current.g || current.g >= max.g) return false
  if (min.b >= current.b || current.b >= max.b) return false
  return true
}
///// 画面処理とレンダリングここまで /////
</script>

<template>
  <v-app>
    <section class="settings">
      <v-btn variant="outlined" class="startBtn" @click="onWindowSelect">ウィンドウ選択</v-btn>
      <br>

      <div class="videoPreview">
        <video class="video" style="display:none;" :width="screenSize.width" :height="screenSize.height" autoplay />
      </div>
      <Transition mode="in-out">
        <div id="canvasPreview" v-show="isWindowSelected">
          <!-- フィールド設定  -->
          
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <template v-slot:default="{ expanded }">
                  <v-row no-gutters>
                    <v-col cols="3" class="d-flex justify-start">
                      フィールド設定
                    </v-col>
                    <v-col
                      cols="9"
                      class="text-grey"
                    >
                      <v-fade-transition leave-absolute>
                        <span
                          v-if="expanded"
                          key="0"
                        >
                          スタート地点のパネルの左上の角を始点に、ゴール地点のパネルの右下の角を終点に指定してくだい。
                        </span>
                        <span
                          v-else
                          key="1"
                        >
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field label="始点X" type="text" v-model="selectRectangle.startX" class="ma-2 pa-2" />
                  </v-col>
                  <v-col>
                    <v-text-field label="横幅" type="text" v-model="selectRectangle.width" class="ma-2 pa-2" />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field label="始点Y" type="text" v-model="selectRectangle.startY" class="ma-2 pa-2"/>
                  </v-col>
                  <v-col>
                    <v-text-field label="横幅" type="text" v-model="selectRectangle.height" class="ma-2 pa-2"/>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col>
                    <v-btn variant="outlined" class="onCalibrateBtn" @click="onCalibrateBtn" v-if="!isCalibrating">キャリブレーション</v-btn>
                    <v-btn variant="outlined" class="onCalibrateBtn" @click="onCalibrateBtn" v-else>キャリブレーションをキャンセル</v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="scrollWrapper">
            <canvas class="canvas" @mousedown="canvasOnMouseDown" @mouseup="canvasOnMouseUp" :width="canvasSize.width" :height="canvasSize.height"  />
          </div>
          <br>
          <v-btn variant="outlined" class="scanBtn" @click="onScanBtn" v-if="!isScanning">スキャン開始</v-btn>
          <v-btn variant="outlined" class="scanBtn" @click="onScanBtn" v-else>スキャン停止</v-btn>
          <v-btn variant="outlined" @click="reset" >入力リセット</v-btn><br>
          <label><input type="checkbox" v-model="isJudgeGaming">ミニゲームの進行を判定する</label><br>
        </div>
      </Transition>

    </section>
    <div v-show="isWindowSelected">
      <PatternDisplay ref='patternDisplay' :battan-input="battan_input" :canvas-size="canvasSize" class="transition" />
    </div>
  </v-app>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.v-application{
    font-family: 'Noto Sans', sans-serif;
}
</style>