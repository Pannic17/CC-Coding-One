<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'

import * as THREE from 'three';

import { onMounted } from "vue";
import { initScene} from "./threeJS/helper";

let scene, camera, renderer, control, geometry, material, points, clock;
const parameters = {}
parameters.count = 100000
parameters.size = .01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 1
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'


function initThree (){
  let init = initScene();
  scene = init.scene;
  camera = init.camera;
  renderer = init.renderer;
  control = init.control;

  camera.position.z = 3;
  camera.position.y = 3;

  initGalaxy();
  initMaterial();

  clock = new THREE.Clock();

  animate();
}

function initGalaxy (){
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = (i % parameters.branches) * (Math.PI * 2 / parameters.branches);

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

function initMaterial (){
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  })
  points = new THREE.Points(geometry, material)
  scene.add(points)
}

function animate (){
  const elapsedTime = clock.getElapsedTime();
  points.rotation.y = elapsedTime * .1;
  control.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
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
  <HelloWorld msg="Vite + Vue" />
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
