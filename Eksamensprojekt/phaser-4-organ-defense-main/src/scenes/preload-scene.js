import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, AUDIO_ASSETS, IMAGE_ASSETS, SPRITESHEET_ASSETS } from '../common/assets.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  // loader alle assets ved at iterere over de definerede arrays for spritesheets
  preload() {
    SPRITESHEET_ASSETS.forEach((asset) => {
      this.load.spritesheet(asset.assetKey, asset.path, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
    });
    IMAGE_ASSETS.forEach((asset) => {
      this.load.image(asset.assetKey, asset.path);
    });
    AUDIO_ASSETS.forEach((asset) => {
      this.load.audio(asset.assetKey, asset.path);
    });
  }
  // laver animationer for alle spritesheets, starter baggrundsmusikken og går videre til title screen når alt er loadet
  create() {
    SPRITESHEET_ASSETS.forEach((asset) => {
      this.anims.create({
        key: asset.assetKey,
        frames: this.anims.generateFrameNumbers(asset.assetKey),
        frameRate: asset.frameRate,
        repeat: asset.repeat,
      });
    });
    this.sound.play(ASSET_KEYS.BACKGROUND_MUSIC, { volume: 0.5, loop: true });
    this.scene.start(SCENE_KEYS.TITLE_SCENE);
  }
}
