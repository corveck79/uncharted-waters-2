class AudioState {
  private audio: HTMLAudioElement | null = null;
  private _volume = 0.7;
  private _muted = false;

  register(audio: HTMLAudioElement) {
    this.audio = audio;
    this.audio.volume = this._volume;
    this.audio.muted = this._muted;
  }

  get volume() {
    return this._volume;
  }

  get muted() {
    return this._muted;
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.audio) this.audio.volume = v;
  }

  setMuted(m: boolean) {
    this._muted = m;
    if (this.audio) this.audio.muted = m;
  }
}

export const audioState = new AudioState();
