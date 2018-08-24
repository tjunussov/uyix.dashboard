// import axios from 'axios'
import {$http} from '@/store/api/http'
import MockAdapter from 'axios-mock-adapter'

export const mock = new MockAdapter($http)
/*.onGet('/RB508027382SG').reply(200,
  {"trackid":"RB508027382SG","timestamp":"21:56:29 06.04.2018","direction":"IMPORT","status_code":"D","status":"Вручено","x_status_code":"S_ISS","x_status":"Вручено","sender":{"country":"Сингапур","name":"1","address":"1","x_postindex":null},"origin":{"date":"01.04.2018","x_dep_id":"18907","city":"Алматы","dep_name":"Участок по обработке международной почты г. Алматы","postindex":"220096"},"receiver":{"name":"Junnussov T","address":"Astana Saryarka  15","country":"Казахстан","x_postindex":null},"last":{"date":"05.04.2018","x_dep_id":"19465","city":"","dep_name":"Постамат пр. Сарыарка, д. 15, БЦ ИСКЕР","address":"Астана область, г. Астана, пр. Сарыарка, д.15","postindex":"900109"},"delivery":{"date":"05.04.2018","time":"15:41","period_fact":"4","x_period":null,"x_dep_id":"19465","city":"","dep_name":"Постамат пр. Сарыарка, д. 15, БЦ ИСКЕР","address":"Астана область, г. Астана, пр. Сарыарка, д.15","gps":["",""],"phone":"","postindex":"900104"},"storage_period":"","package_type":"Мелкий пакет","category":"Заказное","delivery_method":"Авиа","dispute":"","weight":"менее 1"}
)*/
.onGet('/putToBag').reply(200,{
    "user":"ASEL"
  }
)
.onAny('/VALVE').reply((cfg)=>{
    var resp = JSON.parse(cfg.data)
    console.log('mock closeBag',resp);
    if(resp.count > 0)
      return [200,resp];
    else
      return [400,{error:"Мешок пустой!"}]

})
.onGet('/SOCKET').reply(200,{
    "user":"ASEL"
  }
)
.onAny().reply((cfg)=>{

  var resp = {
          "PIR":0,
          "DOOR":0,
          "REEDSWITCH":0,
          "HUMIDITY":"25",
          "TEMP":"21",
          "HALLMETER":"255",
          "POWERMETER":1000,
          "WATERMETER":800,
          "LEAK":0,
          "LIGHT":1,
          "SOCKET":1,
          "CLAP":0,
          "VALVE":1
      };

  if((Math.random()*100) > 10)
    return [200,resp];
  else {
    return [400,{error:"Отправление RB508027382SG не найдено!"}]
  }
})