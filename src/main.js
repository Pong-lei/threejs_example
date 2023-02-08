import Sketch from './app.js'
import Bloom from './bloomTest1.js';
import Ocean from './water.js';
import CameraRomaing from './camera_roaming'
import City from './city.js';
import Rader from './shader_rader.js';

import SwitchEffect from './switch_effect/index.js'


let word = new Sketch("container");
word.axesHelper()


let switchEffect = new SwitchEffect('switchEffect',word.getContainer())
setTimeout(()=>{
  let res = word.registerModule(switchEffect)
},1000)
if(!word.renderFlag) word.render()


let dom = document.querySelector('#btn')
dom.addEventListener('click',(e)=>{
  
  let name = e.target.dataset.name
  console.log(name);
  switch(name){
    case '1':
      // word.testPlane()
      // console.log(word)
      // if(!word.renderFlag) word.render()
      console.log(word.getMainRenderer().info);
      break
    case '2':
      word.destory();break;
    case '3':
      let water = new Ocean('water',word.getContainer())
      water.testPlane()
      water.testShape()
      setTimeout(()=>{
        let res = word.registerModule(water)
      },1000)
      if(!word.renderFlag) word.render()
      break
    case '4':
      word.unregisterModule('water')
      break
    case '5':
      let city = new City('City',word.getContainer())
      city.loadModel('/model/city_min.gltf')
      setTimeout(()=>{
        let res = word.registerModule(city)
      },1000)
      if(!word.renderFlag) word.render()
      break;
    case '6':
      word.unregisterModule('City')
      break
    case '7':
      let bloom = new Bloom('bloom1',word.getContainer())
      // bloom.testCube()
      // bloom.testLine()
      bloom.loadModel('/model/PrimaryIonDrive.glb')
      // bloom.loadModel('/model/chilun.gltf')
      setTimeout(()=>{
        let res = word.registerModule(bloom)
      },1000)
      if(!word.renderFlag) word.render()
      break
    case '8':
      word.unregisterModule('bloom1')
      break;
    case '9':
      let camera_roming = new CameraRomaing('camera_roming',word.getContainer())
      word.stop()
      setTimeout(()=>{
        let res = word.registerModule(camera_roming)
      },1000)
      if(!word.renderFlag) word.render()
      break
    case '10':
      word.unregisterModule('camera_roming')
      word.play()
      break 
    case '11':
      let rader = new Rader('rader',word.getContainer())
      setTimeout(()=>{
        let res = word.registerModule(rader)
      },1000)
      if(!word.renderFlag) word.render()
      break
    case '12':
      word.unregisterModule('rader')
      break 
    case '13':
      let switchEffect = new SwitchEffect('switchEffect',word.getContainer())
      setTimeout(()=>{
        let res = word.registerModule(switchEffect)
      },1000)
      if(!word.renderFlag) word.render()
      break
    case '14':
      word.unregisterModule('switchEffect')
      break   
  }
})





