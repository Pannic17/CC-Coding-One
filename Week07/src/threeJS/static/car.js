import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class Car {
    model;
    scene;
    loaded = false;
    constructor (path, scene) {
        let model;
        let _this = this;
        this.scene = scene;
        const loader = new GLTFLoader();
        loader.load(
            path,
            function (gltf) {
                model = gltf.scene;
                model.position.y = -2
                model.rotation.y = (90 + 180) * Math.PI / 180;
                model.castShadow = true;
                model.receiveShadow = true;
                console.log(model);
                scene.add(model);
                _this.model = model;
                _this.loaded = true;
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
}