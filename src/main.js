import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './plugins/vuex'
import router from './plugins/router'

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
