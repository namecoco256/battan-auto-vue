<script setup>
import { watch, ref } from 'vue'

const canvasSize = { width: 512, height: 512 }

const props = defineProps({
  battanInput: Array,
  battanMerge: Array,
  battanPatternMatchNum: Number

})

const canvas = document.getElementsByClassName('canvas')[0];   //mainキャンバスの要素を取得
const canvasCtx = canvas.getContext('2d');                //2D描画コンテキストを取得

//描画
watch(() => props.battanInput, () => {
  canvasCtx.strokeStyle = "gray"
  canvasCtx.fillStyle = "white";
  canvasCtx.fillRect(0, 0, canvas.width * 3, canvasHeight * 3);
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
            if (battan_pattern[props.battanPatternMatchNum][by][bx] == 1) {
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
})
</script>

<template>
  <div id="canvasPreview">
    <canvas class="canvas" :width="canvasSize.width" :height="canvasSize.height" />
  </div>
</template>