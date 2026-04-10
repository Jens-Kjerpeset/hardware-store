import { Entity, NPCType } from './gameConstants';

export interface UpdateContext {
    player: any;
    deltaTime: number;
    activeRunSpeed: number;
    canvas: HTMLCanvasElement;
    keys: any;
    joystickDeltaRef: React.MutableRefObject<{ x: number, y: number }>;
    isCinematicOutro: boolean;
    chickenQuestFailed: boolean;
    setChickenQuestFailed: (v: boolean) => void;
    questBonusPoints: number;
    setQuestBonusPoints: (v: number) => void;
    floatingTexts: any[];
    entities: Entity[];
    skyHeight: number;
    createAudio: (src: string) => any;
    spawnEntity: (entity: any) => void;
    generateId: () => number;
}

export interface EntityBehavior {
    update(ent: Entity, ctx: UpdateContext): void;
}

export class DefaultBehavior implements EntityBehavior {
    update(ent: Entity, ctx: UpdateContext) {
        // Standard background scrolling
        ent.x -= (ctx.activeRunSpeed + -ent.localSpeedX) * ctx.deltaTime;
        ent.y += ent.localSpeedY * ctx.deltaTime;

        // Sky / Ground bounce
        if (ent.localSpeedY !== 0) {
            const scaleMod = ent.npcType.scaleModifier || 1;
            const minSafeY = ctx.skyHeight + ((96 * scaleMod) * 0.35);
            if (ent.y < minSafeY) {
                ent.y = minSafeY;
                ent.localSpeedY *= -1;
            }
            if (ent.y + ent.height > ctx.canvas.height) {
                ent.y = ctx.canvas.height - ent.height;
                ent.localSpeedY *= -1;
            }
        }

        // AI State
        ent.stateTimer -= ctx.deltaTime;
        if (ent.stateTimer <= 0) {
            if (ent.npcType.walk && ent.npcType.idle) {
                ent.state = ent.state === 'walk' ? 'idle' : 'walk';
            } else if (ent.npcType.walk) {
                ent.state = 'walk';
            } else {
                ent.state = 'idle';
            }
            ent.stateTimer = 1.0 + Math.random() * 3.0;
            
            let localSpeedX = 0;
            let localSpeedY = 0;
            if (ent.state === 'walk') {
                if (ent.npcType.id === 'Roc') {
                    localSpeedY = Math.random() > 0.5 ? 90 : -90; 
                } else if (ent.npcType.id === 'Stinger') {
                    if (Math.random() < 0.25) { 
                        localSpeedX = Math.random() > 0.5 ? 350 : -350;
                        localSpeedY = Math.random() > 0.5 ? 250 : -250;
                    } else {
                        localSpeedX = Math.random() * 160 - 100;
                        localSpeedY = Math.random() * 80 - 40;
                    }
                } else {
                    localSpeedX = Math.random() * 220 - 140;
                }
            }
            ent.localSpeedX = localSpeedX;
            ent.localSpeedY = localSpeedY;

            if (localSpeedX !== 0) ent.facingLeft = localSpeedX < 0;
            else ent.facingLeft = true;

            ent.sprite = (ent.state === 'walk' ? ent.npcType.walk : ent.npcType.idle)!;
        }

        this.animate(ent, ctx);
    }

    animate(ent: Entity, ctx: UpdateContext) {
        ent.frameTimer += ctx.deltaTime;
        const baseFPS = 1 / 24;
        const finalFPS = ent.npcType.fpsModifier ? baseFPS / ent.npcType.fpsModifier : baseFPS;
        if (ent.frameTimer >= finalFPS) {
            ent.currentFrame++;
            ent.currentFrame = ent.npcType.id === 'Wringing Thorns' 
                ? ent.currentFrame % 38 
                : ent.currentFrame % 25;
            ent.frameTimer -= finalFPS;
        }
    }
}

