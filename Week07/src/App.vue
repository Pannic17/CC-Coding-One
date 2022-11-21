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
import { Lights } from "./threeJS/lights";
import { setupScene } from "./threeJS/setup";
import {Cloud, initCloud} from "./threeJS/serial/cloud";

let scene, camera, renderer, gui;
let control, composer, clock;
let loaded = {
  coupe: false
};
let light, unit;
let coupe, grid, cloud;

let speedGrid, speedCloud;
let currentGrid, currentCloud;
let cloudMarker = true;


unit = 600;
speedGrid = 0.5;
speedCloud = 0.02;
currentGrid = 0;
currentCloud = 0;

function initThree () {
  let init = setupScene(unit);
  scene = init.scene;
  camera = init.camera;
  renderer = init.renderer;
  control = init.control;
  gui = new GUI();

  let _gui = {
    "Log": logCamera
  }
  gui.add(_gui, "Log")

  function logCamera() {
    console.log(camera);
  }

  camera.position.set(0, -0.15, -10)
  camera.rotation.set(0, 0, -Math.PI)
  camera.lookAt(scene.position)
  console.log(camera)

  clock = new THREE.Clock();
  light = new Lights(scene, gui);

  coupe = new Car("/CC6_coupe.gltf", scene , function () {
    loaded.coupe = true;
    animate()
  });
  grid = new Grid(scene, unit);
  cloud = new Cloud("/smoke_1.png", scene);

  let sphere = new THREE.Mesh( new THREE.IcosahedronGeometry( 5, 8 ), new THREE.MeshBasicMaterial() );
  sphere.position.set(0, -2, -2)
  // scene.add( sphere );

  console.log(scene)
  animate()
}

function animate () {
  // let delta = clock.getDelta();

  grid.grid.position.z = unit/2-currentGrid;
  cloud.particles.forEach(p => {
    p.rotation.z -= 0.001
    p.position.z -= speedCloud
  })
  currentGrid += speedGrid;
  currentCloud -= speedCloud
  if (currentGrid >= unit) {
    currentGrid = 0;
  }
  if (Math.abs(currentCloud) > 150 && cloudMarker){
    console.log("ADD");
    cloud.generate([0,-2,150]);
    cloudMarker = false;
  } else if (Math.abs(currentCloud) > 300) {
    cloud.remove();
    currentCloud = 0;
    cloudMarker = true;
  }

  renderer.render(scene,camera);
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
