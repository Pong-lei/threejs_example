import * as THREE from "three";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment2 from "./shader/fragment2.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture.js'

export default class Sketch {
  #scene;
  #renderer;
  #camera;
  #controls;
  #chiledModules;
  constructor(selector) {
    this.#scene = new THREE.Scene();

    // 渲染
    this.#renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(this.width, this.height);
    this.#renderer.setClearColor(0xffffff, 1);
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.shadowMap.type = THREE.BasicShadowMap;
    // this.#renderer.outputEncoding = THREE.sRGBEncoding;

    console.log(this.#renderer);
    this.container = document.getElementById("container");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.#renderer.domElement);

    // 相机与控制
    this.#camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      5,
      1000
    );
    this.#camera.position.set(0, 0, 2);
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.time = 0;
    this.paused = false;

    

    // 子模块的钩子
    this.#chiledModules = new Map()

    // 事件
    this.setupResize();
    this.resize();
    // this.render();
  }
  registerModule(module){
    let moduleName = module.getName()
    let registedModule =  this.#chiledModules.get(moduleName)
    if(registedModule){
      console.error(`${moduleName}模块已存在`)
      return
    }
    module.initEvent && module.initEvent({
      renderer:this.#renderer,
      scene:this.#scene,
      camera:this.#camera,
      controls:this.#controls,
      container:this.container
    })
    this.#chiledModules.set(moduleName,module)
    this.#scene.add(module.getScene())
  }
  unregisterModule(module){
    let moduleName = module instanceof Object?moduleName.getName():module
    let unRegistedModule =  this.#chiledModules.get(moduleName)
    if(unRegistedModule){
      unRegistedModule.destory && unRegistedModule.destory()
      this.#chiledModules.delete(moduleName)
    }
  }
  changeCamera(fn){
    fn && fn(this)
  }
  getChildrenModule(name){
    return this.#chiledModules.get(name)
  }
  getMainScene(){
    return this.#scene
  }
  getMainRenderer(){
    return this.#renderer
  }
  getMainCamera(){
    return this.#camera
  }
  getMainControls(){
    return this.#controls
  }
  getContainer(){
    return this.container
  }
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }
  axesHelper(){
    const axesHelper = new THREE.AxesHelper( 10 );
    this.#scene.add( axesHelper );
  }
  testGroup(){
    this.#scene.add(new THREE.AmbientLight(0xffffff))
    this.#scene.add(
      new THREE.Group().add(
        new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({color:0xff0000})
      ))
    )
  }
  testCube(){
    let cube = new THREE.BoxGeometry(1,1,1)
    let material = new THREE.MeshBasicMaterial({color:0xff0000})
    let mesh = new THREE.Mesh(cube,material)
    this.#scene.add(mesh)

    const light = new THREE.PointLight( 0x0088ff , 2, 100 );
    this.#scene.add(light)
  }
  testPlane(){
    this.#renderer.setClearColor(0xffffff,1)
    const intensity = 10;
    const light = new THREE.PointLight( 0x0088ff , intensity, 100 );
    light.castShadow = true;
    light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
    light.position.y = 3
    this.#scene.add( light );
    
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
    this.#scene.add( pointLightHelper );



    const normalMap3 = new THREE.CanvasTexture( new FlakesTexture() );
    normalMap3.wrapS = THREE.RepeatWrapping;
    normalMap3.wrapT = THREE.RepeatWrapping;
    normalMap3.repeat.x = 10;
    normalMap3.repeat.y = 6;
    normalMap3.anisotropy = 16;

    const geometry = new THREE.PlaneGeometry( 10, 10 );
    const material = new THREE.MeshPhysicalMaterial( {
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0.9,
      roughness: 0.5,
      color: 0x000000,
      side: THREE.DoubleSide,
      normalMap: normalMap3,
			normalScale: new THREE.Vector2( 0.15, 0.15 )
    } );

    normalMap3.dispose()

    const plane = new THREE.Mesh( geometry, material );
    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.rotateX(Math.PI/2)
    plane.position.y = -1.1
    this.#scene.add( plane );
  }
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.#renderer.setSize(this.width, this.height);
    this.#camera.aspect = this.width / this.height;
    

    // image cover
    // this.imageAspect = 853/1280;
    // let a1; let a2;
    // if(this.height/this.width>this.imageAspect) {
    //   a1 = (this.width/this.height) * this.imageAspect ;
    //   a2 = 1;
    // } else{
    //   a1 = 1;
    //   a2 = (this.height/this.width) / this.imageAspect;
    // }

    // this.material.uniforms.resolution.value.x = this.width;
    // this.material.uniforms.resolution.value.y = this.height;
    // this.material.uniforms.resolution.value.z = a1;
    // this.material.uniforms.resolution.value.w = a2;

    this.#camera.updateProjectionMatrix();
  }
  stop() {
    this.paused = true;
  }
  play() {
    this.paused = false;
    this.render();
  }
  destory(){
    for(const [key,modules] of this.#chiledModules){
      modules.destory && modules.destory()
      this.#chiledModules.delete(modules.getName())
    }
    this.#scene.traverse((child)=>{
      if(child.isMesh){
        child.material.dispose()
        child.geometry.dispose()
        console.log(child);
      }
      child.texture && child.texture.dispose()
      child.dispose && child.dispose()
    })

    this.#renderer.info.programs.map(item=>{
      // console.log();
      item.destroy()
    })
    // this.#renderer.forceContextLoss()
    // this.#renderer.dispose()
    // this.#scene.clear()
    // this.#renderer.domElement = null
    // this.container.innerHTML = ''
    console.log(this.#renderer.info)
  }
  render() {
    
      // console.log(2);
      if (this.paused) return;
      this.time += 0.05;
      this.renderFlag = true
      // this.#renderer.render(this.#scene, this.#camera);
      this.#controls.update()
      // 注册的子模块钩子
      for(const [key,modules] of this.#chiledModules){
        modules.renderThings && modules.renderThings()
        
      }
      this.#renderer.render(this.#scene, this.#camera);
      requestAnimationFrame(this.render.bind(this));

  }
  
}