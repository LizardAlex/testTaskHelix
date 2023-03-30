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
  PointLight,
  PlaneGeometry,
  CircleGeometry,
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
import Shaders2 from './shaders2';
import helixTower from './helixTower';

class Scene3D extends Scene {
  constructor(scene) {
    super();
    this.scene = this;
    this.setCamera();
    this.textureLoader = new TextureLoader();
    this.cityBg = this.textureLoader.load(game.loadImage('city').original);
    this.platColor = game.parameters.task.platformColor.default;
    if (game.parameters.task.rainbow.default === false) {
      this.shaderLib = new Shaders2(this);
    } else {
      this.shaderLib = new Shaders(this);
    }
    
    this.camera.add(this.shaderLib.shaderGradient);
    this.buildBg();
    this.buildLights();
    this.buildTower();
    this.initialParticles();
    scene.on('onRotate', () => {
      this.onRotate();
    });
  }
  initialParticles() {
    const geometry = new CircleGeometry(1, 32 );
    const material = new MeshToonMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const charge = (part, first) => {
      const scale = 0.4 + Math.random() * 1.1;
      part.scale.set(0.01, 0.01, 0.01);
      part.position.y = Math.random() * 60 - 30;
      part.position.x = -Math.random() * 50 - 10;
      if (Math.random() > 0.5)
        part.position.x = Math.random() * 50 + 10;
      if (first) part.scale.set(scale, scale, scale);
      else Tween.get(part.scale).to({ x: scale, y: scale, z: scale }, 1350, Tween.Ease.sineInOut);
      const tw = Tween.get(part.position).to({ y: part.position.y - 30 }, 9000 + Math.random() * 6000).call(() => {
        Tween.get(part.scale).to({ x: 0.01, y: 0.01, z: 0.01 }, 750, Tween.Ease.sineInOut).call(() => {
          charge(part);
        });
        
      });
      if (first) tw.rawPosition = Math.random() * tw.duration;
    };
    for (let i = 0; i < 20; i += 1) {
      const part = new Mesh(geometry, material);
      this.camera.add(part);
      part.position.z = -35.7;

      charge(part, true);
    }
  }
  buildTower() {
    this.tower = new helixTower(this);
    this.add(this.tower);
  }

  onRotate() {
    this.backPlane.position.y = 10;
    if (game.width > game.height) {
      this.backPlane.scale.set(1 + 0.2 * game.wide, 1 + 0.2 * game.wide, 1 + 0.2 * game.wide);
      this.backPlane.position.x = 0;
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
    } else {
      this.backPlane.scale.set(0.6, 0.6, 0.6);
      this.backPlane.position.x = 15.5 - 6.7 * game.tablet;
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
      if (game.parameters.task.bgCity.default == '#ffffff') {
        this.backPlane.position.y = 0;
      }
    }

    
  }
  setCamera() {
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 12, 20);
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.add(this.camera);
  }
  buildLights() {
    this.directionalLight = new DirectionalLight(0xffffff, 0.1);
    this.directionalLight.position.set(6, 22, 50);
    this.add(this.directionalLight);
    this.ambientLight = new AmbientLight('#ffffff', 0.3); // can be used for very flat lighting with no shadows, set intensity to 0 and remove directionalLight
    this.add(this.ambientLight);

        this.pointLight = new PointLight(0xffffff, 0.5, 0); // extra light source to avoid harsh shadows
    this.pointLight.position.set(0, 50, -50);
    this.add(this.pointLight);
  }
  buildBg() {
    const geometryPlane = new PlaneGeometry(110, 110);
    const materialCity = new MeshToonMaterial({ map: this.cityBg, transparent: true, color: game.parameters.task.bgCity.default });
    const backPlane = new Mesh(geometryPlane, materialCity);
    backPlane.position.y = 10;
    backPlane.position.z = -37;
    this.backPlane = backPlane;
    this.camera.add(backPlane);
  }
}

export default Scene3D;