// @ts-ignore
import * as THREE from 'three/';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export function initScene (){
    let canvas = document.getElementById('three-canvas');


    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({antialias: true});
    const camera = new THREE.PerspectiveCamera(45, 16 / 9, 1,);
    // @ts-ignore
    const control = new OrbitControls(camera, canvas);
    control.enableDamping = true;
    control.rotateSpeed = 0.1;
    renderer.setSize(window.innerWidth*.96, window.innerWidth*.54);
    // @ts-ignore
    var child = canvas.lastElementChild;
    while (child) {
        // @ts-ignore
        canvas.removeChild(child);
        // @ts-ignore
        child = canvas.lastElementChild;
    }
    // @ts-ignore
    canvas.appendChild( renderer.domElement );



    return { scene, camera, renderer, control }
}

export function randomFlashColor (){
    let initHex = '0x';
    const _Arr0 = ['9','a','b','c','d','e','f'];
    const _Arr1 = ['0','1','2'];
    const _Arr2 = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    let mode = Math.round(Math.random()*4);
    switch (mode){
        case 0:
            initHex += randomCombination(_Arr1,_Arr2);
            initHex += randomCombination(_Arr1,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            break;
        case 1:
            initHex += randomCombination(_Arr0,_Arr2);
            initHex += randomCombination(_Arr1,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            break;
        case 2:
            initHex += randomCombination(_Arr1,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            break;
        case 3:
            initHex += randomCombination(_Arr0,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            initHex += randomCombination(_Arr0,_Arr2);
            break;
    }
    //console.log(initHex);
    return initHex;
}

export function randomCombination(_First: Array<string>, _Second: Array<string>){
    const first = Math.round(Math.random()*(_First.length));
    const second = Math.round(Math.random()*(_Second.length));
    return _First[first] + _Second[second];
}