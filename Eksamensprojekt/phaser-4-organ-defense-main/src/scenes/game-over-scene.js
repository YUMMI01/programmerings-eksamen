import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

export class GameOverScene extends Phaser.Scene {
  /** @type {number} */
  #score;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_OVER_SCENE,
    });
    this.#score = 0;
  }

  /**
   * @param {{ score: number }} data
   */
  init(data) {
    this.#score = data.score;
  }

  create() {
    // laver baggrund
    this.add
      .image(0, 0, ASSET_KEYS.BACKGROUND)
      .setOrigin(0)
      .setAlpha(0.4)
      .setScale(1.42, 1.42);
    
    // tekst der skal være på game over skærmen
    this.add
      .text(this.scale.width / 2, 100, 'Game Over', {
        fontSize: '32px',
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, 200, `Score: ${this.#score}`, {
        fontSize: '24px',
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, 350, 'Click to play again!', {
        fontSize: '22px',
      })
      .setOrigin(0.5);
    
    // når spiller klikker på skærmen starter spillet forfra med en fade effekt
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENE_KEYS.GAME_SCENE);
      });
    });

    this.cameras.main.fadeIn(500);
  }
}