export class TortoiseBehavior implements EntityBehavior {
    update(ent: Entity, ctx: UpdateContext) {
        if (ent.isFollowing || ent.isRunningToTarget) {
            let targetX = ctx.player.x - 70;
            let targetY = ctx.player.y;
            
            if (ent.isRunningToTarget) {
                const questEnd = ctx.entities.find(e => e.parentId === 10002);
                if (questEnd) {
                    targetX = questEnd.x + questEnd.width / 2;
                    targetY = questEnd.y;
                    
                    const distCheck = Math.hypot(targetX - ent.x, targetY - ent.y);
                    if (distCheck < 50) {
                        ctx.floatingTexts.push({ id: ctx.generateId(), text: '+150', x: ent.x + ent.width / 2, y: ent.y - 40, life: 2.0, maxLife: 2.0 });
                        ent.x = -9999;
                        questEnd.x = -9999;
                        ent.hit = true;
                        questEnd.hit = true;
                        ctx.setQuestBonusPoints(ctx.questBonusPoints + 150); 
                        const completionSfx = ctx.createAudio('/sounds/iQuestComplete.ogg');
                        completionSfx.volume = 0.5;
                        completionSfx.play().catch(() => {});
                    }
                }
            }

            const activePlayerSpeed = 300; 
            const tortoiseSpeed = activePlayerSpeed * 0.9;
            const dist = Math.hypot(targetX - ent.x, targetY - ent.y);
            
            if (dist > 5) {
                ent.x += ((targetX - ent.x) / dist) * tortoiseSpeed * ctx.deltaTime;
                ent.y += ((targetY - ent.y) / dist) * tortoiseSpeed * ctx.deltaTime;
            }
            
            if (ent.isRunningToTarget) ent.facingLeft = ((targetX - ent.x) < 0);
            else if (dist > 5 && Math.abs(targetX - ent.x) > 5) ent.facingLeft = ((targetX - ent.x) < 0);
            else ent.facingLeft = ctx.player.facingLeft;

            const keys = ctx.keys;
            const isJoy = ctx.joystickDeltaRef.current.x !== 0 || ctx.joystickDeltaRef.current.y !== 0;
            const isPlayerOperating = (ctx.activeRunSpeed > 0 || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || keys.w || keys.a || keys.s || keys.d || isJoy) && ctx.player.sitTimer <= 0 && ctx.player.knockbackTimer <= 0 && !ctx.isCinematicOutro;

            if (ent.isRunningToTarget || dist > 5 || isPlayerOperating) {
                ent.state = 'walk';
                ent.sprite = ent.npcType.walk!;
            } else {
                ent.state = 'idle';
                ent.sprite = ent.npcType.idle!;
            }
            ent.currentFrame = ctx.player.currentFrame;
        } else {
             ent.x -= (ctx.activeRunSpeed + -ent.localSpeedX) * ctx.deltaTime;
             ent.y += ent.localSpeedY * ctx.deltaTime;
        }
    }
}

export class RobotChickenBehavior extends DefaultBehavior {
    update(ent: Entity, ctx: UpdateContext) {
        if (ent.parentId === 10003 && ent.isFollowing) {
            ent.facingLeft = false; 
            ent.state = 'walk';
            ent.sprite = ent.npcType.walk!;
            
            if (!ent.isRunningToTarget) ent.localSpeedX = ctx.player.isMounted ? 320 : 200;

            if (ent.x > ctx.canvas.width && !ent.isRunningToTarget && !ctx.chickenQuestFailed) {
                ctx.setChickenQuestFailed(true);
                ent.x = -9999;
                const failSfx = ctx.createAudio('/sounds/igQuestFailed.ogg');
                failSfx.volume = 0.5;
                failSfx.play().catch(() => {});
            }
            ent.x -= (ctx.activeRunSpeed + -ent.localSpeedX) * ctx.deltaTime;
            ent.y += ent.localSpeedY * ctx.deltaTime;

            super.animate(ent, ctx);
        } else {
            super.update(ent, ctx);
        }
    }
}

export class SilithidBehavior extends DefaultBehavior {
    update(ent: Entity, ctx: UpdateContext) {
        if (ent.enragedTimer > 0) {
            ent.enragedTimer -= ctx.deltaTime;
            if (ctx.player.sitTimer > 0 || ctx.player.knockbackTimer > 0) {
                ent.enragedTimer = 0;
            } else {
                this.aggroMove(ent, ctx, 400);
            }
            super.animate(ent, ctx);
        } else {
            super.update(ent, ctx);
        }

        // STOP here if the mother is dead to prevent ghost babies
        if (ent.hit) return;

        if (!ctx.isCinematicOutro && !ent.isBaby && ent.childSpawnTimer !== 0) {
            if (ent.childSpawnTimer === -1.0) {
                if (ent.x + ent.width < ctx.canvas.width) ent.childSpawnTimer = 0.01;
            } else {
                ent.childSpawnTimer -= ctx.deltaTime;
                if (ent.childSpawnTimer <= 0) {
                    ctx.spawnEntity({
                      id: ctx.generateId(),
                      parentId: ent.id,
                      isBaby: true,
                      enragedTimer: 0,
                      childSpawnTimer: 0,
                      x: ent.x + ent.width / 2,
                      y: ent.y + ent.height / 2,
                      width: 24,
                      height: 24,
                      hit: false,
                      type: 'sit_hazard',
                      npcType: { ...ent.npcType, scaleModifier: 0.5 }, 
                      state: 'walk',
                      stateTimer: 1.0 + Math.random() * 3.0,
                      localSpeedX: Math.random() * 220 - 140,
                      localSpeedY: Math.random() * 80 - 40,
                      facingLeft: true,
                      sprite: ent.npcType.walk || ent.sprite,
                      currentFrame: Math.floor(Math.random() * 25),
                      frameTimer: 0
                    });
                    
                    if (Math.random() > 0.5) ent.childSpawnTimer = Math.random() * 3.0 + 2.0; 
                    else ent.childSpawnTimer = 0; 
                }
            }
        }
    }
    
