<script setup>

const canvasSize = { width: 512, height: 512 }
//描画
function Paint()
{
  const canvas = document.getElementsByClassName('main')[0];   //mainキャンバスの要素を取得
  const canvasCtx = canvas.getContext('2d');                //2D描画コンテキストを取得

	canvasCtx.strokeStyle = "gray"
	canvasCtx.fillStyle = "white";
	canvasCtx.fillRect(0,0,winwidth*3,winheight*3);
	// 入力エリア
	for(var y=0; y<23; y++){
		for(var x=0; x<23; x++){
			canvasCtx.strokeStyle = "gray"
			canvasCtx.fillStyle = "gray";

			if(block[y][x] > 0){
				bx = Math.floor(block[y][x]%100);
				by = Math.floor(block[y][x]/100);
				// マップが確定している場合
				//if(battan_pattern_match_sum == 1){
				//	if(battan_pattern[battan_pattern_match_num][by][bx] == 1){
				//		canvasCtx.fillStyle = "blue";
				//	}else{
				//		canvasCtx.fillStyle = "lightgreen";
				//	}
				//// バッタンあり入力
				//}else 
				if(battan_input[by][bx] == 1){
					canvasCtx.fillStyle = "black";
				// バッタンなし入力
				}else if(battan_input[by][bx] == 2){
					canvasCtx.fillStyle = "lightgreen";
				
				}else if(battan_pattern_match_num != -1){
					// 差分バッタン
					if(battan_merge[by][bx] == 1){
						canvasCtx.fillStyle = "orange";
					// 確定バッタン
					}else if(battan_merge[by][bx] == 0){
						if(battan_pattern[battan_pattern_match_num][by][bx] == 1){
							canvasCtx.fillStyle = "blue";
						}else{
							canvasCtx.fillStyle = "lightgreen";
						}
					}
				}
			}else if(block[y][x] == -1){
				canvasCtx.fillStyle = "white";
			}else if(block[y][x] == -2){
				canvasCtx.fillStyle = "yellow";
			}else if(block[y][x] == -3){
				canvasCtx.fillStyle = "limegreen";
			}else if(block[y][x] == -4){
				canvasCtx.fillStyle = "deeppink";
			}else{
				canvasCtx.fillStyle = "lightgreen";
			}
			
			canvasCtx.fillRect(x*bs,y*bs,bs,bs);
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