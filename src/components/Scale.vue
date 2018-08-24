<template lang="pug">
.scales.p-5
  .display.p-5.text-right
    .value.pr-5(:class="{'text-muted':$root.zero == 0}")
      AnimatedNumber(:number="realValue")
      //- | {{value}}
    .unit кг
</template>

<script>
import Vue from 'vue'
import AnimatedNumber from '@/components/misc/AnimatedNumber'

const audioFolder = 'static/audio/'

var sounds = {
  inprogress : new Audio(audioFolder+"scan.mp3"),
  ready : new Audio(audioFolder+"ready.mp3"),
  clear : new Audio(audioFolder+"clear.mp3"),
  play : function (snd){
      this[snd].currentTime = 0
      this[snd].play();
  }
}

export default {
  name: 'Scale',
  watch:{
    realValue(val){
      console.log('value',val);
      if(val > 0 ){
        this.$root.status = 'inprogress'
        this.timeout(2000)
      } else { 
        window.clearTimeout(this.tmDisplay);
        this.$root.status = 'clear'
      }
    },
    status(val){
      sounds.play(val)
    }
  },
  computed:{
    realValue(){
      if(this.$root.value >= 0) return this.$root.value - this.$root.zero
    },
    status(){
      return this.$root.status;
    }
  },
  data () {
    return {
      isReady:null,
      tmDisplay:null
    }
  },
  components:{
    AnimatedNumber
  },
  methods:{
    timeout(tm){
      console.log('timeo',tm);
      window.clearTimeout(this.tmDisplay);
      this.tmDisplay = window.setTimeout(this.clear,tm);
    },
    clear(){
      console.log('cleared');
      this.$root.status = 'ready'
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">

.scales
  .display
    color #fff
    position relative
    // outline 1px solid rgba(255,255,255,0.2)
    
    .value
      font-size 20rem
      letter-spacing -1rem
      line-height 20rem
      
    .unit
      position absolute
      right 2rem
      top 3rem 
      font-weight 100
      font-size 5rem
 
     
</style>
