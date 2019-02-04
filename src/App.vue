<template lang="pug">
doctype html

#app(:class="[(!ws.disableDemo?'demo':''),(fullscreen?'nocursor':'')]")

  b-navbar.bd-navbar(toggleable="md" type="dark")

    b-nav-toggle(target="nav_collapse")

    b-navbar-brand(@click="showAlert='с 14:00 по 18:00 будут профилактические работы'")
      .logo
      b-badge(v-if="!ws.disableDemo") DEMO
    b-navbar-brand(@click="$root.toggleFullScreen()").w100 SMARTHOME


    b-navbar-nav.ml-2(v-if="meta")
      b-nav-form
        b-button(v-if="meta.others && meta.others.master != null" size="sm" :variant="masterState?'':'danger'" :pressed.sync="masterState") 
          i.fa.fa-power-off.mr-1/
          | {{masterState?'Выключить Все':'Снят с охраны'}}
        b-button.ml-2(v-if="meta.intercom" size="sm" variant="" @click="opendDoor") 
          i.fa.fa-key/ 
          | Домофон
        
    //-   b-nav-item(to="/") Панель
    //-   b-nav-item(to="/") Меню

    b-navbar-nav.ml-auto
      //- b-nav-item(v-b-modal.settings) API
      b-nav-item(to="/home") 
        span(:class="{'text-success':!isRooms,'text-muted':isRooms}") 
          i.fa.fa-home/
      b-nav-item(to="/list") 
        span(:class="{'text-success':!isRooms,'text-muted':isRooms}") 
          i.fa.fa-th/
      b-nav-item(v-b-modal.communicate) 
        span(:class="{'text-success':ws.isOpen,'text-muted':!ws.isOpen}") 
          i.fa.fa-gear/
      b-nav-item(v-b-modal="'settings'").ml-3 {{user}}
      b-nav-item(@click="reload")
        i.fa.fa-user

          
  .mx-3.px-2.pt-2(:class="{'hideFake':hideFake}")
    router-view

  //- code {{ws}}

  b-modal#settings(v-if="showAlert!=null" :visible="true" title="BI SERVICE - ALERT" header-text-variant="danger" @hide.prevent="showAlert=null" no-fade hide-footer hide-backdrop)
    .text-center
      h4 Внимание! 
      p {{showAlert}}
      img(height="200" src="static/maintenace.jpg")

  b-modal#communicate(title="Подключение")

    b-form-group
      b-input-group
        b-form-input(v-model="ws.url" size="lg" placeholder="Server ip:port")
        b-input-group-append(is-text) 
          span.mr-2 Auto
          b-form-checkbox(v-model="ws.autoconnect")
      b-row.mt-3
        b-col
          b-form-group(label="Hide Fake")
            b-form-checkbox(v-model="hideFake")
            b-form-checkbox(v-model="emulateFake")
        b-col
          b-form-group(label="Ajust Temp - 4, Mute")
            b-form-checkbox(v-model="adaptTemp")
            b-form-checkbox(v-model="muteSound")
              

    b-list-group
      b-list-group-item
        p.text-danger(v-if="ws.error") {{ws.error}}
        code {{ws.message}}

    template(slot="modal-footer")
      b-form-checkbox(button-variant="primary" v-model="ws.disableDemo") Disable Demo
      b-btn(:variant="mustReload?'primary':''" @click="reload") Reload
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
import axios from 'axios'
import sounds from '@/services/audio'


var socket;

export default {
  name: 'app',
  data(){
    return {
      user : 'CITY SEOUL ( КВ 51 )',
      isRooms:true,
      dismissCountDown: 10,
      showDoor:null,
      showAlert:null,
      hideFake:false,
      emulateFake:true,
      masterState:true,
      adaptTemp:false,
      muteSound:false,
      mustReload:false,
      ws:{
        isOpen : false,
        start: false,
        error: null,
        message:'Here will be data',
        disableDemo:localStorage.getItem('disableDemo')=== 'true'||false,
        autoconnect:localStorage.getItem('autoconnect') === 'true'||false,
        url:localStorage.getItem('url')
      }
    }
  },
  created(){
    console.log('created',this.ws.autoconnect)
    
    /*axios.get('/static/data/data.json').then((resp)=>{
      console.log('Data loaded',resp.data);
      this.$root.data = resp.data;
    });*/
    // this.demo();
    if(this.ws.disableDemo){
      console.log('Disabling Demo'); 
    }

    this.$http.get('/meta.json').then((resp)=>{
      console.log('Metadata loaded',resp.data);
      this.$root.meta=resp.data;
      if(this.ws.autoconnect) this.toggleConnect();
    }).catch(()=>{
      this.showDoor = "No meta.json found on server!";
    });

    this.getWeather();
    
  },
  watch:{
    'ws.url'(val){
      localStorage.setItem('url',val)
      this.mustReload = true;
    },
    'ws.disableDemo'(val){
      localStorage.setItem('disableDemo',val)
      this.mustReload = true;
    },
    'emulateFake'(val){
      this.$http.get('/fake/'+val).then((resp)=>{
        console.log('toggleFake',resp.data)
      });
    },
    'masterState'(val){
      this.$http.get('/master/'+val).then((resp)=>{
        console.log('toggleMaster',resp.data)
      });
    },
    'ws.autoconnect'(val){
      localStorage.setItem('autoconnect',val)
      this.mustReload = true;
    }
  },
  computed:{
    fullscreen(){
      return this.$root.fullscreen
    },
    data(){
      return this.$root.data;
    },
    meta(){
      return this.$root.meta;
    }
  },
  beforeDestroy(){
    if(this.ws.isOpen) this.toggleConnect();
  },
  methods:{
    reload(){
      location.reload();
    },
    opendDoor(){
      this.$http.get('/opendoor').then((resp)=>{
          console.log(resp);
          this.showDoor = resp.data;
        }).catch(()=>{
        });
    },
    getWeather(){

      console.log('getting weather')

      if(localStorage.getItem('weather') != null){
        this.$root.weather = JSON.parse(localStorage.getItem('weather'));
        return;
      }

      axios.get('https://api.openweathermap.org/data/2.5/weather?q=Astana,KZ&appid=b7c0c6193d281b57a30652d34a8a5b25&units=metric').then((resp)=>{
        console.log('fetching weather',resp.data)
        localStorage.setItem('weather',JSON.stringify(resp.data))
        this.$root.weather = resp.data;
      }).catch(()=>{
        
      });

    },
    toggleConnect(){
      if(this.ws.isOpen){
        socket.close();
        this.ws.isOpen = false;
        socket = null;
      } else {
        this.$http.get('/data.json').then((resp)=>{

          this.$root.data = resp.data
          this.ws.message = resp.data;

          socket = null;
          socket = new WebSocket('ws://'+this.ws.url);
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
            // console.log('message',m)
            if(!this.muteSound) sounds.play('update');

            m = JSON.parse(m.data)
            this.ws.message = m;

            if(m.alert){
              console.log('ALERT',m.alert);
              this.showAlert = m.alert;
            } else if(m.master){
              console.log('MASTER',m.master);

            } else {

              Object.keys(m).forEach((slave)=>{
                /*m[slave].forEach((val,j)=>{
                  this.$root.data[slave][j] = val
                });*/
                this.$root.data[slave] = m[slave];
              });

            }
          });
        });
      }
    }
  }
}


</script>

<style lang="stylus" src="./AppStyles.stylus"/>