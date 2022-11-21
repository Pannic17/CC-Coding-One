import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class Car {
    scene;
    model;
    loaded = false;
    constructor (path, scene, callback) {
        let model;
        let _this = this;
        this.scene = scene;
        const loader = new GLTFLoader();
        loader.load(
            path,
            function (gltf) {
                model = gltf.scene;
                model.position.y = -2
                model.position.z = -2
                model.rotation.y = (90 + 180) * Math.PI / 180;
                model.castShadow = true;
                model.receiveShadow = true;
                console.log(model);
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

    traverse(operation) {
        this.model.traverse(operation);
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