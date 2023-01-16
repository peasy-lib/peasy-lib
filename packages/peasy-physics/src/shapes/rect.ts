import { Circle } from './circle';
import { ExpandedRect } from './expanded-rect';
import { GeometricShape } from './geometric-shape';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";
import { Line } from './line';
import { Box } from '../box';
import { ExpandedStadium } from './expanded-stadium';

export class Rect extends GeometricShape {
  public worldSpace = false;

  private _size: Vector;

  public constructor(
    position: Vector,
    size: Vector,
    orientation: number = 0,
  ) {
    super(position);
    this._size = size;
    this._orientation = orientation;
  }

  public get size(): Vector {
    return this._size;
  }
  public set size(value: Vector) {
    this._size = value;
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

  public get boundingBox(): Box {
    if (this._orientation === 0 || this._orientation === 180) {
      return new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom));
    }
    return super.boundingBox;
  }

  public get shapes(): GeometricShape[] {
    if (this._orientation === 0 || this._orientation === 180) {
      return [];
    } else {
      const vertices = this.vertices;
      return [
        new Line(vertices[0], vertices[1]),
        new Line(vertices[1], vertices[2]),
        new Line(vertices[2], vertices[3]),
        new Line(vertices[3], vertices[0]),
      ];
    }
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

  public getEdgesVertex(edges: Vector[]): { vertex: Vector; index: number; dot: number }[] {
    const best: { vertex: Vector; index: number; dot: number }[] = [];
    const vertices = this.vertices;
    for (let i = 0, ii = edges.length; i < ii; i++) {
      const edge = edges[i];
      best.push({ vertex: vertices[0], index: 0, dot: vertices[0].dot(edge) });
      for (let j = 1; j < 4; j++) {
        const vertex = vertices[j];
        const dot = vertex.dot(edge);
        if (dot > best[i].dot) {
          best[i] = { vertex, dot, index: j };
        }
      }
    }
    return best;
  }

  public equals(rect: Rect): boolean {
    if (!this._position.equals(rect.position) ||
      !this._size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const boundingBox = target.boundingBox;
    if (!(this.left > boundingBox.max.x ||
      this.right < boundingBox.min.x ||
      this.top > boundingBox.max.y ||
      this.bottom < boundingBox.min.y)
    ) {
      return false;
    }
    for (const shape of target.shapes) {
      // if (SAT.overlaps(this, shape)) {
      //   return true;
      // }
    }
    return false;
    // const point = Point.from(this.position);
    // const expanded = this.getSweptShape(target);
    // return point.within(expanded);
  }

  public within(target: Rect): boolean {
    return !(this.left < target.left ||
      this.right > target.right ||
      this.top < target.top ||
      this.bottom > target.bottom);
  }

  public getSweptShape(target: Rect | Circle | Stadium): Rect | Circle | Stadium | RoundedRect | ExpandedRect | ExpandedStadium {
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
      // const { min, max } = this.getMinMax();
      // const rotatedSize = max.subtract(min);
      const expansion = this.clone();
      expansion.position = new Vector();
      // console.log('getSweptShape Rect - Rect', this.orientation, rotatedSize, this.size, this.vertices);
      // const expanded = new ExpandedRect(target.position.clone(), target.size.add(rotatedSize), corner, target.orientation);
      const expanded = new ExpandedRect(target.position.clone(), target.size.clone(), expansion, target.orientation);
      return expanded;
    }
    if (target instanceof Circle) {
      const expansion = target.clone();
      expansion.position = new Vector();
      // console.log('getSweptShape Rect - Rect', this.orientation, rotatedSize, this.size, this.vertices);
      // const expanded = new ExpandedRect(target.position.clone(), target.size.add(rotatedSize), corner, target.orientation);
      const expanded = new ExpandedRect(this.position.clone(), this.size.clone(), expansion, this.orientation);
      return expanded;
      // const expanded = target.getSweptShape(this);
      // expanded.position = target.position.clone();
      // return expanded;
    }
    return this;
  }

  public toString(): string {
    return `[${this._position}] (${this._size})`;
  }

  public clone(): Rect {
    return new Rect(this._position.clone(), this._size.clone(), this._orientation);
  }
}
