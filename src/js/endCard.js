import {
  Container,
  Sprite,
  Text,
  Graphics,
} from 'pixi.js';

import game from './system/game';
import Tween from './system/tweenjs';

class EndCard extends Container {
  constructor(scene) {
  	super();
    game.game.track('Finish');

    this.initCard();
    this.alpha = 0;
    Tween.get(this).to({ alpha: 1 }, 300);

    this.onRotate();

    scene.on('onRotate', () => {
      this.onRotate();
    });
  }
  initCard() {
  	this.overlay = new Graphics();
  	this.overlay.beginFill(0x000000).drawRect(0, 0, 3000, 3000);
  	this.overlay.alpha = 0.6;
  	this.overlay.interactive = true;
  	this.overlay.on('pointertap', () => {
  	  game.storeClick(true);
  	});
  	this.addChild(this.overlay);

  	this.button = new Sprite(game.loadImage('button'));
  	this.button.anchor.set(0.5);
  	this.button.scale.set(1.5);
  	this.addChild(this.button);

  	this.CTAtext = new Text('Play now', {
      fontFamily: 'arial',
      fontSize: 53,
      fill: 0x000000,
      stroke: '#ffffff',
      strokeThickness: 3,
      align: 'center',
      fontWeight: 'bold',
    });
    this.CTAtext.anchor.set(0.5);
    this.CTAtext.y = -5;
    this.button.addChild(this.CTAtext);
    this.button.pivot.x = 500;
    Tween.get(this.button.pivot).wait(300).to({ x: 0 }, 300, Tween.Ease.sineInOut);



  	this.stores = new Sprite(game.loadImage('stores'));
  	this.stores.anchor.set(0.5);
  	this.stores.scale.set(0.4);
  	this.addChild(this.stores);
    this.stores.pivot.x = -1500;
    Tween.get(this.stores.pivot).wait(600).to({ x: 0 }, 300, Tween.Ease.sineInOut).call(() => {
    	Tween.get(this.button.scale, { loop: true }).to({ x: 1.65, y: 1.65 }, 150, Tween.Ease.sineInOut).to({ x: 1.5, y: 1.5 }, 150, Tween.Ease.sineInOut).wait(2200);
    });

  	this.icon = new Sprite(game.loadImage('icon'));
  	this.icon.anchor.set(0.5);
  	this.icon.scale.set(1.4);
  	this.addChild(this.icon);
    this.icon.pivot.x = 500;
    Tween.get(this.icon.pivot).wait(300).to({ x: 0 }, 300, Tween.Ease.sineInOut);

  }
  onRotate() {
    if (game.width > game.height) {
      this.icon.x = game.width / 4;
      this.icon.y = game.height * 0.35;

      this.button.x = game.width / 4;
      this.button.y = game.height * 0.75;

      this.stores.x = game.width / 4 * 3;
      this.stores.y = game.height * 0.5;
    } else {
      this.icon.x = game.width / 2;
      this.icon.y = game.height * 0.2;

      this.button.x = game.width / 2;
      this.button.y = game.height / 2;

      this.stores.x = game.width / 2;
      this.stores.y = game.height * 0.8;
    }
  }
}

export default EndCard;