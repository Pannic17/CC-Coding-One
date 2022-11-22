import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {SSRPass} from "three/examples/jsm/postprocessing/SSRPass";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";

export class PostHelper {
    composer;
    passSSR;
    constructor (scene, renderer, camera, width, height) {
        this.composer = new EffectComposer(renderer);
        this.passSSR = new SSRPass({
            renderer,
            scene,
            camera,
            width: width,
            height: height,
            // groundReflector: true
        })
        this.passSSR.infiniteThick = false
        this.passSSR.maxDistance = .1;
        this.composer.addPass(this.passSSR);
        this.composer.addPass(new ShaderPass(GammaCorrectionShader));
    }
}