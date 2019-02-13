<template lang="pug">
div(v-if="meta")
  b-card-group.uyi.rooms.main(deck)

    b-card(no-body)
      b-card-body
        b-row.display.p-2
          b-col(cols="3")
              b-btn.w100.btn-block.text-left(size="lg" 
                v-if="meta.others && meta.others.master"
                :class="{'text-enable':unvalue(meta.others.master)}"
                @click="sendAction(meta.others.master)")
                i.fa.fa-power-off.mr-2/
                | Отключить
              b-btn.w100.btn-block.text-left(
                v-if="meta.others && meta.others.bell"
                size="lg"
                :class="{'text-enable':unstatus(meta.others.bell)}"
                @click="sendAction(meta.others.bell)")
                  i.fa.fa-bell-slash.mr-2(v-if="unvalue(meta.others.bell)")
                  i.fa.fa-bell.mr-2(v-else)
                  | Звонок
              b-btn.w100.btn-block.text-left(size="lg" variant="outline-secondary" 
                v-if="meta.others && meta.others.alarm"
                @click="sendAction(meta.others.alarm)"
                :class="{'btn-secondary text-danger':unstatus(meta.others.alarm)}")
                i.fa.fa-bolt.mr-2/
                | Сирена
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
                span.mr-2 {{meta.meters['Гор-Вода'] | unwrap(data) | money('hot')}}
              div
                span.mr-2 {{meta.meters['Хол-Вода'] | unwrap(data) | money('cold')}}
              div
                span.mr-2 {{meta.meters['Свет'] | unwrap(data) | money('power')}}
              div(v-if="weather")
                small.mr-2: i.fa.fa-snowflake-o
                span.mrs-2 {{weather.main.temp}}° 
                small {{weather.weather[0].description}}

  b-card-group.uyi.rooms(deck)

    template(v-for="(g,k) in meta.rooms")
      template(v-if="g.light && Array.isArray(g.light[0])")
        b-card(:disabled="g.disabled" no-body align="center")
          b-card-header 
            i.fa.fa-user-secret.mr-1(v-if="unvalue(g.pir)")
            i.fa.fa-folder-open-o.mr-1(v-if="unvalue(g.reed)")
            | {{g.name}}
          b-card-body
            .display.pt-3
              .temp(v-if="g.temp") {{unvalue(g.temp) | numeric}}
              .humidity(v-if="g.humidity") {{unvalue(g.humidity)}}
            .sensors.text-center
              i.fa.fa-fire.text-danger.mr-1(v-if="unvalue(g.fire)")/
              i.fa.fa-tint.text-danger.mr-1(v-if="unvalue(g.leak)")/
              i.fa.fa-ban.text-danger.mr-1(v-if="unstatus(g.valve)")/
            .swicthes
              b-btn.btn-block(size="lg" 
                :key="i"
                @click="sendAction(gg)"
                v-for="(gg,i) in g.light"
                :class="{'enabled':unstatus(gg),'toggled':unvalue(gg)}")

      template(v-else)
        b-card(@click="sendAction(g.light)"
             :class="{'enabled':unstatus(g.light),'toggled':unvalue(g.light)}"
             :disabled="g.disabled"
             no-body
             align="center")
          b-card-header 
            i.fa.fa-user-secret.mr-1(v-if="unvalue(g.pir)")
            i.fa.fa-folder-open-o.mr-1(v-if="unvalue(g.reed)")
            | {{g.name}}
          b-card-body
            .display.pt-3
              .temp(v-if="g.temp") {{unvalue(g.temp) | numeric}}
              .humidity(v-if="g.humidity") {{unvalue(g.humidity)}}
            .sensors.text-center
              i.fa.fa-fire.text-danger.mr-1(v-if="unvalue(g.fire)")/
              i.fa.fa-tint.text-danger.mr-1(v-if="unvalue(g.leak)")/
              i.fa.fa-ban.text-danger.mr-1(v-if="unstatus(g.valve)")/
   

</template>

<script>

import Vue from 'vue'
import actionMixin from '@/services/actionMixin'


export default {
  name: 'Home',
  data(){
    return {
      home:{}
    }
  },
  computed:{
    unstatus(){
      return (v) => window.unwrap(v,2,this.data)
    },
    unvalue(){
      return (v) => window.unwrap(v,0,this.data)
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
  mixins: [actionMixin]
}



</script>

<style lang="stylus">
</style>