<template lang="pug">
doctype html

#app(:class="[status]")

  b-navbar.bd-navbar(toggleable="md" type="dark")

    b-nav-toggle(target="nav_collapse")

    b-navbar-brand(@click="showAlert=!showAlert")
      img(src="static/bilogo.svg" height="36" width="76")
      //- <svg width="36" height="36" viewBox="0 0 612 612" xmlns="http://www.w3.org/2000/svg" focusable="false" fill="#fff" class="d-block"><path d="M510,8 C561.846401,8.16468012 603.83532,50.1535995 604,102 L604,510 C603.83532,561.846401 561.846401,603.83532 510,604 L102,604 C50.1535995,603.83532 8.16468012,561.846401 8,510 L8,102 C8.16468012,50.1535995 50.1535995,8.16468012 102,8 L510,8 L510,8 Z M510,0 L102,0 C45.9,6.21724894e-15 0,45.9 0,102 L0,510 C0,566.1 45.9,612 102,612 L510,612 C566.1,612 612,566.1 612,510 L612,102 C612,45.9 566.1,6.21724894e-15 510,0 Z" fill-rule="nonzero"></path> <text id="BV" font-family="Arial" font-size="350" font-weight="light" letter-spacing="2"><tspan x="130" y="446">B</tspan> <tspan x="360" y="446">I</tspan></text></svg>
    b-navbar-brand(@click="toggleFullScreen()") SMART UYI

    b-navbar-nav.ml-5
      b-nav-item(to="/") Панель
      b-nav-item(to="/") Меню

    b-navbar-nav.ml-auto
      //- b-nav-item(v-b-modal.settings) API
      b-nav-item(v-b-modal.communicate) 
        span(:class="{'text-primary':ws.isOpen}") Config
      b-nav-item(to="/homekit") HomeKit
      b-nav-item(v-b-modal="'settings'").ml-3 КВ 49

          
  .mx-3.px-3.pt-3
    b-card-group.uyi(deck)
      template(v-for="(dev,group) in devices")
        b-card(
          v-for="(value,key) in dev"
           :key="key"
           :class="[group,key,value.status,(value.value==1?'enabled':''),(value.value==0||value.value==1?'':'numeric')]"
           no-body
           @click="sendAction(group,key)"
           @mousedown="down(group,key)"
           @mouseup="up(group,key)"
           align="center")
          b-card-header {{(key)}}
          b-card-body(:data-newvalue="value.value")
            transition(:name="group=='counters'?'slide-fade':(group=='switch'?'chuh':'blink')" :duration="{ enter: 500}" @leave="leave" @enter="enter" mode="out-in")
              h4.card-title.meters(v-if="group == 'counters'" :key="value.value")
                | {{value.value | numeric}} 
              h4.card-title(v-else :key="value.value") {{value.value | humanizer(group)}}

  //- code {{ws}}

  b-modal#settings(title="BI SERVICE - ALERT" header-text-variant="danger" no-fade hide-footer hide-backdrop)
    .text-center
      h4 Внимание! 
      p Профилактические работы с 9.00 - 14:00
      img(height="200" src="static/maintenace.jpg")

  b-modal#communicate(title="Подключение")

    b-form-group(label="Server")
      b-input-group
        b-form-input(v-model="ws.http")
        b-input-group-append(is-text) 
          span.mr-2 Disable Demo
          b-form-checkbox(v-model="ws.disableDemo") 
    b-form-group(label="Server")
      b-input-group
        b-form-input(v-model="ws.server")
        b-input-group-append(is-text) 
          span.mr-2 Autoconnect
          b-form-checkbox(v-model="ws.autoconnect") 
    p.text-danger(v-if="ws.error") {{ws.error}}
    p(v-if="ws.message") {{ws.message}}
    template(slot="modal-footer")
      b-btn(@click="toggleConnect" :variant="ws.isOpen?'secondary':'primary'") {{(!ws.isOpen?'Connect':'Disconnect')}}

  
  b-alert.bialert(
      dismissible 
      variant="danger" 
      :show="showAlert")
      | BI Service 
      a.alert-link с 14:00 по 18:00 
      | будут профилактические работы

</template>

<script>

import Vue from 'vue'
import MockAdapter from 'axios-mock-adapter'
import AnimatedNumber from '@/components/misc/AnimatedNumber'
import axios from 'axios'


