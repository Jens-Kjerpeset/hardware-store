export class WebAudioEngine {
    static ctx: AudioContext | null = null;
    static buffers: Map<string, AudioBuffer> = new Map();

    static init() {
        if (typeof window === 'undefined') return;
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) this.ctx = new AudioContextClass();
        }
    }

    static preload(src: string): Promise<any> {
        if (typeof window === 'undefined') return Promise.resolve();
        if (!this.ctx) this.init();
        if (this.buffers.has(src) || !this.ctx) return Promise.resolve();
        
        // Cache the buffer instantly into explicit memory, skipping QuickTime wrappers
        return fetch(src)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => this.ctx!.decodeAudioData(arrayBuffer))
            .then(audioBuffer => this.buffers.set(src, audioBuffer))
            .catch(e => console.error("Audio decode error", src, e));
    }

    static play(src: string, volume: number) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const buffer = this.buffers.get(src);
        if (!buffer) {
            this.preload(src).then(() => {
                const updatedBuffer = this.buffers.get(src);
                if (updatedBuffer) {
                    const source = this.ctx!.createBufferSource();
                    source.buffer = updatedBuffer;
                    const gainNode = this.ctx!.createGain();
                    gainNode.gain.value = volume;
                    source.connect(gainNode);
                    gainNode.connect(this.ctx!.destination);
                    source.start(0);
                }
            });
            return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
    }
}

export class ImageManager {
    static cache: Map<string, HTMLImageElement> = new Map();

    static getImage(src: string): HTMLImageElement {
        if (typeof window === 'undefined') return {} as HTMLImageElement; // SSR fallback
        
        if (this.cache.has(src)) {
            return this.cache.get(src)!;
        }
        
        const img = new Image();
        img.src = src;
        this.cache.set(src, img);
        return img;
    }
}