    // Aggressive override logic helper
    aggroMove(ent: Entity, ctx: UpdateContext, aggroSpeed: number) {
        ent.state = 'walk';
        ent.stateTimer = 1.0;
        if (ent.npcType.walk) ent.sprite = ent.npcType.walk;
        
        const dx = (ctx.player.x + ctx.player.width/2) - (ent.x + ent.width/2);
        const dy = (ctx.player.y + ctx.player.height/2) - (ent.y + ent.height/2);
        const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        
        ent.y += (dy / distance) * aggroSpeed * ctx.deltaTime;
        
        const scaleMod = ent.npcType.scaleModifier || 1;
        const minSafeY = ctx.skyHeight + ((96 * scaleMod) * 0.35);
        if (ent.y < minSafeY) ent.y = minSafeY;
        if (ent.y + ent.height > ctx.canvas.height) ent.y = ctx.canvas.height - ent.height;
        
        ent.localSpeedX = ((dx / distance) * aggroSpeed) + ctx.activeRunSpeed;
        ent.facingLeft = dx < 0; 
    }
}

export class HyenaBehavior extends DefaultBehavior {
    update(ent: Entity, ctx: UpdateContext) {
        let isAggro = false;
        if (!ctx.isCinematicOutro && !ent.hit) {
            const dx = (ctx.player.x + ctx.player.width/2) - (ent.x + ent.width/2);
            const dy = (ctx.player.y + ctx.player.height/2) - (ent.y + ent.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 250) {
                if (!ent.hasPlayedAggroSound) {
                    ent.hasPlayedAggroSound = true;
                    const sfx = ctx.createAudio('/sounds/HyenaAggroA.ogg');
                    sfx.volume = 0.3;
                    sfx.play().catch(() => {});
                }
                isAggro = true;
                
                ent.state = 'walk';
                ent.stateTimer = 1.0; 
                if (ent.npcType.walk) ent.sprite = ent.npcType.walk;
                
                const aggroSpeed = 150; 
                ent.y += (dy / distance) * aggroSpeed * ctx.deltaTime;
                
                const scaleMod = ent.npcType.scaleModifier || 1;
                const minSafeY = ctx.skyHeight + ((96 * scaleMod) * 0.35);
                if (ent.y < minSafeY) ent.y = minSafeY;
                if (ent.y + ent.height > ctx.canvas.height) ent.y = ctx.canvas.height - ent.height;
                
                ent.localSpeedX = ((dx / distance) * aggroSpeed) + ctx.activeRunSpeed;
                ent.facingLeft = dx < 0; 
            }
        }

        if (!isAggro) super.update(ent, ctx);
        else super.animate(ent, ctx);
    }
}

export class PirateBehavior extends DefaultBehavior {
    update(ent: any, ctx: UpdateContext) {
        // Run default wandering physics
        super.update(ent, ctx);
        
        // STOP here if the pirate is already dead/despawned
        if (ent.hit) return;
        
        // Override animation
        ent.currentFrame = ent.currentFrame % 10;
        if (!ctx.isCinematicOutro && ent.currentFrame === 1 && ent.x > 0 && ent.x + ent.width < ctx.canvas.width) {
            const sfx = ctx.createAudio(`/sounds/GunFire0${Math.floor(Math.random() * 3) + 1}.ogg`);
            sfx.volume = 0.1;
            sfx.play().catch(() => {});
            
            ctx.spawnEntity({
               id: ctx.generateId(),
               parentId: ent.id,
               isBaby: true, 
               enragedTimer: 0,
               childSpawnTimer: 0,
               x: ent.x - 42, 
               y: ent.y - 73, 
               width: 4, 
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
}
