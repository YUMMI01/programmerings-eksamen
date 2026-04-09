import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

const DATA_KEYS = Object.freeze({
  ROTATION_SPEED: 'ROTATION_SPEED',
  STATE: 'STATE',
  SPAWN_TIME: 'SPAWN_TIME',
});

const ENEMY_STATES = Object.freeze({
  LINEAR: 'LINEAR',
  ZIGZAG: 'ZIGZAG',
});

export class GameScene extends Phaser.Scene {
  /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
  #realisticHeart;
  /** @type {Phaser.GameObjects.Image} */
  #player;
  /** @type {number} */
  #playerAngle;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  #cursorKeys;
  /** @type {Phaser.GameObjects.Group} */
  #bulletGroup;
  /** @type {number} */
  #lastBulletFiredTime;
  /** @type {Phaser.GameObjects.Group} */
  #enemyGroup;
  /** @type {number} */
  #enemySpeed;
  /** @type {number} */
  #spawnDelay;
  /** @type {Phaser.Time.TimerEvent} */
  #spawnTimer;
  /** @type {number} */
  #score;
  /** @type {Phaser.GameObjects.Group} */
  #destroyedEnemyGroup;
  /** @type {number} */
  #realisticHeartHealth;
  /** @type {boolean} */
  #lockInput;
  /** @type {Phaser.GameObjects.Text} */
  #scoreText;
  /** @type { Phaser.GameObjects.Container} */
  #realisticHeartHealthContainer;
  /** @type {{ multiShot: number, fireRate: number }} */
  #playerUpgrades;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  create() {
    if (!this.input.keyboard) {
      return;
    }

    // laver game baggrund
    this.add
      .image(0, 0, ASSET_KEYS.BACKGROUND)
      .setOrigin(0)
      .setAlpha(0.4)
      .setScale(1.42, 1.42);

