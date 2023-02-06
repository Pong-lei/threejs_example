import Module from "./module";

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import * as Curves from 'three/examples/jsm/curves/CurveExtras.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let pipeSpline = new THREE.CatmullRomCurve3( [
  new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
  new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),
  new THREE.Vector3( 30, 0, 20 ), new THREE.Vector3( 20, 0, 30 ),
  new THREE.Vector3( 10, 0, 30 ), new THREE.Vector3( 0, 0, 30 ),
  new THREE.Vector3( - 10, 10, 30 ), new THREE.Vector3( - 10, 20, 30 ),
  new THREE.Vector3( 0, 30, 30 ), new THREE.Vector3( 10, 30, 30 ),
  new THREE.Vector3( 20, 30, 15 ), new THREE.Vector3( 10, 30, 10 ),
  new THREE.Vector3( 0, 30, 10 ), new THREE.Vector3( - 10, 20, 10 ),
  new THREE.Vector3( - 10, 10, 10 ), new THREE.Vector3( 0, 0, 10 ),
  new THREE.Vector3( 10, - 10, 10 ), new THREE.Vector3( 20, - 15, 10 ),
  new THREE.Vector3( 30, - 15, 10 ), new THREE.Vector3( 40, - 15, 10 ),
  new THREE.Vector3( 50, - 15, 10 ), new THREE.Vector3( 60, 0, 10 ),
  new THREE.Vector3( 70, 0, 0 ), new THREE.Vector3( 80, 0, 0 ),
  new THREE.Vector3( 90, 0, 0 ), new THREE.Vector3( 100, 0, 0 )
] );
let sampleClosedSpline = new THREE.CatmullRomCurve3( [
  new THREE.Vector3( 0, - 40, - 40 ),
  new THREE.Vector3( 0, 40, - 40 ),
  // new THREE.Vector3( 0, 40, - 40 ),
  new THREE.Vector3( 0, 40, 40 ),
  new THREE.Vector3( 0, - 40, 40 ),
  new THREE.Vector3( 0, - 40, - 40 ),
] );
export default class CameraRomaing extends Module{
  splines = {
    GrannyKnot: new Curves.GrannyKnot(),
    HeartCurve: new Curves.HeartCurve( 3.5 ),
    VivianiCurve: new Curves.VivianiCurve( 70 ),
    KnotCurve: new Curves.KnotCurve(),
    HelixCurve: new Curves.HelixCurve(),
    TrefoilKnot: new Curves.TrefoilKnot(),
    TorusKnot: new Curves.TorusKnot( 20 ),
    CinquefoilKnot: new Curves.CinquefoilKnot( 20 ),
    TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot( 14 ),
    FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
    DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
    DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
    DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
    DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
    PipeSpline: pipeSpline,
    SampleClosedSpline: sampleClosedSpline
  };
  params = {
    spline: 'GrannyKnot',
    scale: 4,
    extrusionSegments: 100,
    radiusSegments: 3,
    offset:15,
    looptime:15000,
    closed: true,
    animationView: false,
    lookAhead: false,
    cameraHelper: false,
  };
  constructor(name,dom){
    super(name,dom)
    this.clock = new THREE.Clock();
    this.parentDom = dom
    this.cameraRomaing = this.moduleScene
    // this.cameraRomaing.name = 'cameraRomaing'
    this.loadFalg = false
    this.mesh = undefined

    this.position = new THREE.Vector3()
    this.binormal = new THREE.Vector3()
    this.direction = new THREE.Vector3();
    this.normal  = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.lookAt = new THREE.Vector3();
  }
  initEvent(word){
    
    word.scene.background = new THREE.Color( 0xf0f0f0 )
    this.Appword = word

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0,0,1)
    this.cameraRomaing.add(light)

    this.camerabox = new THREE.Object3D();
    this.cameraRomaing.add(this.camerabox);
    // this.parentScene.add(this.cameraRomaing)
    word.scene.add(this.cameraRomaing)

