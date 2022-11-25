import { Vector } from "./vector";

export interface IEntity extends Partial<Entity> { }

export class Entity {
  public id!: string;

  public left!: string;
  public top!: string;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
    orientation: 0,
    zIndex: 0,
    size: 0,
  };

  #position: Vector = new Vector();
  #orientation = 0;
  #zIndex = 0;
  public normalMap!: string;
  #size: Vector = new Vector();
  public offset!: Vector;

  #element!: HTMLElement;

  public get position(): Vector {
    return this.#position;
  }
  public set position(value: Vector) {
    if (value.x === this.#position.x && value.y === this.#position.y) {
      this.#position = value;
      return;
    }
    this.#position = value;
    this.left = `${this.#position.x - (this.size?.x / 2)}px`;
    this.top = `${this.#position.y - (this.size?.y / 2)}px`;
    this.updates.position++;
    this.version++;
  }

  public get x(): number {
    return this.#position.x;
  }
  public set x(value: number) {
    if (this.#position.x === value) {
      return;
    }
    this.#position.x = value;
    this.left = `${this.#position.x - (this.size?.x / 2)}px`;
    this.updates.position++;
    this.version++;
  }
  public get y(): number {
    return this.#position.y;
  }
  public set y(value: number) {
    if (this.#position.y === value) {
      return;
    }
    this.#position.y = value;
    this.top = `${this.#position.y - (this.size?.y / 2)}px`;
    this.updates.position++;
    this.version++;
  }

  public get orientation(): number {
    return this.#orientation;
  }
  public set orientation(value: number) {
    if (this.#orientation === value) {
      return;
    }
    this.#orientation = value;
    this.updates.orientation++;
    this.version++;
  }

  public get zIndex(): number {
    return this.#zIndex;
  }
  public set zIndex(value: number) {
    if (this.#zIndex === value) {
      return;
    }
    this.#zIndex = value;
    this.updates.zIndex++;
    this.version++;
  }

  public get size(): Vector {
    return this.#size;
  }
  public set size(value: Vector) {
    if (value.x === this.#size.x && value.y === this.#size.y) {
      this.#size = value;
      return;
    }
    this.#size = value;
    this.left = `${this.#position.x - (this.size?.x / 2)}px`;
    this.top = `${this.#position.y - (this.size?.y / 2)}px`;
    this.updates.size++;
    this.version++;
  }

  private constructor() {
    this.#position = new Vector();
  }

  public static create(input: IEntity): Entity {
    const entity = new Entity();

    entity.id = input.id as string;
    entity.position = input.position ?? entity.#position;
    entity.orientation = input.orientation ?? entity.#orientation;
    entity.zIndex = input.zIndex ?? entity.#zIndex;
    entity.normalMap = input.normalMap ?? entity.normalMap;
    entity.size = input.size ?? entity.size;
    entity.offset = input.offset ?? entity.offset;

    return entity;
  }
}
