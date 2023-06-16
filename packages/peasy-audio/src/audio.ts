import { Assets } from '@peasy-lib/peasy-assets';
import { Entity, IEntity } from "./entity";
import { Sound, ISound } from "./sound";
import { IVector, Vector3 } from './vector';

export class Audio {
  public static listener: { position: IVector };
  public static entities: Entity[] = [];
  public static sounds: Sound[] = [];

  public static audioCtx: AudioContext;
  public static audioListener: AudioListener;

  public static initialize(options: { listener: { position: IVector } }): void {
    try {
      this.audioCtx = new AudioContext();
    } catch (e) { }
    console.log(this.audioCtx);

    this.audioListener = this.audioCtx.listener;

    this.setListener(options.listener ?? { position: { x: 250, y: 250, z: -5 } });
    console.log(this);
  }

  public static update() {
    if (this.audioCtx.state === 'suspended') {
      console.log('Trying to resume audio context');
      try {
        void this.audioCtx.resume();
      } catch (e) { }
    }
    this._updateListener();
    this.entities.forEach(entity => entity.update());
    this.sounds.forEach(sound => sound.update());
  }

  public static setListener(listener: { position: IVector }) {
    this.listener = listener;
    this._updateListener();
  }

  public static addSound(sound: Sound | ISound): Sound {
    if (!(sound instanceof Sound)) {
      sound = Sound.create(sound);
      sound.ctx = this.audioCtx;
      const { audio, gain, panner } = this._createAudio(sound as Sound, (sound as Sound).entity);
      sound.audio = audio;
      sound.gain = gain;
      sound.panner = panner;
    }
    Audio.sounds.push(sound as Sound);
    return sound as Sound;
  }

  public static removeSound(sound: string | Sound) {
    const index = sound instanceof Sound
      ? Audio.sounds.findIndex(item => item === sound)
      : Audio.sounds.findIndex(item => item.id === sound);
    if (index < 0) {
      return;
    }
    // TODO: Needs to also destroy sound and sound entities
    Audio.sounds.splice(index, 1);
  }

  public static addEntities(entities: Entity | IEntity | (Entity | IEntity)[]) {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    return entities.map(input => {
      const entity = input instanceof Entity ? input : Entity.create(input);
      Audio.entities.push(entity);
      return entity;
    });
  }

  private static _updateListener() {
    const position = this.listener.position;
    position.z ??= -5;

    if (this.audioListener.positionX != null) {
      this.audioListener.positionX.value = position.x;
      this.audioListener.positionY.value = position.y;
      this.audioListener.positionZ.value = position.z;
    } else {
      this.audioListener.setPosition(position.x, position.y, position.z);
    }

    // TODO: Fix this for firefox
    if (this.audioListener.forwardX != null) {
      this.audioListener.forwardX.value = 0;
      this.audioListener.forwardY.value = 0;
      this.audioListener.forwardZ.value = -1;
      this.audioListener.upX.value = 0;
      this.audioListener.upY.value = 1;
      this.audioListener.upZ.value = 0;
    }
  }

  private static _createAudio(sound: Sound, entity: IEntity): { audio: HTMLAudioElement; gain: GainNode; panner: PannerNode } {
    const spatial = entity?.position != null;
    const position = entity?.position ?? { x: 0, y: 0, z: 0 };
    position.z ??= 0;

    const audio = Assets.audio(sound.name) ?? Assets.audio(sound.src);
    const source = this.audioCtx.createMediaElementSource(audio);
    const gain = this.audioCtx.createGain();
    gain.gain.value = sound.volume / (position == null ? 100 : 1);
    const panner = new PannerNode(this.audioCtx, {
      panningModel: 'HRTF',
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      refDistance: 1,
      maxDistance: 20000,
      distanceModel: 'exponential',
      rolloffFactor: 0.9,
      // distanceModel: 'linear',
      // rolloffFactor: 500,
    });

    if (spatial) {
      source.connect(gain).connect(panner).connect(this.audioCtx.destination);
    } else {
      source.connect(gain).connect(this.audioCtx.destination);
    }

    return { audio, gain, panner };
  }

}
