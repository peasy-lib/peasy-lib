import { IEntity } from './entity';
import { IVector, Vector3 } from "./vector";

export interface ISound extends Partial<Sound> { }

export interface IExternalSound {
  position: IVector;
}

export class Sound {
  public entity!: IExternalSound;
  public id!: string;

  public type: 'music' | 'effect' = 'music';
  public name!: string;
  public src!: string;
  public volume!: number;
  public autoplay!: boolean;
  public loop!: boolean;

  public doPlay = false;
  public doStop = false;
  public playing = false;

  public playPromise: Promise<any> | null = null;

  public ctx!: AudioContext;

  public audio!: HTMLAudioElement;
  public gain!: GainNode;
  public panner!: PannerNode;


  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
  };
  private readonly _updated: Set<string> = new Set();

  private _position: Vector3 = new Vector3();

  public get position(): Vector3 {
    return this._position;
  }
  public set position(value: IVector) {
    if (value == null) {
      if (this._position != null) {
        this._position = value;
        this._updated.add('position');
        this.updates.position++;
        this.version++;
      }
      return;
    }
    if (value.x === this._position.x && value.y === this._position.y) {
      if (value instanceof Vector3) {
        this._position = value;
      }
      return;
    }
    this._position = value instanceof Vector3 ? value : new Vector3(value.x, value.y);
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }

  public get x(): number {
    return this._position.x;
  }
  public set x(value: number) {
    if (this._position.x === value) {
      return;
    }
    this._position.x = value;
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }
  public get y(): number {
    return this._position.y;
  }
  public set y(value: number) {
    if (this._position.y === value) {
      return;
    }
    this._position.y = value;
    this._updated.add('position');
    this.updates.position++;
    this.version++;
  }

  private constructor() { }

  public static create(input: ISound): Sound {
    const sound = new Sound();

    sound.entity = (input as ISound).entity ?? input as IExternalSound;

    sound.id = (input as ISound).id as string;
    if (sound.entity.position != null) {
      sound.position = new Vector3(sound.entity.position.x, sound.entity.position.y);
    }

    sound.name = input.name ?? sound.name;
    sound.src = input.src ?? sound.src;
    sound.volume = input.volume ?? sound.volume;
    sound.autoplay = input.autoplay ?? sound.autoplay;
    sound.loop = input.loop ?? sound.loop;
    sound.doPlay = !!sound.autoplay;

    return sound;
  }

  public play(): void {
    this.doPlay = true;
  }
  public stop(): void {
    this.doPlay = false;
    this.doStop = true;
  }
  public pause(): void {
    this.doPlay = false;
  }

  public update(): void {
    this._updateFromEntity();
    this._updateProperties();

    if (this.doPlay) {
      if (!this.playing) {
        if (this.ctx.state === 'running') {
          this.playPromise = this.audio.play();
          console.log('play sound', this);
          this.playing = true;
        }
      }
    } else {
      if (this.playing) {
        console.log('stop sound', this);
        void this.playPromise!.then(() => {
          console.log('paused sound', this);
          this.audio.pause();
          this.playPromise = null;
          this.playing = false;
        });
        console.log('stopped sound', this);
      }
      if (this.doStop) {
        this.audio.currentTime = 0;
      }
    }
    if (this.position != null) {
      this.panner.positionX.value = this.position.x;
      this.panner.positionY.value = this.position.y;
      this.panner.positionZ.value = this.position.z;
    }
    this.gain.gain.value = this.volume / (this.entity.position == null ? 100 : 1);
    this.audio.loop = this.loop;

    this._updated.clear();
  }

  private _updateFromEntity(): void {
    this.position = this.entity.position;
  }

  private _updateProperties(): void {
    for (const update of this._updated) {
      // console.log('Updating sound:', update);
      switch (update) {
        case 'position': {
          break;
        }
      }
    }
  }
}
