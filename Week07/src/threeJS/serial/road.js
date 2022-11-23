import * as THREE from "three";

export class Road {
    scene;
    fragments = [];
    loaded = false;
    current = 0;
    flag = true;
    far = 200;
    constructor (scene, far, width, length, size) {
        let _this = this;
        this.far = far;
        this.size = size;
        this.scene = scene;
        this.number = size/length;

        this.width = width;
        this.length = length;

        this.generate([0, -2, -10], width, length, 10);
        this.generate([0, -2, 0], width, length, size);
        console.log(this.fragments)
    }

    generate(position, width, length, size) {
        let loader = new THREE.TextureLoader();
        let mapTexture = loader.load("/CC6_road.png");
        let pbrTexture = loader.load("/CC6_map.png");
        let material = new THREE.MeshStandardMaterial({
            map: mapTexture,
            // aoMAp: pbrTexture,
            // aoMapIntensity: 1,
            metalnessMap: pbrTexture,
            metalness: 0.5,
            // roughnessMap: pbrTexture,
            roughness: 1
        })
        let z = position[2];
        console.log(size/length);
        for (let i = 0; i < this.number; i++) {
            let unit = new THREE.Mesh(
                new THREE.PlaneGeometry(width, length),
                material
            )
            unit.position.set(position[0], position[1], z);
            unit.rotation.x = - Math.PI / 2
            this.fragments.push(unit);
            this.scene.add(unit);
            z += length;
        }
    }

    remove(num) {
        let number = num ?? 1500;
        for (let i = 0; i < number; i++) {
            this.scene.remove(this.fragments[i]);
        }
        this.fragments.splice(0, number)
        // console.log(this.particles)
    }

    animate(speed) {
        this.fragments.forEach(p => {
            // p.rotation.z -= 0.001
            p.position.z -= speed
        })
        this.current -= speed;
        if (Math.abs(this.current) > 0 && this.flag){
            console.log("ADD");
            this.generate([0, -2, 200], this.width, this.length,this.size);
            this.flag = false;
        } else if (Math.abs(this.current) > this.far) {
            console.log("REMOVE");
            this.remove(this.number);
            this.current = 0;
            this.flag = true;
        }
    }
}