<template lang="pug">
b-card-group.uyi.devices(deck v-if="data && meta")
  template(v-for="(bus,s) in meta.slaves")
    b-card(
      v-for="(reg,r) in bus.regs"
       :class="['hub'+s,reg.split('.'),bus.error,(bus.fake?'fake':''),(unvalue([s,r])==1?'enabled':'')]"
       :key="s+':'+r"
       no-body
       v-if="reg && !reg.includes('CHANGE')"
       @click="sendAction([s,r])"
       Zmousedown="down([s,r])"
       Zmouseup="up([s,r])"
       align="center")
      b-card-header {{(reg)}}
      b-card-body(:data-newvalue="unvalue([s,r])")
        transition(:name="reg.includes('METER')?'slide-fade':(reg.includes('RELAY')?'chuh':'blink')" :duration="{ enter: 500}" @leave="leave" @enter="enter" mode="out-in")
          h4.card-title.meters(v-if="reg.includes('METER')" :key="unvalue([s,r])")
            | {{unvalue([s,r]) | numeric}}
          h4.card-title(v-else :key="unvalue([s,r])") {{unvalue([s,r])}}

//- b-card-group.uyi.devices(deck)
//-   template(v-for="(bus,s) in data.groups")
//-     b-card(
//-       v-for="(value,i) in bus.devices"
//-        :class="['hub'+s,value.status,value.type,value.subtype,bus.error,(bus.fake||value.fake?'fake':''),(value.value==1?'enabled':''),(value.value==0||value.value==1?'':'numeric')]"
//-        :key="s+':'+i"
//-        no-body
//-        @click="sendAction(s,i,value)"
//-        mousedown="down(s,i,value)"
//-        mouseup="up(s,i,value)"
//-        align="center")
//-       b-card-header {{(value.name)}}
//-       b-card-body(:data-newvalue="value.value")
//-         transition(:name="value.subtype=='METER'?'slide-fade':(value.type=='switch'?'chuh':'blink')" :duration="{ enter: 500}" @leave="leave" @enter="enter" mode="out-in")
//-           h4.card-title.meters(v-if="value.subtype == 'METER'" :key="value.value")
//-             | {{value.value | numeric | adjuster(value.type,adaptTemp)}} 
//-           h4.card-title(v-else :key="value.value") {{value.value | humanizer(value.type,value.subtype)}}
   

</template>

<script>

import Vue from 'vue'
import actionMixin from '@/services/actionMixin'


export default {
  name: 'List',
  data(){
    return {
      home:{}
    }
  },
  computed:{
    unstatus(){
      return (v) => window.unvalue(v,2,this.data)
    },
    unvalue(){
      return (v) => window.unwrap(v,0,this.data)
    },
    meta(){
      return this.$root.meta;
    },
    data(){
      return this.$root.data;
    }
  },
  mixins: [actionMixin],
  methods:{
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
  }
}


</script>

<style lang="stylus">
</style>