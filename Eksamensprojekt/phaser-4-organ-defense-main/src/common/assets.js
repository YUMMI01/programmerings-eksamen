export const ASSET_KEYS = Object.freeze({
  BACKGROUND: 'BACKGROUND',
  REALISTIC_HEART: 'REALISTIC_HEART',
  VIRUS_EXPLODE: 'VIRUS_EXPLODE',
  BULLET: 'BULLET',
  HEART: 'HEART',
  VIRUS: 'VIRUS',
  IMMUNE_SYSTEM_CELL: 'IMMUNE_SYSTEM_CELL',
  BACKGROUND_MUSIC: 'BACKGROUND_MUSIC',
  FX_HIT: 'FX_HIT',
  FX_SHOT: 'FX_SHOT',
  FX_EXPLOSION: 'FX_EXPLOSION',
});

export const SPRITESHEET_ASSETS = [
  {
    assetKey: ASSET_KEYS.BACKGROUND,
    frameWidth: 640,
    frameHeight: 360,
    path: 'assets/images/background.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.REALISTIC_HEART,
    frameWidth: 96,
    frameHeight: 96,
    path: 'assets/images/Realistic_heart.png',
    frameRate: 4,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.VIRUS_EXPLODE,
    frameWidth: 96,
    frameHeight: 96,
    path: 'assets/images/Virus_explode.png',
    frameRate: 24,
    repeat: 0,
  },
  {
    assetKey: ASSET_KEYS.BULLET,
    frameWidth: 9,
    frameHeight: 9,
    path: 'assets/images/bullet.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.HEART,
    frameWidth: 16,
    frameHeight: 16,
    path: 'assets/images/hearts.png',
    frameRate: 8,
    repeat: -1,
  },
];

export const IMAGE_ASSETS = [
  {
    assetKey: ASSET_KEYS.IMMUNE_SYSTEM_CELL,
    path: 'assets/images/Immune_system_cell.png',
  },
  {
    assetKey: ASSET_KEYS.VIRUS,
    path: 'assets/images/Virus.png',
  },
];

export const AUDIO_ASSETS = [
  {
    assetKey: ASSET_KEYS.BACKGROUND_MUSIC,
    path: 'assets/audio/backgroundmusic.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_EXPLOSION,
    path: 'assets/audio/explosion.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_HIT,
    path: 'assets/audio/hit.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_SHOT,
    path: 'assets/audio/shot_1.wav',
  },
];
