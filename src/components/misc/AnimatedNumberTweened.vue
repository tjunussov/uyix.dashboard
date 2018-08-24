<template lang="pug">
span.animatedNumber {{displayNumber | money}}
</template>

<script>
import TWEEN from '@tweenjs/tween.js';

export default {
  name:'animated-number',
  props:{'number':{type: Number,default:0}},
  data: function(){  
      return {
        tweeningValue:0
      }
    },
    mounted: function () {
      this.tween(0, this.number)
    },
    watch:{
      number: function(newValue, oldValue){
        this.tween(oldValue, newValue)
      }
    },
    methods: {
      tween: function (startValue, endValue) {
        var vm = this
        function animate () {
          if (TWEEN.update()) {
            requestAnimationFrame(animate)
          }
        }
        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 400)
          .easing(TWEEN.Easing.Quartic.Out)
          .onUpdate(function (obj) {
            vm.tweeningValue = obj.tweeningValue.toFixed(0)
          })
          .start()
        animate()
      }
    }
}
</script>
