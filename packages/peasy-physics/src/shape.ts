import { Circle } from './circle';
import { Entity } from './entity';
import { Rect } from './rect';
import { Stadium, StadiumAlignment } from './stadium';
import { Vector } from './vector';

export interface IShape extends Partial<Omit<Shape, 'shape'>> {
  entity: Entity;
  shape?: 'rect' | 'circle' | 'stadium';
  position?: number[] | Vector;
  size?: number[];
  alignment?: StadiumAlignment;
  orientation?: number;
  radius?: number;
}

export type ShapeType = Shape;

export class Shape {
  public name?: string;
  public shape!: Rect | Circle | Stadium;
  public types: string[] = [];
  public color?: string;
  public signal: any;

  public localShape?: Shape;

  // private #worldShape: Shape;

  public constructor(public entity: Entity) { }

  public get worldPosition(): Vector {
    const position = this.entity.position.add(this.shape.position);
    position.z += this.shape.position.z;
    return position;
  }

  public get worldShape(): Shape {
    const _worldShape = this.clone();
    (_worldShape.shape as Rect).worldSpace = true;
    _worldShape.shape.transform(this.entity.position, this.entity.orientation);
    // _worldShape.shape.orientation += this.entity.orientation;
    // _worldShape.shape.position.add(this.entity.position, true);
    // _worldShape.shape.position.z += this.entity.position.z;
    return _worldShape;
  }

  public get renderPosition(): Vector {
    return this.shape.size.negHalf.add(this.shape.position);
  }

  public static create(entity: Entity, input: IShape): Shape {
    const shape = new Shape(entity);

    if (input.shape == null) {
      if (input.alignment != null) {
        input.shape = 'stadium';
      } else if (input.radius != null) {
        input.shape = 'circle';
      } else if (input.size != null) {
        input.shape = 'rect';
      } else {
        throw new Error(`Failed to infer shape: ${JSON.stringify(input)}!`);
      }
    }
    switch (input.shape) {
      case 'rect': {
        const size = new Vector(input.size);
        const position = new Vector(input.position ?? [0, 0]);
        shape.shape = new Rect(position, size, input.orientation);
        break;
      }
      case 'circle': {
        const radius = input.radius as number;
        const position = new Vector(input.position ?? [0, 0]);
        shape.shape = new Circle(position, radius);
        break;
      }
      case 'stadium': {
        const size = new Vector(input.size);
        const position = new Vector(input.position ?? [0, 0]);
        shape.shape = new Stadium(position, size, input.alignment as StadiumAlignment, input.orientation);
        break;
      }
    }
    shape.name = input.name ?? '';
    shape.color = input.color;
    shape.signal = input.signal;

    shape.types = Array.isArray(input.types)
      ? [...input.types]
      : [(input.types ?? 'collision')];

    return shape;
  }

  public clone(): Shape {
    const clone = new Shape(this.entity);
    clone.localShape = this;
    clone.shape = this.shape.clone();
    clone.types = this.types;
    clone.signal = this.signal;
    return clone;
  }
}
