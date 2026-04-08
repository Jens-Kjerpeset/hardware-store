'use client';
import { useEffect, useRef, useState } from 'react';

export default function HardwareStoreGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameId, setGameId] = useState(0);
  const isPausedRef = useRef(false);

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  const restartGame = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsGameOver(false);
    setGameId(prev => prev + 1);
    setIsPlaying(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      // Sync internal resolution with display size
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 400;
      ctx.imageSmoothingEnabled = false;
    };
    
    // Initial size mapping and resize listener
    handleResize();
    window.addEventListener('resize', handleResize);

    if (!isPlaying) {
      // Just draw a static dark background if waiting for play
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Game state
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const player = {
      x: 100,
      y: canvas.height / 2 - 12,
      z: 0,
      vz: 0,
      isJumping: false,
      slowTimer: 0,
      fastTimer: 0,
      width: 24,
      height: 24,
      speed: 300 // pixels per second vertically
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
    const baseRunSpeed = 200; // pixels per second background scroll
    let distanceTraveled = 0;
    let timeRemaining = 223.0; // 3 minutes 43 seconds
    
    let hazardsHit = 0;
    let boostsCollected = 0;

    if (isPlaying) {
      // Map the debug skip function to the ref
      skipRef.current = () => {
        timeRemaining = Math.max(0.5, timeRemaining - 210.0);
      };
    }

    type Entity = { x: number, y: number, width: number, height: number, hit: boolean, type: 'hazard' | 'boost' };
    let entities: Entity[] = [];
    let spawnTimer = 1.0; // First obstacle in 1 second

    // Input listening
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
         if (!player.isJumping) {
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

      // Handle active tracking debuffs and buffs
      if (player.slowTimer > 0) {
        player.slowTimer -= deltaTime;
        if (player.slowTimer < 0) player.slowTimer = 0;
      }
      if (player.fastTimer > 0) {
        player.fastTimer -= deltaTime;
        if (player.fastTimer < 0) player.fastTimer = 0;
      }

      let activePlayerSpeed = player.speed;
      let activeRunSpeed = baseRunSpeed;

      if (player.slowTimer > 0) {
        activePlayerSpeed *= 0.5;
        activeRunSpeed *= 0.5;
      } else if (player.fastTimer > 0) {
        activePlayerSpeed *= 1.6;
        activeRunSpeed *= 1.6;
      }

      // Update Player Y
      if (keys.ArrowUp || keys.w) {
        player.y -= activePlayerSpeed * deltaTime;
      }
      if (keys.ArrowDown || keys.s) {
        player.y += activePlayerSpeed * deltaTime;
      }
      
      // Update Player X
      if (keys.ArrowLeft || keys.a) {
        player.x -= activePlayerSpeed * deltaTime;
      }
      if (keys.ArrowRight || keys.d) {
        player.x += activePlayerSpeed * deltaTime;
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
      if (player.y < 0) player.y = 0;
      if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
      }
      
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
      }

      // Update background moving left (simulating player running right)
      backgroundOffset -= activeRunSpeed * deltaTime;
      if (backgroundOffset <= -32) {
        backgroundOffset += 32; // Loop the grid every 32 pixels smoothly
      }

      // 1. Draw Background
      ctx.fillStyle = '#0a0a0a'; // Darker theme background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw scrolling grid
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      // Vertical lines scrolling
      for (let x = backgroundOffset; x < canvas.width; x += 32) {
         ctx.moveTo(x, 0);
         ctx.lineTo(x, canvas.height);
      }
      
      // Horizontal lines static (perspective of moving perfectly horizontal)
      for (let y = 0; y < canvas.height; y += 32) {
         ctx.moveTo(0, y);
         ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Spawn Entities
      spawnTimer -= deltaTime;
      if (spawnTimer <= 0) {
        const isBoost = Math.random() > 0.75; // 25% chance to be a boost dot
        entities.push({
          x: canvas.width + 50,
          y: Math.random() * (canvas.height - 24),
          width: isBoost ? 16 : 24,
          height: isBoost ? 16 : 24,
          hit: false,
          type: isBoost ? 'boost' : 'hazard'
        });
        spawnTimer = 0.8 + Math.random() * 1.5; // Spawn continuously
      }

      // Draw and Update Entities
      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        ent.x -= activeRunSpeed * deltaTime;
        
        if (ent.x + ent.width < 0) {
          entities.splice(i, 1);
          continue;
        }

        // Collision Check
        if (!ent.hit && player.z < 24) {
          const overlapX = player.x < ent.x + ent.width && player.x + player.width > ent.x;
          const overlapY = player.y < ent.y + ent.height && player.y + player.height > ent.y;
          
          if (overlapX && overlapY) {
            ent.hit = true;
            if (ent.type === 'boost') {
              player.fastTimer = 5.0; // 5 seconds of speed
              player.slowTimer = 0; // overrides slow
              boostsCollected++;
            } else {
              player.slowTimer = 3.0; // 3 seconds penalty
              player.fastTimer = 0; // overrides speed
              hazardsHit++;
            }
          }
        }

        // Render Entity
        if (!ent.hit || ent.type === 'hazard') {
            if (ent.type === 'hazard') {
               ctx.fillStyle = ent.hit ? '#334155' : '#3b82f6';
               ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
               ctx.strokeStyle = ent.hit ? '#64748b' : '#ffffff';
               ctx.lineWidth = 2;
               ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
            } else {
               // Render Green Dot for boost
               if (!ent.hit) {
                 ctx.fillStyle = '#22c55e'; // Green
                 ctx.beginPath();
                 ctx.arc(ent.x + ent.width / 2, ent.y + ent.height / 2, ent.width / 2, 0, Math.PI * 2);
                 ctx.fill();
                 ctx.strokeStyle = '#ffffff';
                 ctx.lineWidth = 2;
                 ctx.stroke();
               }
            }
        }
      }

      // 2. Draw Player (Red Square)
      // Draw shadow if jumping
      if (player.z > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(player.x, player.y + player.height - 4, player.width, 8);
      }

      // If debuffed or buffed, add visual flicker or coloring
      if (player.slowTimer <= 0 || Math.floor(time / 100) % 2 === 0) {
        if (player.fastTimer > 0) {
           ctx.fillStyle = '#facc15'; // Yellowish gold when fast
        } else {
           ctx.fillStyle = player.slowTimer > 0 ? '#b91c1c' : '#ea580c'; // Dark red if hit, or brand orange
        }
        ctx.fillRect(player.x, player.y - player.z, player.width, player.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y - player.z, player.width, player.height);
      }
      
      // Update and Draw Distance Score (Top Right)
      distanceTraveled += activeRunSpeed * deltaTime;
      const score = Math.floor(distanceTraveled / 10); // 1 point per 10 pixels scrolled
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE: ${score.toString().padStart(5, '0')}`, canvas.width - 20, 40);

      // Update and Draw Time (Top Center)
      timeRemaining -= deltaTime;
      if (timeRemaining < 0) timeRemaining = 0;

      const mins = Math.floor(timeRemaining / 60);
      const secs = Math.floor(timeRemaining % 60);
      const ms = Math.floor((timeRemaining % 1) * 100);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = timeRemaining < 10 ? '#ef4444' : '#ffffff'; // Turn red in last 10 seconds
      ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`, canvas.width / 2, 40);

      // Handle Game Over State
      if (timeRemaining <= 0) {
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
         ctx.fillText(`Hazards hit: ${hazardsHit}  |  Boosts collected: ${boostsCollected}`, canvas.width / 2, canvas.height / 2 + 60);

         setIsGameOver(true);
         return; // Halts the requestAnimationFrame loop entirely
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

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full flex-1 pb-6 min-h-0">
       <div className="bg-black border-4 border-zinc-800 rounded-lg p-2 shadow-2xl relative ring-1 ring-zinc-700/50 w-full h-full flex overflow-hidden">
         {!isPlaying && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded">
              <button 
                onClick={() => setIsPlaying(true)}
                className="bg-brand text-white font-black text-2xl px-12 py-4 rounded-lg shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all outline-none"
              >
                PLAY (3:43)
              </button>
           </div>
         )}
         {isPlaying && isPaused && !isGameOver && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded">
              <span className="text-4xl font-black mb-6 tracking-widest">PAUSED</span>
              <div className="flex gap-4">
                 <button 
                   onClick={togglePause}
                   className="bg-zinc-800 text-white font-bold text-xl px-10 py-3 rounded-lg border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all outline-none"
                 >
                   RESUME
                 </button>
                 <button 
                   onClick={restartGame}
                   className="bg-red-950/40 text-red-500 font-bold text-xl px-10 py-3 rounded-lg border border-red-900/50 hover:bg-red-900/50 active:scale-95 transition-all outline-none"
                 >
                   RESTART
                 </button>
              </div>
           </div>
         )}
         {isGameOver && (
           <div className="absolute bottom-16 right-1/2 translate-x-1/2 z-20">
               <button 
                 onClick={restartGame}
                 className="bg-brand text-white font-black text-xl px-12 py-4 rounded-lg shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all outline-none"
               >
                 PLAY AGAIN
               </button>
           </div>
         )}
         {isPlaying && !isPaused && !isGameOver && (
           <>
             <button 
               onClick={togglePause}
               className="absolute top-4 left-4 z-10 bg-surface border border-border px-4 py-1.5 rounded-md text-xs font-bold tracking-widest hover:bg-surface-hover text-zinc-300 transition-colors"
             >
               PAUSE
             </button>
             <button 
               onClick={() => skipRef.current?.()}
               className="absolute bottom-4 right-4 z-10 bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded text-[10px] font-mono text-red-500 hover:bg-red-900/50 transition-colors"
             >
               [DEV] SKIP 3M 30S
             </button>
           </>
         )}
         <canvas 
            ref={canvasRef} 
            className="w-full h-full bg-background block rounded"
            style={{ imageRendering: 'pixelated' }}
          />
       </div>
       <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-zinc-500">
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">W</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">↑</kbd> Up</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">S</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">↓</kbd> Down</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">A</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">←</kbd> Left</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">D</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">→</kbd> Right</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Space</kbd> Jump</div>
       </div>
    </div>
  );
}
