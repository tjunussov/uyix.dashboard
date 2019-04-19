<template lang="pug">
div(v-if="meta")
  b-card-group.uyi.rooms.main(deck)

    //- b-card(no-body)
      b-card-body
        b-row.display.p-2
          b-col(cols="4").w100
              div
                small Горячяя Вода 
              div
                small Холодная Вода 
              div
                small Электроэнергия
              div
                small Погода
          b-col(cols="5")
              div
                span.mr-2 {{meta.meters['hot'] | unwrapMoney(data,'hot',meta) }}
              div
                span.mr-2 {{meta.meters['cold'] | unwrapMoney(data,'cold',meta) }}
              div
                span.mr-2 {{meta.meters['power'] | unwrapMoney(data,'power',meta) }}
              div(v-if="weather")
                small.mr-2: i.fa.fa-snowflake-o
                span.mrs-2 {{weather.main.temp}}° 
                small {{weather.weather[0].description}}

  b-card-group.uyi.rooms(deck)

    template(v-for="(m,k) in meta.meters")
        b-card(:disabled="m.disabled" no-body align="center")
          b-card-header 
            | {{k}}
          b-card-body
            .swicthes
              b-btn.btn-block.cold(@click="edit(m['hot'])" v-if="m['hot']" v-b-modal="'meteredit'")
                | {{m['hot'] | unwrapMoney(data,'hot',meta)}}
              b-btn.btn-block.hot(@click="edit(m['cold'])" v-if="m['cold']" v-b-modal="'meteredit'") 
                | {{m['cold'] | unwrapMoney(data,'cold',meta)}}
              b-btn.btn-block.pow(@click="edit(m['power'])" v-if="m['power']" v-b-modal="'meteredit'")
                | {{m['power'] | unwrapMoney(data,'power',meta)}}

  b-modal#meteredit(title="Уставка" size="sm" @ok="save" @hide="newVal=null" :ok-disabled="isOk")
    //- div {{meta.metersConfig.tariff}}
    //- div {{newVal}}
    b-form-group
      b-input-group
        //- b-form-input.text-right(v-model="newVal1" size="lg" :placeholder="''+unwrap(current)")
        //- b-form-input(v-model="newVal2" size="lg" length="3" :placeholder="''+unwrap(current)")
        b-form-input(v-model="newVal" size="lg" length="3" :placeholder="''+unwrap(current)")
</template>

<script>

import Vue from 'vue'
import actionMixin from '@/services/actionMixin'


export default {
  name: 'Home',
  data(){
    return {
      current:null,
      newVal:null,
      newVal1:null,
      newVal2:null,
      home:{}
    }
  },
  computed:{
    isOk(){
      if(this.newVal){
        if(this.newVal > this.convert(this.current)){
          console.log('true')
          return false;
        }
      }
      return true;
    },
    newVal3(){
      if(this.newVal1 && this.newVal2)
        return Number(this.newVal1+'.'+this.newVal2);
      return null;
    },
    unstatus(){
      return (v) => window.unwrap(v,2,this.data)
    },
    unwrap(){
      return (v) => window.unwrap(v,0,this.data)
    },
    convert(){
      return (v) => window.convert(v,this.data)
    },
    meta(){
      return this.$root.meta;
    },
    data(){
      return this.$root.data;
    },
    weather(){
      return this.$root.weather;
    },
  },
  methods:{
    edit(m){
      this.current = m;
    },
    save(){
      this.current.offset = this.newVal - this.unwrap(this.current)  + this.current.offset;
      console.log('saved',this.newVal,this.current);
    }
  },
  mixins: [actionMixin]
}



</script>

<style lang="stylus">
.hot 
  color red
.cold 
  color #00a2ff
.pow
  color #ffd800
</style>