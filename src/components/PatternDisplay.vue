<script setup>
import { watch, ref } from 'vue'
import battan_pattern from './patterns.js'
import InputDisplay from './InputDisplay.vue'
console.log(battan_pattern.components)

// 一致パターンリスト配列(15コ)
// [pattern] == 1:一致 0:不一致
let battan_pattern_match = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
let battan_pattern_match_sum = 15;
let battan_pattern_match_num = ref(-1)
// 一致パターンの添字が入る
let matchList = ref([]);
let matchListUrl = ref([])

// バッタン差分配列
// 0: 差分なし 1: 差分あり
// [y][x]
const battan_merge = ref(Array(11))
for (var i = 0; i < battan_merge.value.length; i++) {
  battan_merge.value[i] = [0, 0, 0, 0, 0];
}

const props = defineProps({
  battanInput: Array,
  canvasSize: Object,
})

watch(() => props.battanInput, () => {
  console.log(props.battanInput)
  //バッタンのパターンを絞り込む

  //初期化
  matchList.value = []
  for (var p = 0; p < battan_pattern.components.length; p++) {
    battan_pattern_match[p] = 1
  }
  //不一致なパターンを除外する
  for (var x = 0; x < 5; x++) {
    for (var y = 0; y < 11; y++) {
      // 入力済みのマスの場合、絞り込む
      if (props.battanInput[y][x] == 1 || props.battanInput[y][x] == 2) {
        var unmatch_cnt = 0;
        for (var p = 0; p < battan_pattern.components.length; p++) {
          // 既に不一致の場合、不一致カウントのみ
          if (battan_pattern_match[p] == 0) {
            unmatch_cnt++;
            // 今回のマスが不一致の場合、不一致を登録し、不一致カウント
          } else if (props.battanInput[y][x] != battan_pattern.components[p][y][x]) {
            battan_pattern_match[p] = 0;
            unmatch_cnt++;
          }
        }
        // １パターンとも被っていないなら、
        // これ以上処理する意味がないので終わり
        if (unmatch_cnt >= battan_pattern.components.length) {
          battan_pattern_match_sum = 0;
          battan_pattern_match_num.value = -1;
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
      battan_pattern_match_num.value = p;
      matchList.value.push(p);
      console.log('一致' + "" + p + " ")
    }
  }
  console.log(matchList.value);
  // 一致マップが複数の場合
  // 未入力かつ差分のあるバッタンを保存
  for (var y = 0; y < 11; y++) {
    for (var x = 0; x < 5; x++) {
      battan_merge.value[y][x] = 0;	//初期化
      if (battan_pattern_match_sum <= 0 || (props.battanInput[y][x] != 0)) continue;
      for (var l = 0; l < matchList.value.length - 1; l++) {
        if (battan_pattern.components[matchList.value[l]][y][x]
          != battan_pattern.components[matchList.value[l + 1]][y][x]) {
          battan_merge.value[y][x] = 1;
        }
      }
    }
  }
},{deep:true})

watch(matchList,()=>{
  console.log(matchList.value)
  matchListUrl.value = []
  for(i=0;i<matchList.value.length;i++){
    matchListUrl.value[i] = 'src/assets/pattern-image/'+matchList.value[i]+'.png'
  }
  console.log(matchListUrl.value)
  console.log(battan_merge.value)
})

</script>

<template>
  <InputDisplay :battan-input="props.battanInput" :battan-merge="battan_merge" :battan-pattern-match-num="battan_pattern_match_num" />
  <h1>パターン候補</h1>
  <div class="displayArea">
    <ul class="matches" key="matches" >
      <TransitionGroup>
        <li class="match" v-for="match in matchListUrl" :key="match">
          <img :src="match">
        </li>
      </TransitionGroup>
    </ul>
  </div>
  <div class="blank" v-if="!matchListUrl[0]"></div>
</template>

<style scoped>
.v-move,
.v-enter-active,
.v-leave-active {
  transition:0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.v-leave-active{
  position: absolute;
}
.displayArea{
  max-width: 80em;
  margin:auto;
}
.displayArea .matches{
  padding-inline-start:0;
}
</style>