import Vue from 'vue'

export default Vue.mixin({
  methods: {
    sendAction(obj){

      if(!obj) { console.log('nothing to send'); return; }

      var slave = obj[0];
      var register = Math.abs(obj[1]);
      var val = window.unwrap(obj,0,this.data);
      var newVal = (val == 1) ? 0 : 1;

      console.log('sendAction',slave,register,val+ '->'+ newVal)

      this.$http.get(`/write/${slave}/${register}/${newVal}`).then(()=>{
      // this.toggleConfirm(group,key,val);
      // val.status = null
      }).catch((e)=>{
        console.error('sendAction with error',e);
      // this.toggleError(group,key,val);
      });
    },
    /*down(obj){

      var slave = obj[0];
      var register = Math.abs(obj[1]);
      var value = window.unwrap(obj,0,this.data);

      Vue.set(value,'status','progress');
      console.log('down',value);
    },
    up(obj){

      var slave = obj[0];
      var register = Math.abs(obj[1]);
      var value = window.unwrap(obj,0,this.data);

      console.log('up');
      if(value.type == 'TOGGLE')
        value = false
    },*/
    /*toggleConfirm(group,key,value){
      console.log('toggleConfirm');
      this.devices[group][key].status = null
    },
    toggleError(group,key,value){
      console.log('toggleError');
      this.devices[group][key].status = 'error'
      this.devices[group][key].value = (value == 0?1:0)
      this.timeout(group,key);
    },timeout(group,key){
      window.clearTimeout(this.errortm);
      this.errortm = window.setTimeout(()=>{
        this.devices[group][key].status = null
      }, 500);
    },*/
    
  }
});