import Module from "../module";
import * as THREE from "three";

import fragment from '../shader/fragment_switch.glsl'
import vertex from '../shader/vertex_switch.glsl'
import { GUI } from "dat.gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import extendMaterial from './extend.js'

import textureTest from '../img/texture.jpg'

import gsap from "gsap";
import * as _ from 'lodash'

extendMaterial(THREE)
// THREE.haha = 123

export default class SwitchEffect extends Module{
  constructor(name,dom,option){
    super(name,dom)
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.SwitchEffectGroup = this.moduleScene
    this.modulePaths = []
    this.time = 0
    this.shadowRender = option.shadowRender
    this.modelsPath = ''
    this.meshsGroup = []
  }
  debugUI(){
    this.settings ={
      progress:1,
    }
    this.gui = new GUI()
    this.gui.add(this.settings,'progress',0,1,0.01).onChange((val)=>{
      // this.meshsGroup.forEach(item=>{
      //   this.beforeCompileShader(item)
      // })
      // this.debrisMaterial.uniforms.progress.value = val
      // this.material.uniforms.progress.value = val
    });
  }
  initEvent(word){
    this.appWord = word
    this.appWord.scene.add(this.SwitchEffectGroup)

    if(this.shadowRender){
      word.renderer.shadowMap.enable = true
      word.renderer.shadowMap.type = THREE.PCFShadowMap
    }
    

    word.camera.position.set(250,250,220)

    this.addLights()
    this.testObject()
    this.debugUI()
  }
  addLights(){
    const light1 = new THREE.AmbientLight(0xffffff,0.5)
    this.SwitchEffectGroup.add(light1)

    const light = new THREE.SpotLight( 0xffffff, 0.5, 0, Math.PI / 4, 0.8 );
    light.position.set( 0, 5, 5 );
    light.target.position.set( 0, 0, 0 );

    if(this.shadowRender){
      light.castShadow = true;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 15;
      light.shadow.bias = 0.0001;

      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
    }

    this.SwitchEffectGroup.add(light)

  }
  testObject(){
    this.debrisMaterial = THREE.extendMaterial( THREE.MeshStandardMaterial, {
      class: THREE.CustomMaterial,  // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required
      vertexHeader: `
        attribute float aRandom;
        uniform float iTime;
        uniform float progress;
        attribute vec3 aCenter;
        varying vec2 vUv;

        // #define PI 3.141592653589793;
        mat4 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          
          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
        }
      
        vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
        }
        `,
      vertex: {
        transformEnd: `
          vUv = uv;
          float prog = (position.x + 1.)/2.;
          float locprog = progress * clamp((progress - 0.8*prog)/0.2,0.,1.);

          locprog = progress;

          transformed = transformed - aCenter;
          transformed  += 3.*normal*aRandom*(locprog);
          transformed *= (1.0 - progress);
          // transformed *=locprog;
          transformed += aCenter;

          // transformed += process * aRandom * (0.5*sin(iTime)+0.5) * normal;
          transformed = rotate(transformed,vec3(0.,0.,-1.),locprog * aRandom * 1.5 * PI);
          
          // transformed  += normal*aRandom*(1.0-progress);

        `
      },
      fragmentHeader:`
        uniform float progress;
        varying vec2 vUv;
        uniform sampler2D t1;
      `,
      fragment:{
        colorEnd:`

          vec4 finallyT = texture2D(t1,vUv);
          // gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
          // gl_FragColor = vec4(vUv.xy,1.,1.);
          gl_FragColor = vec4(finallyT.xyz,1.);
          
          // gl_FragColor.a = progress;
        `
      },
      uniforms: {
        roughness: 0.75,
        iTime: {
          mixed: true,    // Uniform will be passed to a derivative material (MeshDepthMaterial below)
          linked: true,   // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
          value: 0
        },
        progress:{
          mixed:true,
          linked:true,
          value:0
        },
        t1:{
          mixed:true,
          linked:true,
          value:new THREE.TextureLoader().load(textureTest)
        }
      }
    } );
    // console.log(this.debrisMaterial.__proto__);
    if(this.shadowRender){
      // this.debrisMaterial.uniforms.diffuse.value = new THREE.Color(0xcccccc)
      this.debrisMaterial.transparent = true
    }

    this.material = new THREE.ShaderMaterial( {
      side:THREE.DoubleSide,
      uniforms:{
        iTime:{value:0},
        progress:{value:0},
        iResolution:{value:new THREE.Vector4()},
        texture1:{
          value:new THREE.TextureLoader().load(textureTest)
        }
      },
      // wireframe:true,
      fragmentShader:fragment,
      vertexShader:vertex,
      transparent:true
    });
   
    let floor = new THREE.Mesh(
      new THREE.BoxGeometry(800,800,100,100),
      new THREE.MeshBasicMaterial({color:0xcccccc})
      // this.material
    )
    // this.debrisMaterial.onBeforeCompile = (shader)=>{
    //   this.debrisMaterial .userData.shader = shader
    //     // shader.fragmentShader.replace(
    //     // '#include <alphamap_fragment>',
    //     // require('../shader/fragment_switch.glsl')
    //   // )
    // }
    floor.rotation.x = -Math.PI * 0.5
    floor.position.y = - 1.8
  
    if(this.shadowRender){
      floor.castShadow = floor.receiveShadow = true
    }
    
    // this.SwitchEffectGroup.add(floor)

    this.loadModel('/model/park.gltf')
  }
  beforeCompileShader(item){
    this.geometry =  item.geometry.toNonIndexed()
    item.geometry = this.geometry.toNonIndexed()


    let len = item.geometry.attributes.position.count

    let randoms = new Float32Array(len)
    let centers = new Float32Array(len * 3)
    for (let i = 0; i < len; i+=3) {
      // 給每个顶点设置偏移量
      let r = Math.random()
      randoms[i] = r  
      randoms[i+1] = r  
      randoms[i+2] = r 
      
      // 获取三角形的中心点
      let x = item.geometry.attributes.position.array[i*3];
      let y = item.geometry.attributes.position.array[i*3 + 1];
      let z = item.geometry.attributes.position.array[i*3 + 2];

      let x1 = item.geometry.attributes.position.array[i*3 + 3];
      let y1 = item.geometry.attributes.position.array[i*3 + 4];
      let z1 = item.geometry.attributes.position.array[i*3 + 5];

      let x2 = item.geometry.attributes.position.array[i*3 + 6];
      let y2 = item.geometry.attributes.position.array[i*3 + 7];
      let z2 = item.geometry.attributes.position.array[i*3 + 8];

      let center = new THREE.Vector3(x,y,z).add(new THREE.Vector3(x1,y1,z1)).add(new THREE.Vector3(x2,y2,z2)).divideScalar(3)
      // 分别设置每个三角形的中新点
      //  i=0 0(x,y,z),3(x1,y1,z1),6(x2,y2,z2)
      //  i=3 9(x,y,z),12(x1,y1,z1),15(x2,y2,z2)
      centers.set([center.x,center.y,center.z],i*3)
      centers.set([center.x,center.y,center.z],(i+1)*3)
      centers.set([center.x,center.y,center.z],(i+2)*3)
    }
    item.geometry.setAttribute('aRandom',new THREE.BufferAttribute(randoms,1))
    item.geometry.setAttribute('aCenter',new THREE.BufferAttribute(centers,3))

    // const sphere = new THREE.Mesh( this.geometry, item.material );

    // 设置影子也跟随动画
    // sphere.castShadow = sphere.receiveShadow = true
    // sphere.customDepthMaterial = THREE.extendMaterial(THREE.MeshDepthMaterial,{
    //   template:this.debrisMaterial
    // })
    // sphere.customDepthMaterial.transparent = true
    // console.log();
    
    // this.SwitchEffectGroup.add( sphere );

    if(this.shadowRender){
      item.customDepthMaterial = THREE.extendMaterial(THREE.MeshDepthMaterial,{
        template:this.debrisMaterial
      })
    }
    // this.SwitchEffectGroup.add(item)
    item.material.onBeforeCompile = (shader) =>{
      // console.log(this.settings);
      shader.uniforms.progress = {value:0}
      shader.uniforms.iTime = {value:0}
      
      shader.vertexShader = `
        attribute float aRandom;
        uniform float iTime;
        uniform float progress;
        attribute vec3 aCenter;
        mat4 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          
          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
        }
      
        vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
        }
        `+ shader.vertexShader

      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      `
        vec3 transformed = vec3( position );

        float prog = (position.x + 1.)/2.;
        float locprog = progress * clamp((progress - 0.8*prog)/0.2,0.,1.);

        locprog = progress;

        transformed = transformed - aCenter;
        transformed  += 3.*normal*aRandom*(locprog);
        transformed *= (1.0 - progress);
        // transformed *=locprog;
        transformed += aCenter;

        // transformed += process * aRandom * (0.5*sin(iTime)+0.5) * normal;
        transformed = rotate(transformed,vec3(0.,0.,-1.),locprog * aRandom * 1.5 * PI);
        
        // transformed  += normal*aRandom*(1.0-progress);

        // transformed *= progress;

      `)
      item.material.userData.shader = shader
    }
  }
  async dealModel(gltf){
    await this.playNormalToDebris()
      this.destoryModel()
      // 直接添加场景 场景中的模型位置统一的
      // console.log(gltf.scene);
      if(!gltf.scene.name){
        gltf.scene.name = 'unkonw'
      }
      this.currentSceneName = gltf.scene.name
      // console.log(this.currentSceneName);
      // 所有的mesh
      this.meshsGroup = []
      // console.log(gltf);
      gltf.scene.traverse(item=>{
        if(item.isMesh){
          this.meshsGroup.push(item)
          item.material.transparent = true
          item.material.opacity = 0
          // console.log();
        }
      })
      // console.log(_.cloneDeep(meshsGroup[0]));
      // 对mesh做处理
      this.meshsGroup.forEach(item=>{
        if(this.shadowRender){
          item.castShadow = true
        }
        // this.geometry = new THREE.IcosahedronGeometry( 1, 16 ).toNonIndexed();
        this.beforeCompileShader(item)
      })

      // this.SwitchEffectGroup.add(meshsGroup)
      // this.mixer = new THREE.AnimationMixer( gltf.scene );
      // const clip = gltf.animations[ 0 ];
      // this.mixer.clipAction( clip.optimize() ).play();

      this.loadFalg = true;
      
      this.geometry.dispose()
      this.SwitchEffectGroup.add(gltf.scene)
      await this.playDebrisToNormal()
  }
  nomarlDealModeFn(gltf){
    this.SwitchEffectGroup.add(gltf.scene);
  }
  loadModel(path,nomarlDealMode = false){

    console.log(this.modelsPath,path);
    if(this.modelsPath === path) return
    this.modelsPath = path

    this.loadFalg = false
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../draco/");
    gltfLoader.setDRACOLoader(dracoLoader);


    if(nomarlDealMode){
      gltfLoader.load(path, this.nomarlDealModeFn.bind(this));
    }else{
      gltfLoader.load(path, this.dealModel.bind(this));
    }
    dracoLoader.dispose()
  }
  playDebrisToNormal(){
    // debrisAble:1 有模型可以执行碎片化
    return new Promise((res,rej)=>{
      let sence = this.SwitchEffectGroup.getObjectByName(this.currentSceneName)
      console.log(sence);
      this.debrisAble = 1
      this.settings.progress = 1
      // console.log(2);
      // this.debrisMaterial.uniforms.progress.value = this.settings.progress
      gsap.to(this.settings,{
        progress:0,
        duration:2,
        onComplete:()=>{
          res(1)
        }
      })
    })
    
    
  }
  playNormalToDebris(){
    // debrisAble:0 无模型不可以执行碎片化
    return new Promise((res,rej)=>{
      console.log(this.debrisAble,'----------------------');
      if(this.debrisAble){
        this.settings.progress = 0
        this.debrisMaterial.uniforms.progress.value = this.settings.progress
        gsap.to(this.settings,{
          progress:1,
          duration:2,
          onComplete:()=>{
            res(1)
          }
        })
        this.debrisAble = 0
      }else{
        res(0)
      }
    })
  }
  destoryModel(){ 
    let obj = this.SwitchEffectGroup.getObjectByName(this.currentSceneName)
    if(!obj) return
    console.log(obj);
    obj.traverse(item=>{
      if(item.isMesh){
        item.material.dispose()
        item.geometry.dispose()
        console.log(item.name,'dispose');
      }
    })
    this.SwitchEffectGroup.remove(obj)
  }
  destory(){
    this.destoryModel()
    this.debrisMaterial.dispose()
    this.appWord.scene.remove(this.SwitchEffectGroup)
  }
  renderThings(){
    this.time += 0.004
    // console.log(this.time);
    if(this.loadFalg){
      this.debrisMaterial.uniforms.iTime.value = this.time
      
      // this.material.uniforms.iTime.value = this.time
    }
   
    if(this.meshsGroup.length){
      this.meshsGroup.forEach(item=>{
        // console.log(item);
        if(item.material.userData.shader){
          // console.log(22222);
          if(this.settings.progress >= 0.7 && item.material.opacity === 0){
            console.log(this.settings.progress);
            gsap.to(item.material,{
              opacity:1,
              duration:0.3,
            })
          }
          item.material.userData.shader.uniforms.progress.value = this.settings.progress
        }
      })
    }
    
    
    // this.sphere2.rotation.y =  -Math.PI * 0.5 * this.time
  }
}