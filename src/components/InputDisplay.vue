<script setup>
import { watch, ref, onMounted } from 'vue'
import battan_pattern from './patterns.js'

const canvasSize = { width: 2048, height: 2048 }

const props = defineProps({
  battanInput: Array,
  battanMerge: Array,
  battanPatternMatchNum: Number

})

//blockSize
let bs = 20;
let bx,by;

// 描画ブロック配列
// [y][x] = バッタン番号
let block = Array(30);
for(var i=0; i<block.length; i++){
	block[i] = Array(30);
}

let canvas
let canvasCtx
onMounted(()=>{
  canvas = document.getElementsByClassName('canvas')[1];   //mainキャンバスの要素を取得
  canvasCtx = canvas.getContext('2d');                //2D描画コンテキストを取得

  bs = canvas.height / 25;
  makeMap()
  paint()
})

function makeMap(){
	for(var a=0; a<block.length; a++){
		for(var b=0; b<block[a].length; b++){
			// その他のマス(0)
			block[a][b] = 0;
			// 角のマス(-1)
			if(a + b <= 7)block[a][b] = -1;	//左上の角
			else if(a <= 7 && b > 14 + a)block[a][b] = -1;	//右上の角
			else if(b <= 9 && a > 14 + b)block[a][b] = -1;	//左下の角
			else if(a + b >= 37)block[a][b] = -1;	//右下の角
		}
	}
	// バッタンの生息する座標を登録
	var y_sum = 1;
	for(var y=0; y<11; y++){
		for(var x=0; x<5; x++){
			//はじっこを除外
			if(x == 0 && (y == 0 || y == 1 || y == 9 || y == 10))continue;
			if(x == 3 && (y == 0 || y == 10))continue;
			if(x == 4 && (y % 2 == 0 || y == 1 || y == 9))continue;

			for(var i=0; i<3; i++){
				if(y%2==0){	//横向き
					block[y_sum][x*4+4+i] = 100*y+x;
				}else{		//縦向き
					block[y_sum+i][x*4+3] = 100*y+x;
				}
			}
		}
		if(y%2==0)y_sum += 1;
		else y_sum += 3;
	}
}

watch(() => props.battanInput, () => {
  paint()
},{deep:true})

//描画
function paint(){
  console.log('i am a display')
  canvasCtx.strokeStyle = "gray"
  canvasCtx.fillStyle = "white";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  // 入力エリア
  for (var y = 0; y < 23; y++) {
    for (var x = 0; x < 23; x++) {
      canvasCtx.strokeStyle = "gray"
      canvasCtx.fillStyle = "gray";

      if (block[y][x] > 0) {
        bx = Math.floor(block[y][x] % 100);
        by = Math.floor(block[y][x] / 100);
        // マップが確定している場合
        //if(battan_pattern_match_sum == 1){
        //	if(battan_pattern[props.battanPatternMatchNum][by][bx] == 1){
        //		canvasCtx.fillStyle = "blue";
        //	}else{
        //		canvasCtx.fillStyle = "lightgreen";
        //	}
        //// バッタンあり入力
        //}else 
        if (props.battanInput[by][bx] == 1) {
          canvasCtx.fillStyle = "black";
          // バッタンなし入力
        } else if (props.battanInput[by][bx] == 2) {
          canvasCtx.fillStyle = "lightgreen";

        } else if (props.battanPatternMatchNum != -1) {
          // 差分バッタン
          if (props.battanMerge[by][bx] == 1) {
            canvasCtx.fillStyle = "orange";
            // 確定バッタン
          } else if (props.battanMerge[by][bx] == 0) {
            if (battan_pattern.components[props.battanPatternMatchNum][by][bx] == 1) {
              canvasCtx.fillStyle = "blue";
            } else {
              canvasCtx.fillStyle = "lightgreen";
            }
          }
        }
      } else if (block[y][x] == -1) {
        canvasCtx.fillStyle = "white";
      } else if (block[y][x] == -2) {
        canvasCtx.fillStyle = "yellow";
      } else if (block[y][x] == -3) {
        canvasCtx.fillStyle = "limegreen";
      } else if (block[y][x] == -4) {
        canvasCtx.fillStyle = "deeppink";
      } else {
        canvasCtx.fillStyle = "lightgreen";
      }

      canvasCtx.fillRect(x * bs, y * bs, bs, bs);
      //canvasCtx.strokeRect(x*bs,y*bs,bs,bs);

    }
  }
}
</script>

<template>
  <div id="canvasPreview">
    <canvas class="canvas" :width="canvasSize.width" :height="canvasSize.height" />
  </div>
</template>

<style scoped>
  .canvas {
    width:512px;
    height: 512px;
  }
</style>