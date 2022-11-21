import * as THREE from "three";

export class Grid {
    grid
    scene;
    division = 20;
    limit = 100;
    constructor (scene) {
        this.grid = new THREE.GridHelper(800, this.division, "blue", "blue");
        this.grid.position.set(0, -2, -2)
        scene.add(this.grid);
        console.log(this.grid)
    }

}