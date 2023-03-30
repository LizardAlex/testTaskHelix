import {
  Application,
  BaseTexture,
  Texture,
  Sprite,
} from 'pixi.js';

import {
  Scene as Scene3d,
  WebGLRenderer,
  PerspectiveCamera,
  DirectionalLight,
  TextureLoader,
  AmbientLight,
  Object3D,
  Color,
  Clock,
  Mesh,
  Vector2,
  Vector3,
} from 'three';

import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import Scene from '../scene';
import Scene3D from '../scene3d';

import { Howler, Howl } from './howler';
import breakPlatform from '../../sounds/break.mp3';
import jump from '../../sounds/jump.mp3';

import breakPlatform2 from '../../sounds/break2.mp3';
import jump2 from '../../sounds/jump2.mp3';

import breakPlatform3 from '../../sounds/break3.mp3';
import jump3 from '../../sounds/jump3.mp3';

import firework from '../../sounds/firework.mp3';

window.addEventListener('resize', () => {
  if (typeof game !== 'undefined') {
    game.proceedRotation();
  }
});

window.addEventListener('blur', () => { Howler.mute(true); });
window.addEventListener('focus', () => { Howler.mute(false); });

class gameClass {
  constructor(canvas) {
  	this.canvas = canvas;
    this.app = new Application({
      view: canvas,
    });
    this.xhr = new XMLHttpRequest();
    this.tackedParams = {};
    this.proceedRotation();
    this.sounds = { breakPlatform, jump, firework };

    this.activeSound = [];
  }
  setSound(parameters) {
    if (parameters.task.soundsSet.default == 2) {
      this.sounds.breakPlatform = breakPlatform2;
      this.sounds.jump = jump2;
    }
    if (parameters.task.soundsSet.default == 3) {
      this.sounds.breakPlatform = breakPlatform3;
      this.sounds.jump = jump3;
    }
  }
  unmute(music) {
    this.activeSound.forEach((ele) => {
      if (music && ele.musicFX) ele.volume(ele.origVol);
      else if (!music && ele.soundFX) ele.volume(ele.origVol);
    })
  }
  mute(music) {
    this.activeSound.forEach((ele) => {
      if (music && ele.musicFX) ele.volume(0);
      else if (!music && ele.soundFX) ele.volume(0);
    })
  }
  track(name) {
    if (!this.tackedParams[name]) {
      this.tackedParams[name] = true;
      this.xhr.open("POST", `https://ruby-elated-pigeon.cyclic.app/name=HelixJump?event=${name}`);
      this.xhr.send();
    }
  }
  play(name, vol = 1, loop = false) {
    if (this.sounds[name]) {
      const sound = new Howl({
        autoplay: true,
        src: [this.sounds[name]],
        volume: vol,
        loop,
        format: 'mp3',
      });
      sound.origVol = vol;
      if (name.indexOf('music') !== -1) sound.musicFX = true;
      else sound.soundFX = true;
      sound.on('end', () => {
        const id = this.activeSound.indexOf(sound);
        if (id !== -1) this.activeSound.splice(id, 1);
      });
      this.activeSound.push(sound);

      return sound;
    }
  }
  proceedRotation() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ratio = width / height;
    if (this.ratio <= 1) {
      this.canvas.width = 720;
      this.canvas.height = 720 / this.ratio;
    } else {
      this.canvas.width = 720 * this.ratio;
      this.canvas.height = 720;
    }
    gameClass.width = width;
    gameClass.height = height;

    gameClass.tablet = Math.abs((Math.min(Math.max(this.canvas.width, this.canvas.height), 1280) - 960) / 320 - 1);
    gameClass.wide = (Math.max(Math.max(this.canvas.width, this.canvas.height), 1280) - 1280) / 278;

    this.app.renderer.resize(this.canvas.width, this.canvas.height);
    if (this.renderer) {
      this.renderer.setPixelRatio(2);
      this.renderer.setSize(this.canvas.width, this.canvas.height);
      this.reloadTexture();
      this.renderSprite.width = this.canvas.width;
      this.renderSprite.height = this.canvas.height;
      this.scene3d.camera.aspect = this.canvas.width / this.canvas.height;
      this.scene3d.camera.updateProjectionMatrix();
   //   this.composer.setSize(this.canvas.width * 2, this.canvas.height * 2);
    }


    if (this.scene) {
      this.scene.onRotate();
      this.scene.emit('onRotate');
    }
  }
  init() {
  	this.loaded = true;
  	this.scene = new Scene();
  	this.app.stage.addChild(this.scene);
    gameClass.scene = this.scene;
  	this.scene.onRotate();
    this.init3dLayer();
    this.track('Loaded');
  }
  init3dLayer() {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.reloadTexture();
    this.scene3d = new Scene3D(this.scene);
   // this.effectCOmposer();
    this.update();
    this.proceedRotation();
  }
  effectCOmposer() {
    const renderScene = new RenderPass(this.scene3d, this.scene3d.camera);
    const composer = new EffectComposer(this.renderer);
    composer.addPass(renderScene);

    const bloomPass = new UnrealBloomPass(new Vector2(720, 1280), 0.5, 0.1, 0.65)
    composer.addPass(bloomPass);
    this.composer = composer;
  }
  reloadTexture() {
    if (this.renderTexture) {
      this.scene.removeChild(this.renderSprite);
      this.renderTexture.destroy();
      this.renderSprite.destroy();
    }
    this.renderTexture = BaseTexture.from(this.renderer.domElement);
    this.renderSprite = Sprite.from(new Texture(this.renderTexture));
    this.scene.addChildAt(this.renderSprite, 0);
  }
  update() {
    requestAnimationFrame(this.update.bind(this));
    this.renderer.render(this.scene3d, this.scene3d.camera);
   // this.composer.render();
    this.renderTexture.update();

  }
}
gameClass.storeClick = (end) => {
    if (end) gameClass.game.track('CTAEnd');
    else gameClass.game.track('CTAGame');
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      window.open('https://play.google.com/store/apps/details?id=com.h8games.helixjump');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.open('https://apps.apple.com/us/app/helix-jump/id1345968745');
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.h8games.helixjump');
    }
};
gameClass.loadImage = (key) => {
  return gameClass.images[key];
}
gameClass.loadModel = (key) => {
  if (gameClass.models[key]) return gameClass.models[key].clone();
  return new Mesh();
}

export default gameClass;