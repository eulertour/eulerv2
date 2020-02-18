import Vue from 'vue';
import VueRouter from 'vue-router'
import MobjectLabContainer from '../components/MobjectLabContainer.vue'
import Info from '../components/Info.vue'
import Gallery from '../components/Gallery.vue'
import * as consts from '../constants'
import * as path from 'path'

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    { path: '/', component: Gallery },
    { path: '/info', component: Info },
    { path: path.join(consts.BASE_LAB_URL, ":project"), component: MobjectLabContainer },
  ],
});
