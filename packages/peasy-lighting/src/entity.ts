import { IVector, Vector } from "./vector";

export interface IEntity extends Omit<Partial<Entity>, 'position' | 'size'> {
  position?: IVector;
  size?: IVector;
}

export interface IExternalEntity {
  position: IVector;
  size: IVector;
  orientation?: number;
  scale?: string;
  zIndex?: number;
  offset?: IVector;
  id?: string;
}

export class Entity {
  public entity!: IExternalEntity;
  public id!: string;

  public left!: string;
  public top!: string;

  public version = 0;
  public updates: Record<string, number> = {
    position: 0,
    orientation: 0,
    scale: 0,
    zIndex: 0,
    size: 0,
    offset: 0,
  };

  private _position: Vector;
  private _orientation = 0;
  private _scale = '1';
  private _zIndex = 0;
  public normalMap!: string;
  private _size: Vector = new Vector();
  private _offset: Vector = new Vector();

  private readonly _element!: HTMLElement;

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
    this.left = `${this._position.x - (this.size?.x / 2)}px`;
    this.top = `${this._position.y - (this.size?.y / 2)}px`;
    this.updates.position++;
    this.version++;
  }

  /* Not sure whether this is needed/useful
  public get x(): number {
    return this._position.x;
  }
  public set x(value: number) {
    if (this._position.x === value) {
      return;
    }
    this._position.x = value;
    this.left = `${this._position.x - (this.size?.x / 2)}px`;
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
    this.top = `${this._position.y - (this.size?.y / 2)}px`;
    this.updates.position++;
    this.version++;
  }
  */

  public get orientation(): number {
    return this._orientation;
  }
  public set orientation(value: number) {
    if (this._orientation === value) {
      return;
    }
    this._orientation = value;
    this.updates.orientation++;
    this.version++;
  }

  public get scale(): string {
    return this._scale;
  }
  public set scale(value: string) {
    if (this._scale === value) {
      return;
    }
    this._scale = value;
    this.updates.scale++;
    this.version++;
  }

  public get zIndex(): number {
    return this._zIndex;
  }
  public set zIndex(value: number) {
    if (this._zIndex === value) {
      return;
    }
    this._zIndex = value;
    this.updates.zIndex++;
    this.version++;
  }

  public get size(): Vector {
    return this._size;
  }
  public set size(value: IVector) {
    if (value.x === this._size.x && value.y === this._size.y) {
      if (value instanceof Vector) {
        this._size = value;
      }
      return;
    }
    this._size = value instanceof Vector ? value : new Vector(value.x, value.y);
    this.left = `${this._position.x - (this.size?.x / 2)}px`;
    this.top = `${this._position.y - (this.size?.y / 2)}px`;
    this.updates.size++;
    this.version++;
  }

  public get offset(): Vector {
    return this._offset;
  }
  public set offset(value: IVector) {
    if (value.x === this._offset.x && value.y === this._offset.y) {
      if (value instanceof Vector) {
        this._offset = value;
      }
      return;
    }
    this._offset = value instanceof Vector ? value : new Vector(value.x, value.y);
    this.updates.offset++;
    this.version++;
  }

  private constructor() {
    this._position = new Vector();
  }

  public static create(input: IEntity | IExternalEntity): Entity {
    const entity = new Entity();

    entity.entity = (input as IEntity).entity ?? input as IExternalEntity;

    entity.id = entity.entity.id as string;
    entity.position = new Vector(entity.entity.position.x, entity.entity.position.y);
    entity.orientation = input.orientation ?? entity._orientation;
    entity.scale = input.scale ?? entity._scale;
    entity.zIndex = input.zIndex ?? entity._zIndex;
    entity.normalMap = (input as IEntity).normalMap ?? entity.normalMap;
    entity.size = new Vector(entity.entity.position.x, entity.entity.position.y);
    entity.offset = (input as IEntity).offset ?? entity.offset;

    return entity;
  }

  public update(): void {
    this.position = this.entity.position;
    this.size = this.entity.size;
    if (this.entity.orientation != null) {
      this.orientation = this.entity.orientation;
    }
    if (this.entity.scale != null) {
      this.scale = this.entity.scale;
    }
    if (this.entity.zIndex != null) {
      this.zIndex = this.entity.zIndex;
    }
    if (this.entity.offset != null) {
      this.offset = this.entity.offset;
    }
  }
}
