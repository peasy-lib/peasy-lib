import { Box } from '../box';
import { Vector } from "../vector";
import { Circle } from './circle';
import { GeometricShape } from './geometric-shape';
import { Rect } from './rect';

export class RoundedRect extends GeometricShape {
  public worldSpace = false;

  public constructor(
    position: Vector,
    public size: Vector,
    public radius: number,
    orientation: number = 0,
  ) {
    super(position, orientation);
  }

  public get half(): Vector {
    return this.size.half;
  }

  public get left(): number {
    return this.position.x - this.half.x;
  }
  public set left(value: number) {
    this.position.x = value + this.half.x;
  }
  public get right(): number {
    return this.position.x + this.half.x;
  }
  public set right(value: number) {
    this.position.x = value - this.half.x;
  }
  public get top(): number {
    return this.position.y - this.half.y;
  }
  public set top(value: number) {
    this.position.y = value + this.half.y;
  }
  public get bottom(): number {
    return this.position.y + this.half.y;
  }
  public set bottom(value: number) {
    this.position.y = value - this.half.y;
  }

  public get width(): number {
    return this.size.x;
  }
  public set width(value: number) {
    this.size.x = value;
  }
  public get height(): number {
    return this.size.y;
  }
  public set height(value: number) {
    this.size.y = value;
  }

  public get boundingBox(): Box {
    if (this._orientation === 0 || this._orientation === 180) {
      return new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom));
    }
    return super.boundingBox;
  }

  public get shapes(): (Rect | Circle)[] {
    const r = this.radius;
    const r2 = r * 2;
    return [
      new Circle(new Vector(this.left + r, this.top + r), r),
      new Circle(new Vector(this.right - r, this.top + r), r),

      new Circle(new Vector(this.right - r, this.bottom - r), r),
      new Circle(new Vector(this.left + r, this.bottom - r), r),

      new Rect(this.position, this.size.subtract(new Vector(r2, 0))),
      new Rect(this.position, this.size.subtract(new Vector(0, r2))),
    ];
  }

  public get vertices(): Vector[] {
    if (this._vertices.length > 0) {
      return this._vertices;
    }
    this._vertices = [
      new Vector(-this.half.x, -this.half.y),
      new Vector(+this.half.x, -this.half.y),
      new Vector(+this.half.x, +this.half.y),
      new Vector(-this.half.x, +this.half.y),
    ];
    const position = this.position;
    const orientation = this.orientation;
    this._position = new Vector(0, 0);
    this._orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }

  public equals(rect: RoundedRect): boolean {
    if (!this.position.equals(rect.position) ||
      !this.size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  // public getSweptShapes(target: Rect | Circle | Stadium): (Rect | Circle | Stadium | RoundedRect)[] {
  //   if (target instanceof Stadium) {
  //     return [];
  //   }
  //   if (target instanceof Rect) {
  //     const expanded = target.clone();
  //     expanded.size.add(this.size, true);
  //     return [expanded];
  //   }
  //   if (target instanceof Circle) {
  //     const expanded = target.getSweptShapes(this);
  //     expanded[0].position = this.position.clone();
  //     return expanded;
  //   }
  //   return [];
  // }

  public toString(): string {
    return `[${this.position}] (${this.size})`;
  }

  public clone(): RoundedRect {
    return new RoundedRect(this.position.clone(), this.size.clone(), this.radius, this.orientation);
  }
}
