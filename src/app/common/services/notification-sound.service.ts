import { Injectable } from '@angular/core';

/**
 * Synthesizes short notification chimes with the Web Audio API so the app
 * doesn't depend on any external audio asset. Reusable for future realtime
 * events — just add a new play method here.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationSoundService {
    private audioContext: AudioContext | null = null;

    /** Cheerful ascending 3-note chime, like a shop register "cha-ching". */
    playNewOrder(): void {
        const ctx = this.getContext();

        if (!ctx) {
            return;
        }

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        this.playTone(ctx, 987.77, now, 0.16, 0.22); // B5
        this.playTone(ctx, 1318.51, now + 0.09, 0.18, 0.24); // E6
        this.playTone(ctx, 1567.98, now + 0.2, 0.28, 0.22); // G6
    }

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') {
            return null;
        }

        if (!this.audioContext) {
            const AudioContextCtor =
                window.AudioContext ?? (window as any).webkitAudioContext;

            if (!AudioContextCtor) {
                return null;
            }

            this.audioContext = new AudioContextCtor();
        }

        return this.audioContext;
    }

    private playTone(
        ctx: AudioContext,
        frequency: number,
        startTime: number,
        duration: number,
        peakGain: number
    ): void {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.02);
    }
}
