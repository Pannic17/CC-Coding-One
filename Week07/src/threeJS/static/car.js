import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export class Car {
    scene;
    model;
    loaded = false;
    constructor (path, scene, position, callback) {
        let model;
        let _this = this;
        this.scene = scene;
        const loader = new GLTFLoader();
        loader.load(
            path,
            function (gltf) {
                model = gltf.scene;
                model.position.set(position[0], position[1], position[2])
                model.scale.set(0.8, 0.8, 0.8)
                model.rotation.y = (90 + 180) * Math.PI / 180;
                model.castShadow = true;
                model.receiveShadow = true;
                // console.log(model);
                scene.add(model);
                _this.model = model;
                _this.loaded = true;
                callback();
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100));
            },
            function (error) {
                console.log('ERROR\n'+error.toString());
            }
        )
    }

    removeCar() {
        if (this.loaded) {
            this.scene.remove(this.model);
            this.model.dispose();
        }
    }

    traverse() {
        console.log(this.model)
        this.model.traverse(function (child) {
            if (child.isMesh) {
                if (child.name.includes("Glass") || child.name.includes("Optics")) {
                    child.material.metalnessMap = null;
                    child.material.metalness = 1;
                    child.material.reflectivity = 1
                    // console.log(child)
                } else if (child.name.includes("Body")) {
                    child.material.metalness = 1;
                    child.material.aoMap = child.material.metalnessMap;
                    child.aoMapIntensity = 1;
                    // console.log(child)
                } else {
                    let map = child.material.map
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new THREE.MeshToonMaterial({
                        map: map,
                        transparent: true,
                        // reflectivity: 1
                    })
                }
            }
        });
    }

    getMesh() {
        let meshes = [];
        this.model.traverse(function (child) {
            if (child.isMesh) {
                meshes.push(child)
            }
        })
        return meshes
    }

    rotateWheel(speed) {
        let parts = this.model.children[0].children;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].name.includes("Wheel")) {
                parts[i].rotation.y += speed
            }
        }
        console.log(parts)
    }
}