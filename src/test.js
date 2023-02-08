import Module from "../module";
import * as THREE from "three";

import fragment from '../shader/fragment2.glsl'
import vertex from '../shader/vertex.glsl'

export default class SwitchEffect extends Module{
  constructor(name,dom){
    super(name,dom)
    this.clock = new THREE.Clock();
    this.parentDom = dom
    // 
    this.moduleSceneGroup = this.moduleScene

  }
  initEvent(word){
    this.appWord = word
    this.appWord.scene.add(this.moduleSceneGroup)
    this.testObject()
  }
  testObject(){
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.ShaderMaterial( {
      side:THREE.DoubleSide,
      uniforms:{
        iTime:{value:0},
        iResolution:{value:new THREE.Vector4()}
      },
      wireframe:true,
      fragmentShader:fragment,
      vertexShader:vertex
    } );
    const plane = new THREE.Mesh( geometry, material );
    this.moduleSceneGroup.add( plane );
  }
  loadModel(){

  }
}