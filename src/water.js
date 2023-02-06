import Module from "./module";
import * as THREE from "three";

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { size } from "lodash";

export default class Ocean extends Module{
  clock=''
  constructor(name,dom){
    super(name)
    this.parentScene = this.getScene()
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.gui = new GUI();
    this.OceanGroup = new THREE.Group()
    this.OceanGroup.name = 'OceanGroup'
  }
  initEvent(word){
    // debug params
    this.parameters = {
      elevation: 2,
      azimuth: 180
    };
    
    this.stats = new Stats()
    this.OceanGroup.add(new THREE.AmbientLight(0x404040))
    
    word.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // word.renderer.toneMappingExposure = Math.pow( 1.6, 4.0 );
    console.log(word);
    word.camera.position.set(2,8,8)
    word.camera.lookAt(0,0,0)
    // word.renderer.setClearColor(0xffffff,1) 
    
    const waterGeometry = new THREE.PlaneGeometry( 100, 100);
    this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( '/waternormals.jpg',( texture )=>{
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: this.parentScene.fog !== undefined
      }
    );
    this.water.rotation.x = - Math.PI / 2;
    this.OceanGroup.add( this.water );

    this.sun = new THREE.Vector3

    this.sky = new Sky();
    this.sky.scale.setScalar( 10000 );
    this.OceanGroup.add( this.sky );

    const skyUniforms = this.sky.material.uniforms;
    const skyParams = {
      turbidity:{value:10},
      rayleigh:{value:2},
      mieCoefficient:{value:0.005},
      mieDirectionalG:{value:0.8}
    }

    skyUniforms['turbidity'] = skyParams.turbidity
    skyUniforms['rayleigh'] = skyParams.rayleigh
    skyUniforms['mieCoefficient'] = skyParams.mieCoefficient
    skyUniforms['mieDirectionalG'] = skyParams.mieDirectionalG

    this.pmremGenerator = new THREE.PMREMGenerator( word.renderer );
    this.renderTarget = undefined
    // gui
    
    const floderSky = this.gui.addFolder('Sky')
    console.log(this.parameters);
    floderSky.add( this.parameters, 'elevation', 0, 90, 0.1 ).onChange( this.updateSun.bind(this) );
    floderSky.add( this.parameters, 'azimuth', - 180, 180, 0.1 ).onChange( this.updateSun.bind(this) );
    floderSky.add( skyUniforms.turbidity, 'value', 0.1, 10, 0.1 ).name( 'turbidity' );
    floderSky.add( skyUniforms.rayleigh, 'value', 0.1, 10, 0.1 ).name( 'rayleigh' );
    floderSky.add( skyUniforms.mieCoefficient, 'value', 0.1, 10, 0.1 ).name( 'mieCoefficient' );
    floderSky.add( skyUniforms.mieDirectionalG, 'value', 0.1, 10, 0.1 ).name( 'mieDirectionalG' );
    floderSky.open();

    const folderWater =this.gui.addFolder( 'Water' );
    const waterUniforms = this.water.material.uniforms;
    folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    
    folderWater.open();

    this.parentScene.add(this.OceanGroup)
    this.updateSun()
  }
  updateSun() {

    const phi = THREE.MathUtils.degToRad( 90 - this.parameters.elevation );
    const theta = THREE.MathUtils.degToRad( this.parameters.azimuth );

    this.sun.setFromSphericalCoords( 1, phi, theta );

    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );
    this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun ).normalize();

    if ( this.renderTarget !== undefined ) this.renderTarget.dispose();

    this.renderTarget = this.pmremGenerator.fromScene( this.sky );

    this.parentScene.environment = this.renderTarget.texture;

  }
  testCube(){
    let geometry = new THREE.BoxGeometry(10,10,10,30)
    let material = new THREE.MeshStandardMaterial({
      color:0x00ff00,
      wireframe:true
    })
    this.OceanGroup.add(new THREE.Mesh(geometry,material))
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
    this.OceanGroup.add( line );
  }
  testPlane(){
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    this.OceanGroup.add( plane );
  }
  getShapeMesh(path,len,numbeOfPoints){
    const points = []
    // 根据 numbeOfPoints 的值，决定去多少的点，数值越大越细腻
    const shape = new THREE.Shape()
    for(let i = 0;i < numbeOfPoints;i++){
      /*
        reSubdivide:1 numbeOfPoints = len       pointAt:0,1,2,3,4,5
        reSubdivide:2 numbeOfPoints = len / 2   pointAt:0,2,4,6,8,10   
        reSubdivide:3 numbeOfPoints = len / 3   pointAt:0,3,6,9,12,15   
      */
      let pointAt = len * i / numbeOfPoints
      let p = path.getPointAtLength(pointAt)

      let x = p.x
      let y = p.y
      if(i === 0 ){
        shape.moveTo(x,y)
      }
      shape.lineTo(x,y)

      // points.push(new THREE.Vector3(p.x - 1903/2,903/2 - p.y,0))
    }
    const geometry = new THREE.ShapeGeometry(shape)
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00,side:THREE.DoubleSide } );
    // const mesh = new THREE.Mesh( geometry, material ) ;
    // mesh.scale.set(0.1,0.1,0.1)
    // mesh.rotateX(Math.PI/2)
    // mesh.position.x = -50
    // mesh.position.y = 10
    // mesh.position.z = -10

    // this.parentScene.add( mesh );


    this.textureWater = new THREE.TextureLoader().load( '/waternormals.jpg',( texture )=>{
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } )
    let shapeWater = new Water(
      geometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: this.textureWater,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: this.parentScene.fog !== undefined
      }
    );
    this.textureWater.dispose()


    // console.log(shapeWater,this.textureWater);
    shapeWater.scale.set(0.1,0.1,0.1)
    shapeWater.rotateX(-Math.PI/2)
    shapeWater.position.x = -50
    // shapeWater.position.y = 10
    shapeWater.position.z = -50

    this.shapeWaterGorup = new THREE.Group()
    this.shapeWaterGorup.name = 'shapeWaterGorup'
    this.shapeWaterGorup.add(shapeWater)
    console.log(this.shapeWaterGorup);
    this.OceanGroup.add( this.shapeWaterGorup );
  }
  testShape(){
    const shapdParams={
      reSubdivide:1
    }
    const ShapeFloder =this.gui.addFolder( 'Shape' );
    ShapeFloder.add(shapdParams,'reSubdivide',1,10,1).onChange((value)=>{
      const len = this.svg.getTotalLength()
      const numbeOfPoints = Math.floor(this.svg.getTotalLength()/value)
      this.destory()
      this.getShapeMesh(this.svg,len,numbeOfPoints)
    })

    // folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    this.svg = document.querySelector('#path')
    console.log(this.svg);
    let len = this.svg.getTotalLength()
    let numbeOfPoints = Math.floor(len / shapdParams.reSubdivide)
    this.getShapeMesh(this.svg,len,numbeOfPoints)
  }
  destory(){
    //
    this.gui.destroy()
    console.log('water dispose');
    this.OceanGroup.traverse(item=>{
      if(item.isMesh){
        item.geometry.dispose()
        item.material.dispose()
        console.log(item);
      }
    })
    this.parentScene.remove(this.OceanGroup)
    // this.parentScene.traverse(item=>{

    // })
  }
  renderThings(){
    const delta = this.clock.getDelta()
    this.mixer && this.mixer.update(delta)
    this.stats && this.stats.update()
    this.object && this.composer.render()

    this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0 / 6;
    this.shapeWaterGorup.children[0].material.uniforms[ 'time' ].value += 1.0 / 60.0 / 6;
  }
}