import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './plugins/vuex'

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
