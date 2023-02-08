import Module from "../module";
import * as THREE from "three";

import fragment from '../shader/fragment_switch.glsl'
import vertex from '../shader/vertex_switch.glsl'
import { GUI } from "dat.gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import extendMaterial from './extend.js'

import textureTest from '../img/texture.jpg'
console.log(textureTest);
extendMaterial(THREE)
// THREE.haha = 123

export default class SwitchEffect extends Module{
  constructor(name,dom){
    super(name,dom)
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.SwitchEffectGroup = this.moduleScene
    this.modulePaths = []
    this.time = 0
  }
  debugUI(){
    this.settings ={
      progress:0,
    }
    this.gui = new GUI()
    this.gui.add(this.settings,'progress',0,1,0.01).onChange((val)=>{
      this.material2.uniforms.progress.value = val
      this.material.uniforms.progress.value = val
    });
  }
  initEvent(word){
    this.appWord = word
    this.appWord.scene.add(this.SwitchEffectGroup)

    word.renderer.shadowMap.enable = true
    word.renderer.shadowMap.type = THREE.PCFShadowMap

    word.camera.position.set(3,3,4)

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

    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 15;
    light.shadow.bias = 0.0001;

    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    this.SwitchEffectGroup.add(light)

  }
  testObject(){
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
    } );
    let floor = new THREE.Mesh(
      new THREE.PlaneGeometry(800,800,100,100),
      new THREE.MeshBasicMaterial({color:0xcccccc})
    )
    floor.rotation.x = -Math.PI * 0.5
    floor.position.y = - 1.8
    floor.castShadow = floor.receiveShadow = true
    this.SwitchEffectGroup.add(floor)

    
    
    this.material2 = new THREE.MeshStandardMaterial({
      color:0xff0000
    })

    this.material2 = THREE.extendMaterial( THREE.MeshStandardMaterial, {
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
          transformed = rotate(transformed,vec3(0.,1.,0.),locprog * aRandom * 1.5 * PI);
          
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

          gl_FragColor = vec4(vUv.xy,0.,1.);
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

    // this.material2.uniforms.diffuse.value = new THREE.Color(0xcccccc)
    this.material2.transparent = true



    this.loadModel('/model/building1/scene_min.gltf')



    
  }
  loadModel(path){
    this.loadFalg = false
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../draco/");
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(path, (gltf) => {
      console.log(this,333333333);
      // this.SwitchEffectGroup.add(gltf.scene);
      let meshsGroup = []
     
      console.log(gltf.scene);
      gltf.scene.traverse(item=>{
        if(item.isMesh){
          meshsGroup.push(item)
          // console.log(item);
        }
      })
      meshsGroup.forEach(item=>{
        item.castShadow = true

        this.geometry = new THREE.IcosahedronGeometry( 1, 16 ).toNonIndexed();
    
        this.geometry =  item.geometry.toNonIndexed()
        item.geometry = this.geometry.toNonIndexed()
    
        this.material2.uniforms.t1.value = item.material.map
        item.material = this.material2
    
        let len = this.geometry.attributes.position.count
    
        let randoms = new Float32Array(len)
        let centers = new Float32Array(len * 3)
        for (let i = 0; i < len; i+=3) {
          // 給每个顶点设置偏移量
          let r = Math.random()
          randoms[i] = r  
          randoms[i+1] = r  
          randoms[i+2] = r 
          
          // 获取三角形的中心点
          let x = this.geometry.attributes.position.array[i*3];
          let y = this.geometry.attributes.position.array[i*3 + 1];
          let z = this.geometry.attributes.position.array[i*3 + 2];
    
          let x1 = this.geometry.attributes.position.array[i*3 + 3];
          let y1 = this.geometry.attributes.position.array[i*3 + 4];
          let z1 = this.geometry.attributes.position.array[i*3 + 5];
    
          let x2 = this.geometry.attributes.position.array[i*3 + 6];
          let y2 = this.geometry.attributes.position.array[i*3 + 7];
          let z2 = this.geometry.attributes.position.array[i*3 + 8];
    
          let center = new THREE.Vector3(x,y,z).add(new THREE.Vector3(x1,y1,z1)).add(new THREE.Vector3(x2,y2,z2)).divideScalar(3)
          // 分别设置每个三角形的中新点
          //  i=0 0(x,y,z),3(x1,y1,z1),6(x2,y2,z2)
          //  i=3 9(x,y,z),12(x1,y1,z1),15(x2,y2,z2)
          centers.set([center.x,center.y,center.z],i*3)
          centers.set([center.x,center.y,center.z],(i+1)*3)
          centers.set([center.x,center.y,center.z],(i+2)*3)
        }
    
        this.geometry.setAttribute('aRandom',new THREE.BufferAttribute(randoms,1))
        this.geometry.setAttribute('aCenter',new THREE.BufferAttribute(centers,3))
        // this.geometry.setAttribute('texture',this.texture)
      
    
        // const sphere = new THREE.Mesh( this.geometry, this.material2 );
    
        // 设置影子也跟随动画
        // sphere.castShadow = sphere.receiveShadow = true
        // sphere.customDepthMaterial = THREE.extendMaterial(THREE.MeshDepthMaterial,{
        //   template:this.material2
        // })
        // sphere.customDepthMaterial.transparent = true
        // console.log();
        
        // this.SwitchEffectGroup.add( sphere );
        this.SwitchEffectGroup.add(item)
      })

   



      // this.SwitchEffectGroup.add(meshsGroup)
      // this.mixer = new THREE.AnimationMixer( gltf.scene );
      // const clip = gltf.animations[ 0 ];
      // this.mixer.clipAction( clip.optimize() ).play();

      this.loadFalg = true;
      dracoLoader.dispose()
    });
  }
  destory(){
    this.SwitchEffectGroup.traverse(item=>{
      if(item.isMesh){
        item.material.dispose()
        item.geometry.dispose()
      }
    })
    this.appWord.scene.remove(this.SwitchEffectGroup)
  }
  renderThings(){
    this.time += 0.004
    // console.log(this.time);
    if(this.loadFalg){
      this.material2.uniforms.iTime.value = this.time
      this.material.uniforms.iTime.value = this.time
    }
    
    // this.sphere2.rotation.y =  -Math.PI * 0.5 * this.time
  }
}