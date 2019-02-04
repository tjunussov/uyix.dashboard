import {$http} from '@/api/http'

export default {
  install: function(Vue,) {
    Object.defineProperty(Vue.prototype, '$http', { value: $http });
  }
}



