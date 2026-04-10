import re

with open("/Users/jens/Documents/Antigravity/Home_Page/Hardware_store_v2/src/components/game/HardwareStoreGame.tsx", "r") as f:
    content = f.read()

# Replace all `new Audio` with `createAudio`
content = content.replace("new Audio(", "createAudio(")

# Restore the two background audios back to `new Audio`
content = content.replace("bgmRef.current = createAudio('/sounds/Hardware Store.mp3');", "bgmRef.current = new Audio('/sounds/Hardware Store.mp3');")
content = content.replace("menuBgmRef.current = createAudio('/sounds/BeachDay.ogg');", "menuBgmRef.current = new Audio('/sounds/BeachDay.ogg');")

# We need to insert the createAudio function and states right after `const menuBgmRef = useRef<HTMLAudioElement | null>(null);`
injector = """
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const isSoundMutedRef = useRef(false);
  useEffect(() => { isSoundMutedRef.current = isSoundMuted; }, [isSoundMuted]);

  const createAudio = (src: string) => {
      const audio = new Audio(src);
      const originalPlay = audio.play.bind(audio);
      audio.play = () => {
          if (isSoundMutedRef.current) return Promise.resolve();
          return originalPlay();
      };
      return audio;
  };
"""

content = content.replace("const menuBgmRef = useRef<HTMLAudioElement | null>(null);", "const menuBgmRef = useRef<HTMLAudioElement | null>(null);\n" + injector)

# We also need to update the useEffect that controls background music to support `isMusicMuted`
old_effect = """
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

     if (isPlaying && !isPaused && !isGameOver) {
         bgmRef.current.play().catch(() => {});
         menuBgmRef.current.pause(); // Suppress Menu music natively cleanly
     } else {
         bgmRef.current.pause();
         if (!isGameOver) {
             menuBgmRef.current.play().catch(() => {});
         } else {
             menuBgmRef.current.pause();
         }
     }

     return () => {
         if (bgmRef.current) bgmRef.current.removeEventListener('pause', handleBgmPause);
         if (menuBgmRef.current) menuBgmRef.current.removeEventListener('pause', handleMenuPause);
     };
  }, [isPlaying, isPaused, isGameOver]);"""

new_effect = """
  useEffect(() => {
     if (!bgmRef.current || !menuBgmRef.current) return;

     const handleBgmPause = () => {
         if (isPlaying && !isPaused && !isGameOver) {
             bgmRef.current?.play().catch(() => {});
         }
     };

     const handleMenuPause = () => {
         if (!(isPlaying && !isPaused && !isGameOver) || isMusicMuted) {
             menuBgmRef.current?.play().catch(() => {});
         }
     };

     bgmRef.current.addEventListener('pause', handleBgmPause);
     menuBgmRef.current.addEventListener('pause', handleMenuPause);

     if (isMusicMuted) {
         bgmRef.current.volume = 0;
         menuBgmRef.current.play().catch(() => {});
     } else {
         bgmRef.current.volume = 0.5;
     }

     if (isPlaying && !isPaused && !isGameOver) {
         bgmRef.current.play().catch(() => {});
         if (!isMusicMuted) {
             menuBgmRef.current.pause();
         }
     } else {
         bgmRef.current.pause();
         if (!isGameOver) {
             menuBgmRef.current.play().catch(() => {});
         } else {
             menuBgmRef.current.pause();
         }
     }

     return () => {
         if (bgmRef.current) bgmRef.current.removeEventListener('pause', handleBgmPause);
         if (menuBgmRef.current) menuBgmRef.current.removeEventListener('pause', handleMenuPause);
     };
  }, [isPlaying, isPaused, isGameOver, isMusicMuted]);"""

content = content.replace(old_effect, new_effect)

# Find the container for UI buttons.
# `<div className="relative overflow-hidden` ... `style={{ width: '100%', height: '100%' }}>`
ui_buttons = """
         <div className="absolute top-4 left-4 z-50 flex gap-2 text-xs font-mono text-white select-none">
            <button 
                onClick={() => setIsMusicMuted(m => !m)} 
                className={`px-3 py-2 rounded-lg border outline-none transition-colors shadow-lg flex items-center gap-2 ${isMusicMuted ? 'bg-red-950/80 border-red-700/50 text-red-200 hover:bg-red-900/80' : 'bg-black/60 border-zinc-700/50 hover:bg-black/80'}`}
            >
                {isMusicMuted ? '🔇 MUSIC' : '🔊 MUSIC'}
            </button>
            <button 
                onClick={() => setIsSoundMuted(m => !m)} 
                className={`px-3 py-2 rounded-lg border outline-none transition-colors shadow-lg flex items-center gap-2 ${isSoundMuted ? 'bg-red-950/80 border-red-700/50 text-red-200 hover:bg-red-900/80' : 'bg-black/60 border-zinc-700/50 hover:bg-black/80'}`}
            >
                {isSoundMuted ? '🔇 SFX' : '🔊 SFX'}
            </button>
         </div>
"""

content = content.replace("style={{ width: '100%', height: '100%' }}>", "style={{ width: '100%', height: '100%' }}>\n" + ui_buttons)

with open("/Users/jens/Documents/Antigravity/Home_Page/Hardware_store_v2/src/components/game/HardwareStoreGame.tsx", "w") as f:
    f.write(content)
