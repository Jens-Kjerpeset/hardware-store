'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameEngine } from './useGameEngine';
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
import { WebAudioEngine, ImageManager } from './AssetManager';

export default function HardwareStoreGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameId, setGameId] = useState(0);
  const isPausedRef = useRef(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const menuBgmRef = useRef<HTMLAudioElement | null>(null);

  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const isSoundMutedRef = useRef(false);
  const joystickDeltaRef = useRef({ x: 0, y: 0 });
  useEffect(() => { isSoundMutedRef.current = isSoundMuted; }, [isSoundMuted]);

  const createAudio = (src: string) => {
      WebAudioEngine.preload(src);
      
      const fakePlayer = {
          volume: 1.0,
          play: () => {
              if (isSoundMutedRef.current) return Promise.resolve();
              WebAudioEngine.play(src, fakePlayer.volume);
              return Promise.resolve();
          }
      };
      
      // Interface mapping to mimic standard HTML element APIs
      return fakePlayer as unknown as HTMLAudioElement;
  };


  useEffect(() => {
     bgmRef.current = new Audio('/sounds/Hardware Store.mp3');
     bgmRef.current.loop = false;
     bgmRef.current.volume = 0.5;
     
     menuBgmRef.current = new Audio('/sounds/BeachDay.ogg');
     menuBgmRef.current.loop = true;
     menuBgmRef.current.volume = 0.5;
     
     return () => {
         if (bgmRef.current) {
             bgmRef.current.pause();
             bgmRef.current = null;
         }
         if (menuBgmRef.current) {
             menuBgmRef.current.pause();
             menuBgmRef.current = null;
         }
     };
  }, []);

  useEffect(() => {
     if (!bgmRef.current || !menuBgmRef.current) return;

     const handleBgmPause = () => {
         // Auto-resume if the OS forcefully paused playback (e.g. bluetooth disconnect) but the game is still active
         if (isPlaying && !isPaused && !isGameOver) {
             bgmRef.current?.play().catch(() => {});
         }
     };

     const handleMenuPause = () => {
         // Auto-resume ambient music if the OS paused it while in menus
         if (!(isPlaying && !isPaused && !isGameOver)) {
             menuBgmRef.current?.play().catch(() => {});
         }
     };

     bgmRef.current.addEventListener('pause', handleBgmPause);
     menuBgmRef.current.addEventListener('pause', handleMenuPause);

     if (isMusicMuted) {
         bgmRef.current.volume = 0;
         if (isPlaying && !isPaused && !isGameOver) {
             menuBgmRef.current.play().catch(() => {}); // Play "beach" instead
         }
     } else {
         bgmRef.current.volume = 0.5;
     }

     if (isSoundMuted) {
         menuBgmRef.current.volume = 0;
     } else {
         menuBgmRef.current.volume = 0.5;
     }

     if (isPlaying && !isPaused && !isGameOver) {
         bgmRef.current.play().catch(() => {});
         if (!isMusicMuted) {
             menuBgmRef.current.pause(); // Suppress Menu music natively cleanly
         }
     } else {
         bgmRef.current.pause();
         menuBgmRef.current.play().catch(() => {}); // Always play ambiance in menus
     }

     return () => {
         bgmRef.current?.removeEventListener('pause', handleBgmPause);
         menuBgmRef.current?.removeEventListener('pause', handleMenuPause);
     };
  }, [isPlaying, isPaused, isGameOver, isMusicMuted, isSoundMuted]);

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
    if (bgmRef.current) {
        bgmRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const handleFocusLoss = () => {
        if (isPlaying && !isGameOver && !isPausedRef.current) {
            isPausedRef.current = true;
            setIsPaused(true);
        }
    };
    
    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('visibilitychange', handleFocusLoss);
    
    return () => {
        window.removeEventListener('blur', handleFocusLoss);
        document.removeEventListener('visibilitychange', handleFocusLoss);
    };
  }, [isPlaying, isGameOver]);

  useGameEngine({canvasRef, skipRef, isPlaying, isGameOver, isPausedRef, gameId, togglePause, joystickDeltaRef, isSoundMutedRef, setIsGameOver, createAudio});

  return (
    <div className="flex flex-col items-center justify-center space-y-4 [@media(max-height:500px)]:space-y-0 w-full flex-1 pb-6 [@media(max-height:500px)]:pb-0 min-h-0">
       <div className="bg-black border-4 border-zinc-800 [@media(max-height:500px)]:border-0  p-2 [@media(max-height:500px)]:p-0  relative ring-1 ring-zinc-700/50 w-full h-full flex overflow-hidden">
         {!isPlaying && (
           <div className="absolute inset-0 z-20 flex flex-wrap items-center justify-center  bg-zinc-950/20 px-8 gap-x-12 gap-y-12 content-center [@media(max-height:500px)]:flex-nowrap [@media(max-height:500px)]:justify-between [@media(max-height:500px)]:gap-4 [@media(max-height:500px)]:px-6">
                 <img 
                   src="/sprites/Hardware Store Game Logo.png" 
                   alt="Hardware Store Game" 
                   className="w-[550px] [@media(max-height:500px)]:w-[35%] max-w-[55%] [@media(max-width:900px)]:max-w-[70%] order-1 object-contain )] hover:scale-105 transition-transform duration-[2000ms] ease-in-out shrink-0"
                 />
                 <button 
                   onClick={() => setIsPlaying(true)}
                   className="w-full [@media(max-height:500px)]:w-auto flex justify-center order-3 [@media(max-height:500px)]:order-2 hover:scale-105 active:scale-95 transition-transform duration-200 outline-none shrink-0"
                 >
                   <img src="/sprites/Play_btn.png" alt="Play Game" className="h-[80px] [@media(max-height:500px)]:h-[65px] object-contain )]" />
                 </button>
                 <img 
                    src="/sprites/Lore_txt.png"
                    alt="Today is the GRAND OPENING of the HARDWARE STORE! Make haste, and don't let anything or anyone slow you down! Pick up any hardware you find strewn on the beach!"
                    className="w-[320px] [@media(max-height:500px)]:w-[25%] max-w-[35%] [@media(max-width:900px)]:max-w-[60%] order-2 [@media(max-height:500px)]:order-3 object-contain )] shrink-0"
                 />
           </div>
         )}
         {isPlaying && isPaused && !isGameOver && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm ">
              <img 
                 src="/sprites/Paused_btn.png" 
                 alt="PAUSED" 
                 className="w-[450px] [@media(max-height:500px)]:w-[300px] max-w-[80%] object-contain mb-8 [@media(max-height:500px)]:mb-4 )]"
              />
              <div className="flex gap-10 [@media(max-height:500px)]:gap-6">
                 <button 
                   onClick={togglePause}
                   className="hover:scale-105 active:scale-95 transition-transform duration-200 outline-none"
                 >
                   <img src="/sprites/Resume_btn.png" alt="Resume Game" className="h-[80px] [@media(max-height:500px)]:h-[55px] object-contain )]" />
                 </button>
                 <button 
                   onClick={restartGame}
                   className="hover:scale-105 active:scale-95 transition-transform duration-200 outline-none"
                 >
                   <img src="/sprites/Restart_btn.png" alt="Restart Game" className="h-[80px] [@media(max-height:500px)]:h-[55px] object-contain )]" />
                 </button>
              </div>
              <button
                 onClick={() => window.location.href = '/'}
                 className="mt-8 [@media(max-height:500px)]:mt-4 bg-black border-2 border-zinc-700 px-6 py-2 text-xl font-bold font-mono tracking-widest hover:bg-red-950 hover:border-red-800 hover:text-red-300 text-zinc-400 transition-colors uppercase outline-none"
              >
                 Exit Game
              </button>
           </div>
         )}
         {isGameOver && (
           <div className="absolute bottom-8 right-1/2 translate-x-1/2 z-20 flex flex-col items-center gap-4">
               <button 
                 onClick={restartGame}
                 className="hover:scale-105 active:scale-95 transition-transform duration-200 outline-none"
               >
                 <img src="/sprites/Restart_btn.png" alt="Play Again" className="h-[80px] [@media(max-height:500px)]:h-[60px] object-contain )]" />
               </button>
               <button
                 onClick={() => window.location.href = '/'}
                 className="bg-black border-2 border-zinc-700 px-6 py-2 text-xl font-bold font-mono tracking-widest hover:bg-red-950 hover:border-red-800 hover:text-red-300 text-zinc-400 transition-colors uppercase outline-none"
               >
                 Exit Game
               </button>
           </div>
         )}
         {isPlaying && !isPaused && !isGameOver && (
           <>
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <button 
                   onClick={togglePause}
                   className="bg-surface border border-border px-4 py-1.5  text-xs font-bold tracking-widest hover:bg-surface-hover text-zinc-300 transition-colors"
                 >
                   PAUSE
                 </button>
                 <button 
                     onClick={() => setIsMusicMuted(m => !m)} 
                     className={`px-3 py-1.5  border text-xs font-bold tracking-widest transition-colors ${isMusicMuted ? 'bg-red-950 border-red-700 text-red-200' : 'bg-surface border-border text-zinc-300 hover:bg-surface-hover'}`}
                 >
                     {isMusicMuted ? '🔇 MUSIC' : '🎵 MUSIC'}
                 </button>
                 <button 
                     onClick={() => setIsSoundMuted(m => !m)} 
                     className={`px-3 py-1.5  border text-xs font-bold tracking-widest transition-colors ${isSoundMuted ? 'bg-red-950 border-red-700 text-red-200' : 'bg-surface border-border text-zinc-300 hover:bg-surface-hover'}`}
                 >
                     {isSoundMuted ? '🔇 SOUND' : '🔊 SOUND'}
                 </button>
             </div>
             <VirtualJoystick onMove={(x, y) => { joystickDeltaRef.current = { x, y }; }} />
           </>
         )}
         {/* Invisible font loader to force the browser to eagerly download the Canvas font */}
         <div style={{ fontFamily: '"Jersey 10", sans-serif', position: 'absolute', opacity: 0, pointerEvents: 'none' }}>.</div>
         <canvas 
            ref={canvasRef} 
            className="w-full h-full bg-background block  [image-rendering:pixelated]"
          />
       </div>
       <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-zinc-500 [@media(max-height:500px)]:hidden">
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">W</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">↑</kbd> Up</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">S</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">↓</kbd> Down</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">A</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">←</kbd> Left</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">D</kbd> / <kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">→</kbd> Right</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5  text-zinc-300">Space</kbd> Jump</div>
       </div>
    </div>
  );
}

function VirtualJoystick({ onMove }: { onMove: (x: number, y: number) => void }) {
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!baseRef.current || !stickRef.current) return;
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = baseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const maxDist = rect.width / 2;
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        
        onMove(dx / maxDist, dy / maxDist);
    };

    const handleEnd = () => {
        if (stickRef.current) stickRef.current.style.transform = `translate(0px, 0px)`;
        onMove(0, 0);
    };

    return (
        <div 
           className="absolute bottom-6 left-6 z-[160] w-32 h-32 border-[2.5px] border-white  flex items-center justify-center md:hidden touch-none"
           ref={baseRef}
           onTouchStart={handleMove}
           onTouchMove={handleMove}
           onTouchEnd={handleEnd}
           onMouseDown={handleMove}
           onMouseMove={(e) => { if (e.buttons === 1) handleMove(e); }}
           onMouseUp={handleEnd}
           onMouseLeave={handleEnd}
        >
           <div ref={stickRef} className="w-14 h-14 bg-white  )] pointer-events-none transition-transform duration-75" />
        </div>
    );
}
