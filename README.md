# UYIX Dashboard
Home Automation Dashboard Demo ( HMI ) v2

## Build Setup and Run
npm run dev
npm run build

#!/bin/sh
cd /home/pi/Work/uyix
sudo npm run start  > /home/pi/Work/uyix/log 2>&1
homebridge 2>&1

## Releases

2019.01.01
- [x] refactor project structure
- [x] external configurable interface ( meta.json )
- [x] demo simulator as mockSocket and mockAxios

## TODO
2019.01.01
- [ ] task: meta.json fallback to static/meta.json
- [ ] task: configurable meta on interface
- [ ] task: create vuex store
- [ ] task: start connect by default
- [ ] task: meter filters split value
- [ ] task: settings panel ui refactor
- [ ] task: icons for leak and valve
- [ ] task: light buttons
- [ ] task: meters ticks animate
- [ ] task: intercom call animate
- [ ] task: call history
- [ ] task: real weather load
- [ ] task: down,up, ui feedback
- [ ] task: ngprogress add
- [ ] task: screen modes ( ipad screen compatibility )
- [ ] task: list view polish ( title, value types, filters )
- [ ] git: docs script pack for githubpages

2019.01.01
- [x] others.turn-off: master off добавить
- [x] hallway.reed добавить
- [x] light1, light2 support добавить
- [ ] door
- [ ] door warning open
- [ ] master off count down + sound
- [ ] master on, off sound
- [ ] reed sound
- [ ] ir suport ?

## IMPROVEMENT 
- [ ] new dashbaord screen, 3d view
- [ ] loading screen
- [ ] fake dahua simulator screen
- [ ] task: localStorage as Store plugin

# GIT Cheat Sheet
git config --global alias.acp '!f() { git add -A && git commit -m "$@" && git push; }; f'