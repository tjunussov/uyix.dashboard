<template lang="pug">
doctype html

#app(:class="[status,(fullscreen?'nocursor':'')]")

  b-navbar.bd-navbar(toggleable="md" type="dark")

    b-nav-toggle(target="nav_collapse")

    b-navbar-brand(@click="showAlert='с 14:00 по 18:00 будут профилактические работы'")
      .logo
    b-navbar-brand(@click="toggleFullScreen()") SMART HOME

    b-navbar-nav.ml-2
      b-nav-form
        b-button(size="sm" :variant="masterState?'':'danger'" :pressed.sync="masterState") 
          i.fa.fa-power-off.mr-1/
          | {{masterState?'Выключить Все':'Снят с охраны'}}
        b-button.ml-2(size="sm" variant="" @click="opendDoor") 
          i.fa.fa-key/ 
          | Домофон
        
    //-   b-nav-item(to="/") Панель
    //-   b-nav-item(to="/") Меню

    b-navbar-nav.ml-auto
      //- b-nav-item(v-b-modal.settings) API
      b-nav-item(@click="isRooms=!isRooms" ) 
        span(:class="{'text-success':!isRooms,'text-muted':isRooms}") 
          i.fa.fa-th/
      b-nav-item(v-b-modal.communicate) 
        span(:class="{'text-success':ws.isOpen,'text-muted':!ws.isOpen}") 
          i.fa.fa-gear/
      b-nav-item(v-b-modal="'settings'").ml-3 CITY SEOUL ( КВ 51 )
      b-nav-item(@click="reload")
        i.fa.fa-user

          
  .mx-3.px-2.pt-2(:class="{'hideFake':hideFake}")
    template(v-if="isRooms")

      b-card-group.uyi.rooms.main(deck)
      
        b-card(no-body)
          b-card-body
            b-row.display.p-2
              b-col(cols="3")
                  b-button.mb-2(size="lg" 
                  :class="{'text-enable':data.groups[home.bell.status[0]] && data.groups[home.bell.status[0]].devices[home.bell.status[1]-1].value}" @click="sendAction(home.bell.value[0],home.bell.value[1]-1,data.groups[home.bell.value[0]].devices[home.bell.value[1]-1])")
                    | Звонок
                    i.fa.fa-bell-slash.ml-2(v-if="data.groups[home.bell.value[0]] && data.groups[home.bell.value[0]].devices[home.bell.value[1]-1].value")
                    i.fa.fa-bell.ml-2(v-else)
                  b-btn.text-danger(size="lg" v-if="data.groups[home.alarm[0]] && data.groups[home.alarm[0]].devices[home.alarm[1]-1].value" @click="sendAction(home.alarm[0],home.alarm[1]-1,data.groups[home.alarm[0]].devices[home.alarm[1]-1])")
                    | Сирена
                    i.fa.fa-bolt.ml-2/
              b-col(cols="4")
                  div
                    small Горячяя-Вода 
                  div
                    small Холодная-Вода 
                  div
                    small Электросчетчик
                  div
                    small Погода
              b-col(cols="5")
                  div
                    span.mr-2 {{home.meters[0] | unwrap(data) | money('hot')}}
                  div
                    span.mr-2 {{home.meters[1] | unwrap(data) | money('cold')}}
                  div
                    span.mr-2 {{home.meters[2] | unwrap(data) | money('power')}}
                  div
                    small.mr-2: i.fa.fa-snowflake-o
                    span.mr-2 2° 
                    small Гололед 


      b-card-group.uyi.rooms(deck)

        b-card(

            v-for="(g,k) in home.rooms"
             @click="sendAction(g.light.value[0],g.light.value[1]-1,data.groups[g.light.value[0]].devices[g.light.value[1]-1])"
             :key="k"
             :class="{'enabled':data.groups[g.light.status[0]] && data.groups[g.light.status[0]].devices[g.light.status[1]-1] && data.groups[g.light.status[0]].devices[g.light.status[1]-1].value,'toggled':data.groups[g.light.value[0]] && data.groups[g.light.value[0]].devices[g.light.value[1]-1].value}"
             no-body
             align="center")
          b-card-header 
            i.fa.fa-user-secret.mr-1(v-if="g.pir && data.groups[g.pir[0]] && data.groups[g.pir[0]].devices[g.pir[1]-1].value")
            | {{g.name}}
          b-card-body
            .display.pt-3
              .temp(v-if="g.temp") {{g.temp | unwrap(data) | numeric | adjuster('TEMP',adaptTemp)}}
              .humidity(v-if="g.humidity") {{g.humidity| unwrap(data)}}
              .sensors.text-center
                i.fa.fa-fire.text-danger.mr-1(v-if="g.fire && data.groups[g.fire[0]] && data.groups[g.fire[0]].devices[g.fire[1]-1].value")/
                i.fa.fa-tint.text-danger.mr-1(v-if="g.leak && data.groups[g.leak[0]] && data.groups[g.leak[0]].devices[g.leak[1]-1].value")/
                i.fa.fa-ban.text-danger.mr-1(v-if="g.valve && data.groups[g.valve.status[0]] && data.groups[g.valve.status[0]].devices[g.valve.status[1]-1].value")/
              

    template(v-else)
      b-card-group.uyi.devices(deck)
        template(v-for="(bus,s) in data.groups")
          b-card(
            v-for="(value,i) in bus.devices"
             :class="['hub'+s,value.status,value.type,value.subtype,bus.error,(bus.fake||value.fake?'fake':''),(value.value==1?'enabled':''),(value.value==0||value.value==1?'':'numeric')]"
             :key="s+':'+i"
             no-body
             @click="sendAction(s,i,value)"
             mousedown="down(s,i,value)"
             mouseup="up(s,i,value)"
             align="center")
            b-card-header {{(value.name)}}
            b-card-body(:data-newvalue="value.value")
              transition(:name="value.subtype=='METER'?'slide-fade':(value.type=='switch'?'chuh':'blink')" :duration="{ enter: 500}" @leave="leave" @enter="enter" mode="out-in")
                h4.card-title.meters(v-if="value.subtype == 'METER'" :key="value.value")
                  | {{value.value | numeric | adjuster(value.type,adaptTemp)}} 
                h4.card-title(v-else :key="value.value") {{value.value | humanizer(value.type,value.subtype)}}



  //- code {{ws}}

  b-modal#settings(v-model="showAlert" title="BI SERVICE - ALERT" header-text-variant="danger" no-fade hide-footer hide-backdrop)
    .text-center
      h4 Внимание! 
      p {{showAlertMessage}}
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
    b-form-group(label="Hide Fake" horizontal)
      b-form-checkbox(v-model="hideFake")
      b-form-checkbox(v-model="emulateFake")
    b-form-group(label="Ajust Temp - 4"  horizontal)
      b-form-checkbox(v-model="adaptTemp")

    p.text-danger(v-if="ws.error") {{ws.error}}
    p(v-if="ws.message") {{ws.message}}
    template(slot="modal-footer")
      b-btn(@click="toggleConnect" :variant="ws.isOpen?'secondary':'primary'") {{(!ws.isOpen?'Connect':'Disconnect')}}

  
  b-alert.bialert(
      dismissible 
      variant="danger" 
      :show="showDoor != null"
      @dismissed="showDoor = null")
      | Домофон 
      a.alert-link.ml-2 {{showDoor}}

