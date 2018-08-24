// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import BootstrapVue from 'bootstrap-vue'
import AxiosVue from './services/axios'

import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// import VueNativeSock from 'vue-native-websocket'

Vue.use(BootstrapVue)
// Vue.use(ToggleButton)
Vue.use(AxiosVue)

import '@/components/misc/filters.js'
import '@/store/api/mock'

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
      status:false,
      value:0,
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
  },
  render: h => h(App)
})
