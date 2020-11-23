import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import GamePlay from './gamePlay';

class Scene extends Container {
  constructor() {
  	super();
  	this.bg = new Sprite(game.loadImage('background'));
  	this.bg.anchor.set(0.5);
  	this.addChild(this.bg);

    this.gamePlay = new GamePlay(this);
    this.addChild(this.gamePlay);
  }
  onRotate() {
    this.gamePlay.x = game.width / 2;
    this.gamePlay.y = game.height / 2;
    this.bg.x = game.width / 2;
    this.bg.y = game.height / 2;
    const bgScale = Math.max(game.width, game.height) / 1280;
    this.bg.scale.set(bgScale);
  }
}

export default Scene;