Vue.filter('humanizer', function (value,param) {
  if(param == 'sensors'){
    // return value == 0?'NO':(value == 1?'YES':value)
    return value == 0?'○':(value == 1?'●':value)
  } else if( param == 'togglers'){
    return value == 0?'PU':(value == 1?'UP':value)
  }
   else {
    return value == 0?'OFF':(value == 1?'ON':value)
  }
})

const audioFolder = 'static/audio/'

var sounds = {
  scan : new Audio(audioFolder+"scan.mp3"),
  ready : new Audio(audioFolder+"ready.mp3"),
  toggle : new Audio(audioFolder+"clear.mp3"),
  update: new Audio(audioFolder+"update.mp3"),
  play : function (snd){
      this[snd].currentTime = 0
      this[snd].play();
  }
}

var socket;
var baseURL = localStorage.getItem('http')||'http://192.168.0.11';
var $mock;
var $http = axios.create({
  baseURL: baseURL
})


export default {
  name: 'app',
  data(){
    return {
      user : 'ЗЕЛЕННЫЙ КВАРТАЛ',
      dismissCountDown: 10,
      showAlert:false,
      tm:null,
      errortm:null,
      value:null,
      ws:{
        isOpen : false,
        start: false,
        error: null,
        message: null,
        disableDemo:localStorage.getItem('disableDemo')=== 'true'||false,
        autoconnect:localStorage.getItem('autoconnect') === 'true'||false,
        server: localStorage.getItem('ws')||'ws://192.168.0.11:81',
        http:baseURL
      },
      message:[0,0,0,0,0,0,30,25,21,255,125,0,0,0,0,0],
      devices:{
        sensors:{
          "PIR":{value:0,status:null},
          "DOOR":{value:0,status:null},
          "REED":{value:0,status:null},
          "SOUND":{value:0,status:null},
          "LEAK":{value:0,status:null},
          "LIGHT":{value:0,status:null},
          "CO2":{value:0,status:null},
          "HUMIDITY":{value:0,status:null},
          "TEMP":{value:0,status:null},
        },
        counters:{
          "ELECTRICITY":{value:0,status:null},
          "WATER":{value:0,status:null},
        },
        switch:{
          "VALVE":{value:0,status:null},
          "ALARM":{value:0,status:null},
          "LAMP":{value:0,status:null},
          // "LAMP2":{value:0,status:null},
          "SOCKET":{value:0,status:null},
          // "SOCKET2":{value:0,status:null},
        },
        togglers:{
          "BELL":{value:0,status:null},
        }
      }
    }
  },
  created(){
    if(this.autoconnect) this.toggleConnect();
    // $http = axios.create({ baseURL: this.ws.http })
    if(!this.ws.disableDemo) this.demo();
  },
  watch:{
    'ws.server'(val){
      localStorage.setItem('ws',val)
    },
    'ws.http'(val){
      $http.setBaseURL(val);
      localStorage.setItem('http',val)
    },
    'ws.disableDemo'(val){
      localStorage.setItem('disableDemo',val)
      if(!val) {
        this.demo()
      } else {
        $mock.reset();
        window.clearInterval(this.demoInt);
      }
    },
    'ws.autoconnect'(val){
      localStorage.setItem('autoconnect',val)
    },
    'devices.sensors.DOOR.value'(val){
        console.log('sensors->device DOOR->BELL auto',val);
        this.sendAction('togglers','BELL',val)
    },
    'devices.sensors.LEAK.value'(val){
        console.log('sensors->device LEAK->VALVE auto',val);
        this.sendAction('switch','VALVE',val);
    },
    'devices.sensors.REED.value'(val){
      console.log('sensors->device REED->ALARM auto',val);
      this.sendAction('switch','ALARM',val);
    },
    message(val){
      var cursor = 0;
      sounds.play('update')
      Object.keys(this.devices).forEach((k1,i)=>{
        Object.keys(this.devices[k1]).forEach((k2,j)=>{
          this.devices[k1][k2].value = val[cursor++]
        });
      })
      
    }
  },
  computed:{
    online(){
      return this.$root.online
    },
    status(){
      return this.$root.status;
    }
  },
  beforeDestroy(){
    window.clearInterval(this.demoInt);
  },
  methods:{
    demo(){
      $mock = new MockAdapter($http,{delayResponse:1000 }).onAny().reply((cfg)=>{ return [200,'ok'];})
      this.demoData()
      window.clearInterval(this.demoInt);
      this.demoInt = window.setInterval(this.demoData,5000);
    },
    demoData(){
        // this.devices.counters[Object.keys(this.devices.counters)[Math.ceil(Math.random()*2)]]++;
        // this.devices.sensors["HUMIDITY"] = Math.floor(Math.random()*100);

        // var name = Object.keys(this.devices.sensors)[Math.floor(Math.random()*4)];
        // this.devices.sensors[name] = Math.floor(Math.random()*1);


        var message = this.message.slice(0);

        // counter
        message[(Math.ceil(Math.random()*2)+8)]++;
        // sensors
        message[Math.floor(Math.random()*4)] = Math.floor(Math.random()*2);
        // sensors humidity
        message[(Math.floor(Math.random()*3)+6)] = Math.ceil(Math.random()*100);

        this.message = message;
    },
    enter(el){

      var newVal = el.parentElement.dataset.newvalue;
      var oldVal = el.parentElement.dataset.value
          el.parentElement.dataset.value = newVal

      if(newVal!=0&&newVal!=1){

          if(oldVal != null) {
            if(newVal > oldVal) el.parentElement.dataset.dir = 'up'
            else if(newVal < oldVal) el.parentElement.dataset.dir = 'down'
            else el.parentElement.dataset.dir = ''
          }
      }
    },
    leave(el){
      el.parentElement.dataset.dir = ''
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
      } else {  
        if (document.cancelFullScreen) {  
          document.cancelFullScreen();  
        } else if (document.mozCancelFullScreen) {  
          document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
          document.webkitCancelFullScreen();  
        }  
      }  
    },
    sendAction(group,key,value){

      if((group == 'switch' || group == 'togglers' ) && this.devices[group][key].status == null){

        if(value == undefined){
          value = (this.devices[group][key].value == 0?1:0)
          console.log('default',group,key,value);
        } else {
          console.log(group,key,value);
        }
        
        this.devices[group][key].status = 'progress'
        this.devices[group][key].value = value

        sounds.play('toggle')

        $http.get(this.ws.http+'/'+key+'/'+value).then(()=>{
          this.toggleConfirm(group,key,value);
        }).catch(()=>{
          this.toggleError(group,key,value);
        });

      // } else if (group == 'sensors'){

      //   if(value == 1){
      //     this.tm = window.setTimeout(()=>{
      //       this.sendAction(group,key,0);
      //     },300)
      //   }

       }
    },
    down(group,key){
      console.log('down');
      if(group == 'sensors')
        this.devices[group][key].value = true
    },
    up(group,key){
      console.log('up');
      if(group == 'sensors')
        this.devices[group][key].value = false
    },
    toggleConfirm(group,key,value){
      console.log('toggleConfirm');
      this.devices[group][key].status = null
    },
    toggleError(group,key,value){
      console.log('toggleError');
      this.devices[group][key].status = 'error'
      this.devices[group][key].value = (value == 0?1:0)
      this.timeout(group,key);
    },
    timeout(group,key){
      window.clearTimeout(this.errortm);
      this.errortm = window.setTimeout(()=>{
        this.devices[group][key].status = null
      }, 500);
    },
    toggleConnect(){
      if(this.ws.isOpen){
        socket.close();
        this.ws.isOpen = false;
      } else {
        socket = null;
        socket = new WebSocket(this.ws.server);
        socket.addEventListener('open', (e) => {
          console.log('open',e)
          this.ws.isOpen = true
          socket.send('start');
        });
        socket.addEventListener('error', (e) => {
          console.log('error',e)
          this.ws.error = e
          this.ws.isOpen = false
        });
        socket.addEventListener('close', (e) => {
          console.log('close',e)
          this.ws.isOpen = false
        });
        socket.addEventListener('message', (m) => {
          console.log('messsage',m)
          this.ws.message = m.data
          this.message = JSON.parse(m.data)
        });
      }
    },
    toggleRead(){
      if(this.ws.isOpen) {
        this.ws.start = !this.ws.start;
        socket.send(this.ws.start?'start':'stop');
      }
    },
  },
  components:{
    AnimatedNumber
  },
}


