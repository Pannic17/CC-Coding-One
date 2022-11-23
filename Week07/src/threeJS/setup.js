import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function setupScene (unit) {
    let canvas = document.getElementById('three-canvas');


    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    const camera = new THREE.PerspectiveCamera(90, 16 / 9, 1, unit/2);
    camera.position.set(0, 1, 0)
    // console.log(camera)
    // @ts-ignore
    const control = new OrbitControls(camera, canvas);
    control.enableDamping = true;
    control.rotateSpeed = 0.2;
    renderer.setSize(window.innerWidth*.96, window.innerWidth*.54);
    // @ts-ignore
    let child = canvas.lastElementChild;
    while (child) {
        // @ts-ignore
        canvas.removeChild(child);
        // @ts-ignore
        child = canvas.lastElementChild;
    }
    // @ts-ignore
    canvas.appendChild( renderer.domElement );

    scene.fog = new THREE.Fog(0x0b5394, 5, 180);
    // renderer.setClearColor(scene.fog.color);

    return { scene, camera, renderer, control }
}