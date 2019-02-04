import axios from 'axios'

if (localStorage.getItem("url") === null) {
  localStorage.setItem('url',location.host);
}

export const $http = axios.create({
  baseURL: location.protocol + '//' + localStorage.getItem('url')
})