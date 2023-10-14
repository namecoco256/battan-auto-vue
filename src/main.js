import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

// use(vuetify)を追加
createApp(App).use(vuetify).mount('#app')

console.log("Original version: http://zenon.starfree.jp/mp5battan/mp5battan.html\nby Zenon_128")