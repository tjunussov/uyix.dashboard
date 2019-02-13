import axios from 'axios'
import {$http} from '@/api/http'
import MockAdapter from 'axios-mock-adapter'
import { WebSocket, Server } from 'mock-socket';

var data = {};
var meta = null;

var $mockServer 
var $mock 

var $socket = null;

axios.get('static/data/data.json').then((resp)=>{
  data = resp.data;
})

if(localStorage.getItem('disableDemo') !== 'true'){

  console.log('Enabling Mock Services');

  $mock = new MockAdapter($http)
  .onGet('data.json').reply((cfg)=>{
    console.log('mocking providing fake data');
    return [200,data];  
  })
  .onGet('meta.json').reply((cfg)=>{ 
    return axios.get('/static/data/meta.json').then((resp)=>{
      meta = resp.data;
      console.log('mocking providing fake metadata');
      return [200,meta];  
    })
  })
  .onGet(/write/).reply((cfg)=>{
    console.log('mocking writing data',cfg.url.split('/'));
    var a = cfg.url.split('/');

    data[a[2]][Number(a[3])] = Number(a[4]);

    var randSlave = Number(a[2]);
    var regs = data[randSlave];

    var _json = {};
    _json[randSlave] = regs;
    _json[randSlave][Number(a[3])] = Number(a[4]);

    if($socket) $socket.send(JSON.stringify(_json));

    return [200,data];
  })
  .onAny().reply((cfg)=>{
    console.log('onAny',cfg);
    return [200,'Badaboom'];
  })

  $mockServer = new Server("ws://"+localStorage.getItem('url'));

  window.WebSocket = WebSocket; // Here we stub out the window object
    
  $mockServer.on('connection', socket => {
      $socket = socket
      console.log("started mock socket demo",socket);
      socket.on('close',() => {
        console.log("stopping mock socket demo");
        $socket = null;
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