<template lang="pug">
div(v-if="meta")
  b-card-group.uyi.rooms.meters(deck)
    pass(v-for="(m,k,i) in meta.meters" v-if="k == selected" :key="k" :meta="getUserData(m)")
      b-card.active(no-body align="center" slot-scope="{ meta }")
        b-card-body
          b-card-group.meters-body(deck)
            b-card(no-body align="center")
              b-card-body.hot(v-if="m['hot']") 
                div ХВС {{meta.value}} m3 {{meta.money}} ₸
                | {{m['hot'] | unwrapMoney(data,'hot',meta)}}
            b-card(no-body align="center")
              b-card-body.cold(v-if="m['cold']")  
                div ГВС 
                | {{m['cold'] | unwrapMoney(data,'cold',meta)}}
            b-card(no-body align="center")
              b-card-body.pow(v-if="m['power']") 
                div ЭЛ 
                | {{m['power'] | unwrapMoney(data,'power',meta)}}

  b-card-group.uyi.rooms(deck)

    template(v-for="(m,k,i) in meta.meters")
        b-card(:class="{active:selected == k}" :disabled="m.disabled" no-body align="center" )
          b-card-header(@click.stop="meterNo = i")
            | {{k}}
          b-card-body
            .swicthes
              b-btn.btn-block.hot(@click.stop="edit(m['hot'])" v-if="m['hot']" v-b-modal="'meteredit'")
                | {{m['hot'] | unwrapMoney(data,'hot',meta)}}
              b-btn.btn-block.cold(@click.stop="edit(m['cold'])" v-if="m['cold']" v-b-modal="'meteredit'") 
                | {{m['cold'] | unwrapMoney(data,'cold',meta)}}
              b-btn.btn-block.pow(@click.stop="edit(m['power'])" v-if="m['power']" v-b-modal="'meteredit'")
                | {{m['power'] | unwrapMoney(data,'power',meta)}}

  b-modal#meteredit(title="Уставка" size="sm" @ok="saveMeta" @hide="newVal=null" Zok-disabled="isOk")
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

Vue.component('pass', {
  render() {
    return this.$scopedSlots.default(this.$attrs)
  }
});

export default {
  name: 'Home',
  data(){
    return {
      current:null,
      newVal:null,
      newVal1:null,
      newVal2:null,
      interval:null,
      meterNo:0,
      home:{}
    }
  },
  created(){
    this.interval = window.setInterval(()=>{ this.meterNo++ },10000);
  },
  beforeDestroy(){
    window.clearInterval(this.interval);
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
    selected(){
      return Object.keys(this.meta.meters)[this.meterNo % Object.keys(this.meta.meters).length]
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
    saveMeta(){
      this.current.offset = this.newVal - this.unwrap(this.current)  + this.current.offset;
      console.log('sendMeta',this.newVal,this.current);

      this.$http.post('meta.json',this.meta).then(()=>{
        console.log('meta saved');        
      }).catch((e)=>{
        console.error('saveMeta with error',e);
      // this.toggleError(group,key,val);
      });
    },
    getUserData(data){
      return {value:10,money:10}

    }
  },
  mixins: [actionMixin]
}





</script>

<style lang="stylus">
.hot 
  color red !important
.cold 
  color #00a2ff !important
.pow
  color #ffd800 !important
  

.uyi.rooms.meters .card
  height 13.1rem !important
    
.uyi.rooms .meters-body .card
  height 11.5rem !important
  border-radius  100%
  margin-right 2.2rem !important
  margin-left 2.2rem !important
  padding-top 1rem
  font-size 2rem
  line-height 2.2rem
  letter-spacing -1px
  background-color rgba(0,0,0,0.1) !important
  border 1px solid #ffffff66  !important
  color #000 !important
    
</style>