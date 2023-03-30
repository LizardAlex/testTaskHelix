import {
  BaseTexture,
  Texture,
} from 'pixi.js';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as images from './js/system/images';
import * as models from './js/system/models';
import Game from './js/system/game';
import parameters from './js/parameters.json';
import './css/style.css';

const game = new Game(document.getElementById('canvas'));
Game.images = {};
Game.models = {};
game.Game = Game;
Game.game = game;
window.game = game;
Game.parameters = parameters;
game.setSound(parameters);
Object.keys(images).forEach((key) => {
  const image = new Image();
  image.src = images[key];
  image.onload = () => {
  	Game.images[key] = new Texture(new BaseTexture(image));
  	Game.images[key].original = image.src;
  	if (Object.keys(Game.images).length + Object.keys(Game.models).length === Object.keys(models).length + Object.keys(images).length) game.init();
  };
});
const fbxLoader = new FBXLoader();
Object.keys(models).forEach((key) => {
  const model = fbxLoader.load(models[key], (ev) => {
  	Game.models[key] = ev;
  	if (Object.keys(Game.images).length + Object.keys(Game.models).length === Object.keys(models).length + Object.keys(images).length) game.init();
  });
});