import Module from "./module";
import * as THREE from "three";
import fragment from './shader/fragment_rader.glsl';
import vertex from './shader/vertex.glsl';
export default class Rader extends Module{
  constructor(name,dom){
    super(name,dom)
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.RaderGroup = this.moduleScene
    this.time = 0
  }
  initEvent(word){
    this.Appword = word
    word.scene.add(this.RaderGroup)
    this.testPlane()
  }
  raderMaterial(){
    const material = new THREE.ShaderMaterial({
      uniforms:{
        u_time:{type:'f',value:0},
        u_resolution:{value:new THREE.Vector4()}
      },
      vertexShader:vertex,
      fragmentShader:fragment,
      side: THREE.DoubleSide
    })
    

    this.imageAspect = 853/1280;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }
  
    material.uniforms.u_resolution.value.x = this.Appword.container.offsetWidth
    material.uniforms.u_resolution.value.y = this.Appword.container.offsetHeight
    material.uniforms.u_resolution.value.z = a1
    material.uniforms.u_resolution.value.w = a2
    this.material = material
    return material
  }
  testPlane(){
    const geometry = new THREE.BoxGeometry(2,2,2);
    // const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, this.raderMaterial() );
    this.RaderGroup.add( plane );
  }
  destory(){
    this.RaderGroup.traverse(item=>{
      if(item.isMesh){
        item.geometry.dispose()
        item.material.dispose()
        console.log(item);
      }
    })
    this.Appword.scene.remove(this.RaderGroup)
  }
  renderThings(){
    this.time += 0.005
    this.material.uniforms.u_time.value = this.time;
  }
}