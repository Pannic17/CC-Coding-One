import * as THREE from "three";

export class Grid {
    scene;
    grid
    division = 50;
    constructor (scene, unit) {
        this.grid = new THREE.GridHelper(unit*2, this.division, "blue", "blue");
        this.grid.position.set(0, -2, -2)
        scene.add(this.grid);
        console.log(this.grid)
    }
}