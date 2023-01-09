import { Circle } from './circle';
import { ExpandedRect } from './expanded-rect';
import { GeometricShape } from './geometric-shape';
import { Point } from './point';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";

export class Rect {
  public worldSpace = false;

  private _position: Vector;
  private _size: Vector;
  private _orientation: number = 0;

  private _vertices: Vector[] = [];

  public constructor(
    position: Vector,
    size: Vector,
    orientation: number = 0,
  ) {
    this._position = position;
    this._size = size;
    this._orientation = orientation;
  }

  public get position(): Vector {
    return this._position;
  }
  public set position(value: Vector) {
    this._position = value;
    this._vertices = [];
  }

  public get size(): Vector {
    return this._size;
  }
  public set size(value: Vector) {
    this._size = value;
    this._vertices = [];
  }

  public get orientation(): number {
    return this._orientation;
  }
  public set orientation(value: number) {
    this._orientation = value;
    this._vertices = [];
  }

  public get half(): Vector {
    return this._size.half;
  }

  public get left(): number {
    return this._position.x - this.half.x;
  }
  public set left(value: number) {
    this._position.x = value + this.half.x;
    this._vertices = [];
  }
  public get right(): number {
    return this._position.x + this.half.x;
  }
  public set right(value: number) {
    this._position.x = value - this.half.x;
    this._vertices = [];
  }
  public get top(): number {
    return this._position.y - this.half.y;
  }
  public set top(value: number) {
    this._position.y = value + this.half.y;
    this._vertices = [];
  }
  public get bottom(): number {
    return this._position.y + this.half.y;
  }
  public set bottom(value: number) {
    this._position.y = value - this.half.y;
    this._vertices = [];
  }

  public get width(): number {
    return this._size.x;
  }
  public set width(value: number) {
    this._size.x = value;
    this._vertices = [];
  }
  public get height(): number {
    return this._size.y;
  }
  public set height(value: number) {
    this._size.y = value;
    this._vertices = [];
  }

  public get area(): number {
    return this.size.x * this.size.y;
  }

  public get boundingRadius(): number {
    const halfSquared = this.half.multiply(this.half);
    return Math.sqrt(halfSquared.x + halfSquared.y);
  }

  public get boundingBox(): Rect {
    return this;
  }

  public shapes(): GeometricShape[] {
    return [];
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
    const position = this._position;
    const orientation = this._orientation;
    this._position = new Vector(0, 0);
    this._orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }

  public equals(rect: Rect): boolean {
    if (!this._position.equals(rect.position) ||
      !this._size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  public rotate(degrees: number): void {
    const vertices = this.vertices;
    if (Math.abs(degrees) !== 0) {
      vertices.forEach(vertex => vertex.rotate(degrees, true));
      this._position.rotate(degrees, true);
      this._orientation += degrees;
    }
    this._vertices = vertices;
    // console.log('orientation', this.#orientation);
    // if (this.#orientation < 0) {
    //   this.rotate(-this.#orientation);
    // }
  }

  public translate(position: Vector): void {
    const vertices = this.vertices;
    vertices.forEach(vertex => vertex.add(position, true));
    this._position.add(position, true);
    this._vertices = vertices;
  }

  public transform(degrees: number, position: Vector): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public resetVertices(): void {
    this._vertices = [];
  }

  public overlaps(target: Rect | Circle | Stadium): boolean {
    if (target instanceof Rect) {
      return !(this.left > target.right ||
        this.right < target.left ||
        this.top > target.bottom ||
        this.bottom < target.top);
    }
    const point = Point.from(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public within(target: Rect): boolean {
    return !(this.left < target.left ||
      this.right > target.right ||
      this.top < target.top ||
      this.bottom > target.bottom);
  }

  public getSweptShape(target: Rect | Circle | Stadium): Rect | Circle | Stadium | RoundedRect | ExpandedRect {
    if (target instanceof Stadium) {
      // console.log(this.#size.toString(), ',', target.size.toString(), '=', target.size.add(this.#size).toString());
      const expanded = target.getSweptShape(this);
      expanded.position = target.position.clone();
      return expanded;
      // const expanded = target.clone();
      // expanded.size.add(new Vector(this.size.x, this.size.y), true);
      // return [expanded];
    }
    if (target instanceof Rect) {
      if (this.orientation === 0 && target.orientation === 0) {
        // const { min, max } = this.getMinMax();
        const expanded = target.clone();
        // expanded.size.add(max.subtract(min), true);
        expanded.size.add(this.size, true);
        return expanded;
      }
      const { min, max } = this.getMinMax();
      const rotatedSize = max.subtract(min);
      const slant = rotatedSize.subtract(this.size);
      const corner = this.clone();
      corner.position = new Vector();
      console.log('getSweptShape Rect - Rect', this.orientation, rotatedSize, this.size, this.vertices);
      const expanded = new ExpandedRect(target.position.clone(), target.size.add(rotatedSize), corner);
      return expanded;

    }
    if (target instanceof Circle) {
      const expanded = target.getSweptShape(this);
      expanded.position = target.position.clone();
      return expanded;
    }
    return this;
  }

  public getMinMax(): { min: Vector, max: Vector } {
    const min = new Vector();
    const max = new Vector();
    const vertices = this.vertices;

    min.x = Math.min(...vertices.map(vertex => vertex.x));
    min.y = Math.min(...vertices.map(vertex => vertex.y));
    max.x = Math.max(...vertices.map(vertex => vertex.x));
    max.y = Math.max(...vertices.map(vertex => vertex.y));
    return { min, max };
  }
  public toString(): string {
    return `[${this._position}] (${this._size})`;
  }

  public clone(): Rect {
    return new Rect(this._position.clone(), this._size.clone(), this._orientation);
  }
}
