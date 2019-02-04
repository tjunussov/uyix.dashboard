import axios from 'axios'
import {$http} from '@/api/http'
import MockAdapter from 'axios-mock-adapter'
import { WebSocket, Server } from 'mock-socket';

var data = {};
var meta = null;

var $mockServer 
var $mock 

axios.get('/static/data/data.json').then((resp)=>{
  data = resp.data;
})

if(localStorage.getItem('disableDemo') !== 'true'){

  console.log('Enabling Mock Services');

  $mock = new MockAdapter($http)
  .onGet('/data.json').reply((cfg)=>{
    console.log('providing fake data');
    return [200,data];  
  })
  .onGet('/meta.json').reply((cfg)=>{ 
    return axios.get('/static/data/meta.json').then((resp)=>{
      meta = resp.data;
      console.log('providing fake metadata');
      return [200,meta];  
    })
  })
  .onGet('/write/*').reply((cfg)=>{ 
    return [200,'OK'];
  })
  .onAny().reply((cfg)=>{
    return [200,'Badaboom'];
  })

  $mockServer = new Server("ws://"+localStorage.getItem('url'));

  window.WebSocket = WebSocket; // Here we stub out the window object
    
  $mockServer.on('connection', socket => {
      console.log("started mock socket demo",socket);
      socket.on('close',() => {
        console.log("stopping mock socket demo");
        window.clearInterval(interval);
      });
      demo(socket);
  });

}


var interval = null;

function demo(socket){
  window.clearInterval(interval);
  interval = window.setInterval(()=>{

      var slaves = Object.keys(data);
      var randSlave = slaves[random(0,slaves.length-1)];
      var regs = data[randSlave];
      var randReg = random(0,regs.length-1);

      var _json = {};
      _json[randSlave] = regs;
      _json[randSlave][randReg] = regs[randReg] > 1 ? random(10,100) : random(0,1) ;


      // console.log("mock socket _json",_json);

      socket.send(JSON.stringify(_json));

    },5000)
}

function random(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}