<script>
import { defineProps, watch} from 'vue'
import battan_pattern from './patterns.js'
console.log(battan_pattern)

const battan_input = defineProps(['battanInput'])
console.log(battan_input)

watch(battan_input, ()=>{
  console.log(battan_input)
})
</script>

<template>
  
</template>
