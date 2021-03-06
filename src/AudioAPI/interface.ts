export type LoadFunc = (src: string, ac: AudioContext) => Promise<AudioBuffer>;

export interface ITrack {
  readonly duration: number;
  readonly isPlaying: boolean;
  loadFile(url: string): Promise<void>;
  clearBuffer(): void;
  play(offset: number): Promise<void>;
  stop(): void;
  setVolume(value: number): void;
  setPan(value: number): void;
  // Dynamically get real-time peak.
  readonly peak: number | null;
  // Statically get every peaks of whole audio buffer.
  getPeakList(): { length: number; data: number[][]; bits: number } | null;
  mute(): void;
  unMute(): void;
  release(): void;
}

export default interface IAudioAPI {
  readonly tracks: { [key: string]: ITrack };
  readonly sampleRate: number;
  readonly resolution: number;
  readonly secondsElapsed: number;
  readonly masterPeak: number;
  time: number;
  loadTrack(id: string): ITrack;
  getTrack(id: string): ITrack | null;
  // Return Promise that indicates all tracks has ended.
  play(): Promise<void[]>;
  stop(): void;
  setMasterVolume(value: number): void;
  onTimeUpdate(callback: (time: number) => void): void;
  removeListeners(): void;
  release(): void;
}