</template>

<script>

import Vue from 'vue'
import MockAdapter from 'axios-mock-adapter'
import { WebSocket, Server } from 'mock-socket';
// import AnimatedNumber from '@/components/misc/AnimatedNumber'
import axios from 'axios'


Vue.filter('humanizer', function (value,type,subtype) {
  if(subtype == 'SENSOR'){
    // return value == 0?'NO':(value == 1?'YES':value)
    return value == 0?'○':(value == 1?'●':value)
  } else if( subtype == 'RELAY'){
    if(type=='TOGGLE') 
      return value == 0?'DN':(value == 1?'UP':value)
    else 
      return value == 0?'OFF':(value == 1?'ON':value)
  } else {
    return value == 0?'OFF':(value == 1?'ON':value)
  }
})

Vue.filter('adjuster', function (value,type,enabled) {
  if(type == 'TEMP' && enabled){
    return value - 4;
  } 
  return value;
})

var powerValue = null;
var powerCnt = 0;

var coldValue = null;
var coldCnt = 0;

var hotValue = null;
var hotCnt = 0;

Vue.filter('money', function (value,type) {
  if(type == 'cold'){
     if(coldValue != value && coldValue != null){
      coldCnt++;
    }
    coldValue = value;
    return ((454+coldCnt*10)/1000).toFixed(4) + 'm3 ( '+value*5+'тг)';
  }
  if(type == 'hot'){
    if(hotValue != value && hotValue != null){
      hotCnt++;
    }
    hotValue = value;
    return ((1095+hotCnt*10)/1000).toFixed(4) + 'm3 ('+value*10+'тг)';
  } 
  if(type == 'power'){
    if(powerValue != value && powerValue != null){
      powerCnt++;
    }
    powerValue = value;
    return ((15300+powerCnt*1000/3200)/1000).toFixed(4) + ' kW ('+Math.ceil(value*0.1)+'тг)';
  } 
  return value
})




