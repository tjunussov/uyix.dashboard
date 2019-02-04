// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import BootstrapVue from 'bootstrap-vue'
import AxiosVue from '@/services/axios'

import router from '@/router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// import VueNativeSock from 'vue-native-websocket'

import '@/api/mock'

Vue.use(BootstrapVue)
// Vue.use(ToggleButton)
Vue.use(AxiosVue)

import '@/services/filters.js'
Vue.config.productionTip = false


// Global Functions
Vue.mixin({
  methods: {
    $resetData: function (emit) {
      console.log('reset global data =', this.$options.name)
      // reset data()
      Object.assign(this.$data, this.$options.data.call(this));
      if((emit !==null && emit) || ( emit == null)) this.$emit('reset',null) /// CAUTION! May Interefere with other local events
    },
    $_clone: function (val) {
      return Object.assign({},val);
    },
    $: function (id) {
      return document.querySelector(id)
    },
    $ArrayRemoveElement(arr,item){
      let index = arr.indexOf(item);
      if(index !== -1) {
        arr.splice(index, 1);
      }
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data () {
    return {
      fullscreen:false,
      value:0,
      meta:null,
      data:null,
      weather:null
    }
  },
  created(){
    window.addEventListener("com",this.read)
    // this.$mqtt.on('connect', ()=>{ this.mqttOnline = true })
    // this.$mqtt.on('offline', ()=>{ this.mqttOnline = false })
    // this.handleScroll = new InfiniteList(this.$refs.infinite, 'contacts', this.$store)
  },
  mounted(){
    // this.$mqtt.subscribe('bicafe/keyboard')
  },
  watch:{
    
  },
  // mqtt: {
  //   'bicafe/keyboard' (barcode) {
  //     console.log('mqtt keypreesed',barcode.toString(),'red');
  //   }
  // },
  beforeDestroy(){
    window.removeEventListener("com",this.read)
  },
  router,
  methods:{
    read(e){
      // console.log('readed from listener',e.detail);
      if(!isNaN(e.detail)) this.value = e.detail
      else console.error('is not a number');
    },
    toggleFullScreen() {
      if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
       (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {  
          document.documentElement.requestFullScreen();  
        } else if (document.documentElement.mozRequestFullScreen) {  
          document.documentElement.mozRequestFullScreen();  
        } else if (document.documentElement.webkitRequestFullScreen) {  
          document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
        } 
        this.fullscreen = true;
      } else {  
        if (document.cancelFullScreen) {  
          document.cancelFullScreen();  
        } else if (document.mozCancelFullScreen) {  
          document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
          document.webkitCancelFullScreen();  
        } 
        this.fullscreen = false;
      }  
    },
  },
  render: h => h(App)
})


