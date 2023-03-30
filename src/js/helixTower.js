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
  CircleGeometry,
  RepeatWrapping,
} from 'three';

import {
  Container,
  Sprite,
  BaseTexture,
  Texture,
} from 'pixi.js';

import game from './system/game';
import Tween from './system/tweenjs';
import Shaders from './shaders';
import Ball from './ball';

class HelixTower extends Group {
  constructor(scene) {
    super();
    this.scene = scene;
    this.shaderLib = this.scene.shaderLib;
    this.platformsDestroyed = 0;
    this.hitTextures = [1, 2, 3, 4, 5].map((e) => this.scene.textureLoader.load(game.loadImage(`hit${e}`).original));
    this.initTower();
    this.initControl();
    this.hitsUsed = [];
    this.clock = new Clock();
    this.brokenInArow = 0;
    this.usedParticles = [];
  }
  initControl() {
    game.scene.interactive = true;
    game.scene.on('pointerup', (evt) => {
      this.startPoint = null;
    });
    game.scene.on('pointerdown', (evt) => {
      this.startPoint = evt.data.global.x;
      if (!this.started) {
        game.game.track('Start');
      }
    });
    game.scene.on('pointermove', (evt) => {
      if (this.startPoint) {
        this.rotation.y -= (this.startPoint - evt.data.global.x) / 150;
        this.startPoint = evt.data.global.x;
        this.checkSum();
      }
    });
  }
  initTower() {

    const geometry = new CylinderGeometry( 3, 3, 1000, 32 );
    let material = new MeshToonMaterial( { color: game.parameters.task.cylinderColor.default } );
    let material2 = new MeshToonMaterial( {color: this.scene.platColor } );
    if (game.parameters.task.useTextureForPole.default) {
      const texture = this.scene.textureLoader.load(game.loadImage('poleTexture').original);
      material = new MeshToonMaterial( {map: texture } );
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.offset.set( 0, 0 );
      texture.repeat.set( 1, 30 );
    }
    if (game.parameters.task.useTextureForPlatforms.default) {
      material2 = new MeshToonMaterial( {map: this.scene.textureLoader.load(game.loadImage('platformTexture').original) } );
    }
    const cylinder = new Mesh( geometry, material );
    this.add(cylinder);


    //const geometry2 = new TorusGeometry( 2, 1, 16, 16 );
    const exit = game.loadModel('platformFull');;
    exit.scale.set(0.065, 0.065, 0.065);
    exit.children[0].material = this.shaderLib.rainbowMaterial;
    this.add(exit);
   // exit.rotation.x = -Math.PI / 2;
    exit.position.y = -10;

    this.platformArr = [];
    for (let i = 0; i < game.parameters.task.platforms.default; i += 1) {
      const platform = game.loadModel('platform');
      platform.scale.set(0.065, 0.065, 0.065);
      if (this.platformArr.length === 0) platform.rotation.y = Math.PI + Math.PI / 8;
      else {
        platform.rotation.y = this.platformArr[i - 1].rotation.y + Math.random() * 1.5 - 0.75;
        if (game.parameters.extra.difficulty.default === 1) {
          platform.rotation.y = this.platformArr[i - 1].rotation.y + Math.random() * 1 - 0.5;
        } else if (game.parameters.extra.difficulty.default === 3) {
          console.log(3);
          platform.rotation.y = this.platformArr[i - 1].rotation.y + Math.random() * 2.5 - 1.25;
        } 
      }
      platform.children[0].material = material2;
      platform.children[1].material = material2;
      platform.position.y = 6.5 - i * game.parameters.task.spacing.default;
      this.add(platform);
      this.platformArr.push(platform);
    }
    this.platformArr.push(exit);
    exit.position.y = 6.5 - (this.platformArr.length - 1) * game.parameters.task.spacing.default;
    // Math.PI * 1.5 - Math.PI / 5
    this.currentplatformId = 0;
    this.acitvePlatform = this.platformArr[0];

    this.ball = new Ball(this.scene, this);
    this.scene.add(this.ball);
    this.ball.position.z = 4.5;
    this.ball.position.y = 10;
    this.ball.update();
    this.checkSum();
  }
  fallDown(glow) {
    this.destr(this.acitvePlatform, glow);
    if (glow) {
      const circle = new CircleGeometry(8, 32);
      const mat = new MeshToonMaterial({ color: 0xfff000, transparent: true, opacity: 0.5 });
      const expl = new Mesh(circle, mat);
      expl.scale.set(0.01, 0.01, 0.01);
      Tween.get(expl.scale).to({ x: 1, y: 1, z: 1 }, 600);
      Tween.get(mat).wait(300).to({ opacity: 0 }, 300);
      this.scene.add(expl);
      expl.rotation.x = -Math.PI / 2;
      expl.position.y = this.acitvePlatform.position.y;
    }
    this.currentplatformId += 1;
    this.brokenInArow += 1;
    if (this.brokenInArow === 3) this.ball.rage();
    this.acitvePlatform = this.platformArr[this.currentplatformId];
    this.checkSum();
    game.scene.plusProgress(this.brokenInArow, this.currentplatformId / (this.platformArr.length - 1));
  }
  destr(platform, glow) {
    this.platformsDestroyed += 1;
    if (Math.floor(0.25 * game.parameters.task.platforms.default) === this.platformsDestroyed) {
      game.game.track('Progress25');
    }
    if (Math.floor(0.5 * game.parameters.task.platforms.default) === this.platformsDestroyed) {
      game.game.track('Progress50');
    }
    if (Math.floor(0.75 * game.parameters.task.platforms.default) === this.platformsDestroyed) {
      game.game.track('Progress75');
    }
    Tween.get(platform.children[1].rotation).to({ x: -Math.PI / 2 * 1.5 + Math.PI / 4 * Math.random() - Math.PI / 8 }, 350)
    Tween.get(platform.children[1].position).to({ z: -155, y: -120 }, 600);
    Tween.get(platform.children[1].scale).to({ x: 55, y: 55, z: 55 }, 600);
    Tween.get(platform.children[0].rotation).to({ x: -Math.PI / 2 * 1.5 + Math.PI / 4 * Math.random() - Math.PI / 8 }, 350)
    Tween.get(platform.children[0].position).to({ z: 155, y: -120 }, 600);
    Tween.get(platform.children[0].scale).to({ x: 55, y: 55, z: 55 }, 600).call(() => {
      this.remove(platform);
    });
    if (glow) platform.children[1].material = this.shaderLib.rainbowMaterial;
    if (glow) platform.children[0].material = this.shaderLib.rainbowMaterial;
  }
  checkSum() {
    this.sumAngle = (((this.acitvePlatform.rotation.y + this.rotation.y) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }
  spawnHit(big) {
    let obj;
    if (!this.hitGeom) this.hitGeom = new PlaneGeometry(4, 4);
    if (this.hitsUsed.length > 10) {
      obj = this.hitsUsed.shift();
    } else {
      const mat = this.shaderLib.getRainbowShaderForHit(this.hitTextures[Math.floor(Math.random() * this.hitTextures.length)]);
      obj = new Mesh(this.hitGeom, mat);
    }
    obj.scale.set(1,1,1);
    obj.rotation.x = -Math.PI / 2;
    obj.rotation.z = Math.PI * 2 * Math.random();
    obj.position.z = this.ball.position.z;
    obj.position.y = this.acitvePlatform.position.y + 0.01;
    this.spawnParts(obj.position, big);
    if (!big) this.scene.add(obj);

    if (this.sumAngle > Math.PI * 1.5 || this.sumAngle < Math.PI / 2) {
      if (!big) this.acitvePlatform.children[0].attach(obj);
    } else {
      if (!big) this.acitvePlatform.children[1].attach(obj);
    }
    this.hitsUsed.push(obj);
  }
  spawnParts(place, big) {
    const hitGeom = new PlaneGeometry(0.15, 0.15);
    let am = 35;
    if (big) am = 70;
    for (let i = 0; i < am; i += 1) {
      //var 

      let part;
      if (this.usedParticles.length > 0) part = this.usedParticles.pop();
      else part = new Mesh(hitGeom, this.shaderLib.getRainbowShaderForParticles());
      this.scene.add(part);
      part.position.set(place.x, place.y, place.z);
      part.scale.set(1, 1, 1);
      part.accelX = 0.07 - Math.random() * 0.14;
      part.accelY = 0.06 + Math.random() * 0.05;
      part.accelZ = 0.07 - Math.random() * 0.14;
      part.rotation.z = Math.random() * Math.PI * 2;
      if (big) {
        const scale = 2 + Math.random() * 1;
        part.scale.set(scale, scale, scale);
        part.accelX *= 1.9;
        part.accelY *= 1.8;
        part.accelZ *= 1.9;
        part.accelY -= Math.random() * 0.05;
      }
      const tw = Tween.get(part.scale).to({ x: 0.001, y: 0.001, z: 0.001 }, 1000);
      tw.on('change', (evt) => {
        let deltaTime = this.constructor.deltaCalc(evt);
        part.position.y += part.accelY * deltaTime;
        part.accelY -= 0.004;
        part.position.x += part.accelX * deltaTime;
        part.position.z += part.accelZ * deltaTime;
      });
      tw.call(() => {
        this.usedParticles.push(part);
        this.scene.remove(part);
      });
    }
  }
  static deltaCalc(evt) {
    let delta;
    delta = evt.timeStamp - evt.target.lastTS;
    evt.target.lastTS = evt.timeStamp;
    delta /= 7;
    if (!delta) delta = 1;
    if (delta > 15) delta = 15;
    return delta;
  }
}

export default HelixTower;