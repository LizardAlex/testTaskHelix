import {
  DirectionalLight,
  TextureLoader,
  AmbientLight,
  Object3D,
  Color,
  Clock,
  Vector3,
  Group,
  Scene,
  BoxGeometry,
  MeshToonMaterial,
  PerspectiveCamera,
  ShaderMaterial,
  CylinderGeometry,
  Mesh,
  TorusGeometry,
  PlaneGeometry,
} from 'three';

import {
  Container,
  Sprite,
  BaseTexture,
  Texture,
} from 'pixi.js';

import game from './system/game';
import Tween from './system/tweenjs';


class ShadersLibrary {
  constructor(scene) {
    this.scene = scene;
    this.colorForBallHit = game.parameters.task.BallSplat.default;
    this.initRainbowShader();
    this.initShaderBGGradient();
    this.initRainbowShaderBall();
    this.poolHitShaders = [];
    this.poolParticlesShaders = [];
    this.maxPoolLength = 1;


   
  }
  getRainbowShaderForHit(texture) {
    if (this.poolHitShaders.length >= this.maxPoolLength) {
      this.poolHitShaders.push(this.poolHitShaders.shift());
      return this.poolHitShaders[0];
    }
    const rainbowMaterial = new MeshToonMaterial({ color: this.colorForBallHit, transparent: true, map: texture });
    return rainbowMaterial;
  }

  getRainbowShaderForParticles() {
    if (this.poolParticlesShaders.length >= this.maxPoolLength) {
      this.poolParticlesShaders.push(this.poolParticlesShaders.shift());
      return this.poolParticlesShaders[0];
    }
    const rainbowMaterialBall = new MeshToonMaterial({ color: this.colorForBallHit });
    return rainbowMaterialBall;
  }
  initRainbowShaderBall() {
    this.rainbowMaterialBall = new MeshToonMaterial({ color: this.colorForBallHit });
    if (game.parameters.task.useTextureForBall.default) {
      this.rainbowMaterialBall = new MeshToonMaterial({ map: this.scene.textureLoader.load(game.loadImage('ballTexture').original) });
    }

  }

  initRainbowShader() {
    this.rainbowMaterial = new MeshToonMaterial({ color: this.colorForBallHit });
  }


  initShaderBGGradient() {
    var myGradient = new Mesh(
    new PlaneGeometry(2,2,1,1),
    new ShaderMaterial({
      uniforms: {
        uColorA: { value: new Color(game.parameters.task.gradStart.default) },
        uColorB: { value: new Color(game.parameters.task.gradEnd.default) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          float depth = -1.; //or maybe 1. you can experiment
          gl_Position = vec4(position.xy, depth, 1.);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        void main(){
          gl_FragColor = vec4(
            mix( uColorA, uColorB, vec3((vUv.y + vUv.x) / 2.)),
            1.
          );
        }
      `
      })
    )
    myGradient.material.depthWrite = false
    myGradient.renderOrder = -99999
    this.shaderGradient = myGradient;
  }
  
}

export default ShadersLibrary;