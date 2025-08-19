'use client';

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  private constructor() {
    this.initializeAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chillcampus-sound-enabled', enabled.toString());
    }
  }

  public getEnabled(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chillcampus-sound-enabled');
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('chillcampus-sound-volume', this.volume.toString());
    }
  }

  public getVolume(): number {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chillcampus-sound-volume');
      if (stored !== null) {
        return parseFloat(stored);
      }
    }
    return this.volume;
  }

  // Generate notification sound using Web Audio API
  private generateNotificationSound(frequency: number = 800, duration: number = 200, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.getEnabled()) return;

    try {
      // Resume audio context if suspended (for browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.getVolume() * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // Different sound types for different events
  public playNewMessageSound() {
    // Gentle notification sound
    this.generateNotificationSound(650, 300, 'sine');
    setTimeout(() => {
      this.generateNotificationSound(800, 200, 'sine');
    }, 100);
  }

  public playDirectMessageSound() {
    // More prominent sound for direct messages
    this.generateNotificationSound(900, 250, 'triangle');
    setTimeout(() => {
      this.generateNotificationSound(700, 300, 'sine');
    }, 150);
  }

  public playTypingSound() {
    // Subtle typing indicator sound
    this.generateNotificationSound(400, 50, 'square');
  }

  public playConnectSound() {
    // Pleasant connection sound
    this.generateNotificationSound(523, 200, 'sine'); // C5
    setTimeout(() => {
      this.generateNotificationSound(659, 200, 'sine'); // E5
    }, 150);
    setTimeout(() => {
      this.generateNotificationSound(784, 300, 'sine'); // G5
    }, 300);
  }

  public playDisconnectSound() {
    // Descending sound for disconnection
    this.generateNotificationSound(784, 200, 'sine'); // G5
    setTimeout(() => {
      this.generateNotificationSound(659, 200, 'sine'); // E5
    }, 150);
    setTimeout(() => {
      this.generateNotificationSound(523, 300, 'sine'); // C5
    }, 300);
  }

  public playErrorSound() {
    // Error indication sound
    this.generateNotificationSound(300, 400, 'sawtooth');
  }

  public playSuccessSound() {
    // Success indication sound
    this.generateNotificationSound(800, 150, 'sine');
    setTimeout(() => {
      this.generateNotificationSound(1000, 150, 'sine');
    }, 100);
    setTimeout(() => {
      this.generateNotificationSound(1200, 200, 'sine');
    }, 200);
  }

  // Test sound for settings
  public playTestSound() {
    this.playNewMessageSound();
  }

  // Enable sound after user interaction (for browser autoplay policies)
  public enableSoundAfterUserInteraction() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// React hook for using sound manager
import { useEffect, useState } from 'react';

export function useSoundManager() {
  const [soundManager] = useState(() => SoundManager.getInstance());
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    setIsEnabled(soundManager.getEnabled());
    setVolume(soundManager.getVolume());
  }, [soundManager]);

  const toggleSound = () => {
    const newEnabled = !isEnabled;
    soundManager.setEnabled(newEnabled);
    setIsEnabled(newEnabled);
  };

  const updateVolume = (newVolume: number) => {
    soundManager.setVolume(newVolume);
    setVolume(newVolume);
  };

  const playTest = () => {
    soundManager.playTestSound();
  };

  // Enable sound after user interaction
  useEffect(() => {
    const enableSound = () => {
      soundManager.enableSoundAfterUserInteraction();
    };

    // Add listeners for user interactions
    document.addEventListener('click', enableSound, { once: true });
    document.addEventListener('keydown', enableSound, { once: true });
    document.addEventListener('touchstart', enableSound, { once: true });

    return () => {
      document.removeEventListener('click', enableSound);
      document.removeEventListener('keydown', enableSound);
      document.removeEventListener('touchstart', enableSound);
    };
  }, [soundManager]);

  return {
    soundManager,
    isEnabled,
    volume,
    toggleSound,
    updateVolume,
    playTest,
  };
}

export default SoundManager;
