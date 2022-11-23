<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'

import * as THREE from 'three';

import { onMounted } from "vue";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

// Custom Objects
import { Car } from "./threeJS/static/car";
import { Grid } from "./threeJS/serial/grid";
import { Road } from "./threeJS/serial/road";
import { Cloud } from "./threeJS/serial/cloud";
import { Block } from "./threeJS/serial/block";
import { Lights } from "./threeJS/lights";
import { setupScene } from "./threeJS/setup";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {SSRPass} from "three/examples/jsm/postprocessing/SSRPass";

let scene, camera, renderer, gui;
let control, composer, clock;
let loaded = {
  coupe: false
};
let light, ssrPass;
let grid, road, cloud, block;

let coupe1, coupe2, coupe3;

let far, unitCloud;
let speedGrid, speedSerial;
let currentGrid, currentCloud;

far = 200;
speedGrid = 0.5;
speedSerial = 0.05;
currentGrid = 0;

function initThree () {
  let init = setupScene(far);
  scene = init.scene;
  camera = init.camera;
  renderer = init.renderer;
  control = init.control;
  gui = new GUI();

  let _gui = {
    "Log": logCamera
  }
  gui.add(_gui, "Log");

  function logCamera() {
    console.log(camera);
  }

  camera.position.set(0, -0.2, -6)
  camera.rotation.set(0, 0, -Math.PI)
  // camera.position.set(0, -0.96, -5.6);
  // camera.rotation.set(0, .9*Math.PI, -Math.PI);
  camera.lookAt(scene.position)
  // console.log(camera)



  clock = new THREE.Clock();
  light = new Lights(scene, gui);

  coupe1 = new Car("/CC6_coupe.gltf", scene , [1, -2, -2], function () {
    loaded.coupe = true;
    coupe1.traverse();
  });
  coupe2 = new Car("/CC6_coupe.gltf", scene , [-1, -2, 0],function () {
    loaded.coupe = true;
    coupe2.traverse();
  });
  coupe3 = new Car("/CC6_coupe.gltf", scene , [1.2, -2, 2],function () {
    loaded.coupe = true;
    coupe3.traverse();
    Postprocessing();
    animate()
  });

  // grid = new Grid(scene, far);
  road = new Road(scene, far, 8, 8, 200);
  cloud = new Cloud("/smoke_1.png", scene, far);
  block = new Block(scene, far);

  // post = new Postprocessing(scene, renderer, camera, window.innerWidth*.96, window.innerWidth*.54)

  let sphere = new THREE.Mesh( new THREE.IcosahedronGeometry( 5, 8 ), new THREE.MeshBasicMaterial() );
  sphere.position.set(0, -2, -2)
  // scene.add( sphere );

  console.log(scene)
  animate()
}

const params = {
  enableSSR: true,
  autoRotate: true,
  otherMeshes: true,
  groundReflector: true,
};

function Postprocessing() {
  let selects = []
  selects = selects.concat(road.fragments)
  selects = selects.concat(block.buildings)
  selects = selects.concat(coupe1.getMesh())
  selects = selects.concat(coupe2.getMesh())
  selects = selects.concat(coupe3.getMesh())
  console.log(selects)
  composer = new EffectComposer( renderer );
  ssrPass = new SSRPass( {
    renderer,
    scene,
    camera,
    width: innerWidth,
    height: innerHeight,
    selects: selects
  } );

  composer.addPass( ssrPass );
  composer.addPass( new ShaderPass( GammaCorrectionShader ) );

  // GUI
  ssrPass.thickness = 0.018;
  ssrPass.infiniteThick = false;

  const folder = gui.addFolder( 'SSR Setting' );

  ssrPass.maxDistance = 0.2;

  folder.add( ssrPass, 'bouncing' );
  folder.add( ssrPass, 'output', {
    'Default': SSRPass.OUTPUT.Default,
    'SSR Only': SSRPass.OUTPUT.SSR,
    'Beauty': SSRPass.OUTPUT.Beauty,
    'Depth': SSRPass.OUTPUT.Depth,
    'Normal': SSRPass.OUTPUT.Normal,
    'Metalness': SSRPass.OUTPUT.Metalness,
  } ).onChange( function ( value ) {

    ssrPass.output = parseInt( value );

  } );
  ssrPass.opacity = 1;
  // folder.open()
  // gui.close()
}

function animate () {
  // let delta = clock.getDelta();

  // console.log("ANIMATE")
  // Serial Grid
  // grid.grid.position.z = far/2-currentGrid;
  currentGrid += speedGrid;
  if (currentGrid >= far) {
    currentGrid = 0;
  }

  // Serial Cloud
  road.animate(speedSerial);
  block.animate(speedSerial/4);
  cloud.animate(speedSerial);

  composer.render();

  // renderer.render(scene,camera);
  requestAnimationFrame(animate);
}

onMounted(() => {
  initThree();
  window.onresize = function (){
    location.reload()
  }
})

</script>

<template>
  <div id="three-canvas"></div>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
<!--  <HelloWorld msg="Vite + Vue" />-->
</template>

<style scoped>
#three-canvas{
  margin: 2vw;
  padding: 0;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
