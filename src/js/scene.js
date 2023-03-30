

import {
  Container,
  Sprite,
  BaseTexture,
  Texture,
  Filter,
  BLEND_MODES,
  Text,
} from 'pixi.js';

import game from './system/game';
import Tween from './system/tweenjs';
import {AdvancedBloomFilter} from '@pixi/filter-advanced-bloom';
import EndCard from './endCard';

class Scene extends Container {
  constructor() {
  	super();
    this.initUI();
    this.initTutorial();
    this.initParticleCont();
    this.filters = [new AdvancedBloomFilter({ threshold: 0.4, bloomScale: 0.4, blur: 8, brighteness: 1.1 })];
    this.on('pointerdown', () => {
      if (this.UI.alpha === 0) Tween.get(this.UI).to({ alpha: 1 }, 300);
      Tween.removeTweens(this.tutCont);
      Tween.get(this.tutCont).to({ alpha: 0 }, 300);
    });
    if (game.parameters.task.firstClickSound.default) Howler.mute(true);

    this.on('pointertap', () => {
      if (!this.started) {
        this.started = true;
        Howler.mute(false);
      }
    });
  }
  initParticleCont() {
    this.particleCont = new Container();
    this.addChild(this.particleCont);
    this.leftPart = new Container();
    this.particleCont.addChild(this.leftPart);
    this.rightPart = new Container();
    this.particleCont.addChild(this.rightPart);
  }
  initTutorial() {
    this.tutCont = new Container();
    this.addChild(this.tutCont);

    this.reachTheBotton = new Text('Reach\nthe bottom!', {
      fontFamily: 'arial',
      fontSize: 87,
      fill: 0x000000,
      align: 'center',
      stroke: '#ffffff',
      strokeThickness: 5,
      fontWeight: 'bold',
    });
    Tween.get(this.reachTheBotton.scale, { loop: true })
      .to({ x: 1.1, y: 1.1 }, 300, Tween.Ease.sineInOut)
      .to({ x: 1, y: 1 }, 300, Tween.Ease.sineInOut);

    this.reachTheBotton.anchor.set(0.5);
    this.tutCont.addChild(this.reachTheBotton);


    this.circle = new Sprite(game.loadImage('circle'));
    this.tutCont.addChild(this.circle);
    this.circle.x = -250;
    this.circle.anchor.set(0.5);
    this.circle.scale.set(0);
    Tween.get(this.circle, { loop: true }).wait(400).to({ alpha: 0 }, 300).wait(1250);
    Tween.get(this.circle.scale, { loop: true }).wait(400).to({ x: 1, y: 1 }, 300).wait(1250);
    this.hand = new Sprite(game.loadImage('hand'));
    this.hand.rotation = -Math.PI / 3;
    this.hand.x = -150;
    this.hand.anchor.set(0.5);
    this.hand.alpha = 0;
    Tween.get(this.hand, { loop: true }).to({ alpha: 1 }, 300).wait(1350).to({ alpha: 0 }, 300);
    Tween.get(this.hand, { loop: true }).wait(300).to({ rotation: -Math.PI / 2.3 }, 150).wait(1500);
    Tween.get(this.hand, { loop: true }).wait(450).to({ x: 150 }, 1000, Tween.Ease.sineInOut).wait(500);
    this.tutCont.addChild(this.hand);
  }
  initUI() {
    this.UI = new Container();
    this.addChild(this.UI);

    this.levelNum = 37;
    this.topBar = new Container();
    this.UI.addChild(this.topBar);

    this.barEmpty = new Sprite(game.loadImage('barEmpty'));
    this.barEmpty.anchor.set(0.5);
    this.topBar.addChild(this.barEmpty);

    this.barFilled = new Sprite(game.loadImage('barFilled'));
    this.barFilled.anchor.set(0, 0.5);
    this.barFilled.x = -124;
    this.topBar.addChild(this.barFilled);
    this.barFilled.texture.frame.width = 0;
    this.barFilled.texture.updateUvs();

    this.circle1 = new Sprite(game.loadImage('circleFilled'));
    this.topBar.addChild(this.circle1);
    this.circle1.anchor.set(0.5);
    this.circle1.x = -147;

    this.level1 = new Text(this.levelNum, {
      fontFamily: 'arial',
      fontSize: 33,
      fill: 0x000000,
/*      
*/
      align: 'center',
    });
    this.level1.anchor.set(0.5);
    this.circle1.addChild(this.level1);

    this.circle2 = new Sprite(game.loadImage('circleEmpty'));
    this.topBar.addChild(this.circle2);
    this.circle2.anchor.set(0.5);
    this.circle2.x = 147;

    this.level2 = new Text(this.levelNum + 1, {
      fontFamily: 'arial',
      fontSize: 33,
      fill: 0x000000,

      align: 'center',
    });
    this.level2.anchor.set(0.5);
    this.circle2.addChild(this.level2);

    this.score = new Text(30969, {
      fontFamily: 'arial',
      fontSize: 87,
      fill: 0x000000,
      align: 'center',
      stroke: '#ffffff',
      strokeThickness: 2,
    });
    this.score.anchor.set(0.5);
    this.topBar.addChild(this.score);
    this.score.y = 72;

    this.banner = new Sprite(game.loadImage('banner'));
    this.UI.addChild(this.banner);
    this.banner.anchor.set(0.5, 1);
    this.banner.alpha = 0.6;
    this.banner.interactive = true;
    this.banner.on('pointertap', () => {
      game.storeClick();
    });
    this.UI.alpha = 0;
//perfect nice! wow! godlike!
  }
  plusProgress(inRow, percent) {
    Tween.removeTweens(this.barFilled.texture.frame);
    Tween.get(this.barFilled.texture.frame).to({ width: percent * 247 }, 200).on('change', () => {
      this.barFilled.texture.updateUvs();
    });
//    this.barFilled.texture.frame.width = percent * 247;
    
    let points = inRow * this.levelNum;
    if (points > 1000) {
      points = (inRow - Math.round(1000 / this.levelNum)) * this.levelNum;
    }
    const text = new Text(`+${points}`, {
      fontFamily: 'arial',
      fontSize: 87,
      fill: 0xfef545,
      stroke: '#b19241',
      strokeThickness: 1,
      align: 'center',
    });
    text.alpha = 0.8;
    text.anchor.set(0.5);
    this.topBar.addChild(text);
    text.y = 170;
    text.scale.set(0);
    Tween.get(text.scale).to({ x: 1, y: 1 }, 150, Tween.Ease.getBackOut(2));
    Tween.get(text).wait(150).to({ y: 72 }, 800);
    Tween.get(text).wait(150).to({ alpha: 0 }, 800).call(() => {
      this.topBar.removeChild(text);
    });
    this.score.text = parseInt(this.score.text) + points;
    if (inRow === 3 || inRow === 5) {
      const text = ['PERFECT!', 'NICE!', 'WOW!', 'GODLIKE!'][Math.floor(Math.random() * 4)];
      const tempText = new Text(text, {
        fontFamily: 'arial',
        fontSize: 47,
        fill: 0xa0d53d,
        align: 'center',
      });
      tempText.anchor.set(0.5);
      tempText.scale.set(0);
      tempText.x = 180;
      tempText.y = 170;
    //  Tween.get(tempText.scale).to({ x: 1, y: 1 }, 150, Tween.Ease.getBackOut(2));
      this.topBar.addChild(tempText);
      Tween.get(tempText.scale).to({ x: 1, y: 1 }, 150, Tween.Ease.getBackOut(2));
      Tween.get(tempText).wait(150).to({ y: 72 }, 800);
      Tween.get(tempText).wait(250).to({ alpha: 0 }, 800).call(() => {
        this.topBar.removeChild(tempText);
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
  buildEndCard() {
    this.endCard = new EndCard(this);
    this.addChild(this.endCard);
  }
  finish() {
    this.circle2.texture = game.loadImage('circleNext');
    Tween.get(this.UI).to({ alpha: 0 }, 600).call(() => {
      this.buildEndCard();
      this.addChild(this.particleCont);
    });
    this.fireWorks(this.leftPart, 1);
    this.fireWorks(this.rightPart, -1);
    game.game.play('firework');
    Tween.get(this, { loop:  2 }).wait(350).call(() => {
      this.fireWorks(this.leftPart, 1);
      this.fireWorks(this.rightPart, -1);
      game.game.play('firework');
    });
  }
  fireWorks(cont, way) {
    for (let i = 0;i < 30; i += 1) {
      const part = new Sprite(game.loadImage(`p${Math.ceil(Math.random() * 6)}`));
      part.accel = (-10.4 + 2 - 5 * Math.random()) * game.height / 720;
      part.rotation = Math.random() * Math.PI * 2;
      part.anchor.set(0.5);
      const sc = 0.4 + Math.random() * 0.6;
      part.scale.set(sc);
      const tw = Tween.get(part.scale, { loop: true }).to({ x: -sc }, 250).to({ x: sc }, 250);
      tw.rawPosition = Math.random() * tw.duration;
      const tw2 = Tween.get(part).to({ x: (200 + (game.width * 0.7) * Math.random()) * way }, 2000);
      tw2.on('change', (evt) => {
        const delta = this.constructor.deltaCalc(evt);
        part.y += delta * part.accel;
        
        part.accel += 0.1 * delta * game.height / 720;
        
      });
      tw2.call(() => {

      });
      cont.addChild(part);
    }
  }

  onRotate() {
    if (game.width > game.height) {
      this.topBar.x = 200;
      this.topBar.y = game.height * 0.06;

      this.banner.x = game.width - 160;
      this.banner.y = game.height;

      this.reachTheBotton.y = -350;
    } else {
      this.topBar.x = game.width / 2;
      this.topBar.y = game.height * 0.06;

      this.banner.x = game.width / 2;
      this.banner.y = game.height;

      this.reachTheBotton.y = -550 + 70 * game.tablet;
    }
    this.tutCont.x = game.width / 2;
    this.tutCont.y = game.height * 0.65;

    this.leftPart.y = game.height + 50;
    this.rightPart.x = game.width;
    this.rightPart.y = game.height + 50;
  }
  update() {
    

  }
  
}

export default Scene;