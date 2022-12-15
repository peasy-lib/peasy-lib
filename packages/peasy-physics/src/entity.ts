import { Physics } from './physics';
import { Force, IForce } from "./force";
import { IShape, Shape } from './shape';
import { IVector, Vector } from "./vector";

export interface IEntity extends Omit<Partial<Entity>, 'position'> {
  position?: IVector;
}

export interface IExternalEntity {
  position: IVector;
  orientation?: number;
}

export class Entity {
  public entity!: IExternalEntity;

  // Non-normalized velocity
  public velocity: Vector = new Vector();
  // Normalized velocity
  public direction!: Vector;
  // Speed for the direction
  public speed!: number;
  // How many times movement has changed in current step
  public movements = 0;

  public forces: Force[] = [];

  public color?: string;

  // public nextPosition!: Vector;

  // Shapes local to the the entity
  public shapes: Shape[] = [];
  public worldShapes: Shape[] = [];
  public collisionTypes: Record<string, Shape[]> = {};
  public signalTypes: Record<string, Shape[]> = {};

  #position: Vector;
  #orientation = 0;

  public get left(): number {
    return this.position.x + this.shapes[0].shape.size.negHalf.x;
  }
  public get top(): number {
    return this.position.y + this.shapes[0].shape.size.negHalf.y;
  }

  public get position(): Vector {
    return this.#position;
  }
  public set position(value: IVector) {
    if (value.x === this.#position.x && value.y === this.#position.y) {
      if (value instanceof Vector) {
        this.#position = value;
      }
      return;
    }
    this.#position = value instanceof Vector ? value : new Vector(value.x, value.y);
  }

  public get orientation(): number {
    return this.#orientation;
  }
  public set orientation(value: number) {
    if (this.#orientation === value) {
      return;
    }
    this.#orientation = value;
  }

  private constructor() {
    this.#position = new Vector();
  }

  public static create(input: IEntity): Entity {
    const entity = new Entity();

    entity.entity = (input as IEntity).entity ?? input as IExternalEntity;

    entity.position = new Vector(entity.entity.position.x, entity.entity.position.y);
    entity.orientation = input.orientation ?? entity.#orientation;

    entity.forces = (input.forces ?? []).map(force => (force instanceof Force) ? force : force = Force.create(force));

    entity.color = input.color;

    (input.shapes ?? []).forEach(shape => entity.addShape(shape));

    return entity;
  }

  public addForce(force: Force | IForce) {
    if (!(force instanceof Force)) {
      force = Force.create(force);
    }
    this.forces.push(force as Force);
  }

  public applyForces(deltaTime: number, now: number): boolean {
    if (this.position == null) {
      return false;
    }
    for (let i = 0; i < this.forces.length; i++) {
      const force = this.forces[i];
      force.update(deltaTime, now);
      this.velocity.add(force.effect, true);
      if (force.duration <= 0) {
        this.forces.splice(i--, 1);
      }
    }
    this.movements = 0; // Amount of movements in current step
    return true;
    // this.forces.forEach(force => {
    //   force.update(deltaTime, now);
    //   this.velocity.add(force.effect, true);
    // });
  }

  public addShape(shape: Shape | IShape): Shape {
    if (!(shape instanceof Shape)) {
      shape = Shape.create(this, shape);
    }
    this.shapes.push(shape);
    this.#updateShapes();
    return shape;
  }

  public prepareMovement(deltaTime: number, now: number): boolean {
    this.direction = this.velocity.normalize();
    this.speed = ++this.movements < 5 ? Math.abs(this.velocity.magnitude) : 0; // Limit amount of movements in step

    if (this.speed < 0.1) {
      this.speed = 0;
    }

    // this.nextPosition = new Vector(this.position.x, this.position.y).add(this.velocity.multiply(deltaTime));

    return this.speed > 0;
    // return {
    //   entity: this,
    //   moving: !this.velocity.zero,
    //   direction: this.velocity.normalize(),
    //   magnitude: this.velocity.magnitude,
    //   velocity: this.velocity,
    //   nextPosition: this.nextPosition,
    //   shapes: this.worldShapes,
    // };
  }

  public move(direction: Vector, magnitude: number, deltaTime: number): void {
    this.position.add(direction.multiply(magnitude * deltaTime), true);
  }

  public moveTo(to: Vector): void {
    this.position.x = to.x;
    this.position.y = to.y;
    this.worldShapes = this.shapes.map(shape => shape.worldShape);
  }

  #updateShapes(): void {
    this.collisionTypes = {};
    this.signalTypes = {};
    for (const shape of this.shapes) {
      for (const type of shape.types) {
        if (Physics.collisions[type] != null) {
          if (this.collisionTypes[type] == null) {
            this.collisionTypes[type] = [];
          }
          this.collisionTypes[type].push(shape);
        }
        if (Physics.signals[type] != null) {
          if (this.signalTypes[type] == null) {
            this.signalTypes[type] = [];
          }
          this.signalTypes[type].push(shape);
        }
      }
    }
  }
}