    // laver hjertet man skal forsvare, og laver en container til at holde mængden af liv man har tilbage
    this.#realisticHeart = this.physics.add
      .sprite(this.scale.width / 2, this.scale.height / 2, ASSET_KEYS.REALISTIC_HEART, 0)
      .play(ASSET_KEYS.REALISTIC_HEART);
    this.#realisticHeart.body.setCircle(30, 18, 18);
    this.#realisticHeartHealth = 3;
    this.#realisticHeartHealthContainer = this.add.container(this.scale.width / 2, this.#realisticHeart.y + 50, [
      this.add.sprite(-18, 0, ASSET_KEYS.HEART, 0).play(ASSET_KEYS.HEART),
      this.add.sprite(0, 0, ASSET_KEYS.HEART, 0).play(ASSET_KEYS.HEART),
      this.add.sprite(18, 0, ASSET_KEYS.HEART, 0).play(ASSET_KEYS.HEART),
    ]);

    // laver spilleren og sætter den i position, og laver variabler til at holde styr på spillerens rotation og våben
    this.#player = this.add.image(0, 0, ASSET_KEYS.IMMUNE_SYSTEM_CELL, 0).setScale(1);
    this.#playerAngle = 0;
    this.#updatePlayerPosition();
    // laver spillerens skud og laver en variabel til at holde styr på hvornår spilleren sidst skød
    this.#bulletGroup = this.physics.add.group([]);
    this.#lastBulletFiredTime = 0;

    // laver fjenderne og laver en variabel til at holde styr på hvor hurtigt de skal bevæge sig, og hvor lang tid der skal være mellem at de spawner, og laver en timer til at håndtere spawn af fjender
    this.#enemyGroup = this.physics.add.group([]);
    this.#destroyedEnemyGroup = this.add.group([], {
      classType: Phaser.GameObjects.Sprite,
    });
    this.physics.add.overlap(this.#bulletGroup, this.#enemyGroup, this.#handleBulletAndEnemyCollision, undefined, this);
    this.physics.add.overlap(this.#realisticHeart, this.#enemyGroup, this.#handlePlayerAndEnemyCollision, undefined, this);

    // laver variabler og timer til at håndtere sværhedsgrad der stiger over tid ved at øge fjendernes spawn rate og hastighed
    this.#spawnDelay = 1500; // starter med 1.5 sek mellem hver spawn
    this.#enemySpeed = 45; // starter med en hastighed på 45
    this.#spawnTimer = this.time.addEvent({
      delay: this.#spawnDelay,
      callback: this.#spawnEnemy,
      callbackScope: this,
      loop: true,
    });
    // sværhedsgraden stiger hvert 10. sekund ved at spawn rate øges og fjenderne bevæger sig hurtigere
    this.time.addEvent({
      delay: 10000, // angiver at sværhedsgraden skal stige hvert 10. sekund (10000 ms)
      callback: this.#increaseDifficulty,
      callbackScope: this,
      loop: true,
    });

    // score og UI elementer til at vise score og spillerens resterende liv
    this.#score = 0;
    const scoreTextPrefix = this.add
      .text(10, 10, 'Score: ', {
        fontSize: '16px',
      })
      .setDepth(2);
    this.#scoreText = this.add
      .text(scoreTextPrefix.x + scoreTextPrefix.displayWidth, scoreTextPrefix.y, this.#score.toString(10), {
        fontSize: '16px',
      })
      .setDepth(2);

    // laver variabler til at håndtere spiller input og en variabel til at låse input når spillet ert tabt
    this.#cursorKeys = this.input.keyboard.createCursorKeys();
    this.#lockInput = false;

    this.cameras.main.fadeIn(500);

    this.#playerUpgrades = {
      multiShot: 1,
      fireRate: 200,
    };
  }

  
  update(time) {
    if (this.#lockInput) {
      return;
    }

    // roter spiller med venstre og højre piletaster
    if (this.#cursorKeys.left.isDown) {
      this.#playerAngle -= 0.06;
    } else if (this.#cursorKeys.right.isDown) {
      this.#playerAngle += 0.06;
    }
    this.#updatePlayerPosition();

    // skyd med mellemrumstasten, og tjek at der er gået nok tid siden sidste skud baseret på spillerens fire rate upgrade
    if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space) && time > this.#lastBulletFiredTime + this.#playerUpgrades.fireRate) {
      this.#fireBullet();
      this.#lastBulletFiredTime = time;
    }
    // særger for at de skud der er skudt og er udenfor skærmen bliver deaktiveret og usynlige for at sørger for at spillet ikke lagger
    this.#bulletGroup.getChildren().forEach((/** @type {Phaser.Physics.Arcade.Sprite} */ bullet) => {
      if (
        bullet.active &&
        (bullet.x < 0 || bullet.x > this.scale.width || bullet.y < 0 || bullet.y > this.scale.height)
      ) {
        bullet.setActive(false).setVisible(false);
      }
    });

    // hånterer fjendernes bevægelse og opførsel, sørger for at de roterer, og at de der er udenfor skærmen bliver deaktiveret og usynlige, og ændrer deres bevægelsesmønster baseret på hvor længe de har været i live
    this.#enemyGroup.getChildren().forEach((/** @type {Phaser.Physics.Arcade.Sprite} */ enemy) => {
      // usynliggør og deaktiver fjender der er udenfor skærmen for at sørger for at spillet ikke lagger
      if (enemy.x < -50 || enemy.x > 850 || enemy.y < -50 || enemy.y > 650) {
        enemy.setActive(false).setVisible(false);
        return;
      }
      // rotere fjender baseret på deres individuelle rotationshastighed
      enemy.rotation += enemy.getData(DATA_KEYS.ROTATION_SPEED);
      const aliveTime = time - enemy.getData(DATA_KEYS.SPAWN_TIME);

      if (aliveTime > 180000 && enemy.getData(DATA_KEYS.STATE) === ENEMY_STATES.LINEAR) {
        enemy.setData(DATA_KEYS.STATE, ENEMY_STATES.ZIGZAG);
      }

      if (enemy.getData(DATA_KEYS.STATE) === ENEMY_STATES.ZIGZAG) {
        enemy.body.velocity.x += Math.sin(time * 0.005) * 15;
      }
    });
  }

  #updatePlayerPosition() {
    // bruger spillerens vinkel til at sætte spillerens position i en cirkel rundt om hjertet, og roterer spilleren så den vender udad
    const x = this.scale.width / 2 + (this.#realisticHeart.displayHeight / 2) * Math.cos(this.#playerAngle);
    const y = this.scale.height / 2 + (this.#realisticHeart.displayHeight / 2) * Math.sin(this.#playerAngle);
    this.#player.setPosition(x, y);
    this.#player.rotation = this.#playerAngle + Math.PI / 2; // roterer spilleren så den vender udad fra hjertet
  }

  #fireBullet() {
    const spread = 0.2;
    const bullets = this.#playerUpgrades.multiShot;

    for (let i = 0; i < bullets; i++) {
      const angle =
        this.#playerAngle +
        (i - (bullets - 1) / 2) * spread;

      const velocity = this.physics.velocityFromRotation(angle, 400);

      const bullet = this.#bulletGroup.getFirstDead(
        true,
        this.#player.x,
        this.#player.y,
        ASSET_KEYS.BULLET,
        0,
        true
      );

      bullet
        .setActive(true)
        .setVisible(true)
        .enableBody()
        .setVelocity(velocity.x, velocity.y)
        .setRotation(angle + Math.PI / 2)
        .play(ASSET_KEYS.BULLET);

      this.sound.play(ASSET_KEYS.FX_SHOT, { volume: 0.1 });
    }
  }

  #spawnEnemy() {
    // spawner fjender ved en tilfældig position langs kanten af skærmen, og får dem til at bevæge sig mod hjertet, og giver dem en tilfældig rotationshastighed og et spawn tidspunkt for at kunne ændre deres opførsel over tid
    let x = 0;
    let y = 0;
    const edge = Phaser.Math.Between(0, 3);
    if (edge === 0) {
      x = 0;
      y = Phaser.Math.Between(0, this.scale.height);
    } else if (edge === 1) {
      x = 800;
      y = Phaser.Math.Between(0, this.scale.height);
    } else if (edge === 2) {
      x = Phaser.Math.Between(0, this.scale.width);
      y = 0;
    } else {
      x = Phaser.Math.Between(0, this.scale.width);
      y = 600;
    }

    /** @type {Phaser.Physics.Arcade.Image} */
    const enemy = this.#enemyGroup.getFirstDead(true, x, y, ASSET_KEYS.VIRUS, 0, true);
    enemy
      .setActive(true)
      .setVisible(true)
      .enableBody()
      .setScale(Phaser.Math.FloatBetween(0.75, 1.25))
      .setData(DATA_KEYS.ROTATION_SPEED, Phaser.Math.FloatBetween(-0.02, 0.02))
      .setData(DATA_KEYS.STATE, ENEMY_STATES.LINEAR)
      .setData(DATA_KEYS.SPAWN_TIME, this.time.now);
    // beregner en vinkel fra fjenden til hjertet og sætter fjendens velocity i den retning baseret på den nuværende enemy speed
    this.physics.moveTo(enemy, this.scale.width / 2, this.scale.height / 2, this.#enemySpeed);
    // updaterer fjendens hitbox så den passer bedre til sprite'en for at gøre det mere retfærdigt for spilleren
    enemy.body.setSize(enemy.displayWidth * 0.3, enemy.displayHeight * 0.3);

    console.log(this.#enemyGroup.getChildren().length);
  }

  #increaseDifficulty() {
    // Øger spawn rate ved at formindske spawn delay med 50 ms, ned til minimum 500 ms
    if (this.#spawnDelay > 500) {
      this.#spawnDelay -= 50; // forminsker spawn delay med 50 ms
      console.log('Spawn delay decreased to:', this.#spawnDelay);
      // fjern den eksisterende spawn timer og lav en ny med den opdaterede spawn delay for at øge spawn rate
      this.#spawnTimer.destroy();
      this.#spawnTimer = this.time.addEvent({
        delay: this.#spawnDelay,
        callback: this.#spawnEnemy,
        callbackScope: this,
        loop: true,
      });
    }

    // øger enemy speed med 10, op til maksimum 200
    if (this.#enemySpeed < 200) {
      this.#enemySpeed += 10;
      console.log('Enemy speed increased to:', this.#enemySpeed);
    }
  }

  /**
   * @param {Phaser.Physics.Arcade.Sprite} bullet
   * @param {Phaser.Physics.Arcade.Image} enemy
   */
  #handleBulletAndEnemyCollision(bullet, enemy) {
    // håndterer kollision mellem skud og fjende ved at deaktivere og usynliggøre begge, opdatere score og spillerens upgrades baseret på score, og spawner en eksplosion animation ved fjendens position
    bullet.disableBody();
    bullet.setActive(false).setVisible(false);
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);
    this.#score++;
    if (this.#score % 10 === 0) {
      this.#playerUpgrades.multiShot++;
    }

    if (this.#score % 25 === 0) {
      this.#playerUpgrades.fireRate = Math.max(50, this.#playerUpgrades.fireRate - 20);
    }

    if (this.#score % 15 === 0) {
      this.#upgradePlayerHealth();
    }

    this.#scoreText.setText(this.#score.toString(10));

    this.#spawnDestroyedEnemy(enemy.x, enemy.y);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  #spawnDestroyedEnemy(x, y) {
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const asteroid = this.#destroyedEnemyGroup.getFirstDead(true, x, y, ASSET_KEYS.VIRUS_EXPLODE, 0, true);
    asteroid.setActive(true).setVisible(true).play(ASSET_KEYS.VIRUS_EXPLODE);
    asteroid.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      asteroid.setActive(false).setVisible(false);
    });
    this.sound.play(ASSET_KEYS.FX_EXPLOSION, { volume: 0.5 });
    console.log(this.#destroyedEnemyGroup.getChildren().length);
  }

  /**
   * @param {Phaser.Physics.Arcade.Sprite} planet
   * @param {Phaser.Physics.Arcade.Sprite} enemy
   */
  #handlePlayerAndEnemyCollision(planet, enemy) {
    enemy.disableBody();
    enemy.setActive(false).setVisible(false);
    this.#spawnDestroyedEnemy(enemy.x, enemy.y);
    this.#damagePlayer();
  }

  #damagePlayer() {
    if (this.#realisticHeartHealth <= 0) {
      return;
    }

    this.#realisticHeartHealth--;
    this.#realisticHeartHealthContainer.getAt(this.#realisticHeartHealth).destroy();

    // flash og shake kameraet, og spil hit sound effect for at give feedback til spilleren om at hjertet er blevet ramt
    this.#realisticHeart.setTint(0xff0000);
    this.time.delayedCall(100, () => this.#realisticHeart.clearTint());

    this.tweens.add({
      targets: this.#realisticHeart,
      scaleX: 1.1,
      scaleY: 0.9,
      yoyo: true,
      duration: 100,
      ease: Phaser.Math.Easing.Quadratic.InOut,
    });
    this.cameras.main.shake(150, 0.02);

    this.sound.play(ASSET_KEYS.FX_HIT, { volume: 0.4 });

    // slutter spillet og gå til game over skærmen hvis hjertet er løbet tør for liv
    if (this.#realisticHeartHealth <= 0) {
      this.#lockInput = true;
      this.#player.setVisible(false);
      this.#realisticHeart.disableBody();
      this.#realisticHeart.setActive(false).setVisible(false);
      this.#spawnDestroyedEnemy(this.#realisticHeart.x, this.#realisticHeart.y);

      this.cameras.main.fadeOut(500);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENE_KEYS.GAME_OVER_SCENE, { score: this.#score });
      });
    }
  }

  // håndterer opgradering af spillerens liv ved at øge health variablen, og tilføje et hjerte ikon til health containeren for at vise spilleren at de har fået et ekstra liv
  #upgradePlayerHealth() {
    this.#realisticHeartHealth++;

    const heart = this.add
      .sprite(
        this.#realisticHeartHealthContainer.length * 18,
        0,
        ASSET_KEYS.HEART,
        0
      )
      .play(ASSET_KEYS.HEART);

    this.#realisticHeartHealthContainer.add(heart);
  }
}
