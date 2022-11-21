import * as THREE from "three";

export class Cloud {
    scene;
    geometry;
    material;
    particles = [];
    loaded = false;
    constructor (path, scene) {
        let _this = this;
        this.scene = scene;
        const loader = new THREE.TextureLoader();
        loader.load(
            path,
            function (texture) {
                _this.loaded = true;
                _this.geometry = new THREE.PlaneGeometry(10, 10);
                _this.material = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: true,
                    depthTest: false
                })
                _this.generate([0,-2,-2], {
                    opacity: 0.8
                })
        })
    }

    generate(core, parameter){
        let number = parameter?.number ?? 1500;
        let opacity = parameter?.opacity ?? 0.8;
        for (let i = 0; i < number; i++) {
            let cloud = new THREE.Mesh(this.geometry, this.material);
            cloud.position.set(
                Math.random()*100-50,
                5,
                Math.random()*320-20+core[2]
            )
            cloud.rotation.set(
                Math.random()*3+2,
                0,
                Math.random()*2*Math.PI
            )
            cloud.material.opacity = opacity;
            this.particles.push(cloud);
            this.scene.add(cloud);
        }
        console.log(this.scene);
    }

    remove(num) {
        let number = num ?? 1500;
        for (let i = 0; i < number; i++) {
            this.scene.remove(this.particles[i]);
        }
        this.particles.splice(0, number)
        // console.log(this.particles)
    }
}