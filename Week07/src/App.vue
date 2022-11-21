<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'

import * as THREE from 'three';

import { onMounted } from "vue";
import { initScene } from "./threeJS/helper";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

// Custom Objects
import { Car } from "./threeJS/static/car";
import { Lights } from "./threeJS/lights";

let scene, camera, renderer, gui;
let control, composer, clock;

function initThree (){
  let init = initScene();
  scene = init.scene;
  camera = init.camera;
  renderer = init.renderer;
  control = init.control;
  gui = new GUI();

  camera.position.set(0, -0.2, -10)
  camera.rotation.set(0, 0, -Math.PI)
  console.log(camera)

  let coupe = new Car("/CC6_coupe.gltf", scene);
  let light = new Lights(scene, gui)

  console.log(scene)

  animate();
}

function animate (){
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
