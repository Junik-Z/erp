// #ifdef H5
import "@/utils/flexible";
import * as ElementUI from "@/uni_modules/element-ui/element.min";

import "@/uni_modules/element-ui/element.min.css";
import UvAlbum from "@/uni_modules/uv-album/components/uv-album/uv-album.vue";

// #endif


// #ifndef VUE3
import Vue from "vue";
import App from "./App";
import store from './store';


Vue.config.productionTip = false;

App.mpType = "app";

// #ifdef H5
Vue.use(ElementUI);
Vue.use({
  install(Vue) {
    Vue.component('UvAlbum', UvAlbum)
  }
})
// #endif

const app = new Vue({
  ...App,
  store
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from "vue";

import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}

// #endif
