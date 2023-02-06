import * as THREE from "three";

export default class Module{
  #moduleName;
  moduleScene;
  constructor(name){
    this.#moduleName = name
    this.moduleScene = new THREE.Group()
    this.moduleScene.name = name
  }
  initEvent(){

  }
  getName(){
    return this.#moduleName
  }
  getScene(){
    return this.moduleScene
  }
  renderThings(){

  }
  destory(){
    this.moduleScene.traverse((child)=>{
      child.material && child.material.dispose()
      child.geometry && child.geometry.dispose()
      child.texture && child.texture.dispose()
      child.dispose && child.dispose()
    })
  }
}