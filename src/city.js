import Module from "./module";
import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export default class City extends Module{
  constructor(name,dom){
    super(name)
    this.parentScene = this.getScene()
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.gui = new GUI();
    this.cityGroup = new THREE.Group()
    this.cityGroup.name = 'cityGroup'
    this.loadFalg = false
  }
  initEvent(word){
    word.renderer.setClearColor(0xffffff, 1);
  }
  loadModel(path){
    this.loadFalg = false
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(path, (gltf) => {
      this.cityGroup.add(gltf.scene);
      this.parentScene.add(this.cityGroup)
      // settingLayer();
      gltf.scene.traverse(c => {
        if(c.name === 'PhysCamera001'){
          console.log(c);
        }
      })
      // console.log(gltf);
      // this.mixer = new THREE.AnimationMixer( gltf.scene );
      // const clip = gltf.animations[ 0 ];
      // this.mixer.clipAction( clip.optimize() ).play();

      this.loadFalg = true;
      dracoLoader.dispose()
    });
  }
  destory(){
    this.gui.destory()
    this.cityGroup.traverse(child=>{
      if(child.isMesh){
        child.material.dispose()
        child.geometry.dispose()
      }
    })
    this.parentScene.remove(this.cityGroup)
  }
}