Vue.filter('unwrap', function (value,data) {
  // on first load groups are empty
  
    // console.log(data.groups);
    if(value instanceof Array){
      // -1 becaue of registers
      if(data.groups[value[0]])
        return data.groups[value[0]].devices[value[1]-1].value;
      else 
        return null;
    }
    else {
      if(data.groups[value.value[0]])
        return data.groups[value.value[0]].devices[value.value[1]-1].value;
      else 
        return null
    }
})



var _DATA = {
  "homeid":"bicityseoul",
  "date":null,
  "time":null,
  "groups":{
    "1":{
      "title":"ПЛК",
      "fake":true,
      "devices":[
        /*{"name":"PIR","value":0,"type":"PIR","subtype":"SENSOR"},
        {"name":"Light","value":0,"type":"SWITCH","subtype":"RELAY"},
        {"name":"Blink","value":0,"type":"SWITCH","subtype":"RELAY"},*/
        {"name":"Коридор","value":0,"type":"SWITCH","subtype":"RELAY","fake":true},
        {"name":"Зал","value":0,"type":"SWITCH","subtype":"RELAY","fake":true},
        {"name":"Кухня","value":0,"type":"SWITCH","subtype":"RELAY","fake":true},
        {"name":"Сан-узел","value":0,"type":"SWITCH","subtype":"RELAY","fake":true},
        {"name":"Кладовая","value":0,"type":"SWITCH","subtype":"RELAY","fake":true},
        {"name":"Коридор","value":0,"type":"SOCKET","subtype":"RELAY","fake":true},
        {"name":"Зал1","value":0,"type":"SOCKET","subtype":"RELAY","fake":true},
        {"name":"Зал2","value":0,"type":"SOCKET","subtype":"RELAY","fake":true},
        {"name":"Кухня","value":0,"type":"SOCKET","subtype":"RELAY","fake":true},
        {"name":"Bell","value":0,"type":"TOGGLE","subtype":"RELAY","fake":true},
        {"name":"Сирена","value":1,"type":"ALARM","subtype":"RELAY","fake":true},
        {"name":"Bell","value":1,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Коридор","value":0,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Зал","value":0,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Кухня","value":0,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Сан-узел","value":0,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Кладовая","value":0,"type":"HALL","subtype":"SENSOR","fake":true},
        {"name":"Счетчик","value":2,"type":"METER","subtype":"POWER","fake":true}
      ]
    },
    "2":{
      "fake":true,
      "title":"Сенсор(Зал)",
      "devices":[
        {"name":"PIR","type":"PIR","subtype":"SENSOR","value":0},
        {"name":"Temp","type":"TEMP","subtype":"METER","value":23},
        {"name":"Humidity","type":"HUMIDITY","subtype":"METER","value":22},
        {"name":"Fire","type":"FIRE","subtype":"SENSOR","value":0},
        {"name":"TV on/off","type":"TV","subtype":"IR","value":0},
        {"name":"AIR on/off","type":"AIR","subtype":"IR","value":0}
      ]
    },
    "3":{
      "fake":true,
      "title":"Сенсор(Кухня)",
      "devices":[
        {"name":"PIR","type":"PIR","subtype":"SENSOR","value":0},
        {"name":"Temp","type":"TEMP","subtype":"METER","value":22},
        {"name":"Humidity","type":"HUMIDITY","subtype":"METER","value":28},
        {"name":"Fire","type":"FIRE","subtype":"SENSOR","value":0}
      ]
    },
    "4":{
      "fake":true,
      "title":"Сенсор(Санузел)",
      "devices":[
        {"name":"PIR","type":"PIR","subtype":"SENSOR","value":1},
        {"name":"Temp","type":"TEMP","subtype":"METER","value":21},
        {"name":"Humidity","type":"HUMIDITY","subtype":"METER","value":50}
      ]
    },
    "5":{
      "fake":true,
      "title":"Сенсор(Коридор)",
      "devices":[
        {"name":"PIR","type":"PIR","subtype":"SENSOR","value":1},
        {"name":"Temp","type":"TEMP","subtype":"METER","value":10},
        {"name":"Humidity","type":"HUMIDITY","subtype":"METER","value":40}
      ]
    },
    "6":{
      "fake":true,
      "title":"HUB(Санузел)",
      "devices":[
        {"name":"Задвижка","type":"VALVE","subtype":"RELAY","value":0},
        {"name":"Счетчик гор","type":"WATER COLD","subtype":"METER","value":3},
        {"name":"Счетчик хол","type":"WATER HOT","subtype":"METER","value":2},
        {"name":"Протечка Кухня","type":"LEAK","subtype":"SENSOR","value":0},
        {"name":"Протечка Санузел","type":"LEAK","subtype":"SENSOR","value":0},
        {"name":"Status Valve","type":"VALVE","subtype":"SENSOR","value":0}
      ]
    }
  },
};




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
var baseURL = localStorage.getItem('http')||'http://192.168.1.50:3000';
var $mock;
var $http = axios.create({
  baseURL: baseURL
})


export default {
  name: 'app',
  data(){
    return {
      user : 'ЗЕЛЕННЫЙ КВАРТАЛ',
      isRooms:true,
      dismissCountDown: 10,
      showDoor:null,
      showAlert:false,
      showAlertMessage:null,
      fullscreen:false,
      hideFake:false,
      emulateFake:true,
      masterState:true,
      adaptTemp:false,
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
        server: localStorage.getItem('ws')||'ws://192.168.1.50:3000',
        http:baseURL
      },
      data:{
        "homeid":"bicityseoul",
        "date":null,
        "time":null,
        "groups":{}
      },
      home:{
        // bell:{value:[1,10],status:[1,12]},
        // alarm:[1,11],
        alarm:[1,7],
        bell:{value:[1,8],status:[1,12]},
        meters:[
          {name:"Хол-Вода",value:[6,2]},
          {name:"Гор-Вода",value:[6,3]},
          {name:"Свет",value:[1,18]}
        ],
        rooms:{
          HALLAWAY:{
            name:"Прихожая",
            light:{value:[1,1],status:[1,13]},
            pir:[4,1],
            temp:[4,2],
            humidity:[4,3]
          },
          KITCHEN:{
            name:"Кухня",
            light:{value:[1,3],status:[1,15]},
            pir:[2,1],
            temp:[2,2],
            humidity:[2,3],
            fire:[2,4],
            tv:[2,5],
            air:[2,6],
            leak:[6,4]
          },
          HALL:{
            name:"Зал",
            light:{value:[1,2],status:[1,14]},
            pir:[3,1],
            temp:[3,2],
            humidity:[3,3]
          },
          BATHROOM:{
            name:"Сан-узел",
            light:{value:[1,4],status:[1,16]},
            pir:[5,1],
            temp:[5,2],
            humidity:[5,3],
            leak:[6,5],
            valve:{value:[6,1],status:[6,6]}
          },
          WARDROBE:{
            name:"Кладовая",
            light:{value:[1,5],status:[1,17]}
          }
        }
      }
      /*devices:{
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
      }*/
    }
  },
  created(){
    this.demo();
    console.log('created',this.ws.autoconnect)
    if(!this.ws.autoconnect) this.toggleConnect();
    // $http = axios.create({ baseURL: this.ws.http })
    // if(!this.ws.disableDemo) 

  },
  watch:{
    'ws.server'(val){
      localStorage.setItem('ws',val)
    },
    'ws.http'(val){
      localStorage.setItem('http',val)
      $http.setBaseUrl(val);
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
    'emulateFake'(val){
      $http.get('/fake/'+val).then((resp)=>{
        console.log('toggleFake',resp.data)
      });
    },
    'masterState'(val){
      $http.get('/TJ/master/'+val).then((resp)=>{
        console.log('toggleMaster',resp.data)
      });
    },
    'ws.autoconnect'(val){
      localStorage.setItem('autoconnect',val)
    },
    'ws.message'(val){
      

      var cursor = 0;
      sounds.play('update')
      
      /*Object.keys(this.data.groups).forEach((slave,i)=>{
        this.data.groups[slave].devices.forEach((k2,j)=>{
          console.log(k2,j);
          this.data.groups[slave][j].value = val[cursor++]
        });
      })*/

      Object.keys(val).forEach((slave)=>{
        val[slave].devices.forEach((item,j)=>{
          // console.log(slave,this.data.groups[slave]);
          var i = this.data.groups[slave].devices[j]
          i.value = item.value
          i.status = item.status
        });
      });

    }
  },
  computed:{
    online(){
      return this.$root.online
    },
    status(){
      return this.$root.status;
    },
    unwrap() {
      return (value) => {
        if(this.data.groups[value[0]]){
          if(value instanceof Array){
            // -1 becaue of registers
            if(this.data.groups[value[0]])
              return this.data.groups[value[0]].devices[value[1]-1].value;
          }
          else {
            if(this.data.groups[value.value[0]])
              return this.data.groups[value.value[0]].devices[value.value[1]-1].value;
          }
        }
        return '';
      }
    }
  },
  beforeDestroy(){
    window.clearInterval(this.demoInt);
    if(this.ws.isOpen) this.toggleConnect();
  },
  methods:{
    reload(){
      location.reload();
    },
    unwrapZ(value){
      if(value instanceof Array){
        // -1 becaue of registers
        return this.data.groups[value[0]].devices[value[1]-1].value;
      }
      else {
        return this.data.groups[value.value[0]].devices[value.value[1]-1].value;
      }
    },
    demo(){

      $mock = new MockAdapter($http,{delayResponse:1000 })
      .onAny().reply((cfg)=>{ return [200,_DATA];})

      //this.demoData()

      // window.clearInterval(this.demoInt);
      // this.demoInt = window.setInterval(this.demoData,5000);

    },
    demoData(){
        // this.devices.counters[Object.keys(this.devices.counters)[Math.ceil(Math.random()*2)]]++;
        // this.devices.sensors["HUMIDITY"] = Math.floor(Math.random()*100);

        // var name = Object.keys(this.devices.sensors)[Math.floor(Math.random()*4)];
        // this.devices.sensors[name] = Math.floor(Math.random()*1);


        var data = this.data.slice(0);

        // counter
        data[(Math.ceil(Math.random()*2)+8)]++;
        // sensors
        data[Math.floor(Math.random()*4)] = Math.floor(Math.random()*2);
        // sensors humidity
        data[(Math.floor(Math.random()*3)+6)] = Math.ceil(Math.random()*100);

        this.data = data;
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
    sendAction(slave,register,value){

      /*if((group == 'switch' || group == 'togglers' ) && this.devices[group][key].status == null){

        if(value == undefined){
          value = (this.devices[group][key].value == 0?1:0)
          console.log('default',group,key,value);
        } else {
          console.log(group,key,value);
        }
        
        this.devices[group][key].status = 'progress'
        this.devices[group][key].value = value

        sounds.play('toggle')

        $http.get(this.ws.http+'/set/'+key+'/'+value).then(()=>{
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

       }*/


       var val = (value.value == 1) ? 0 : 1;

       console.log('sendAction',slave,register,value.value+ '->'+ val)

       $http.get(`/TJ01/set/${slave}/${register+1}/${val}`).then(()=>{
          // this.toggleConfirm(group,key,value);
          // value.status = null
        }).catch(()=>{
          value.status = 'error'
          // this.toggleError(group,key,value);
        });
    },
    opendDoor(){
      $http.get('/opendoor').then((resp)=>{
          console.log(resp);
          this.showDoor = resp.data;
        }).catch(()=>{
        });
    },
    down(slave,register,value){
      Vue.set(value,'status','progress');
      console.log('down',value.status);
      if(value.type == 'TOGGLE')
        value.value = true
    },
    up(slave,register,value){
      console.log('up');
      if(value.type == 'TOGGLE')
        value.value = false
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
        socket = null;
      } else {
        this.toggleRead().then(()=>{
          socket = null;
          socket = new WebSocket(this.ws.server);
          socket.addEventListener('open', (e) => {
            this.ws.isOpen = true
            socket.send('/');
          });
          socket.addEventListener('error', (e) => {
            console.error('error',e)
            this.ws.error = e
            this.ws.isOpen = false
          });
          socket.addEventListener('close', (e) => {
            // console.log('close',e)
            this.ws.isOpen = false
          });
          socket.addEventListener('message', (m) => {
            // console.log('messsage',m)
            var m = JSON.parse(m.data)
            if(m.alert){
              console.log('ALERT',m.alert);
              this.showAlertMessage = m.alert;
              this.showAlert = true;
            } else if(m.master){
              console.log('MASTER',m.master);

            } else {
              this.ws.message = m
            }
          });
        });
      }
    },
    toggleRead(){
      /*if(this.ws.isOpen) {
        this.ws.start = !this.ws.start;
        socket.send(this.ws.start?'start':'stop');
      }*/
      return $http.get('/data.json').then((resp)=>{
        this.data = resp.data
      });
    },
  },
  components:{
    // AnimatedNumber
  },
}


const mockServer = new Server("ws://192.168.1.50:3000");

window.WebSocket = WebSocket; // Here we stub out the window object
  
mockServer.on('connection', socket => {
  window.setInterval(()=>{
    socket.send(JSON.stringify({
    "2":{
      "fake":true,
      "title":"Сенсор(Зал)",
      "devices":[
        {"name":"PIR","type":"PIR","subtype":"SENSOR","value":random(0,1)},
        {"name":"Temp","type":"TEMP","subtype":"METER","value":random(20,30)},
        {"name":"Humidity","type":"HUMIDITY","subtype":"METER","value":random(1,100)}
      ]
    }}));  

  },5000)


function random(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

  
});


</script>

<style lang="stylus" src="./AppStyles.stylus"/>