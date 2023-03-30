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
  MeshBasicMaterial,
  SphereGeometry,
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
import TrailRenderer from './system/trailRenderer';

class Ball extends Object3D {
  constructor(scene, tower) {
    super();
    this.tower = tower;
    this.gravity = game.parameters.extra.gravity.default;
    this.acceleration = 0;
    this.clock = new Clock();
    const mat = scene.shaderLib.rainbowMaterialBall
    const geometry = new SphereGeometry(0.67, 32, 16 );
    const sphere = new Mesh(geometry, mat);
    this.add(sphere);
    this.scene = scene;
    this.sphere = sphere;

    const glowG = new PlaneGeometry(2.2, 2.2);
    const glowMaterial = new MeshToonMaterial({ map: this.scene.textureLoader.load(game.loadImage('glow').original), transparent: true });
    this.glow = new Mesh(glowG, glowMaterial);
    this.add(this.glow);
    this.glow.scale.set(0.01, 0.01, 0.01);
    this.glow.position.y = 0.15;
    this.glow.position.z = 0.67;

    this.geoSmallPart = new SphereGeometry(0.1, 16, 8);
    this.smallPartMat = new MeshToonMaterial({ color: 0xf5443f, transparent: true, opacity: 0.6 });
    this.bigPartGeo = new CylinderGeometry(1, 1, 0.25, 15);

    this.smallPartsArr = [];
    this.bigPartsArr = [];

    Tween.get(sphere.rotation, { loop: true }).to({ x: Math.PI * 2 }, 6000);
    Tween.get(sphere.rotation, { loop: true }).to({ y: Math.PI * 2 }, 4000);

    this.initTrail();
    
  }
  initTrail() {
    this.trail = new TrailRenderer(this.scene.camera, false);
    this.trailMaterial = TrailRenderer.createBaseMaterial();

    this.trailMaterial.uniforms.headColor.value.set(1, 0.9, 0.2, 0.1);
    this.trailMaterial.uniforms.tailColor.value.set(1, 0.9, 0.2, 0);
    const circlePoints = [];
    let index = 0;
    for (let i = 0; i <= Math.PI * 2 + Math.PI / 8; i += Math.PI / 8) {
      const vector = new Vector3();
      vector.set(Math.cos(i) * 0.3, 0, Math.sin(i) * 0.3);
      circlePoints[index] = vector;
      index += 1;
    }
    this.trail.initialize(this.trailMaterial, 25, true, 1.24, circlePoints, this);
    this.trail.activate();
  }
  rage() {
    this.trailMaterial.uniforms.headColor.value.set(1, 0, 0, 0.1);
    this.trailMaterial.uniforms.tailColor.value.set(1, 0, 0, 0);
    Tween.removeTweens(this.glow.scale);
    Tween.get(this.glow.scale).to({ x: 1, y: 1, z: 1 }, 150, Tween.Ease.sineInOut).call(() => {
      Tween.get(this.glow.scale, { loop: true }).to({ x: 1.15, y: 1.15, z: 1.15 }, 30).to({ x: 1, y: 1, z: 1 }, 30);
    });
    Tween.get(this.glow.scale, { loop: true }).wait(15).call(() => {
      this.spawnSmallPart();
      if (Math.random > 0.5) this.spawnSmallPart();
    });
    Tween.get(this.glow.scale, { loop: true }).wait(50).call(() => {
      this.spawnBigPart();
    });
  }
  spawnBigPart() {
    let cld;
    if (this.bigPartsArr.length > 10) cld = this.bigPartsArr.shift();
    else cld = new Mesh(this.bigPartGeo, this.smallPartMat);
    this.scene.add(cld);
    cld.position.copy(this.position);
    cld.scale.set(0.01, 0.01, 0.01);
    Tween.get(cld.scale).to({ x: 1, y: 1, z: 1 }, 200);
    this.bigPartsArr.push(cld);
  }
  spawnSmallPart() {
    let sphr;
    if (this.smallPartsArr.length > 20) sphr = this.smallPartsArr.shift();
    else sphr = new Mesh(this.geoSmallPart, this.smallPartMat);
    const sc = 1 * Math.random() * 2;
    sphr.scale.set(sc, sc, sc);
    this.scene.add(sphr);
    sphr.position.copy(this.position);

    sphr.position.x += Math.random() * 1 - 0.5;
    sphr.position.y += -Math.random() * 0.67;
    sphr.position.z += Math.random() * 1 - 0.5;
    this.smallPartsArr.push(sphr);
  }
  offRage() {
    this.smallPartsArr.forEach((e) => this.scene.remove(e));
    this.bigPartsArr.forEach((e) => this.scene.remove(e))
    this.trailMaterial.uniforms.headColor.value.set(1, 0.9, 0.2, 0.1);
    this.trailMaterial.uniforms.tailColor.value.set(1, 0.9, 0.2, 0);
    Tween.removeTweens(this.glow.scale);
    Tween.get(this.glow.scale).to({ x: 0.01, y: 0.01, z: 0.01 }, 150, Tween.Ease.sineInOut);

  }
  update() {
    requestAnimationFrame(this.update.bind(this));
    if (this.finished) return;
    this.deltaTime = this.clock.getDelta();
    
    if (this.deltaTime > 0.1) this.deltaTime = 0.1;

    if (this.tower.acitvePlatform && this.tower.acitvePlatform.position.y < this.position.y - 0.5) {
      this.position.y -= this.deltaTime * this.acceleration;
      this.acceleration += this.deltaTime * this.gravity / 0.007;
      if (this.acceleration > 35) this.acceleration = 35;
    } else if (this.tower.sumAngle < Math.PI * 1.5 - Math.PI / 4.5 || this.tower.sumAngle > Math.PI * 1.5 + Math.PI / 4.5) {
      
      this.position.y = this.tower.acitvePlatform.position.y + 0.51;
      this.acceleration = -18;

      this.offRage();
      if (this.tower.currentplatformId == this.tower.platformArr.length - 1) {
        this.finishF();

        return;
      }
      game.game.play('jump');

      if (this.tower.brokenInArow >= 3) {
        this.tower.spawnHit(true);
        this.tower.fallDown(true);
      } else {
        this.tower.spawnHit();
      }
      this.tower.brokenInArow = 0;

    } else {
      if (this.tower.currentplatformId == this.tower.platformArr.length - 1) {
        this.finishF();
        return;
      }
      const snd = game.game.play('breakPlatform', 0.3);
      snd.rate(1 + this.tower.brokenInArow / 5);
      this.tower.fallDown();
    }
    this.trail.advance();

    if (this.scene.camera.position.y - this.position.y > 6) this.scene.camera.position.y = this.position.y + 6;

  }
  finishF() {
    this.acceleration = 0;
    this.finished = true;
    this.position.y = this.tower.acitvePlatform.position.y + 0.51;
    this.trail.deactivate();
    this.offRage();
    game.scene.finish();
  }

}

export default Ball;