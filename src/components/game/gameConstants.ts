export type NPCType = { 
    id: string, 
    walk?: HTMLImageElement, 
    idle?: HTMLImageElement, 
    scaleModifier?: number, 
    fpsModifier?: number, 
    flipDefault?: boolean, 
    isPickup?: boolean 
};

export type Entity = { 
    id: number,
    parentId?: number,
    isBaby?: boolean,
    hasPlayedStealthSound?: boolean,
    hasPlayedAggroSound?: boolean,
    isFollowing?: boolean,
    isRunningToTarget?: boolean,
    enragedTimer: number,
    childSpawnTimer: number,
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    hit: boolean, 
    type: 'sit_hazard',
    npcType: NPCType, 
    state: 'walk' | 'idle', 
    stateTimer: number, 
    localSpeedX: number, 
    localSpeedY: number, 
    facingLeft: boolean,
    sprite: HTMLImageElement, 
    currentFrame: number, 
    frameTimer: number 
};

export const SKY_COLORS = [
    '#1e1b4b', '#2e186a', '#3f1680', '#4c1d95', '#5f1885', '#701a75', 
    '#98196b', '#be185d', '#d01b52', '#e11d48', '#ed5e29', '#f59e0b', 
    '#f9bf28', '#fde047'
];

export const WATER_COLORS = ['#0ea5e9', '#0284c7', '#0369a1'];

export const PALM_SPRITE = [
    "  GGGG    ",
    " GGGGGG   ",
    "GG GG GG  ",
    "G      G  ",
    "   TT     ",
    "   TT     ",
    "   TT     "
];

export const INITIAL_UNSPAWNED_PICKUPS = [
    'Allen_wrench', 'Broom', 'Flashlight', 'Garden_hose', 'Gerbil_feeder', 
    'Hacksaw', 'Hammer', 'Nuts_bolts', 'Pliers', 'Racket', 'Safety_goggles', 
    'Screws', 'Walkie_talkie'
];

export const BASE_RUN_SPEED = 200;
export const INITIAL_TIME_REMAINING = 223.0;
export const SKY_HEIGHT = 5 * 32;
