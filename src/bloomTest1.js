import Module from "./module";
import * as THREE from "three";

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default class Bloom extends Module{
  object={
    stats:'',
    composer:'',
    parentDom:'',
    renderScene:'',
    bloomPass:''
  }
  loadFalg=false
  mixer=''
  clock=''
  constructor(name,dom){
    super(name)
    this.parentScene = this.getScene()
    this.clock = new THREE.Clock();
    this.object.parentDom = dom
    this.bloomGroup = new THREE.Group()
    this.bloomGroup.name = 'bloomGroup'
    this.loadFalg = false
  }
  initEvent(word){
    // debug params
    const params = {
      exposure: 1.6,
      bloomStrength: 1.5,
      bloomThreshold: 0,
      bloomRadius: 0
    };
    this.object.stats = new Stats()
    this.bloomGroup.add(new THREE.AmbientLight(0x404040))
    
    word.renderer.toneMapping = THREE.ReinhardToneMapping
    word.renderer.toneMappingExposure = Math.pow( 1.6, 4.0 );
    
    this.object.parentDom.appendChild(this.object.stats.dom)    
    this.object.renderScene = new RenderPass(word.scene,word.camera)
    this.object.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    this.object.bloomPass.threshold = params.bloomThreshold;
    this.object.bloomPass.strength = params.bloomStrength;
    this.object.bloomPass.radius = params.bloomRadius

    this.object.composer = new EffectComposer( word.renderer );
    this.object.composer.addPass( this.object.renderScene );
		this.object.composer.addPass( this.object.bloomPass );


    // gui
    this.gui = new GUI();
    this.gui.add( params, 'exposure', 0.1, 2 ).onChange(value=>{
      word.renderer.toneMappingExposure = Math.pow( value, 4.0 );
    });

    this.gui.add( params, 'bloomThreshold', 0.0, 1).onChange(value=>{
   
      this.object.bloomPass.threshold = Number( value );
    });

    this.gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange(value=>{
      this.object.bloomPass.strength = Number( value );
    });

    this.gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange(value=>{
      this.object.bloomPass.radius = Number( value );
    });
  }
  testCube(){
    let geometry = new THREE.BoxGeometry(10,10,10,30)
    let material = new THREE.MeshStandardMaterial({
      color:0x00ff00,
      wireframe:true
    })
    this.bloomGroup.add(new THREE.Mesh(geometry,material))
  }
  testLine(){
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    
    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );
    
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    const line = new THREE.Line( geometry, material );
    this.bloomGroup.add( line );
  }
  testPlane(){
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    this.bloomGroup.add( plane );
  }
  destory(){
    this.mixer = undefined
    this.gui.destroy()
    console.log(this.object);
    this.object.bloomPass.dispose()
    this.object.renderScene.scene.traverse(item=>{
      if(item.isMesh){
        item.geometry.dispose()
        item.material.dispose()
        // console.log(item);
      }
    })
    this.object.composer.removePass(this.object.bloomPass)
    this.object.composer.removePass(this.object.renderScene)
    this.object = {}
    this.bloomGroup.traverse(item=>{
      if(item.isMesh){
        item.geometry.dispose()
        item.material.dispose()
        // console.log(item);
      }
    })
    this.parentScene.remove(this.bloomGroup)
    console.log(this.parentScene);
  }
  loadModel(path){
    this.loadFalg = false
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(path, (gltf) => {
      this.bloomGroup.add(gltf.scene);
      this.parentScene.add(this.bloomGroup)
      // settingLayer();
      gltf.scene.traverse(c => {
        if(c.name === 'PhysCamera001'){
          console.log(c);
        }
      })
      console.log(gltf);
      this.mixer = new THREE.AnimationMixer( gltf.scene );
      const clip = gltf.animations[ 0 ];
      this.mixer.clipAction( clip.optimize() ).play();

      this.loadFalg = true;
      dracoLoader.dispose()
    });
  }
  renderThings(){
    const delta = this.clock.getDelta()
    this.mixer && this.mixer.update(delta)
    this.object.stats && this.object.stats.update()
    this.object.composer && this.object.composer.render()
  }
}