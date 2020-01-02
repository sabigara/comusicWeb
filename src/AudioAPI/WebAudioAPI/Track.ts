import { ITrack } from '../interface';
import LoaderFactory from './loader/LoaderFactory';

export class Track implements ITrack {
  ac: AudioContext;
  _volume: number;
  gain: GainNode;
  pan: StereoPannerNode;
  analyzer: AnalyserNode;
  array:Uint8Array | null = null;
  id: string;
  name: string;
  buffer: AudioBuffer | null = null;
  source: AudioBufferSourceNode | null  = null;

  constructor(id: string, name: string, ac: AudioContext) {
    this.id = id;
    this.name = name;
    this.ac = ac;
    this._volume = 0;
    this.gain = ac.createGain();
    this.pan = ac.createStereoPanner();
    this.analyzer = ac.createAnalyser();
    this.array = new Uint8Array(this.analyzer.frequencyBinCount); 
  }

  async loadFile(url: string) {
    const loader = LoaderFactory.createLoader(url, this.ac);
    this.buffer = await loader.load();
  }

  play() {
    this.source = this.ac.createBufferSource()
    this.source.buffer = this.buffer;
    this.source.connect(this.gain).connect(this.pan).connect(this.analyzer).connect(this.ac.destination);
    this.source.start(this.ac.currentTime);
  }

  stop() {
    this.source?.stop();
  }

  setVolume(value: number) {
    this._volume = value;
    this.gain.gain.value = value;
  }

  setPan(value: number) {
    this.pan.pan.value = value;
  }

  mute() {
    this.gain.gain.value = 0;
  }

  unMute() {
    this.gain.gain.value = this._volume;
  }

  getPeak() {
    this.analyzer.getByteFrequencyData(this.array!);
    return Math.max.apply(null, Array.from(this.array!));
  }
}