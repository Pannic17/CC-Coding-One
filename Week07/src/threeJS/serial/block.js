import * as THREE from "three";

export class Block {
    scene;
    buildings = [];
    loaded = false;
    current = 0;
    flag = true;
    far = 200;
    constructor (scene, far) {
        let _this = this;
        this.scene = scene;
        this.far = far;
        this.generate([5, -2, -10], 2, 10);
        this.generate([5, -2, 0], 2, 200);
        // console.log(this.buildings[0])
    }

    generate(position, length, size) {
        let loader = new THREE.TextureLoader();
        let texture = loader.load("/building_face.png");
        let material = new THREE.MeshStandardMaterial({
            map: texture,
            depthTest: true,
            depthWrite: true,
            metalness: 1,
            // reflectivity: 1,
        })
        let z = position[2];
        let x = [position[0], -position[0]]
        // console.log(size/length)
        for (let i = 0; i < size/length; i++) {
            for (let j = 0; j < 2; j++) {
                let width = (Math.random()*length+length)/2;
                let height = Math.random()*2+2;
                // let renderTarget = new THREE.WebGLCubeRenderTarget(128, {
                //         format: THREE.RGBFormat,
                //         generateMipmaps: true,
                //         minFilter: THREE.LinearMipmapLinearFilter,
                //         encoding: THREE.sRGBEncoding
                //     }
                // )
                // let material = new THREE.MeshBasicMaterial( {
                //     envMap: renderTarget.texture,
                //     combine: THREE.MultiplyOperation,
                //     reflectivity: 1
                // } );
                let cube = new THREE.Mesh(
                    new THREE.BoxGeometry(width, height, length), material)
                cube.position.set(x[j]+Math.random()*1.5-1, position[1]+height/2, z);
                // console.log(this.buildings)
                this.buildings.push(cube);
                this.scene.add(cube);
            }
            z += length;
        }
    }

    remove(num) {
        let number = num ?? 1500;
        for (let i = 0; i < number; i++) {
            this.scene.remove(this.buildings[i]);
        }
        this.buildings.splice(0, number)
        // console.log(this.particles)
    }

    animate(speed) {
        this.buildings.forEach(p => {
            // p.rotation.z -= 0.001
            p.position.z -= speed
        })
        this.current -= speed;
        if (Math.abs(this.current) > 0 && this.flag){
            console.log("ADD");
            this.generate([5, -2, 200], 2, 200);
            this.flag = false;
        } else if (Math.abs(this.current) > this.far) {
            console.log("REMOVE");
            this.remove(200);
            this.current = 0;
            this.flag = true;
        }
    }
}