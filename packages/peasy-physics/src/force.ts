import { Entity } from './entity';
import { IVector, Vector } from "./vector";

export interface IForce extends Partial<Force> { }

export class Force {
  public direction?: IVector;
  public maxMagnitude!: number;
  public acceleration?: number;
  public deceleration?: number;

  public callback?: (force: Force, entity: Entity) => Vector;

  public constructor(
    public name: string | undefined,
    public duration: number,
  ) { }

  public startTime: number | null = null;
  public magnitude = 0;

  public static create(input: IForce): Force {
    const force = new Force(
      input.name,
      input.duration ?? 0,
    );

    force.direction = input.direction;
    force.maxMagnitude = input.maxMagnitude ?? 1;

    force.acceleration = input.acceleration;
    force.deceleration = input.deceleration;

    force.callback = input.callback;

    return force;
  }

  public update(deltaTime: number, now: number) {
    // if (this.name === 'gravity') {
    //   console.log('Force', this.magnitude);
    // }
    if (this.duration !== 0 && this.duration !== Infinity) {
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
    if (this.callback != null) {
      return;
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

  public effect(entity: Entity): Vector {
    return this.callback != null
      ? (() => this.callback(this, entity))()
      : new Vector((this.direction?.x ?? 1) * this.magnitude, (this.direction?.y ?? 1) * this.magnitude);
  }

  public reset(): Force {
    this.startTime = null;
    this.magnitude = 0;
    return this;
  }

  public clone(): Force {
    return Force.create(this);
  }

  public static Drag(options: IDragOptions = {}): Force {
    options.density ??= 1;
    options.coefficient ??= 0.1;
    options.surface ??= (force: Force, entity: Entity): number => {
      return (entity as Entity & { getSurfaceArea(): number }).getSurfaceArea?.() ?? 500;
    };
    const drag = -0.5 * options.density * (options.coefficient / 1000000);

    return Force.create({
      name: 'drag',
      duration: Infinity,
      callback: (force: Force, entity: Entity): Vector => function (force: Force, entity: Entity, drag: number, callback: (force: Force, entity: Entity) => number) {
        // console.log('FORCE', force.name, entity, density, coefficient);
        const velocity = entity.velocity.normalize();
        const speed = entity.velocity.magnitude;
        const surface = callback(force, entity);
        return velocity.multiply(drag * surface * speed * speed, true);
      }(force, entity, drag, options.surface!)
    });
  }

  public static Gravity(options: IGravityOptions = {}): Force {
    options.G ??= 1;
    options.direction ??= new Vector(0, 1);

    return Force.create({
      name: 'gravity',
      duration: Infinity,
      direction: options.direction,
      magnitude: options.G * 10000,
    });
  }
}

export interface IDragOptions {
  density?: number;
  coefficient?: number;
  surface?: (force: Force, entity: Entity) => number;
}

export interface IGravityOptions {
  G?: number;
  direction?: Vector;
}
