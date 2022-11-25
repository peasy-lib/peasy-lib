import { IVector, Vector } from "./vector";

export interface IForce extends Partial<Force> { }

export class Force {
  public acceleration?: number;
  public deceleration?: number;

  public constructor(
    public name: string | undefined,
    public direction: IVector,
    public maxMagnitude: number,
    public duration: number,
  ) { }

  public startTime: number | null = null;
  public magnitude = 0;

  public static create(input: IForce): Force {
    const force = new Force(
      input.name,
      input.direction!,
      input.maxMagnitude!,
      input.duration!,
    );

    force.acceleration = input.acceleration;
    force.deceleration = input.deceleration;

    return force;
  }

  public update(deltaTime: number, now: number) {
    if (this.name === 'gravity') {
      console.log('Force', this.magnitude);
    }
    if (this.duration !== 0) {
      if (this.startTime == null) {
        this.startTime = now;
      }
      if (this.startTime + this.duration > now) {
        if (this.magnitude > 0) {
          if (this.deceleration == null) {
            this.magnitude = 0;
          } else {
            this.magnitude -= this.deceleration * deltaTime;
          }
        } else {
          return;
        }
      }
    }
    if (this.magnitude < this.maxMagnitude) {
      if (this.acceleration == null) {
        this.magnitude = this.maxMagnitude;
      } else {
        this.magnitude += this.acceleration * deltaTime;
        if (this.magnitude > this.maxMagnitude) {
          this.magnitude = this.maxMagnitude;
        }
      }
    }
  }

  public get effect(): Vector {
    return new Vector(this.direction.x * this.magnitude, this.direction.y * this.magnitude);
  }

  public reset(): Force {
    this.startTime = null;
    this.magnitude = 0;
    return this;
  }

  public clone(): Force {
    return Force.create(this);
  }
}
