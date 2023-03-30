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
    this.initRainbowShader();
    this.initShaderBGGradient();
    this.initRainbowShaderBall();
    this.initRainbowShader2();
    this.poolHitShaders = [];
    this.poolParticlesShaders = [];
    this.maxPoolLength = 10;
  }
  getRainbowShaderForHit(texture) {
    if (this.poolHitShaders.length >= this.maxPoolLength) {
      this.poolHitShaders.push(this.poolHitShaders.shift());
      return this.poolHitShaders[0];
    }
    const rainbowMaterial = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1 },
          tex: { type: 't', value: texture }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSize;
          uniform sampler2D tex;
          // adapted from https://github.com/wsmind/js-pride/blob/master/shaders/rainbow.glsl

          #define SMOOTH 1
          varying vec2 vUv;



          vec3 saturate (vec3 x)
          {
              return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
          }

          vec3 spectral_bruton (float y)
          {
            vec3 c;

            if (y >= 0. && y < 0.16)
              c = vec3
              (
                -(y * 340. + 400. - 440.) / (440. - 380.),
                0.0,
                1.0
              );
            else if (y >= 0.16 && y < 0.32)
              c = vec3
              (
                0.0,
                (y * 340. + 400. - 440.) / (490. - 440.),
                1.0
              );
            else if (y >= 0.32 && y < 0.48)
              c = vec3
              ( 0.0,
                1.0,
                -(y * 340. + 400. - 510.) / (510. - 490.)
              );
            else if (y >= 0.48 && y < 0.64)
              c = vec3
              (
                (y * 340. + 400. - 510.) / (580. - 510.),
                1.0,
                0.0
              );
            else if (y >= 0.64 && y < 0.8)
              c = vec3
              (
                1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                0.0
              );
            else if (y >= 0.8 && y <= 1.0)
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );
            else
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );

            return saturate(c);
          }

          vec3 smoothRainbow (float x)
          {
              float level1 = x;
              float level2 = x + 0.1;
              
              vec3 a = spectral_bruton(level1);
              vec3 b = spectral_bruton(level2);
              
              return mix(a, b, fract(x));
          }

          void main()
          {   
              float y = (vUv.y + uTime);
              if (y > 1.0) {
                  y -= 1.0;
              } else if (y < 0.0) {
                  y += 1.0;
              }
              y /= uSize;
              vec3 color = smoothRainbow(y);




              vec4 color2 = texture2D(tex, vUv);
              if (color2.a > 0.1) {
                gl_FragColor = vec4(color,1.0);
              } else {
                discard;
              }
              
          }

        `
    });

    const tw = Tween.get(rainbowMaterial.uniforms.uTime, { loop: true }).to({ value: 1 }, 1200)
      .on('change', () => { rainbowMaterial.needsUpdate = true; });
    tw.rawPosition = Math.random() * 1200;
    this.poolHitShaders.push(rainbowMaterial);
    return rainbowMaterial;
  }

  getRainbowShaderForParticles() {
    if (this.poolParticlesShaders.length >= this.maxPoolLength) {
      this.poolParticlesShaders.push(this.poolParticlesShaders.shift());
      return this.poolParticlesShaders[0];
    }
    const rainbowMaterialBall = new ShaderMaterial({
        uniforms: {
          uTime: { value: -1 },
          uSize: { value: 1 }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSize;
          // adapted from https://github.com/wsmind/js-pride/blob/master/shaders/rainbow.glsl

          #define SMOOTH 1
          varying vec2 vUv;



          vec3 saturate (vec3 x)
          {
              return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
          }

          vec3 spectral_bruton (float y)
          {
            vec3 c;

            if (y >= 0. && y < 0.16)
              c = vec3
              (
                -(y * 340. + 400. - 440.) / (440. - 380.),
                0.0,
                1.0
              );
            else if (y >= 0.16 && y < 0.32)
              c = vec3
              (
                0.0,
                (y * 340. + 400. - 440.) / (490. - 440.),
                1.0
              );
            else if (y >= 0.32 && y < 0.48)
              c = vec3
              ( 0.0,
                1.0,
                -(y * 340. + 400. - 510.) / (510. - 490.)
              );
            else if (y >= 0.48 && y < 0.64)
              c = vec3
              (
                (y * 340. + 400. - 510.) / (580. - 510.),
                1.0,
                0.0
              );
            else if (y >= 0.64 && y < 0.8)
              c = vec3
              (
                1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                0.0
              );
            else if (y >= 0.8 && y <= 1.0)
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );
            else
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );

            return saturate(c);
          }

          vec3 smoothRainbow (float x)
          {
              float level1 = x;
              float level2 = x + 0.1;
              
              vec3 a = spectral_bruton(level1);
              vec3 b = spectral_bruton(level2);
              
              return mix(a, b, fract(x));
          }

          void main()
          {   
              float y = (vUv.y + uTime) / 10.0;
              if (y > 1.0) {
                  y -= 1.0;
              } else if (y < 0.0) {
                  y += 1.0;
              }
              y /= uSize;
              vec3 color = smoothRainbow(y);

              gl_FragColor = vec4(color,1.0);
          }

        `
    });

    const tw = Tween.get(rainbowMaterialBall.uniforms.uTime, { loop: true }).to({ value: 9 }, 1200)
    .to({ value: -1 }, 1200);
      tw.on('change', () => { rainbowMaterialBall.needsUpdate = true; });
    tw.rawPosition = Math.random() * tw.duration;
    this.poolParticlesShaders.push(rainbowMaterialBall);
    return rainbowMaterialBall;
  }
  initRainbowShaderBall() {
    this.rainbowMaterialBall = new ShaderMaterial({
        uniforms: {
          uTime: { value: -1 },
          uSize: { value: 1 }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSize;
          // adapted from https://github.com/wsmind/js-pride/blob/master/shaders/rainbow.glsl

          #define SMOOTH 1
          varying vec2 vUv;



          vec3 saturate (vec3 x)
          {
              return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
          }

          vec3 spectral_bruton (float y)
          {
            vec3 c;

            if (y >= 0. && y < 0.16)
              c = vec3
              (
                -(y * 340. + 400. - 440.) / (440. - 380.) + 0.8,
                0.5,
                1.0
              );
            else if (y >= 0.16 && y < 0.32)
              c = vec3
              (
                0.0 + 0.4,
                (y * 340. + 400. - 440.) / (490. - 440.) + 0.4,
                1.0
              );
            else if (y >= 0.32 && y < 0.48)
              c = vec3
              ( 0.0,
                1.0,
                -(y * 340. + 400. - 510.) / (510. - 490.)
              );
            else if (y >= 0.48 && y < 0.64)
              c = vec3
              (
                (y * 340. + 400. - 510.) / (580. - 510.),
                1.0,
                0.0
              );
            else if (y >= 0.64 && y < 0.8)
              c = vec3
              (
                1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.) + 0.4,
                0.0 + 0.4
              );
            else if (y >= 0.8 && y <= 1.0)
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.) + 0.4,
                1.0
              );
            else
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.) + 2.,
                1.0
              );

            return saturate(c);
          }

          vec3 smoothRainbow (float x)
          {
              float level1 = x;
              float level2 = x + 0.1;
              
              vec3 a = spectral_bruton(level1);
              vec3 b = spectral_bruton(level2);
              
              return mix(a, b, fract(x));
          }

          void main()
          {   
              float y = (vUv.y + uTime) / 10.0;
              if (y > 1.0) {
                  y -= 1.0;
              } else if (y < 0.0) {
                  y += 1.0;
              }
              y /= uSize;
              vec3 color = smoothRainbow(y);

              gl_FragColor = vec4(color,1.0);
          }

        `
    });

    Tween.get(this.rainbowMaterialBall.uniforms.uTime, { loop: true }).to({ value: 9 }, 6000)
    .to({ value: -1 }, 6000)
      .on('change', () => { this.rainbowMaterialBall.needsUpdate = true; });

    if (game.parameters.task.useTextureForBall.default) {
      this.rainbowMaterialBall = new MeshToonMaterial({ map: this.scene.textureLoader.load(game.loadImage('ballTexture').original) });
    }
  }

  initRainbowShader() {
    this.rainbowMaterial = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1 }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSize;
          // adapted from https://github.com/wsmind/js-pride/blob/master/shaders/rainbow.glsl

          #define SMOOTH 1
          varying vec2 vUv;



          vec3 saturate (vec3 x)
          {
              return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
          }

          vec3 spectral_bruton (float y)
          {
            vec3 c;

            if (y >= 0. && y < 0.16)
              c = vec3
              (
                -(y * 340. + 400. - 440.) / (440. - 380.),
                0.0,
                1.0
              );
            else if (y >= 0.16 && y < 0.32)
              c = vec3
              (
                0.0,
                (y * 340. + 400. - 440.) / (490. - 440.),
                1.0
              );
            else if (y >= 0.32 && y < 0.48)
              c = vec3
              ( 0.0,
                1.0,
                -(y * 340. + 400. - 510.) / (510. - 490.)
              );
            else if (y >= 0.48 && y < 0.64)
              c = vec3
              (
                (y * 340. + 400. - 510.) / (580. - 510.),
                1.0,
                0.0
              );
            else if (y >= 0.64 && y < 0.8)
              c = vec3
              (
                1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                0.0
              );
            else if (y >= 0.8 && y <= 1.0)
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );
            else
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );

            return saturate(c);
          }

          vec3 smoothRainbow (float x)
          {
              float level1 = x;
              float level2 = x + 0.1;
              
              vec3 a = spectral_bruton(level1);
              vec3 b = spectral_bruton(level2);
              
              return mix(a, b, fract(x));
          }

          void main()
          {   
              float y = (vUv.y + uTime);
              if (y > 1.0) {
                  y -= 1.0;
              } else if (y < 0.0) {
                  y += 1.0;
              }
              y /= uSize;
              vec3 color = smoothRainbow(y);

              gl_FragColor = vec4(color,1.0);
          }

        `
    });

    Tween.get(this.rainbowMaterial.uniforms.uTime, { loop: true }).to({ value: 1 }, 1200)
      .on('change', () => { this.rainbowMaterial.needsUpdate = true; });
  }

  initRainbowShader2() {
    this.rainbowMaterial2 = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1 }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
              vUv = uv;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uSize;
          // adapted from https://github.com/wsmind/js-pride/blob/master/shaders/rainbow.glsl

          #define SMOOTH 1
          varying vec2 vUv;



          vec3 saturate (vec3 x)
          {
              return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
          }

          vec3 spectral_bruton (float y)
          {
            vec3 c;

            if (y >= 0. && y < 0.16)
              c = vec3
              (
                -(y * 340. + 400. - 440.) / (440. - 380.),
                0.0,
                1.0
              );
            else if (y >= 0.16 && y < 0.32)
              c = vec3
              (
                0.0,
                (y * 340. + 400. - 440.) / (490. - 440.),
                1.0
              );
            else if (y >= 0.32 && y < 0.48)
              c = vec3
              ( 0.0,
                1.0,
                -(y * 340. + 400. - 510.) / (510. - 490.)
              );
            else if (y >= 0.48 && y < 0.64)
              c = vec3
              (
                (y * 340. + 400. - 510.) / (580. - 510.),
                1.0,
                0.0
              );
            else if (y >= 0.64 && y < 0.8)
              c = vec3
              (
                1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                0.0
              );
            else if (y >= 0.8 && y <= 1.0)
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );
            else
              c = vec3
              ( 1.0,
                -(y * 340. + 400. - 645.) / (645. - 580.),
                1.0
              );

            return saturate(c);
          }

          vec3 smoothRainbow (float x)
          {
              float level1 = x;
              float level2 = x + 0.1;
              
              vec3 a = spectral_bruton(level1);
              vec3 b = spectral_bruton(level2);
              
              return mix(a, b, fract(x));
          }

          void main()
          {   
              float y = (vUv.x + uTime);
              if (y > 1.0) {
                  y -= 1.0;
              } else if (y < 0.0) {
                  y += 1.0;
              }
              y /= uSize;
              vec3 color = smoothRainbow(y);

              gl_FragColor = vec4(color,1.0);
          }

        `
    });

    Tween.get(this.rainbowMaterial2.uniforms.uTime, { loop: true }).to({ value: 1 }, 1200)
      .on('change', () => { this.rainbowMaterial2.needsUpdate = true; });
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