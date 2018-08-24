<template lang="pug">
span.animatedNumber(:class="{'inprogress':interval}") {{displayNumber}}
//- span.animatedNumber {{displayNumber | money}}
</template>

<script>
export default {
  name:'animated-number',
  props:{'number':{default:0}},
  data: function(){  
    return {
      displayNumber:0,
      interval:false
    }
  },
  mounted(){
    console.log('mounted animated number',this.number);
    this.displayNumber = this.number ? this.number : 0;
  },
  /*ready(){
    console.log('ready animated number',this.number);
    this.displayNumber = this.number ? this.number : 0;
  },*/
  watch:{
    number: function(val){
      console.log('watch animated number',val);
      clearInterval(this.interval);
      if(val !==null && !isNaN(val) && val != this.displayNumber){
        // console.info('animated-number',val);
        // return;
      
        this.interval = window.setInterval(function(){
          if(this.displayNumber != val){
            var change = (val - this.displayNumber) / 2;
            change = change >= 0 ? Math.ceil(change) : Math.floor(change);
            this.displayNumber = this.displayNumber + change;
          } else {
            clearInterval(this.interval);
            this.interval = false;
          }
        }.bind(this), 20);

      }
    }
  
  }
}
</script>
