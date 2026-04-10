import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }

  create() {
    // laver baggrund
    this.add
      .image(0, 0, ASSET_KEYS.BACKGROUND)
      .setOrigin(0)
      .setAlpha(0.4)
      .setScale(1.42, 1.42);
    

    // laver et billede af et hjerte i midten af skærmen
    this.add.image(this.scale.width / 2, this.scale.height / 2, ASSET_KEYS.REALISTIC_HEART, 0);

    this.add
      .text(this.scale.width / 2, 100, 'Organ Defense', {
        fontSize: '32px',
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, 350, 'Click to play!', {
        fontSize: '22px',
      })
      .setOrigin(0.5);

    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENE_KEYS.GAME_SCENE);
      });
    });

    this.cameras.main.fadeIn(500);
  }
}
