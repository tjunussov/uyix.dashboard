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