</script>

<style lang="stylus">

  html,body
    background-color #555 !important
    
    height 100%
    width 100%
    
  #app
    // height 100%
    width 800px
    height 480px
    background-color #004996 !important 
    background-size 125px 175px
    font-family: 'Roboto', sans-serif;
    transition all 0.5s  ease-in


  body
    margin 0
    padding 0

  // Test  

  .bd-navbar
    min-height 64px
    min-height 4rem
    // background-color #0157a5
    background-color rgba(255,255,255,0.08)
    -webkit-box-shadow 0 .5rem 1rem rgba(0,0,0,.05),inset 0 -1px 0 rgba(0,0,0,.1)
    box-shadow 0 .5rem 1rem rgba(0,0,0,.05),inset 0 -1px 0 rgba(0,0,0,.1)

  /**********************/

  #app.inprogress 
    background-color #0059a6  !important
    
    .value
      animation 0.5s blinkled linear infinite  !important

  #app.ready
    background-color green !important
    

  @keyframes blinkled
    from,to
      opacity 0
    50%
      opacity 1

  .blink
    animation 1s blink step-end infinite
          
  @keyframes blink
    from,to
      visibility hidden
    50%
      visibility visible
      

  @keyframes blink1
    from
      visibility visible
    to
      visibility hidden
    

