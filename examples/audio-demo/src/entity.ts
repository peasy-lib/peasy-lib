import { Audio } from '@peasy-lib/peasy-audio';

export interface IVector {
  x: number;
  y: number;
}

export class Entity {
  public element!: HTMLElement;

  public offset: IVector = { x: 0, y: 0 };
  public id?: string;

  public movement = 0;

  public direction = 'right';

  public walkingSound = Audio.addSound({ name: 'walk', entity: this, volume: 20, loop: true });

  public constructor(
    public position: IVector,
    public size: IVector,
    public orientation = 0,
    public scale = '100%',
    public zIndex = 0,
  ) { }

  public get walking(): boolean {
    return this.movement !== 0;
  }

  public update(movement: number) {
    if (movement !== 0) {
      this.direction = movement > 0 ? 'right' : 'left';
      this.walkingSound.play();
    } else {
      this.walkingSound.stop();
    }

    this.position.x += movement * 5;
  }
}