    this.splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 1000 );
    this.camerabox.add( this.splineCamera );
    this.cameraHelper = new THREE.CameraHelper( this.splineCamera );
		this.cameraRomaing.add( this.cameraHelper );

    this.addTube()
    this.debugCamera()
    this.animate()
  }
  addGeometry( geometry ) {
    const material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );

		// const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1, wireframe: true, transparent: true } );
    // 3D shape

    this.mesh = new THREE.Mesh( geometry, material );
    // const wireframe = new THREE.Mesh( geometry, wireframeMaterial );
    // this.mesh.add( wireframe );

    this.camerabox.add( this.mesh );

  }
  setScale() {
    this.mesh.scale.set( this.params.scale, this.params.scale, this.params.scale );
  }
  addTube() {
    if ( this.mesh !== undefined ) {
      this.camerabox.remove( this.mesh );
      this.mesh.geometry.dispose();
    }
    // debugger
    const extrudePath = this.splines[this.params.spline];
    // 3D路径  组成这一管道的分段数 管道的半径 管道横截面的分段数目 管道的两端是否闭合
    // this.tubeGeometry = new THREE.TubeGeometry( extrudePath, this.params.extrusionSegments, 2, this.params.radiusSegments, this.params.closed );
    // this.addGeometry( this.tubeGeometry );
    // this.setScale();


    const points = extrudePath.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    this.mesh = new THREE.LineLoop( geometry, material );
    this.camerabox.add( this.mesh );
    this.setScale();
    this.frames = extrudePath.computeFrenetFrames(64,false)
    this.extrudePath = extrudePath
    console.log(this.frames);
  }
  animateCamera() {
    this.cameraHelper.visible = this.params.cameraHelper;
    this.cameraEye.visible = this.params.cameraHelper;
  }
  debugCamera(){
    this.cameraEye = new THREE.Mesh( new THREE.SphereGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
		this.camerabox.add( this.cameraEye );

    this.cameraHelper.visible = this.params.cameraHelper
    this.cameraEye.visible = this.params.cameraHelper

    this.stats = new Stats();
		this.parentDom.appendChild( this.stats.dom );

    // gui
    this.gui = new GUI( { width: 285 } );

    const folderGeometry = this.gui.addFolder( 'Geometry' );
    folderGeometry.add( this.params, 'spline', Object.keys( this.splines ) ).onChange( ()=>{
      this.addTube();
    } );
    folderGeometry.add( this.params, 'scale', 2, 10 ).step( 2 ).onChange( ()=>{
      this.setScale();
    } );
    folderGeometry.add( this.params, 'extrusionSegments', 50, 500 ).step( 50 ).onChange( ()=>{
      this.addTube();
    } );
    folderGeometry.add( this.params, 'radiusSegments', 2, 12 ).step( 1 ).onChange( ()=>{
      this.addTube();
    } );
    folderGeometry.add( this.params, 'closed' ).onChange( ()=>{
      this.addTube();
    } );
    folderGeometry.open();

    const folderCamera = this.gui.addFolder( 'Camera' );
    folderCamera.add( this.params, 'animationView' ).onChange( ()=>{
      this.animateCamera();
    } );
    folderCamera.add( this.params, 'lookAhead' ).onChange(()=>{
      this.animateCamera();
    } );
    folderCamera.add( this.params, 'cameraHelper' ).onChange( ()=>{
      this.animateCamera();
    } );
    folderCamera.add( this.params, 'offset',-30, 30).step( 1 ).onChange( ()=>{
      this.animateCamera();
    } );
    folderCamera.add( this.params, 'looptime',5000, 200000).step( 100 ).onChange( ()=>{
      this.animateCamera();
    } );
    folderCamera.open();
  }
  destory(){
    // this.stats.destory()
    this.gui.destroy()
    if ( this.mesh !== undefined ) {
      this.camerabox.remove( this.mesh );
      this.mesh.geometry.dispose();
    }
    this.cameraHelper.dispose()
    this.cameraRomaing.remove(this.camerabox)
    this.Appword.scene.remove(this.cameraRomaing)
    this.cancleAniamte()
    this.Appword = null
  }
  renderThings(){
    const time = Date.now();
    // 相机移动速度
    // const looptime = 20 * 10000;
    const t = ( time % this.params.looptime ) / this.params.looptime;

    this.extrudePath.getPointAt( t, this.position );
    // chengfa
    this.position.multiplyScalar( this.params.scale );

    const segments = this.frames.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor( pickt );
    const pickNext = ( pick + 1 ) % segments;

    // 法线
    this.binormal.subVectors( this.frames.binormals[ pickNext ], this.frames.binormals[ pick ] );
    this.binormal.multiplyScalar( pickt - pick ).add( this.frames.binormals[ pick ] );

    // 切线
    this.extrudePath.getTangentAt( t, this.direction );
    // const offset = 15;

    this.normal.copy( this.binormal ).cross( this.direction );

    this.position.add(this.normal.clone().multiplyScalar( this.params.offset ))

    this.splineCamera.position.copy( this.position );
		this.cameraEye.position.copy( this.position );


    // using arclength for stablization in look ahead
    // 使用弧长来稳定前视
    this.extrudePath.getPointAt( ( t + 30 / this.extrudePath.getLength() ) % 1, this.lookAt );
    this.lookAt.multiplyScalar( this.params.scale );

    if ( ! this.params.lookAhead ) this.lookAt.copy( this.position ).add( this.direction );
    this.splineCamera.matrix.lookAt( this.splineCamera.position, this.lookAt, this.normal );
    this.splineCamera.quaternion.setFromRotationMatrix( this.splineCamera.matrix );

    this.cameraHelper.update();

    this.Appword.renderer.render( this.Appword.scene, this.params.animationView === true ? this.splineCamera : this.Appword.camera );

    this.stats.update()
  }
  animate(){
    this.renderThings()
    this.stats.update();
    this.requestId =  requestAnimationFrame( this.animate.bind(this) );
  }
  cancleAniamte(){
    if(this.requestId){
      cancelAnimationFrame(this.requestId)
    }
  }
}