</style>

<style lang="stylus">

.bialert 
  position fixed !important
  top 10px !important
  left 8rem !important
  // margin-left -200px
  z-index 9999 !important
  
  
.uyi
  
  .card
    color #ccc
    flex 0 0 auto !important
    width 7.5rem  !important
    height 7.5rem !important
    margin 0.24rem !important
    background-color transparent !important
    border-color rgba(255,255,255,0.1) !important
    cursor pointer
    opacity 0.5 !important
    border-radius 0
    transition  background 0.2s ease-out, color 0.2s ease-out, border-color 0.5s ease-out !important
    

    // .card-header
      // background-color rgba()
      
    
    .card-body, .card-header
      padding 0.5rem 0.2rem  !important
      overflow hidden !important
      position relative !important
      

    .card-header
      font-weight 700 !important
      
    .card-title
      font-size 4rem !important
      color rgba(255,255,255,0.2)
      white-space nowrap
      padding-right 5px
      margin 0
      line-height 3rem
      letter-spacing -5px
      
    &.sensors
      background-color rgba(255,255,255,0.1) !important
      opacity 1 !important  
      
    &.enabled.progress
      border-color #be924e !important
      background-color transparent !important
      
    &.enabled
      background-color #be924e !important
      opacity 1 !important
      
    &.error
      background-color #f00 !important
      
      
    &.counters, &.sensors
      border-color rgba(190,146,78,0.7) !important
      opacity 1 !important
      
      .card-title
        color rgba(190,146,78,1) !important
        
    // &.numeric
    //   .card-title


    &.WATER .card-title, &.ELECTRICITY .card-title
    &.HUMIDITY .card-title, &.TEMP .card-title
    &.CO2 .card-title
      font-size 2.5rem !important
      text-align right !important
      padding-right 1.5rem
      letter-spacing -1.5px !important
      font-weight 300 !important
      

    
      
      
    &.TEMP .card-title:after
      content '°'
      
    &.ELECTRICITY .card-title:after, &.HALL.METER .card-title:after
      content 'W'
      font-size 0.8rem
      margin-left 0.2rem
      
    &.WATER .card-title:after
      content 'c3'
      font-size 0.8rem
      margin-left 0.2rem
      
    &.HUMIDITY .card-title:after, &.CO2 .card-title:after
      content '%'
      font-size 1.2rem
      margin-left 0.2rem
      
    &.numeric .card-body[data-dir='up'] .card-title:before
      content '▴'
      animation blink1 5s 1 step-end forwards
      margin-left -1.8rem
      
    &.numeric .card-body[data-dir='down'] .card-title:before
      content '▾'
      color red
      animation blink1 5s 1 step-end forwards
      margin-left -1.8rem
      
    .card-title:after, .card-title:before
      position absolute

.slide-fade-enter-active
  transition all .3s ease
  color red !important
  
.slide-fade-leave-active
  transition all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0)

.slide-fade-enter
  transform translateY(-20px)
  opacity 0
  
.slide-fade-leave-to
  transform translateY(20px)
  opacity 0

.blink-enter-active
  animation 0.1s blink step-end infinite
  
</style>