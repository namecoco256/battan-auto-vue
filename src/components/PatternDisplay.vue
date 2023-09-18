<script setup>
import { watch, ref } from 'vue'
import battan_pattern from './patterns.js'
console.log(battan_pattern.components)

// 一致パターンリスト配列(15コ)
// [pattern] == 1:一致 0:不一致
let battan_pattern_match = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
let battan_pattern_match_sum = 15;
let battan_pattern_match_num = -1;
// 一致パターンの添字が入る
let matchList = ref([]);
let matchListUrl = ref([])

// バッタン差分配列
// 0: 差分なし 1: 差分あり
// [y][x]
let battan_merge = Array(11);
for (var i = 0; i < battan_merge.length; i++) {
  battan_merge[i] = [0, 0, 0, 0, 0];
}

//App.vue内のbattan_inputが変化したときに呼ばれる
function onChangeBattanInput(battan_input){
  console.log(battan_input.value)

  //バッタンのパターンを絞り込む
  //ぜのちゃが作ったやつからまんま持ってきた

  //初期化
  matchList.value = []
  for (var p = 0; p < battan_pattern.components.length; p++) {
    battan_pattern_match[p] = 1
  }
  //不一致なパターンを除外する
  for (var x = 0; x < 5; x++) {
    for (var y = 0; y < 11; y++) {
      // 入力済みのマスの場合、絞り込む
      if (battan_input.value[y][x] == 1 || battan_input.value[y][x] == 2) {
        var unmatch_cnt = 0;
        for (var p = 0; p < battan_pattern.components.length; p++) {
          // 既に不一致の場合、不一致カウントのみ
          if (battan_pattern_match[p] == 0) {
            unmatch_cnt++;
            // 今回のマスが不一致の場合、不一致を登録し、不一致カウント
          } else if (battan_input.value[y][x] != battan_pattern.components[p][y][x]) {
            battan_pattern_match[p] = 0;
            unmatch_cnt++;
          }
        }
        // １パターンとも被っていないなら、
        // これ以上処理する意味がないので終わり
        if (unmatch_cnt >= battan_pattern.components.length) {
          battan_pattern_match_sum = 0;
          battan_pattern_match_num = -1;
          console.log('一致なし')
          return;
        }
      }
    }
  }
  // 一致マップのカウント、一致マップ番号の保存
  battan_pattern_match_sum = 0;
  matchList.value = [];
  for (var p = 0; p < battan_pattern.components.length; p++) {
    if (battan_pattern_match[p] == 1) {
      battan_pattern_match_sum++;
      battan_pattern_match_num = p;
      matchList.value.push(p);
      console.log('一致' + "" + p + " ")
    }
  }
  console.log(matchList.value);
  // 一致マップが複数の場合
  // 未入力かつ差分のあるバッタンを保存
  for (var y = 0; y < 11; y++) {
    for (var x = 0; x < 5; x++) {
      battan_merge[y][x] = 0;	//初期化
      if (battan_pattern_match_sum <= 0 || (battan_input.value[y][x] != 0)) continue;
      for (var l = 0; l < matchList.value.length - 1; l++) {
        if (battan_pattern.components[matchList.value[l]][y][x]
          != battan_pattern.components[matchList.value[l + 1]][y][x]) {
          battan_merge[y][x] = 1;
        }
      }
    }
  }
}

watch(matchList,()=>{
  console.log(matchList.value)
  matchListUrl.value = []
  for(i=0;i<matchList.value.length;i++){
    matchListUrl.value[i] = 'src/assets/pattern-image/'+matchList.value[i]+'.png'
  }
  console.log(matchListUrl.value)
})

defineExpose({
  onChangeBattanInput,
})
</script>

<template>
  <h1>パターン候補</h1>
  <ul class="matches">
    <li v-for="match in matchListUrl">
      <img :src="match">
    </li>
  </ul>
</template>

<style scoped>

</style>