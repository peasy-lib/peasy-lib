import { Physics } from './physics';
import { Force, IForce } from "./force";
import { IShape, Shape } from './shape';
import { IVector, Vector } from "./vector";
import { Rect } from './rect';

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

  public mass: number = 1;
  public forces: Force[] = [];

  public maxSpeed = 1000000;

  public color?: string;

  // public nextPosition!: Vector;

  // Shapes local to the the entity
  public shapes: Shape[] = [];
  public worldShapes: Shape[] = [];
  public collisionTypes: Record<string, Shape[]> = {};
  public signalTypes: Record<string, Shape[]> = {};

  // The radius (not squared) for the entity's shapes
  public boundingRadius!: number;
  // The maximum movement radius (squared) for the entity's shapes
  public movementRadius!: number;
  // The maximum movement radius (NOT squared) for the entity's shapes (for debugging)
  public movementRadiusDebug!: number;
  // The bounding box for the entity's shapes
  public boundingBox!: Rect;
  // The maximum movement box for the entity's shapes
  public movementBox!: Rect;

  // Entities near this entity (found in broad phase)
  public near = new Set<Entity>();
  // The entities this entity that has already been checked in this time iteration
  // public nearChecked = new Set<Entity>();

  private _position: Vector;
  private _orientation = 0;

  public get left(): number {
    return this.position.x + this.shapes[0].shape.size.negHalf.x;
  }
  public get top(): number {
    return this.position.y + this.shapes[0].shape.size.negHalf.y;
  }

  public get position(): Vector {
    return this._position;
  }
  public set position(value: IVector) {
    if (value.x === this._position.x && value.y === this._position.y) {
      if (value instanceof Vector) {
        this._position = value;
      }
      return;
    }
    this._position = value instanceof Vector ? value : new Vector(value.x, value.y);
  }

  public get orientation(): number {
    return this._orientation;
  }
  public set orientation(value: number) {
    if (this._orientation === value) {
      return;
    }
    this._orientation = value;
  }

  private constructor() {
    this._position = new Vector();
  }

  public static create(input: IEntity): Entity {
    const entity = new Entity();

    entity.entity = (input as IEntity).entity ?? input as IExternalEntity;

    entity.position = new Vector(entity.entity.position.x, entity.entity.position.y);
    entity.orientation = input.orientation ?? entity._orientation;

    entity.mass = input.mass ?? entity.mass;
    entity.forces = (input.forces ?? []).map(force => (force instanceof Force) ? force : force = Force.create(force));

    entity.maxSpeed = input.maxSpeed ?? entity.maxSpeed;

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
      const effect = force.effect(this);
      // console.log(force.name, effect);
      this.velocity.add(effect, true);
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
    this._updateShapes();
    this.boundingRadius = this._getBoundingRadius();
    this.movementRadius = this._getMovementRadius(1 / 60);
    this.boundingBox = this._getBoundingBox();
    this.movementBox = this._getMovementBox(1 / 60);

    return shape;
  }

  public prepareMovement(deltaTime: number, now: number): boolean {
    this.direction = this.velocity.normalize();

    // Limit amount of movements in step (15 limited to max speed, then 5 more unlimited, then stop)
    if (++this.movements < 15) {
      this.speed = Math.abs(this.velocity.magnitude);
    } else if (this.movements >= 20) {
      // console.log('########### Limited movement', this);
      this.speed = 0;
    }
    // this.speed = ++this.movements < 20 ? Math.abs(this.velocity.magnitude) : 0; // Limit amount of movements in step

    if (this.speed < 0.00001) {
      this.speed = 0;
      this.velocity = new Vector();
    }

    if (this.speed > this.maxSpeed && this.movements < 15) {
      this.speed = this.maxSpeed;
      this.velocity = this.direction.multiply(this.speed);
    }

    // this.nextPosition = new Vector(this.position.x, this.position.y).add(this.velocity.multiply(deltaTime));
    this.movementBox = this._getMovementBox(deltaTime);
    const movementRadius = this._getMovementRadius(deltaTime);
    if (movementRadius !== this.movementRadius) {
      this.movementRadius = movementRadius;
      Physics.updateEntity(this);
    }

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

  public move(deltaTime: number): void {
    this.position.add(this.direction.multiply(this.speed * deltaTime), true);
    Physics.updateEntity(this);
  }

  public moveTo(to: Vector): void {
    this.position.x = to.x;
    this.position.y = to.y;
    this.worldShapes = this.shapes.map(shape => shape.worldShape);
    Physics.updateEntity(this);
  }

  public getSurfaceArea(): number {
    return this.shapes[0].shape.area;
  }

  private _updateShapes(): void {
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
  private _getBoundingRadius(): number {
    return Math.max(...this.shapes.map(shape => shape.shape.boundingRadius));
  }
  private _getBoundingBox(): Rect {
    const left = Math.min(...this.shapes.map(shape => shape.shape.left));
    const right = Math.max(...this.shapes.map(shape => shape.shape.right));
    const top = Math.min(...this.shapes.map(shape => shape.shape.top));
    const bottom = Math.max(...this.shapes.map(shape => shape.shape.bottom));

    return new Rect(new Vector(), new Vector(right - left, bottom - top));
  }

  private _getMovementRadius(deltaTime: number): number {
    // return this.boundingRadius * this.boundingRadius;
    const movement = Math.min(this.maxSpeed * Math.min(deltaTime * 4, 0.1), this.maxSpeed);
    const movementRadius = this.boundingRadius + movement; // (this.maxSpeed / 10); //; (this.maxSpeed * deltaTime * 2);
    this.movementRadiusDebug = movementRadius;
    return movementRadius * movementRadius;
  }

  private _getMovementBox(deltaTime: number): Rect {
    // const movement = Math.min(this.speed * Math.min(deltaTime, 0.1), this.speed) * 2;
    const movement = Math.min(this.maxSpeed * Math.min(deltaTime, 0.1), this.maxSpeed) * 2;
    const movementBox = this.boundingBox.clone();
    movementBox.size.add(new Vector(movement, movement), true);
    return movementBox;
  }
}
