const audioFolder = 'static/audio/'

export default {
  scan : new Audio(audioFolder+"scan.mp3"),
  ready : new Audio(audioFolder+"ready.mp3"),
  toggle : new Audio(audioFolder+"clear.mp3"),
  update: new Audio(audioFolder+"update.mp3"),
  play : function (snd){
      this[snd].currentTime = 0
      this[snd].play();
  }
}