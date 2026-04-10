import Phaser from './lib/phaser.js';
import { SCENE_KEYS } from './common/scene-keys.js';
import { GameScene } from './scenes/game-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { GameOverScene } from './scenes/game-over-scene.js';
import { TitleScene } from './scenes/title-scene.js';

/** @type {Phaser.Types.Core.GameConfig} */
const gameConfig = {
  type: Phaser.CANVAS,
  pixelArt: true,
  roundPixels: true,
  scale: {
    parent: 'game-container',
    width: 640,
    height: 450,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(gameConfig);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.GAME_OVER_SCENE, GameOverScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
