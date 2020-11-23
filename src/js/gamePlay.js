import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import Tween from './tweenjs';

class GamePlay extends Container {
  constructor(scene) {
  	super();
    this.scene = scene;

    this.figure = new Container();
    this.addChild(this.figure);

    this.headColor = 0xd167e1;
    this.bodyColor = 0x4dc2e3;

  	this.cube = new Sprite(game.loadImage('cube'));
    this.cube.anchor.set(0.5);
    this.cube.tint = this.headColor;
    this.cube.stepX = 0;
    this.cube.stepY = 0;
    this.figure.addChild(this.cube);
    this.vert2 = [this.cube];

    this.scene.interactive = true;
    this.scene.on('pointerdown', (evt) => {
      this.lastClicked = this.toLocal(evt.data.global);
    });
    this.scene.on('pointerup', (evt) => {
      if (this.lastClicked) {
        this.swipeRead(this.lastClicked, this.toLocal(evt.data.global))
      }
    });
    this.array = [[{ main: this.cube, angles: [] }]];
    this.middleBlocks = [];
  }
  swipeRead(lastC, currentC) {
    const angle = Math.atan2(lastC.y - currentC.y, lastC.x - currentC.x);
    if (angle < Math.PI && angle > Math.PI / 2 + Math.PI / 4)  this.move('rt');
    if (angle <= Math.PI / 2 + Math.PI / 4 && angle >= Math.PI / 2 - Math.PI / 4) this.move('t');
    if (angle > 0 && angle < Math.PI / 2 - Math.PI / 4) this.move('lt');
    if (angle > -Math.PI && angle < -Math.PI / 2 - Math.PI / 4) this.move('rb');
    if (angle >= -Math.PI / 2 - Math.PI / 4 && angle <= -Math.PI / 2 + Math.PI / 4) this.move('b');
    if (angle < 0 && angle > -Math.PI / 2 + Math.PI / 4) this.move('lb');
  }
  alignScale() {

    let min = { x: 0, y: 0 };
    let max = { x: 0, y: 0 };
    this.figure.children.forEach((ele) => {
      if (!ele.dead) {
        min = { x: Math.min(ele.x, min.x), y: Math.min(ele.y, min.y) };
        max = { x: Math.max(ele.x, max.x), y: Math.max(ele.y, max.y) };
      }
    });
    const width = max.x - min.x;
    const height = max.y - min.y;
    Tween.removeTweens(this.pivot);
    Tween.get(this.pivot).to({ x: min.x + width / 2, y: min.y + height / 2 }, 300, Tween.Ease.sineInOut);
    const scale = Math.min(360 / Math.max(width,height), 1);
    Tween.get(this.scale).to({ x: scale, y: scale }, 300, Tween.Ease.sineInOut)
  }
  move(way) {
    if (this.inMove) return;
    this.inMove = true;
    if (!this.vert) this.vert = [];
    const leftOff = 53;
    const topOff = 30.5;
    this.ways = {
      rt: { x: leftOff, y: -topOff, stepX: 1, rp: 3, stepY: 1, c: 'lb' },
      lt: { x: -leftOff, y: -topOff, stepX: -1, lp: 3, stepY: 1, c: 'rb' },
      rb: { x: leftOff, y: topOff, stepX: 1, lp: 1, stepY: -1, c: 'lt' },
      lb: { x: -leftOff, y: topOff, stepX: -1, rp: 1, stepY: -1, c: 'rt' },
      t: { x: 0, y: -61, stepX: 0, stepY: 2, c: 'b' },
      b: { x: 0, y: 61, stepX: 0, stepY: -2, c: 't' },
    };
    const ind = this.array[this.cube.stepX][this.cube.stepY].angles.indexOf(way);
    const xS = this.cube.stepX + this.ways[way].stepX;
    const yS = this.cube.stepY + this.ways[way].stepY;

    const id1 = this.cube.stepX * 1000000 + this.cube.stepY * 10000 + xS * 100 + yS;
    const id2 = this.cube.stepX * 100 + this.cube.stepY + xS * 1000000 + yS * 10000;

    if (ind !== -1) {
      if (this.array[xS] && this.array[xS][yS]) {
        const ind2 = this.array[xS][yS].angles.indexOf(this.ways[way].c);
        if (ind2 !== -1) this.array[xS][yS].angles.splice(ind2, 1);
      }
      if (this.array[this.cube.stepX][this.cube.stepY].angles.length === 1) {
        this.cube.scale.ele = this.cube;
        this.cube.dead = true;
        Tween.get(this.cube.scale).to({ x: 0, y: 0 }, 100).call((evt) => {
          if (evt.target.ele.parent) evt.target.ele.parent.removeChild(evt.target.ele);
        });
        this.array[this.cube.stepX][this.cube.stepY] = null;
      } else {
        this.array[this.cube.stepX][this.cube.stepY].angles.splice(ind, 1);
        this.cube.tint = this.bodyColor;
      }
      if (Math.hypot(this.cube.x - this.middleBlocks[id2][0].x, this.cube.y - this.middleBlocks[id2][0].y) > 80) this.middleBlocks[id2].reverse();
      this.middleBlocks[id2].forEach((ele, i)=> {
        ele.scale.ele = ele;
        ele.dead = true;
        Tween.get(ele.scale).wait(50 * (i + 1)).to({ x: 0, y: 0 }, 100).call((evt) => {
          if (i + 1 === 3) {
            this.inMove = false;
            this.cube.tint = this.headColor;
          }

          if (evt.target.ele.parent) evt.target.ele.parent.removeChild(evt.target.ele);
        });
        
        if (ele.over) {
          ele.over.dead = true;
          ele.over.scale.ele = ele.over;
          Tween.get(ele.over.scale).wait(50 * (i + 1)).to({ x: 0, y: 0 }, 100).call((evt) => {
            if (evt.target.ele.parent) evt.target.ele.parent.removeChild(evt.target.ele);
          });
        }
       
      });
      this.cube = this.array[xS][yS].main;
      this.alignScale();
      return;
    }
    this.middleBlocks[id1] = [];
    this.middleBlocks[id2] = [];


    this.array[this.cube.stepX][this.cube.stepY].angles.push(way);
    let toScore = 5;

    if (this.array[xS] && this.array[xS][yS]) toScore = 4;


    for (let i = 1; i < toScore; i += 1) {
      const cube = new Sprite(game.loadImage('cube'));
      cube.anchor.set(0.5);
      this.figure.addChild(cube);
      cube.x = this.cube.x + this.ways[way].x;
      cube.y = this.cube.y + this.ways[way].y;
      cube.scale.set(0);
      cube.stepX = this.cube.stepX;
      cube.stepY = this.cube.stepY;
      if (i < 4) {
        this.middleBlocks[id1].push(cube);
        this.middleBlocks[id2].push(cube);
      }
      if (way === 't' || way === 'b') this.vert2.push(cube);


      let topExtra = false;
      if (this.ways[way].lp === i) topExtra = 'lp';
      if (this.ways[way].bp === i) topExtra = 'bp';
      if (this.ways[way].rp === i) topExtra = 'rp';
      if (topExtra) {
        const over = new Sprite(game.loadImage(topExtra));
        over.anchor.set(0.5);
        over.position = cube.position;
        cube.over = over;
        this.figure.addChild(over);
        this.vert.push(over);
        over.tint = this.bodyColor;
        over.scale.set(0);
        if (topExtra === 'lp') {
          over.pivot.x = -2.5;
          over.pivot.y = -1.5;
        } else if (topExtra === 'bp') {
          over.pivot.y = 4.5;
        } else if (topExtra === 'rp') {
          over.pivot.x = 3.5;
          over.pivot.y = -2;
        }
        Tween.get(over.scale).wait(50 * i).to({ x: 1, y: 1}, 100, Tween.Ease.cubicOut);
      }
      Tween.get(cube.scale).wait(50 * i).to({ x: 1, y: 1 }, 100, Tween.Ease.cubicOut).call(() => {
        if (i === 4) this.inMove = false;
      });
      this.cube.tint = this.bodyColor;
      this.cube = cube;
      this.cube.tint = this.headColor;

    }
    if (toScore === 4) {
      this.cube.tint = this.bodyColor;
      this.cube = this.array[xS][yS].main;
      Tween.get(this.cube.scale).wait(50 * 5).call(()=> {
        this.cube.tint = this.headColor;
        this.inMove = false;
      });
    }
    this.vert2.push(this.cube);

    if (!this.array[xS]) this.array[xS] = [];

    if (!this.array[xS][yS]) this.array[xS][yS] = { main: this.cube, angles: [ this.ways[way].c ] };
    else this.array[xS][yS].angles.push(this.ways[way].c);
    this.cube.stepX = xS;
    this.cube.stepY = yS;
    this.vert = this.vert.filter(el => el.parent);
    this.vert2 = this.vert2.filter(el => el.parent);
    this.figure.children.sort((a,b) => a.y - b.y);
    this.vert2.sort((a,b) => b.y - a.y);
    this.vert2.forEach((ele) => {
      this.figure.addChild(ele);
    });
    this.vert.sort((a,b) => a.y - b.y);
    this.vert.forEach((ele) => {
      this.figure.addChild(ele);
    });
    this.alignScale();

  }
  onRotate() {
  }
}

export default GamePlay;