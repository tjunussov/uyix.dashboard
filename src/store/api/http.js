import axios from 'axios'
// import ion from 'ion-sound'
/*************************************/

const baseURL = localStorage.getItem("apiUrl")||'http://192.168.1.10';

export const $http = axios.create({
  baseURL: baseURL
})

// ion.sound({
//     sounds: [
//         {
//             name: "search1"
//         },
//         {
//             name: "found",
//             volume: 0.2
//         },
//         {
//             name: "notfound",
//             // volume: 0.3,
//             // preload: false
//         }
//     ],
//     volume: 0.5,
//     path: "/static/audio/",
//     preload: true
// });


