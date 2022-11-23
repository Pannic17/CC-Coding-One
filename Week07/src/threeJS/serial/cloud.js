import * as THREE from "three";

export class Cloud {
    scene;
    geometry;
    material;
    particles = [];
    loaded = false;
    current = 0;
    flag = true;
    far = 200
    constructor (path, scene, far) {
        let _this = this;
        this.scene = scene;
        this.far = far
        const loader = new THREE.TextureLoader();
        loader.load(
            path,
            function (texture) {
                _this.loaded = true;
                _this.geometry = new THREE.PlaneGeometry(15, 15);
                _this.material = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false
                    // reflectivity: 1
                })
                _this.generate(-2, far*8, far+100)
        })
    }

    generate(z, number, size){
        for (let i = 0; i < number; i++) {
            let cloud = new THREE.Mesh(this.geometry, this.material);
            cloud.position.set(
                Math.random()*60-30,
                18+Math.random()*2,
                Math.random()*size-20+z
            )
            cloud.rotation.set(
                Math.random()*3+2,
                0,
                Math.random()*2*Math.PI
            )
            cloud.material.opacity = 0.8;
            this.particles.push(cloud);
            this.scene.add(cloud);
        }
        // console.log(this.scene);
    }

    remove(num) {
        let number = num ?? 1500;
        for (let i = 0; i < number; i++) {
            this.scene.remove(this.particles[i]);
        }
        this.particles.splice(0, number)
        // console.log(this.particles)
    }

    animate(speed) {
        this.particles.forEach(p => {
            p.rotation.z -= 0.001
            p.position.z -= speed
        })
        this.current -= speed;
        if (Math.abs(this.current) > 0 && this.flag){
            console.log("ADD");
            this.generate(this.far/2, this.far*8, this.far+20);
            this.flag = false;
        } else if (Math.abs(this.current) > this.far) {
            console.log("REMOVE");
            this.remove(this.far*6);
            this.current = 0;
            this.flag = true;
        }
    }
}