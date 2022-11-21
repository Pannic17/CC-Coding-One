import * as THREE from "three";
import scene from "three/examples/jsm/offscreen/scene";

let cloudGeo, cloudMaterial, textureEffect;
let cloudParticles = [];

const initCloud = function (){
    const texture = new THREE.TextureLoader();
    texture.load("/smoke_2.png", function(texture){
        cloudGeo = new THREE.PlaneGeometry(1,1);
        cloudMaterial = new THREE.MeshLambertMaterial({
            map:texture,
            transparent: true,
            depthTest: false
        });



        for(let p=0; p<50; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
            let phi = Math.random() * 2 - 1
            let theta = Math.random() * 2 - 1
            cloud.position.set(
                Math.sin(theta) * Math.cos(phi),
                Math.sin(theta) * Math.sin(phi),
                -Math.cos(theta)
            );
            cloud.rotation.x = 0 // 1.16;
            cloud.rotation.y = 2*Math.PI // -0.12;
            cloud.rotation.z = Math.random()*2*Math.PI;
            cloud.material.opacity = 0.55;
            cloudParticles.push(cloud);
            scene.add(cloud);
        }
    });
}

function animate (){
    cloudParticles.forEach(p => {
      p.rotation.z -=0.002;
    });
}