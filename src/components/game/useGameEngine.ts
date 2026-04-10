import { useEffect } from 'react';
import { ImageManager, WebAudioEngine } from './AssetManager';
import { 
    NPCType, 
    Entity, 
    SKY_COLORS, 
    WATER_COLORS, 
    PALM_SPRITE, 
    INITIAL_UNSPAWNED_PICKUPS, 
    BASE_RUN_SPEED, 
    INITIAL_TIME_REMAINING, 
    SKY_HEIGHT 
} from './gameConstants';

export function useGameEngine({
    canvasRef, skipRef, isPlaying, isGameOver, isPausedRef, gameId, togglePause, 
    joystickDeltaRef, isSoundMutedRef, setIsGameOver, createAudio
}: any) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      const clientW = canvas.parentElement?.clientWidth || 800;
      const clientH = canvas.parentElement?.clientHeight || 400;
      
      // Expand logical rendering matrix on mobile viewports so physical entity proportions mirror desktop space
      let scaleMultiplier = 1;
      if (clientH < 600 && clientH > 0) {
          scaleMultiplier = 600 / clientH;
      }
      
      canvas.width = clientW * scaleMultiplier;
      canvas.height = clientH * scaleMultiplier;
      ctx.imageSmoothingEnabled = false;
    };
    
    // Initial size mapping and resize listener
    handleResize();
    window.addEventListener('resize', handleResize);

    // Load Sprites
    const idleImg = ImageManager.getImage('/sprites/Reapz-idle.png');
    const runImg = ImageManager.getImage('/sprites/Reapz-run.png');
    const jumpImg = ImageManager.getImage('/sprites/Reapz-jump.png');
    const sitImg = ImageManager.getImage('/sprites/Reapz-sit.png');
    const rideImg = ImageManager.getImage('/sprites/Reapz-ride.png');
    const floorImg = ImageManager.getImage('/sprites/desert_floor.jpeg');
    const hutImg = ImageManager.getImage('/sprites/Troll Hut.png');
    const townImg = ImageManager.getImage('/sprites/Game end.png');

    // NPC Definitions Map
    const loadImg = (src: string) => ImageManager.getImage(src);
    const npcTypes: NPCType[] = [
      { id: 'Bog Lord', idle: loadImg('/sprites/Bog Lord-idle.png'), scaleModifier: 1.5 },
      { id: 'Assassin', walk: loadImg('/sprites/Assassin-walk.png') },
      { id: 'Roc', walk: loadImg('/sprites/Roc-walk.png') },
      { id: 'Stinger', walk: loadImg('/sprites/Stinger-walk.png'), flipDefault: true, scaleModifier: 1.5 },
      // Basilisk inherently walks backwards so we flip it by default and scale it 2x
      { id: 'Basilisk', walk: loadImg('/sprites/Basilisk-walk.png'), idle: loadImg('/sprites/Basilisk-idle.png'), scaleModifier: 2, flipDefault: true },
      { id: 'Hyena', walk: loadImg('/sprites/Hyena-walk.png'), idle: loadImg('/sprites/Hyena-idle.png') },
      // Sea Giant is towering (4x) and moves slowly (half fps)
      { id: 'Sea giant', walk: loadImg('/sprites/Sea giant-walk.png'), idle: loadImg('/sprites/Sea giant-idle.png'), scaleModifier: 4, fpsModifier: 0.5 },
      { id: 'Silithid', walk: loadImg('/sprites/Silithid-walk.png'), idle: loadImg('/sprites/Silithid-idle.png'), scaleModifier: 1.5, fpsModifier: 4.0 },
      { id: 'Wringing Thorns', idle: loadImg('/sprites/Wringing Thorns-spritesheet.png'), scaleModifier: 0.8 },
      { id: 'Strider', walk: loadImg('/sprites/Strider-run.png'), idle: loadImg('/sprites/Strider-idle.png'), scaleModifier: 1.5 },
      { id: 'Pirate', idle: loadImg('/sprites/Pirate-fire_blunderbuss.png'), scaleModifier: 1.5, fpsModifier: 0.4 },
      { id: 'Dragon', walk: loadImg('/sprites/Dragon-flying_forward,_flapping_its_wings.png'), scaleModifier: 10.0 },
      { id: 'Robot Chicken', walk: loadImg('/sprites/Robot Chicken-run.png'), idle: loadImg('/sprites/Robot Chicken-idle.png'), scaleModifier: 1.0 },
      { id: 'Tortoise', walk: loadImg('/sprites/Tortoise-walk.png'), idle: loadImg('/sprites/Tortoise-idle.png'), scaleModifier: 1.3 },
      // Pickups
      { id: 'Allen_wrench', idle: loadImg('/pickups/Allen_wrench.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Broom', idle: loadImg('/pickups/Broom.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Flashlight', idle: loadImg('/pickups/Flashlight.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Garden_hose', idle: loadImg('/pickups/Garden_hose.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Gerbil_feeder', idle: loadImg('/pickups/Gerbil_feeder.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Hacksaw', idle: loadImg('/pickups/Hacksaw.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Hammer', idle: loadImg('/pickups/Hammer.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Nuts_bolts', idle: loadImg('/pickups/Nuts_bolts.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Pliers', idle: loadImg('/pickups/Pliers.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Racket', idle: loadImg('/pickups/Racket.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Safety_goggles', idle: loadImg('/pickups/Safety_goggles.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Screws', idle: loadImg('/pickups/Screws.png'), scaleModifier: 0.8, isPickup: true },
      { id: 'Walkie_talkie', idle: loadImg('/pickups/Walkie_talkie.png'), scaleModifier: 0.8, isPickup: true }
    ];

    // Game state
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const player = {
      x: 250,
      y: canvas.height / 2 - 12,
      z: 0,
      vz: 0,
      isJumping: false,
      slowTimer: 0,
      fastTimer: 0,
      sitTimer: 0,
      width: 24,
      height: 24,
      speed: 300, // pixels per second vertically
      frameTimer: 0,
      currentFrame: 0,
      facingLeft: false,
      isFrozen: false,
      frozenSpriteId: '',
      frozenFrame: 0,
      knockbackTimer: 0,
      isTrappedTimer: 0,
      trappedEntityId: -1,
      isMounted: false,
    };

    const keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      w: false,
      s: false,
      a: false,
      d: false,
    };

    let backgroundOffset = 0;
    const baseRunSpeed = BASE_RUN_SPEED; // pixels per second background scroll
    let distanceTraveled = 0;
    let timeRemaining = INITIAL_TIME_REMAINING; // 3 minutes 43 seconds
    let hasSpawnedDragon = false;
    let dragonSpawnTime = 30.0 + (Math.random() * 30.0); // 30s to 60s window natively
    let hasSpawnedStrider1 = false;
    let hasSpawnedStrider2 = false;
    let isCinematicOutro = false;
    let hasPlayedTaxiNode = false;
    let engineHalt = false;
    let outroTriggeredDistance = -1;
    
    let hasSpawnedQuestStart = false;
    let hasSpawnedQuestEnd = false;
    let tortoiseQuestFailed = false;
    
    let hasSpawnedChicken = false;
    let chickenQuestFailed = false;
    let questBonusPoints = 0;
    
    let hazardsHit = 0;
    let boostsCollected = 0;
    let pickupsCollected = 0;
    let nextPickupTime = INITIAL_TIME_REMAINING - 5.0; // Starting 5 seconds in
    let unspawnedPickups = [...INITIAL_UNSPAWNED_PICKUPS].sort(() => Math.random() - 0.5);
    
    let floatingTexts: { id: number, text: string, x: number, y: number, life: number, maxLife: number }[] = [];

    if (isPlaying) {
      // Map the debug skip function to the ref
      skipRef.current = () => {
        timeRemaining = Math.max(0.5, timeRemaining - 210.0);
      };
    }

    let globalIdCounter = 0;
    let entities: Entity[] = [];
    let spawnTimer = 1.0; // First obstacle in 1 second

    // Input listening
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
          if (isPlaying && !isGameOver) togglePause();
          e.preventDefault();
          return;
      }
      if (e.code === 'Space') {
         if (!player.isJumping && player.sitTimer <= 0 && isPlaying) {
            player.vz = 400; // Jump power
            player.isJumping = true;
         }
         e.preventDefault();
         return;
      }
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key as keyof typeof keys] = true;
        // Prevent default scrolling for arrow keys while focused on the game
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key as keyof typeof keys] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main loop
    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (isPausedRef.current) {
         animationFrameId = requestAnimationFrame(render);
         return;
      }

      // Animate Sprite Frame based on state constraints
      if (!player.isFrozen) {
          player.frameTimer += deltaTime;
      }

      // Unified animation speed
      let fpsThreshold = 1 / 24; // Default 24 FPS

      if (player.frameTimer >= fpsThreshold && !player.isFrozen) {
         let minFrame = 0;
         let maxFrame = 24; // 25 frames total
         
         // User requested Jump animation to snap to specific indices
         if (player.sitTimer > 0 && !player.isFrozen) {
            // Sit uses a custom mapped time sequence, so let currentFrame count up infinitely
            minFrame = 0;
            maxFrame = 999999;
         } else if (player.isJumping) {
            minFrame = 2; // Frame 3 (0-indexed)
            maxFrame = 14; // Frame 15 (0-indexed)
         } else {
            // Default running animation constraints
            minFrame = 0; // Frame 1 (0-indexed)
            maxFrame = 22; // Frame 23 (0-indexed)
         }

         player.currentFrame++;
         if (player.currentFrame < minFrame || player.currentFrame > maxFrame) {
             player.currentFrame = minFrame;
         }

         player.frameTimer -= fpsThreshold;
      }

      // Global Quest Failure Hook!
      if (player.knockbackTimer > 0 || player.sitTimer > 0) {
          const follower = entities.find(e => e.parentId === 10001 && e.isFollowing);
          if (follower) {
              follower.x = -9999; 
              follower.hit = true;
              tortoiseQuestFailed = true;
              const failSfx = createAudio('/sounds/igQuestFailed.ogg');
              failSfx.volume = 0.5;
              failSfx.play().catch(() => {});
          }
      }

      // Handle active tracking debuffs and buffs
      if (player.knockbackTimer > 0) {
          player.knockbackTimer -= deltaTime;
          player.x -= 400 * deltaTime; // physically shove player backward
          if (player.knockbackTimer < 0) player.knockbackTimer = 0;
      }
      if (player.isTrappedTimer > 0) {
          player.isTrappedTimer -= deltaTime;
          if (player.isTrappedTimer < 0) player.isTrappedTimer = 0;
      }
      if (player.sitTimer > 0) {
        player.sitTimer -= deltaTime;
        if (player.sitTimer <= 0) {
           player.sitTimer = 0;
           player.isFrozen = false;
        }
      }
      if (player.slowTimer > 0) {
        player.slowTimer -= deltaTime;
        if (player.slowTimer < 0) player.slowTimer = 0;
      }
      if (player.fastTimer > 0) {
        player.fastTimer -= deltaTime;
        if (player.fastTimer <= 0) {
            player.fastTimer = 0;
            if (player.isMounted) {
                player.isMounted = false;
            }
        }
      }

      let activePlayerSpeed = player.speed;
      let activeRunSpeed = isPlaying ? baseRunSpeed : 0;

      if (isCinematicOutro) {
          activePlayerSpeed = 0;
          player.facingLeft = false;
          
          const targetY = canvas.height / 2 - 12;
          player.y += (targetY - player.y) * 5 * deltaTime;
          
          if (townImg.complete && townImg.naturalWidth > 0) {
              const targetTownHeight = Math.min(canvas.height * 0.65, townImg.naturalHeight);
              const townRatio = targetTownHeight / townImg.naturalHeight;
              const townWidth = townImg.naturalWidth * townRatio;
              
              const targetStopX = canvas.width - townWidth + (townWidth * 0.1);
              const theoreticalScrollX = canvas.width + 100 - (distanceTraveled - outroTriggeredDistance);
              
              if (theoreticalScrollX <= targetStopX) {
                  activeRunSpeed = 0;
                  const physicalDoorX = targetStopX + (townWidth * 0.48) - 10;
                  if (player.x < physicalDoorX) {
                      player.x += baseRunSpeed * 1.5 * deltaTime;
                      if (player.x > physicalDoorX) player.x = physicalDoorX;
                  }
              }
          }
      } else {
          if (player.sitTimer > 0 || player.isTrappedTimer > 0) {
            activePlayerSpeed = 0;
            activeRunSpeed = 0;
          } else if (player.slowTimer > 0) {
            activePlayerSpeed *= 0.5;
            activeRunSpeed *= 0.5;
          } else if (player.fastTimer > 0) {
            activePlayerSpeed *= 1.6;
            activeRunSpeed *= 1.6;
          }

          if (player.knockbackTimer <= 0 && isPlaying) {
              const jX = joystickDeltaRef.current.x;
              const jY = joystickDeltaRef.current.y;
              
              const isMovingUp = keys.ArrowUp || keys.w || jY < -0.2;
              const isMovingDown = keys.ArrowDown || keys.s || jY > 0.2;
              const isMovingLeft = keys.ArrowLeft || keys.a || jX < -0.2;
              const isMovingRight = keys.ArrowRight || keys.d || jX > 0.2;

              if (isMovingUp) player.y -= activePlayerSpeed * deltaTime * (jY < -0.2 ? Math.abs(jY) : 1);
              if (isMovingDown) player.y += activePlayerSpeed * deltaTime * (jY > 0.2 ? Math.abs(jY) : 1);
              player.facingLeft = isMovingLeft && !isMovingRight;
              if (isMovingLeft) player.x -= activePlayerSpeed * deltaTime * (jX < -0.2 ? Math.abs(jX) : 1);
              if (isMovingRight) player.x += activePlayerSpeed * deltaTime * (jX > 0.2 ? Math.abs(jX) : 1);
          } else if (isPlaying) {
              // Force backflip pose while soaring backward
              player.facingLeft = false;
          }
      }
      
      // Update Player Z (Jumping)
      if (player.isJumping) {
        player.z += player.vz * deltaTime;
        player.vz -= 1400 * deltaTime; // Gravity
        if (player.z <= 0) {
           player.z = 0;
           player.vz = 0;
           player.isJumping = false;
        }
      }

      // Clamp player bounds tightly to canvas
      const skyHeight = SKY_HEIGHT; // 160 pixels (top 5 squares)
      // Visual padding to prevent floating in the sky zone
      const playerMinY = skyHeight + (96 * 0.35); 
      if (player.y < playerMinY) player.y = playerMinY;
      if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
      }
      
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
      }

      // Update background moving left (simulating player running right)
      backgroundOffset -= activeRunSpeed * deltaTime;

      // 1. Procedural Parallax Oasis Horizon
      
      // Sky Gradient (Dithered pixel-art bands for organic transition)
      const skyColors = SKY_COLORS;
      const bandHeight = Math.ceil(120 / skyColors.length);
      for (let i = 0; i < skyColors.length; i++) {
          ctx.fillStyle = skyColors[i];
          ctx.fillRect(0, i * bandHeight, canvas.width, bandHeight + 1);
          
          // Organic dithering (checkerboard fade into the upper band)
          if (i > 0) {
              ctx.fillStyle = skyColors[i - 1];
              for (let dx = 0; dx < canvas.width; dx += 4) {
                 ctx.fillRect(dx, i * bandHeight, 2, 2);
                 ctx.fillRect(dx + 2, i * bandHeight + 2, 2, 2);
              }
          }
      }

      // Distant Mountains (0.05x Parallax - Organic Sine Waves, true 2x2 density)
      const mtOffset = (backgroundOffset * 0.05) % 1000;
      const lmtOffset = mtOffset > 0 ? mtOffset - 1000 : mtOffset;
      const mSize = 2; // Strict 2x2 density mapped to the foreground art
      const f = (Math.PI * 2) / 1000; // Continuous looping frequency spanning 1000px bounds
      
      // Layer 1: Background Mountains (Lighter)
      ctx.fillStyle = '#5b21b6'; 
      for (let loop = 0; loop < Math.ceil(canvas.width / 1000) + 1; loop++) {
          let loopX = Math.floor(lmtOffset + loop * 1000);
          for (let x = 0; x < 1000; x += mSize) {
              let h = Math.sin(x * f) * 15 + Math.sin(x * f * 2.3) * 10 + Math.sin(x * f * 4.1) * 8 + 35;
              h = Math.floor(h / mSize) * mSize; 
              if (h > 0) ctx.fillRect(loopX + x, 120 - h, mSize + 1, h + 1); 
          }
      }

      // Layer 2: Foreground Mountains (Darker, overlapping)
      ctx.fillStyle = '#312e81'; 
      const mtOffsetFront = (backgroundOffset * 0.07) % 1000;
      const lmtOffsetFront = mtOffsetFront > 0 ? mtOffsetFront - 1000 : mtOffsetFront;
      
      for (let loop = 0; loop < Math.ceil(canvas.width / 1000) + 1; loop++) {
          let loopX = Math.floor(lmtOffsetFront + loop * 1000);
          for (let x = 0; x < 1000; x += mSize) {
              let h = Math.sin((x * f) + 2) * 22 + Math.sin((x * f * 3.7) + 1) * 12 + Math.sin((x * f * 6) + 3) * 5 + 25;
              h = Math.floor(h / mSize) * mSize; 
              
              if (h > 0) {
                  ctx.fillRect(loopX + x, 120 - h, mSize + 1, h + 1);
                  // Highlight Rim Texture
                  if (Math.floor(x / mSize) % 2 === 0) {
                      ctx.fillStyle = '#3f3c9e';
                      ctx.fillRect(loopX + x, 120 - h, mSize, mSize);
                      ctx.fillStyle = '#312e81'; 
                  }
              }
          }
      }

      // Ocean Water (Dithered gradient + noise)
      const waterY = 120;
      const waterHeight = skyHeight - waterY;
      const waterColors = WATER_COLORS;
      const wBand = Math.ceil(waterHeight / waterColors.length);
      
      for (let i = 0; i < waterColors.length; i++) {
          ctx.fillStyle = waterColors[i];
          ctx.fillRect(0, waterY + (i * wBand), canvas.width, wBand + 1);
          
          if (i > 0) {
              ctx.fillStyle = waterColors[i - 1];
              for (let dx = 0; dx < canvas.width; dx += 4) {
                 ctx.fillRect(dx, waterY + (i * wBand), 2, 2);
                 ctx.fillRect(dx + 2, waterY + (i * wBand) + 2, 2, 2);
              }
          }
      }
      
      // Wave hints
      ctx.fillStyle = '#7dd3fc';
      const waveOffset = (backgroundOffset * 0.1) % 120;
      const lwaveOffset = waveOffset > 0 ? waveOffset - 120 : waveOffset;
      for (let w = lwaveOffset; w < canvas.width; w += 120) {
          let flooredW = Math.floor(w);
          ctx.fillRect(flooredW, waterY + 6, 8, 2);
          ctx.fillRect(flooredW + 40, waterY + 18, 6, 2);
          ctx.fillRect(flooredW + 80, waterY + 28, 12, 2);
      }

      // Distant Sand Islands (0.15x Parallax - Organic Sine Formations)
      const islandOffset = (backgroundOffset * 0.15) % 1000;
      const lislandOffset = islandOffset > 0 ? islandOffset - 1000 : islandOffset;
      const iSize = 2; // Island structural density
      
      // Hardcoded explicit pixel-art Palm Tree mapping string for raw accuracy (2x2px)
      const palmSprite = PALM_SPRITE;

      const drawPalm = (ox: number, oy: number) => {
          for (let row = 0; row < palmSprite.length; row++) {
              for (let col = 0; col < palmSprite[row].length; col++) {
                  const char = palmSprite[row][col];
                  if (char === 'G') ctx.fillStyle = '#15803d'; // Green
                  else if (char === 'T') ctx.fillStyle = '#78350f'; // Trunk
                  else continue;
                  ctx.fillRect(ox + (col * 2), oy + (row * 2), 2, 2);
              }
          }
      };
      
      for (let loop = 0; loop < Math.ceil(canvas.width / 1000) + 1; loop++) {
          let loopX = Math.floor(lislandOffset + loop * 1000);
          
          // Island 1 (x: 100 to 350)
          for (let x = 100; x < 350; x += iSize) {
              let nx = (x - 100) / 250; 
              let h = Math.sin(nx * Math.PI) * 12; 
              h += Math.sin(nx * Math.PI * 4) * 3; 
              h = Math.floor(h / iSize) * iSize;
              
              if (h > 0) {
                  ctx.fillStyle = '#fcd34d'; 
                  ctx.fillRect(loopX + x, 142 - h, iSize + 1, h + 1);
                  ctx.fillStyle = '#d97706'; 
                  ctx.fillRect(loopX + x, 142 - iSize, iSize + 1, iSize + 1);
              }
          }
          drawPalm(loopX + 180, 118);
          drawPalm(loopX + 240, 115);

          // Island 2 (x: 650 to 800)
          for (let x = 650; x < 800; x += iSize) {
              let nx = (x - 650) / 150; 
              let h = Math.sin(nx * Math.PI) * 8 + Math.sin(nx * Math.PI * 3) * 2; 
              h = Math.floor(h / iSize) * iSize;
              
              if (h > 0) {
                  ctx.fillStyle = '#fcd34d'; 
                  ctx.fillRect(loopX + x, 142 - h, iSize + 1, h + 1);
                  ctx.fillStyle = '#d97706'; 
                  ctx.fillRect(loopX + x, 142 - iSize, iSize + 1, iSize + 1);
              }
          }
          drawPalm(loopX + 700, 126);
      }

      // 2. Draw Repeating Desert Floor
      const groundHeight = canvas.height - skyHeight;
      if (floorImg.complete && floorImg.naturalWidth > 0) {
          // Scale logic to preserve the visual texture while locking height
          const ratio = groundHeight / floorImg.naturalHeight;
          const renderWidth = Math.max(1024, floorImg.naturalWidth * Math.max(0.2, ratio)); 
          
          let localOffset = backgroundOffset % renderWidth;
          if (localOffset > 0) localOffset -= renderWidth; // guarantee negative shift
          
          try {
             // Draw enough tiles to safely cover dynamically resizing ultra-wide monitors
             ctx.drawImage(floorImg, 0, 0, floorImg.naturalWidth, floorImg.naturalHeight, localOffset, skyHeight, renderWidth, groundHeight);
             ctx.drawImage(floorImg, 0, 0, floorImg.naturalWidth, floorImg.naturalHeight, localOffset + renderWidth, skyHeight, renderWidth, groundHeight);
             ctx.drawImage(floorImg, 0, 0, floorImg.naturalWidth, floorImg.naturalHeight, localOffset + renderWidth * 2, skyHeight, renderWidth, groundHeight);
          } catch(e) {}
      } else {
          // Fallback if image not ready
          ctx.fillStyle = '#292524'; // Warm stone tint
          ctx.fillRect(0, skyHeight, canvas.width, groundHeight);
      }

      // Draw Troll Hut securely mapped to visual scrolling coordinates
      if (hutImg.complete && hutImg.naturalWidth > 0) {
          const targetHutHeight = Math.min(canvas.height * 0.45, hutImg.naturalHeight);
          const hutRatio = targetHutHeight / hutImg.naturalHeight;
          const hutWidth = hutImg.naturalWidth * hutRatio;
          
          // Mathematically slide it off mechanically against physical scroll data mapping the Center dynamically over Reapz!
          const scrollOffX = (canvas.width / 2) - (hutWidth * 0.73) - 450 - distanceTraveled;
          if (scrollOffX + hutWidth > 0) {
              try {
                  const hutY = (canvas.height / 2) - targetHutHeight + 25;
                  ctx.drawImage(hutImg, 0, 0, hutImg.naturalWidth, hutImg.naturalHeight, scrollOffX, hutY, hutWidth, targetHutHeight);
              } catch(e) {}
          }
      }
      
      // Draw Cinematic Outro Town physically natively perfectly
      if (isCinematicOutro && townImg.complete && townImg.naturalWidth > 0) {
          const targetTownHeight = Math.min(canvas.height * 0.65, townImg.naturalHeight);
          const townRatio = targetTownHeight / townImg.naturalHeight;
          const townWidth = townImg.naturalWidth * townRatio;
          
          let scrollOffX = canvas.width + 100 - (distanceTraveled - outroTriggeredDistance);
          const targetStopX = canvas.width - townWidth + (townWidth * 0.1);
          if (scrollOffX <= targetStopX) {
              scrollOffX = targetStopX;
          }
          
          if (scrollOffX + townWidth > 0) {
              try {
                  const townY = (canvas.height / 2) - targetTownHeight + 50;
                  ctx.drawImage(townImg, 0, 0, townImg.naturalWidth, townImg.naturalHeight, scrollOffX, townY, townWidth, targetTownHeight);
              } catch(e) {}
          }
          
          const physicalDoorX = targetStopX + (townWidth * 0.48) - 10;
          
          if (!hasPlayedTaxiNode && scrollOffX === targetStopX && player.x >= physicalDoorX - 150) {
              hasPlayedTaxiNode = true;
              const taxiSfx = createAudio('/sounds/igNewTaxiNodeDiscovered.ogg');
              taxiSfx.volume = 0.5;
              taxiSfx.play().catch(() => {});
          }

          if (scrollOffX === targetStopX && player.x >= physicalDoorX) {
             if (player.isMounted) player.isMounted = false;
             if (!engineHalt) {
                 setIsGameOver(true);
                 engineHalt = true;
             }
          }
      }

      // Pre-compute Player drawing logic for pixel-perfect collision tests
      let pSpriteSheet = runImg;
      if (player.isFrozen) {
          if (player.frozenSpriteId === 'sit') pSpriteSheet = sitImg;
          else if (player.frozenSpriteId === 'jump') pSpriteSheet = jumpImg;
          else if (player.frozenSpriteId === 'idle') pSpriteSheet = idleImg;
          else pSpriteSheet = runImg;
      } else {
          if (player.isMounted) pSpriteSheet = rideImg;
          else if (player.isTrappedTimer > 0) pSpriteSheet = idleImg;
          else if (player.sitTimer > 0) pSpriteSheet = sitImg;
          else if (player.isJumping) pSpriteSheet = jumpImg;
          else if (activeRunSpeed === 0 && (!isCinematicOutro || engineHalt)) pSpriteSheet = idleImg;
      }

      let pDrawnFrame = player.isFrozen ? player.frozenFrame : player.currentFrame;
      if (player.isMounted) {
          pDrawnFrame = 18;
      } else if (player.sitTimer > 0 && !player.isFrozen) {
          if (player.currentFrame === 0) pDrawnFrame = 0;
          else if (player.currentFrame === 1) pDrawnFrame = 9;
          else if (player.currentFrame === 2) pDrawnFrame = 18;
          else {
              const tick = Math.floor((player.currentFrame - 3) / 2);
              const pp = tick % 4;
              pDrawnFrame = pp <= 2 ? 22 + pp : 22 + (4 - pp);
          }
      }
      
      const pDrawW = 96;
      const pDrawH = 96;
      const pDrawX = player.x - (pDrawW / 2) + (player.width / 2);
      const pDrawY = player.y - player.z - pDrawH + player.height + 4;
      const pSourceX = (pDrawnFrame % 5) * (1280 / 5);
      const pSourceY = Math.floor(pDrawnFrame / 5) * (1280 / 5);

      // Master Spawn Controller
      if (isPlaying && timeRemaining > 0) {
          spawnTimer -= deltaTime;
      }
      if (spawnTimer <= 0 && isPlaying && timeRemaining > 0) {
        let forceStrider = false;
        if (timeRemaining <= 180 && timeRemaining > 120 && !hasSpawnedStrider1) {
            if (timeRemaining < 125 || Math.random() < 0.1) forceStrider = true;
        }
        if (timeRemaining <= 60 && timeRemaining > 30 && !hasSpawnedStrider2) {
            if (timeRemaining < 35 || Math.random() < 0.1) forceStrider = true;
        }

        let npcType;
        if (forceStrider) {
            npcType = npcTypes.find(n => n.id === 'Strider')!;
            if (timeRemaining > 120) hasSpawnedStrider1 = true;
            else hasSpawnedStrider2 = true;
        } else {
            const allowedEnemies = npcTypes.filter(n => n.id !== 'Bullet' && n.id !== 'Wringing Thorns' && n.id !== 'Dragon' && n.id !== 'Strider' && n.id !== 'Tortoise' && n.id !== 'Robot Chicken' && !n.isPickup);
            npcType = allowedEnemies[Math.floor(Math.random() * allowedEnemies.length)];
        }
        
        let width = 24;
        let height = 24;
        let startState: 'walk' | 'idle' = npcType.walk ? 'walk' : 'idle';
        if (npcType.walk && npcType.idle && Math.random() > 0.5) startState = 'idle';

        // Expanded Hitboxes based on NPC type
        if (npcType.id === 'Hyena') {
            width = 16; // Slightly reduced from 24
            height = 16;
        } else if (npcType.id === 'Bog Lord') {
            width = 48; // Increased from 24
            height = 48;
        } else if (npcType.id === 'Sea giant') {
            width = 80; // Greatly increased from 24
            height = 80;
        }

        // Calculate a safe minimum Y spawn so scaled sprites don't visually float in the sky 
        const scaleMod = npcType.scaleModifier || 1;
        const minSpawnY = skyHeight + ((96 * scaleMod) * 0.35); 

        // Local pacing speed (-X is walking left, +X is walking right). Scaled 2x.
        let localSpeedX = startState === 'walk' ? (Math.random() * 220 - 140) : 0;
        let localSpeedY = 0;
        if (startState === 'walk') {
            if (npcType.id === 'Roc') {
                localSpeedX = 0; // Rocs do not pace horizontally
                localSpeedY = Math.random() > 0.5 ? 90 : -90; // Start pacing Y
            } else if (npcType.id === 'Stinger') {
                localSpeedX = Math.random() * 160 - 100; // Normal wandering
                localSpeedY = Math.random() * 80 - 40;
            }
        }
        
        const newEntityY = minSpawnY + Math.random() * Math.max(0, canvas.height - minSpawnY - height);
        const spawnX = npcType.id === 'Bog Lord' ? canvas.width + 250 : canvas.width + 50;

        entities.push({
          id: globalIdCounter++,
          enragedTimer: 0,
          childSpawnTimer: npcType.id === 'Silithid' ? -1.0 : 0, 
          x: spawnX,
          y: newEntityY,
          width,
          height,
          hit: false,
          type: 'sit_hazard', // All NPCs force 2 second sit
          npcType,
          state: startState,
          stateTimer: 1.0 + Math.random() * 3.0,
          localSpeedX,
          localSpeedY,
          facingLeft: localSpeedX < 0 || localSpeedX === 0, // default facing left if standing still
          sprite: (startState === 'walk' ? npcType.walk : npcType.idle)!,
          currentFrame: Math.floor(Math.random() * 25),
          frameTimer: 0
        });

        // Bog Lord spawns 3 Wringing Thorns in the area around him automatically
        if (npcType.id === 'Bog Lord') {
            const thornType = npcTypes.find(n => n.id === 'Wringing Thorns');
            if (thornType) {
                for(let t=0; t<3; t++) {
                    const tY = minSpawnY + Math.random() * Math.max(0, canvas.height - minSpawnY - 40);
                    entities.push({
                        id: globalIdCounter++,
                        enragedTimer: 0,
                        childSpawnTimer: 0,
                        x: spawnX + (Math.random() * 300 - 150),
                        y: tY,
                        width: 40, // thorns have smaller functional hitbox logic
                        height: 40,
                        hit: false,
                        type: 'sit_hazard',
                        npcType: thornType,
                        state: 'idle',
                        stateTimer: 999, // stationary logic limits AI swapping
                        localSpeedX: 0,
                        localSpeedY: 0,
                        facingLeft: true,
                        sprite: thornType.idle!,
                        currentFrame: Math.floor(Math.random() * 25),
                        frameTimer: 0
                    });
                }
            }
        }
        
        // Slower spawn timer so the screen isn't entirely flooded with instant sits
        spawnTimer = 1.0 + Math.random() * 2.5; 
      }

      // Draw and Update Entities
      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        
        // Handle explicit Toroise overriding Logic cleanly structurally seamlessly!
        if (ent.npcType.id === 'Tortoise' && (ent.isFollowing || ent.isRunningToTarget)) {
            let targetX = player.x - 70;
            let targetY = player.y;
            
            if (ent.isRunningToTarget) {
                const questEnd = entities.find(e => e.parentId === 10002);
                if (questEnd) {
                    targetX = questEnd.x + questEnd.width / 2;
                    targetY = questEnd.y;
                    
                    const distCheck = Math.hypot(targetX - ent.x, targetY - ent.y);
                    if (distCheck < 50) {
                        floatingTexts.push({ id: globalIdCounter++, text: '+150', x: ent.x + ent.width / 2, y: ent.y - 40, life: 2.0, maxLife: 2.0 });
                        ent.x = -9999; // Yeet seamlessly cleanly!
                        questEnd.x = -9999;
                        ent.hit = true;
                        questEnd.hit = true;
                        questBonusPoints += 150; 
                        const completionSfx = createAudio('/sounds/iQuestComplete.ogg');
                        completionSfx.volume = 0.5;
                        completionSfx.play().catch(() => {});
                    }
                }
            }

            const activePlayerSpeed = 300; 
            const tortoiseSpeed = activePlayerSpeed * 0.9;
            const dist = Math.hypot(targetX - ent.x, targetY - ent.y);
            
            if (dist > 5) {
                ent.x += ((targetX - ent.x) / dist) * tortoiseSpeed * deltaTime;
                ent.y += ((targetY - ent.y) / dist) * tortoiseSpeed * deltaTime;
            }
            
            if (ent.isRunningToTarget) {
                ent.facingLeft = ((targetX - ent.x) < 0);
            } else if (dist > 5 && Math.abs(targetX - ent.x) > 5) {
                ent.facingLeft = ((targetX - ent.x) < 0);
            } else {
                ent.facingLeft = player.facingLeft;
            }

            const isPlayerOperating = (activeRunSpeed > 0 || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || keys.w || keys.a || keys.s || keys.d || joystickDeltaRef.current.x !== 0 || joystickDeltaRef.current.y !== 0) && player.sitTimer <= 0 && player.knockbackTimer <= 0 && !isCinematicOutro;

            if (ent.isRunningToTarget || dist > 5 || isPlayerOperating) {
                ent.state = 'walk';
                ent.sprite = ent.npcType.walk!;
            } else {
                ent.state = 'idle';
                ent.sprite = ent.npcType.idle!;
            }
            // Universally bind the frame counter to the literal engine tick of the player's active physical frame, avoiding any discrete de-syncing gaps during interpolation 
            ent.currentFrame = player.currentFrame;
        } else if (ent.npcType.id === 'Robot Chicken' && ent.parentId === 10003 && ent.isFollowing) {
            ent.facingLeft = false; 
            ent.state = 'walk';
            ent.sprite = ent.npcType.walk!;
            
            // Scale native pacing speed dynamically so it never natively outruns a perfectly pacing player
            if (!ent.isRunningToTarget) {
                ent.localSpeedX = player.isMounted ? 320 : 200;
            }

            // If it visibly out-paces the screen natively, fail out
            if (ent.x > canvas.width && !ent.isRunningToTarget && !chickenQuestFailed) {
                chickenQuestFailed = true;
                ent.x = -9999;
                const failSfx = createAudio('/sounds/igQuestFailed.ogg');
                failSfx.volume = 0.5;
                failSfx.play().catch(() => {});
            }
            ent.x -= (activeRunSpeed + -ent.localSpeedX) * deltaTime;
            ent.y += ent.localSpeedY * deltaTime;
        } else {
            // Background flows left, local pacing speed adds to the vector
            ent.x -= (activeRunSpeed + -ent.localSpeedX) * deltaTime;
            ent.y += ent.localSpeedY * deltaTime;
        }
        
        if (ent.localSpeedY !== 0) {
            const scaleMod = ent.npcType.scaleModifier || 1;
            const minSafeY = skyHeight + ((96 * scaleMod) * 0.35);
            if (ent.y < minSafeY) {
                ent.y = minSafeY;
                ent.localSpeedY *= -1; // Bounce off invisible sky limit
            }
            if (ent.y + ent.height > canvas.height) {
                ent.y = canvas.height - ent.height;
                ent.localSpeedY *= -1; // Bounce off bottom rim
            }
        }
        
        // Dynamically Spawn Baby Silithids!
        if (!isCinematicOutro && ent.npcType.id === 'Silithid' && !ent.isBaby && ent.childSpawnTimer !== 0) {
            if (ent.childSpawnTimer === -1.0) {
                // Wait until the mother is fully visible on screen before spawning the first baby
                if (ent.x + ent.width < canvas.width) {
                    ent.childSpawnTimer = 0.01; // Trigger instantly next tick
                }
            } else {
                ent.childSpawnTimer -= deltaTime;
                if (ent.childSpawnTimer <= 0) {
                    entities.push({
                      id: globalIdCounter++,
                      parentId: ent.id,
                      isBaby: true,
                      enragedTimer: 0,
                      childSpawnTimer: 0,
                      x: ent.x + ent.width / 2, // Spawn physically out of mother
                      y: ent.y + ent.height / 2,
                      width: 24, // Tighter hitbox
                      height: 24,
                      hit: false,
                      type: 'sit_hazard',
                      npcType: { ...ent.npcType, scaleModifier: 0.5 }, // Scaled down overlay 
                      state: 'walk',
                      stateTimer: 1.0 + Math.random() * 3.0,
                      localSpeedX: Math.random() * 220 - 140, // random local pacing
                      localSpeedY: Math.random() * 80 - 40,
                      facingLeft: true,
                      sprite: ent.npcType.walk || ent.sprite,
                      currentFrame: Math.floor(Math.random() * 25),
                      frameTimer: 0
                    });
                    
                    // Chance to spawn exactly one more baby later
                    if (Math.random() > 0.5) {
                        ent.childSpawnTimer = Math.random() * 3.0 + 2.0; 
                    } else {
                        ent.childSpawnTimer = 0; // Never spawn again
                    }
                }
            }
        }

        const scaleMod = ent.npcType.scaleModifier || 1;
        const drawWidth = 96 * scaleMod;
        const visualRightEdge = ent.x + (drawWidth / 2) + (ent.width / 2);
        
        if (visualRightEdge < 0) {
          entities.splice(i, 1);
          continue;
        }

        // Collision Check based on the drawn "pixels area" footprint
        if (!ent.hit) {
          // Establish entity drawn bounds
          const scaleMod = ent.npcType.scaleModifier || 1;
          let eDrawW = 96 * scaleMod; 
          let eDrawH = 96 * scaleMod;
          
          let eDrawX = ent.x - (eDrawW / 2) + (ent.width / 2);
          let eDrawY = ent.y - eDrawH + ent.height + 4; 

          // Procedural explicit boundaries (Bullet geometric parity)
          if (ent.npcType.id === 'Bullet') {
              eDrawW = ent.width;
              eDrawH = ent.height;
              eDrawX = ent.x;
              eDrawY = ent.y;
          }

          // Entity Head Bypass Offset (For towering giants)
          let enemyHeadMargin = 0;
          if (ent.npcType.id === 'Sea giant') enemyHeadMargin = 100;
          else if (ent.npcType.id === 'Wringing Thorns') enemyHeadMargin = 60 * scaleMod; // Thorns are grounded traps
          else if (ent.npcType.id === 'Basilisk') enemyHeadMargin = 45 * scaleMod; // Horizontally shaped grounded lizard
          else if (ent.npcType.id === 'Roc') enemyHeadMargin = 40 * scaleMod; // Cut through empty upper wingspan area
          else if (ent.npcType.id === 'Silithid') enemyHeadMargin = 35 * scaleMod;
          else if (ent.npcType.id === 'Hyena') enemyHeadMargin = 35 * scaleMod; // Quadrupedal
          else if (ent.npcType.id === 'Stinger') enemyHeadMargin = 30 * scaleMod;
          else if (ent.npcType.id === 'Bog Lord') enemyHeadMargin = 25 * scaleMod;
          else if (ent.npcType.id === 'Pirate') enemyHeadMargin = 20 * scaleMod;
          
          let enemyFootMargin = 0;
          if (ent.npcType.id === 'Sea giant') enemyFootMargin = 30 * scaleMod; // Pull bottom boundary upwards from empty ocean floor/toe shadows
          else if (ent.npcType.id === 'Stinger') enemyFootMargin = 20 * scaleMod; // Pull up from drop shadows below flyer
          else if (ent.npcType.id === 'Basilisk') enemyFootMargin = 30 * scaleMod; // Extra-heavy bottom trimming for horizontal lizard
          
          const hitEDrawY = eDrawY + enemyHeadMargin;
          const hitEDrawH = eDrawH - enemyHeadMargin - enemyFootMargin;

          // Player Head Bypass Offset
          const headMargin = 30; // Shave 30 active pixels off the character's top drawing bounds
          const hitPDrawY = pDrawY + headMargin;
          const hitPDrawH = pDrawH - headMargin;

          // Horizontal Insets
          const hitPX = pDrawX + 30;
          const hitPW = pDrawW - 60;
          
          let eInsetX = 30 * scaleMod;
          if (ent.npcType.id === 'Bullet') eInsetX = 0; // Bypass custom geometric parity
          else if (ent.npcType.id === 'Wringing Thorns') eInsetX = 50 * scaleMod; // Thorns have wide transparent edges
          
          const hitEX = eDrawX + eInsetX;
          const hitEW = eDrawW - (eInsetX * 2);

          // 1. Broad Phase AABB collision on the visual footprint (Disabled absolutely cleanly structurally perfectly during Outro sequence!)
          if (!isCinematicOutro && hitPX < hitEX + hitEW && hitPX + hitPW > hitEX && 
              hitPDrawY < hitEDrawY + hitEDrawH && hitPDrawY + hitPDrawH > hitEDrawY) {
            
              // Fast-track simple procedural geometries
              if (ent.npcType.id === 'Bullet' && !ent.hit) {
                  ent.hit = true;
                  player.knockbackTimer = 0.5; // Short half-second airtime
                  player.isJumping = true;
                  player.vz = 400; // Propel physically backwards and upwards!
                  player.sitTimer = 0; // Do not apply hard sit stun
                  player.isFrozen = false;
                  hazardsHit++;
              }
              // 2. Strict Fast-Track Broad Phase AABB Override
              else if (ent.npcType.id !== 'Dragon' && player.knockbackTimer <= 0) {
                          ent.hit = true;
                          
                          if (ent.npcType.isPickup) {
                              pickupsCollected++;
                              floatingTexts.push({ id: globalIdCounter++, text: '+50', x: ent.x + ent.width / 2, y: ent.y, life: 1.5, maxLife: 1.5 });
                              const pickupSounds = ['LootCoinSmall', 'PutDownGems', 'iMoneyDialogOpen', 'iMoneyDialogClose'];
                              const sfx = createAudio(`/sounds/${pickupSounds[Math.floor(Math.random() * pickupSounds.length)]}.ogg`);
                              sfx.volume = 0.3;
                              sfx.play().catch(() => {});
                              continue;
                          }
                          
                          if (ent.npcType.id === 'Strider') {
                              player.isMounted = true;
                              player.fastTimer = 30.0;
                              const sfx = createAudio('/sounds/MechaStriderAggro.ogg');
                              sfx.volume = 0.3;
                              sfx.play().catch(() => {});
                              continue;
                          }
                          if (ent.npcType.id === 'Robot Chicken' && ent.parentId === 10003) {
                              ent.hit = false;
                              if (!ent.isFollowing && !ent.isRunningToTarget) {
                                  ent.isFollowing = true;
                                  ent.localSpeedX = 200; // Match passive player speed mathematically
                                  const sfx = createAudio('/sounds/iQuestActivate.ogg');
                                  sfx.volume = 0.4;
                                  sfx.play().catch(() => {});
                                  
                                  const chickenSfx = createAudio('/sounds/ChickenA.ogg');
                                  chickenSfx.volume = 0.5;
                                  chickenSfx.play().catch(() => {});
                              }
                              continue;
                          }

                          if (ent.npcType.id === 'Tortoise') {
                              if (ent.parentId === 10001) {
                                  ent.hit = false; // Always restore physical render boundary on player collision
                                  
                                  if (!ent.isFollowing && !ent.isRunningToTarget) {
                                      const sfx = createAudio('/sounds/iQuestActivate.ogg');
                                      sfx.volume = 0.4;
                                      sfx.play().catch(() => {});
                                      
                                      const questEnd = entities.find(e => e.parentId === 10002);
                                      if (questEnd) {
                                          ent.isRunningToTarget = true;
                                      } else {
                                          ent.isFollowing = true;
                                      }
                                  }
                              }
                              if (ent.parentId === 10002) {
                                  ent.hit = false; 
                              }
                              continue;
                          }
                          
                          // Custom AI Traps
                          if (ent.isBaby && ent.parentId !== undefined) {
                              // Enrage the Mother!
                              const mother = entities.find(e => e.id === ent.parentId);
                              if (mother) {
                                  if (mother.enragedTimer <= 0) {
                                      const sfx = createAudio('/sounds/mSilithidWaspAggroA.ogg');
                                      sfx.volume = 0.3;
                                      sfx.play().catch(() => {});
                                  }
                                  mother.enragedTimer = 10.0;
                              }
                              // Baby silithids do not punish the player
                              continue;
                          }

                           const hitSounds = ['2hMaceMetalHitFlesh1A', 'UnarmedAttackMediumA', 'UnarmedAttackMediumB', 'UnarmedAttackMediumC'];
                           const hitSfx = createAudio(`/sounds/${hitSounds[Math.floor(Math.random() * hitSounds.length)]}.ogg`);
                           hitSfx.volume = 0.3;
                           hitSfx.play().catch(() => {});

                          player.isMounted = false;
                          player.fastTimer = 0;
                          player.slowTimer = 0;

                          if (ent.npcType.id === 'Wringing Thorns') {
                              player.x = ent.x + ent.width / 2 - player.width / 2;
                              player.y = ent.y + ent.height / 2 - player.height / 2;
                              
                              const sfxRoots = createAudio('/sounds/EntanglingRoots.ogg');
                              sfxRoots.volume = 0.3;
                              sfxRoots.play().catch(() => {});
                              
                              const sfxTroll = createAudio('/sounds/TrollMaleMainAttackC.ogg');
                              sfxTroll.volume = 0.3;
                              sfxTroll.play().catch(() => {});
                              
                              player.isTrappedTimer = 4.0;
                              player.trappedEntityId = ent.id;
                              player.sitTimer = 0;
                              player.isFrozen = false;
                          } else if (ent.npcType.id === 'Sea giant') {
                              player.knockbackTimer = 1.0;
                              player.isJumping = true;
                              player.vz = 800; // Super jump!
                              player.sitTimer = 0; // Ensure no sit override 
                              player.isFrozen = false;
                          } else if (ent.npcType.id === 'Basilisk') {
                              if (!player.isFrozen) {
                                  // Cache visual state exactly as it was!
                                  player.frozenSpriteId = (pSpriteSheet === sitImg ? 'sit' : pSpriteSheet === jumpImg ? 'jump' : pSpriteSheet === idleImg ? 'idle' : 'run');
                                  player.frozenFrame = pDrawnFrame;
                              }
                              player.sitTimer = 5.0;
                              player.isFrozen = true;
                          } else {
                              player.sitTimer = 2.0; 
                              player.isFrozen = false;
                              player.currentFrame = 0; // Reset counter for custom hit ticks
                          }
                          hazardsHit++; 
              }
          }
        }

         // Hyena Aggro Override
         let isAggro = false;
         if (!isCinematicOutro && ent.npcType.id === 'Hyena' && !ent.hit) {
             const dx = (player.x + player.width/2) - (ent.x + ent.width/2);
             const dy = (player.y + player.height/2) - (ent.y + ent.height/2);
             const distance = Math.sqrt(dx * dx + dy * dy);
             
             if (distance < 250) {
                 if (!ent.hasPlayedAggroSound) {
                     ent.hasPlayedAggroSound = true;
                     const sfx = createAudio('/sounds/HyenaAggroA.ogg');
                     sfx.volume = 0.3;
                     sfx.play().catch(() => {});
                 }
                 isAggro = true;
                 ent.state = 'walk';
                 ent.stateTimer = 1.0; 
                 if (ent.npcType.walk) ent.sprite = ent.npcType.walk;
                 
                 const aggroSpeed = 150; // Pixels per second (matches standard pacing speed)
                 ent.y += (dy / distance) * aggroSpeed * deltaTime;
                 
                 // Constrain Y geometry just like spawn so it doesn't float
                 const scaleMod = ent.npcType.scaleModifier || 1;
                 const minSafeY = skyHeight + ((96 * scaleMod) * 0.35);
                 if (ent.y < minSafeY) ent.y = minSafeY;
                 if (ent.y + ent.height > canvas.height) ent.y = canvas.height - ent.height;
                 
                 // Push localSpeedX to combat the implicit floor-scrolling deduction
                 ent.localSpeedX = ((dx / distance) * aggroSpeed) + activeRunSpeed;
                 ent.facingLeft = dx < 0; 
             }
         }

         // Mother Silithid Enraged Override
         if (ent.enragedTimer > 0) {
             ent.enragedTimer -= deltaTime;
             if (player.sitTimer > 0 || player.knockbackTimer > 0) {
                 ent.enragedTimer = 0; // Cancel enrage once player is punished
             } else {
                 isAggro = true;
                 ent.state = 'walk';
                 ent.stateTimer = 1.0;
                 if (ent.npcType.walk) ent.sprite = ent.npcType.walk;
                 
                 const dx = (player.x + player.width/2) - (ent.x + ent.width/2);
                 const dy = (player.y + player.height/2) - (ent.y + ent.height/2);
                 const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                 
                 const aggroSpeed = 400; // Terrifyingly fast Mother
                 ent.y += (dy / distance) * aggroSpeed * deltaTime;
                 
                 const scaleMod = ent.npcType.scaleModifier || 1;
                 const minSafeY = skyHeight + ((96 * scaleMod) * 0.35);
                 if (ent.y < minSafeY) ent.y = minSafeY;
                 if (ent.y + ent.height > canvas.height) ent.y = canvas.height - ent.height;
                 
                 ent.localSpeedX = ((dx / distance) * aggroSpeed) + activeRunSpeed;
                 ent.facingLeft = dx < 0; 
             }
         }

         // Process AI State
         ent.stateTimer -= deltaTime;
         if (!isAggro && ent.stateTimer <= 0) {
             if (ent.npcType.walk && ent.npcType.idle) {
                 ent.state = ent.state === 'walk' ? 'idle' : 'walk';
             } else if (ent.npcType.walk) {
                 ent.state = 'walk';
             } else {
                 ent.state = 'idle';
             }
             ent.stateTimer = 1.0 + Math.random() * 3.0; // 1 to 4 seconds before state switch
             
             // Walking speed logic (-X faces left, moves closer to player. +X runs away right)
             // Default is 0 when idle
             let localSpeedX = 0;
             let localSpeedY = 0;
             if (ent.state === 'walk') {
                 if (ent.npcType.id === 'Roc') {
                     localSpeedY = Math.random() > 0.5 ? 90 : -90; 
                 } else if (ent.npcType.id === 'Stinger') {
                     if (Math.random() < 0.25) { 
                         // 25% chance to furiously ZOOM diagonally
                         localSpeedX = Math.random() > 0.5 ? 350 : -350;
                         localSpeedY = Math.random() > 0.5 ? 250 : -250;
                     } else {
                         localSpeedX = Math.random() * 160 - 100; // Calm wandering
                         localSpeedY = Math.random() * 80 - 40;
                     }
                 } else {
                     localSpeedX = Math.random() * 220 - 140; // Bias towards moving left, speed doubled
                 }
             }
             ent.localSpeedX = localSpeedX;
             ent.localSpeedY = localSpeedY;

             // Determine facing based on local movement
             if (localSpeedX !== 0) {
                 ent.facingLeft = localSpeedX < 0;
             } else {
                 // Even if idle, generally look left towards the player
                 ent.facingLeft = true;
             }

             // Snap the active sprite layer
             ent.sprite = (ent.state === 'walk' ? ent.npcType.walk : ent.npcType.idle)!;
         }

         // Animate Entity Sprite
         ent.frameTimer += deltaTime;
         const baseFPS = 1 / 24;
         const finalFPS = ent.npcType.fpsModifier ? baseFPS / ent.npcType.fpsModifier : baseFPS;
         
         if (ent.frameTimer >= finalFPS) {
             ent.currentFrame++;
             
             if (ent.npcType.id === 'Pirate') {
                 ent.currentFrame = ent.currentFrame % 10; // Truncate explicitly to first 10 sprite frames
                 // Check if animation just rolled onto Frame 1
                 if (!ent.hit && !isCinematicOutro && ent.currentFrame === 1 && ent.x > 0 && ent.x + ent.width < canvas.width) {
                     // Execute procedural gunfire SFX payload bypassing cache locks
                     const sfx = createAudio(`/sounds/GunFire0${Math.floor(Math.random() * 3) + 1}.ogg`);
                     sfx.volume = 0.1;
                     sfx.play().catch(() => {});
                     
                     entities.push({
                        id: globalIdCounter++,
                        parentId: ent.id,
                        isBaby: true, 
                        enragedTimer: 0,
                        childSpawnTimer: 0,
                        x: ent.x - 42, 
                        y: ent.y - 73, 
                        width: 4, // Final smallest physical collision box
                        height: 4,
                        hit: false,
                        type: 'sit_hazard',
                        npcType: { id: 'Bullet' }, 
                        state: 'walk',
                        stateTimer: 99.0,
                        localSpeedX: -600, 
                        localSpeedY: 0,
                        facingLeft: true,
                        sprite: null as any, 
                        currentFrame: 0,
                        frameTimer: 0
                     });
                 }
             }
             else if (ent.npcType.id !== 'Wringing Thorns') {
                 ent.currentFrame = ent.currentFrame % 25;
             } else {
                 ent.currentFrame = ent.currentFrame % 38; // Ping-pong bounds strictly 0-19 and back
             }
             
             ent.frameTimer -= finalFPS;
         }

      } // End Entity Logic Loop

      // DEPTH SORTED RENDERING (Y-Sorting based on bottom edge of hitbox)
      // We collect all entities + the player, sort them by y, and draw them from top to bottom
      const renderables: any[] = [
         { type: 'player', ref: player, depth: player.y + player.height },
         ...entities.filter(e => !e.hit || (e.npcType.id === 'Wringing Thorns' && player.isTrappedTimer > 0 && e.id === player.trappedEntityId)).map(e => ({ type: 'npc', ref: e, depth: e.y + e.height }))
      ];
      renderables.sort((a, b) => a.depth - b.depth);

      for (const item of renderables) {
         if (item.type === 'npc') {
             const ent = item.ref;
             if (ent.sprite && ent.sprite.complete) {
                 ctx.save();
                 
                 // Assassin Stealth Mechanic
                 if (ent.npcType.id === 'Assassin') {
                     const dx = (player.x + player.width/2) - (ent.x + ent.width/2);
                     const dy = (player.y + player.height/2) - (ent.y + ent.height/2);
                     const distance = Math.sqrt(dx * dx + dy * dy);
                     
                     // Visible radius bounds
                     const fadeStartDist = 400; // Starts becoming visible
                     const fullyVisibleDist = 150; // 100% visible
                     
                     if (distance > fadeStartDist) {
                         ctx.globalAlpha = 0.0;
                     } else {
                         if (distance > fullyVisibleDist) {
                             ctx.globalAlpha = 1.0 - ((distance - fullyVisibleDist) / (fadeStartDist - fullyVisibleDist));
                         }

                         // Only play specific transition asset precisely once as transparency breaks
                         if (!ent.hasPlayedStealthSound) {
                             ent.hasPlayedStealthSound = true;
                             const sfx = createAudio('/sounds/Stealth.ogg');
                             sfx.volume = 0.25;
                             sfx.play().catch(() => {});
                         }
                     }
                 }
                 
                 const drawFrame = ent.npcType.id === 'Wringing Thorns' ? (ent.currentFrame <= 19 ? ent.currentFrame : 38 - ent.currentFrame) : ent.currentFrame;
                 const col = drawFrame % 5;
                 const row = Math.floor(drawFrame / 5);
                 const frameWidth = 1280 / 5;
                 const frameHeight = 1280 / 5;

                 // Scale logic
                 const scaleMod = ent.npcType.scaleModifier || 1;
                 const drawWidth = 96 * scaleMod; 
                 const drawHeight = 96 * scaleMod;
                 const drawX = ent.x - (drawWidth / 2) + (ent.width / 2);
                 const drawY = ent.y - drawHeight + ent.height + 4; 

                 let bobbingY = 0;
                 if (ent.npcType.isPickup) {
                     bobbingY = Math.sin((time + ent.id * 100) / 200) * 8; 
                     ctx.shadowBlur = 25;
                     ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
                 }
                 
                 ctx.translate(drawX + drawWidth / 2, drawY + drawHeight / 2 + bobbingY);
                 const shouldFlip = ent.facingLeft !== !!ent.npcType.flipDefault;
                 if (shouldFlip) {
                     ctx.scale(-1, 1);
                 }
                 
                 if (ent.npcType.isPickup) {
                     ctx.drawImage(ent.sprite, 0, 0, ent.sprite.naturalWidth, ent.sprite.naturalHeight, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                     ctx.shadowBlur = 0; // Reset
                 } else {
                     ctx.drawImage(ent.sprite, col * frameWidth, row * frameHeight, frameWidth, frameHeight, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                 }
                 
                 // Procedural Help Marker (Bouncing Green Arrow)
                 if (ent.npcType.id === 'Strider') {
                     const bobbingOffset = Math.sin(time / 150) * 8; // Organic vertical wave translation
                     const arrowY = (-drawHeight / 2) - 30 + bobbingOffset; // Mapped inherently cleanly above the frame bounds
                     
                     ctx.fillStyle = '#22c55e'; // Bright active green highlight
                     ctx.beginPath();
                     ctx.moveTo(0, arrowY + 12);     // Bottom Point
                     ctx.lineTo(-12, arrowY - 2);    // Left Edge
                     ctx.lineTo(-5, arrowY - 2);     // Left Inner Shaft Core
                     ctx.lineTo(-5, arrowY - 16);    // Top Left Root
                     ctx.lineTo(5, arrowY - 16);     // Top Right Root
                     ctx.lineTo(5, arrowY - 2);      // Right Inner Shaft Core
                     ctx.lineTo(12, arrowY - 2);     // Right Edge
                     ctx.closePath();
                     ctx.fill();
                     
                     ctx.lineWidth = 2;
                     ctx.strokeStyle = '#022c22'; // High contrast primitive framing
                     ctx.stroke();
                 }

                 // Quest Interaction Icons seamlessly cleanly rendered
                 if (ent.npcType.id === 'Robot Chicken' && ent.parentId === 10003 && !ent.isFollowing) {
                     const bobbingOffset = Math.sin(time / 150) * 8; 
                     const markY = (-drawHeight / 2) - 30 + bobbingOffset;
                     
                     ctx.save();
                     if (shouldFlip) ctx.scale(-1, 1);
                     ctx.fillStyle = '#fde047'; 
                     ctx.font = 'bold 64px monospace'; 
                     ctx.textAlign = 'center';
                     ctx.shadowBlur = 10;
                     ctx.shadowColor = '#000000';
                     ctx.fillText('!', 0, markY);
                     ctx.restore();
                 }

                 if (ent.npcType.id === 'Tortoise') {
                     if (ent.parentId === 10001 && !ent.isFollowing && !ent.isRunningToTarget) {
                         const bobbingOffset = Math.sin(time / 150) * 8; 
                         const markY = (-drawHeight / 2) - 30 + bobbingOffset;
                         
                         ctx.save();
                         // Neutralize scale flipping so the math/text draws correctly globally mapping cleanly successfully identically flawlessly mathematically!
                         if (shouldFlip) ctx.scale(-1, 1);
                         ctx.fillStyle = '#fde047'; // Bright Yellow
                         ctx.font = 'bold 64px monospace'; // Massive icon
                         ctx.textAlign = 'center';
                         ctx.shadowBlur = 10;
                         ctx.shadowColor = '#000000';
                         ctx.fillText('!', 0, markY);
                         ctx.restore();
                     } else if (ent.parentId === 10002 && ent.hit === false) {
                         const bobbingOffset = Math.sin(time / 150) * 8; 
                         const markY = (-drawHeight / 2) - 30 + bobbingOffset;
                         
                         ctx.save();
                         if (shouldFlip) ctx.scale(-1, 1);
                         ctx.fillStyle = '#fde047'; // Bright Yellow
                         ctx.font = 'bold 64px monospace'; // Massive icon
                         ctx.textAlign = 'center';
                         ctx.shadowBlur = 10;
                         ctx.shadowColor = '#000000';
                         ctx.fillText('?', 0, markY);
                         ctx.restore();
                     }
                 }

                 ctx.restore();
             } else {
                 if (ent.npcType && ent.npcType.id === 'Bullet') {
                     const visualRadius = (ent.width * 3) / 2;
                     
                     ctx.fillStyle = '#64748b'; // Outer metallic highlight rim
                     ctx.beginPath();
                     ctx.arc(ent.x + ent.width/2, ent.y + ent.height/2, visualRadius, 0, Math.PI * 2);
                     ctx.fill();
                     
                     ctx.fillStyle = '#0f172a'; // Heavy matte black iron core
                     ctx.beginPath();
                     ctx.arc(ent.x + ent.width/2, ent.y + ent.height/2, Math.max(1, visualRadius - 2), 0, Math.PI * 2);
                     ctx.fill();
                 } else {
                     ctx.fillStyle = '#334155';
                     ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
                 }
             }
         } else if (item.type === 'player') {
             // 2. Draw Player (Sprite Sequence)
             if (player.slowTimer <= 0 || Math.floor(time / 100) % 2 === 0) {
                ctx.save();
                
                if (player.isMounted) {
                    const striderRef = npcTypes.find(n => n.id === 'Strider');
                    if (striderRef && striderRef.walk) {
                        const sDrawW = 96 * 1.5;
                        const sDrawH = 96 * 1.5;
                        const sDrawX = player.x - (sDrawW / 2) + (player.width / 2);
                        const sDrawY = player.y - player.z - sDrawH + player.height + 4;
                        
                        ctx.save();
                        const sSourceX = (player.currentFrame % 5) * 256;
                        const sSourceY = Math.floor(player.currentFrame / 5) * 256;
                        
                        ctx.translate(sDrawX + sDrawW / 2, sDrawY + sDrawH / 2);
                        if (player.facingLeft) ctx.scale(-1, 1);
                        ctx.drawImage(striderRef.walk, sSourceX, sSourceY, 256, 256, -sDrawW / 2, -sDrawH / 2, sDrawW, sDrawH);
                        ctx.restore();
                    }
                } else if (player.fastTimer > 0) {
                    ctx.beginPath();
                    ctx.arc(player.x + player.width/2, player.y - player.z + player.height/2, player.width * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                    ctx.fill();
                } else if (player.slowTimer > 0) {
                    ctx.beginPath();
                    ctx.arc(player.x + player.width/2, player.y - player.z + player.height/2, player.width * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(185, 28, 28, 0.4)';
                    ctx.fill();
                }

                try {
                   if (pSpriteSheet.complete) {
                      if (player.isFrozen) {
                          ctx.filter = 'grayscale(100%)';
                      }
                      // Mount bob formula mapping 0 to 2 px smoothly based on time
                      const mountBob = Math.sin(time / 40) * 2;
                      const activePDrawY = player.isMounted ? pDrawY - 62 + mountBob : pDrawY;
                      const mountOffsetX = player.facingLeft ? -10 : 10; // Dynamic asymmetric mirroring
                      const activePDrawX = player.isMounted ? pDrawX + mountOffsetX : pDrawX;

                      if (player.facingLeft) {
                         ctx.translate(activePDrawX + pDrawW / 2, activePDrawY + pDrawH / 2);
                         ctx.scale(-1, 1);
                         ctx.drawImage(pSpriteSheet, pSourceX, pSourceY, 256, 256, -pDrawW / 2, -pDrawH / 2, pDrawW, pDrawH);
                      } else {
                         ctx.drawImage(pSpriteSheet, pSourceX, pSourceY, 256, 256, activePDrawX, activePDrawY, pDrawW, pDrawH);
                      }
                   }
                } catch(e) {}
                
                ctx.restore();
             }
         }
      }
      
      // Process Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.life -= deltaTime;
          if (ft.life <= 0) {
              floatingTexts.splice(i, 1);
              continue;
          }
          ft.y -= 40 * deltaTime; 
          ft.x -= activeRunSpeed * deltaTime; 
          
          ctx.save();
          ctx.globalAlpha = ft.life / ft.maxLife;
          ctx.fillStyle = '#22c55e'; // Bright active green 
          ctx.font = 'bold 36px monospace';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#000000'; // High contrast punch-out
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
      }

      // Update and Draw Distance Score (Top Right)
      distanceTraveled += activeRunSpeed * deltaTime;
      const score = Math.floor(distanceTraveled / 10) + (pickupsCollected * 50) + questBonusPoints;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE: ${score.toString().padStart(5, '0')}`, canvas.width - 20, 40);

      // Update and Draw Time (Top Center)
      if (isPlaying) {
          timeRemaining -= deltaTime;
      }
      if (timeRemaining < 0) timeRemaining = 0;

      if (timeRemaining <= nextPickupTime && unspawnedPickups.length > 0 && isPlaying) {
          nextPickupTime -= 16.0; // 16 second intervals correctly evenly distributes precisely 13 drops mapping 223 - 5 sec cleanly mathematically smoothly!
          const pickupId = unspawnedPickups.pop()!;
          const pType = npcTypes.find(n => n.id === pickupId)!;
          
          const minSpawnY = (5 * 32) + ((96 * 0.8) * 0.35); 
          const newEntityY = minSpawnY + Math.random() * Math.max(0, canvas.height - minSpawnY - 48);

          entities.push({
              id: globalIdCounter++,
              enragedTimer: 0,
              childSpawnTimer: 0,
              x: canvas.width + 50,
              y: newEntityY,
              width: 48, // Generous collision boundary reliably natively!
              height: 48,
              hit: false,
              type: 'sit_hazard',
              npcType: pType,
              state: 'idle',
              stateTimer: 999.0,
              localSpeedX: 0,
              localSpeedY: 0,
              facingLeft: true,
              sprite: pType.idle!,
              currentFrame: 0,
              frameTimer: 0
          });
      }

      if (timeRemaining <= dragonSpawnTime && !hasSpawnedDragon) {
          hasSpawnedDragon = true;
          const sfx = createAudio('/sounds/DragonAggro.ogg');
          sfx.volume = 0.3;
          sfx.play().catch(() => {});
          entities.push({
              id: globalIdCounter++,
              enragedTimer: 0,
              childSpawnTimer: 0,
              x: canvas.width + 200, // Starts off-screen right
              y: canvas.height / 2 + 480, // Compensates for the 960px bottom-up scale offset, plotting its core visually down the centerline
              width: 24, // Irrelevant logical boundary
              height: 24, // Irrelevant logical boundary
              hit: false, // Ensures rendering pipeline explicitly paints the sequence
              type: 'sit_hazard',
              npcType: npcTypes.find(n => n.id === 'Dragon')!,
              state: 'walk',
              stateTimer: 999.0, // Permanent pacing
              localSpeedX: -800, // Supersonic flight velocity
              localSpeedY: 0, // Perfectly level trajectory
              facingLeft: true,
              sprite: npcTypes.find(n => n.id === 'Dragon')!.walk!,
              currentFrame: 0,
              frameTimer: 0
          });
      }

      const spawnRobotChicken = () => {
          const cType = npcTypes.find(n => n.id === 'Robot Chicken')!;
          entities.push({
              id: globalIdCounter++,
              enragedTimer: 0,
              childSpawnTimer: 0,
              x: canvas.width + 50,
              y: canvas.height - 180,
              width: 50,
              height: 50,
              hit: false,
              type: 'sit_hazard',
              npcType: cType,
              state: 'idle',
              stateTimer: 999.0,
              localSpeedX: 0,
              localSpeedY: 0,
              facingLeft: true,
              sprite: cType.idle!,
              currentFrame: 0,
              frameTimer: 0,
              isFollowing: false,
              isRunningToTarget: false,
              parentId: 10003
          });
      };

      const spawnTortoise = (questType: 'quest_start' | 'quest_end') => {
          const tType = npcTypes.find(n => n.id === 'Tortoise')!;
          entities.push({
              id: globalIdCounter++,
              enragedTimer: 0,
              childSpawnTimer: 0,
              x: canvas.width + 50,
              y: canvas.height - 180, // Walk securely along explicit bottom lower pathway natively logically explicitly structurally
              width: 90,
              height: 60,
              hit: false,
              type: 'sit_hazard',
              npcType: tType,
              state: 'idle',
              stateTimer: 999.0,
              localSpeedX: 0,
              localSpeedY: 0,
              facingLeft: true,
              sprite: tType.idle!,
              currentFrame: 0,
              frameTimer: 0,
              isFollowing: false,
              isRunningToTarget: false,
              parentId: questType === 'quest_start' ? 10001 : 10002 // Abuse parent ID mapping elegantly reliably!
          });
      };

      if (timeRemaining <= 70.0 && !hasSpawnedChicken && isPlaying) {
          hasSpawnedChicken = true;
          spawnRobotChicken();
      }
      
      if (timeRemaining <= 2.0 && isPlaying && !chickenQuestFailed) {
          const chicken = entities.find(e => e.parentId === 10003 && e.isFollowing);
          if (chicken && !chicken.isRunningToTarget) {
              chicken.isRunningToTarget = true; 
              chicken.localSpeedX = 600; // Zoom off 3x speed natively 
              questBonusPoints += 250;
              const sfx = createAudio('/sounds/iQuestComplete.ogg');
              sfx.volume = 0.5;
              sfx.play().catch(() => {});
              
              const chickenSfx = createAudio('/sounds/ChickenA.ogg');
              chickenSfx.volume = 0.5;
              chickenSfx.play().catch(() => {});
          }
      }

      if (timeRemaining <= 150.0 && !hasSpawnedQuestStart && isPlaying) {
          hasSpawnedQuestStart = true;
          spawnTortoise('quest_start');
      }
      
      if (timeRemaining <= 105.0 && !hasSpawnedQuestEnd && isPlaying && !tortoiseQuestFailed) {
          hasSpawnedQuestEnd = true;
          spawnTortoise('quest_end');
          
          const escortTarget = entities.find(e => e.parentId === 10001 && e.isFollowing);
          if (escortTarget) {
              escortTarget.isFollowing = false;
              escortTarget.isRunningToTarget = true;
          }
      }

      const mins = Math.floor(timeRemaining / 60);
      const secs = Math.floor(timeRemaining % 60);
      const ms = Math.floor((timeRemaining % 1) * 100);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = timeRemaining < 10 ? '#ef4444' : '#ffffff'; // Turn red in last 10 seconds
      ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`, canvas.width / 2, 40);

      // Handle Cinematic State Trigger
      if (timeRemaining <= 0) {
          if (!isCinematicOutro) {
              isCinematicOutro = true;
              const cheerSfx = createAudio('/sounds/TrollMaleCheer02.ogg');
              cheerSfx.volume = 0.3;
              cheerSfx.play().catch(() => {});
              outroTriggeredDistance = distanceTraveled;
              entities.length = 0; // Obliterate all remaining entities cleanly organically naturally!
          }
          
          if (engineHalt) {
             ctx.fillStyle = 'rgba(0,0,0,0.85)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             
             ctx.fillStyle = '#ea580c';
             ctx.font = 'black 48px monospace';
             ctx.fillText('ENDURANCE COMPLETE', canvas.width / 2, canvas.height / 2 - 40);
             
             ctx.fillStyle = '#ffffff';
             ctx.font = 'bold 32px monospace';
             ctx.fillText(`FINAL SCORE: ${score.toString().padStart(5, '0')}`, canvas.width / 2, canvas.height / 2 + 20);

             ctx.fillStyle = '#a1a1aa';
             ctx.font = '20px monospace';
             ctx.fillText(`Hazards hit: ${hazardsHit}  |  Items collected: ${pickupsCollected}/13`, canvas.width / 2, canvas.height / 2 + 60);

             return; // Halts the requestAnimationFrame loop entirely
          }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, gameId]);

}
