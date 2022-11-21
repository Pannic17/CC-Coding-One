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

let scene, camera, renderer, gui;
let control, composer, clock;
let loaded = {
  coupe: false
};
let light, speed, unit, curr;
let coupe, grid;

speed = 0.2
unit = 400;
curr = 0;

function initThree (){
  let init = setupScene();
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

  coupe = new Car("/CC6_coupe.gltf", scene , function () {
    loaded.coupe = true;
  });
  light = new Lights(scene, gui);
  grid = new Grid(scene);

  animate()
}

function animate (){
  grid.grid.position.z = unit/2-curr;
  curr += 0.2;
  if (curr >= unit) {
    curr = 0;
  }
  console.log(grid.grid.position)
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
