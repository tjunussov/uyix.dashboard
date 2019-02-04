import Vue from 'vue'
import numeral from 'numeral'

numeral.localeData().delimiters.thousands = ' ';

Vue.filter('date', function(value) {
  if(!value) return ""
  return value.toLocaleString('ru', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).initCap();
});

Vue.filter('datetime', function(value) {
  if(!value) return ""
  return value.toLocaleString('ru', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour:'numeric',
    minute:'numeric'
  });
});

Vue.filter('numeric', function (value) {
  return numeral(value).format('0,0')
})

String.prototype.initCap = function () {
   return this.toLowerCase().replace('г.','').replace(/(?:^|\s)[a-zа-я]/g, function (m) {
      return m.toUpperCase();
   });
};


/***************/

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
  if(value == null) return '-';
  if(type == 'cold'){
     if(coldValue != value && coldValue != null){
      coldCnt++;
    }
    coldValue = value;
    return ((454+coldCnt*10)/1000).toFixed(2) + 'm3 ( '+value*5+'тг)';
  }
  if(type == 'hot'){
    if(hotValue != value && hotValue != null){
      hotCnt++;
    }
    hotValue = value;
    return ((1095+hotCnt*10)/1000).toFixed(2) + 'm3 ('+value*10+'тг)';
  } 
  if(type == 'power'){
    if(powerValue != value && powerValue != null){
      powerCnt++;
    }
    powerValue = value;
    return ((15300+powerCnt*1000/3200)/1000).toFixed(2) + ' kW ('+Math.ceil(value*0.1)+'тг)';
  } 
  return value
})


Vue.filter('unwrap', function (value,data) {
  return unwrap(value,0,data);
})

function unwrap(v,i,data){
  if(!data) return null;
  if(v && v[i] && data[v[i]] && data[v[i]][Math.abs(v[i+1])] != null){
    if(v[i+1] < 0) // Проверка на инвертированные значения
      return (data[v[0]][Math.abs(v[i+1])] == 1) ? 0 : 1;
    else 
      return data[v[0]][Math.abs(v[i+1])];
  } else {
    return null
  }

}

window.unwrap = unwrap;