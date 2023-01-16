import { Circle } from './circle';
import { Rect } from './rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";
import { GeometricShape } from './geometric-shape';
import { Box } from '../box';
import { Line } from './line';

export class ExpandedStadium extends GeometricShape {
  public worldSpace = false;

  private _size: Vector;

  public constructor(
    position: Vector,
    size: Vector,
    public expansion: Rect | Circle | Stadium,
    orientation: number = 0,
  ) {
    super(position, orientation);
    this._size = size;
  }

  public get size(): Vector {
    return this._size;
  }
  public set size(value: Vector) {
    this._size = value;
    this._vertices = [];
  }

  public get radius(): number {
    return this._size.x / 2;
  }

  public get half(): Vector {
    return this._size.half;
  }

  public get left(): number {
    return this.position.x - this.half.x;
  }
  public get right(): number {
    return this.position.x + this.half.x;
  }
  public get top(): number {
    return this.position.y - this.half.y;
  }
  public get bottom(): number {
    return this.position.y + this.half.y;
  }

  // public get width(): number {
  //   return this.size.x;
  // }
  // public set width(value: number) {
  //   this.size.x = value;
  // }
  // public get height(): number {
  //   return this.size.y;
  // }
  // public set height(value: number) {
  //   this.size.y = value;
  // }

  public get boundingBox(): Box {
    const box = this._orientation === 0 || this._orientation === 180
      ? new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom))
      : super.boundingBox;
    const expansionBox = this.expansion.boundingBox;
    const halfExpansionBox = expansionBox.size.half;
    box.min.subtract(halfExpansionBox, true);
    box.max.add(halfExpansionBox, true);
    return box;
  }

  public get shapes(): GeometricShape[] {
    const shapes = [];
    const vertices = this.vertices;
    const vertexCount = vertices.length;
    const expansions = [];
    for (let i = 0; i < vertexCount; i++) {
      const expansion = this.expansion.clone();
      expansion.position = vertices[i].clone();
      expansions.push(expansion);
      shapes.push(expansion);
    }
    // for (let i = 0; i < vertexCount; i++) {
    //   const expansion = this.corner.clone();
    //   expansion.position = vertices[i].clone();
    //   expansions.push(expansion);
    //   shapes.push(expansion);
    // }
    const edgeNormals = this.edgeNormals;
    for (let i = 0; i < vertexCount; i++) {
      const a = expansions[i].getEdgesVertex([edgeNormals[i]])[0].vertex;
      const b = expansions[(i + 1) % vertexCount].getEdgesVertex([edgeNormals[i]])[0].vertex;
      shapes.push(new Line(a, b));
    }
    return shapes;
  }

  public get vertices(): Vector[] {
    if (this._vertices.length > 0) {
      return this._vertices;
    }
    const r = this.radius;
    const half = this.half;
    const innerHalf = this.size.subtract(new Vector(r * 2, r * 2)).half;
    this._vertices = [
      // new Vector(half.x, -innerHalf.y),
      // new Vector(half.x, innerHalf.y),
      // new Vector(-half.x, innerHalf.y),
      // new Vector(-half.x, -innerHalf.y),

      new Vector(0, -innerHalf.y),
      new Vector(0, innerHalf.y),
    ];
    const position = this._position;
    const orientation = this._orientation;
    this._position = new Vector(0, 0);
    this._orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }

  public equals(stadium: ExpandedStadium): boolean {
    if (!this.position.equals(stadium.position) ||
      !this.size.equals(stadium.size)
    ) {
      return false;
    }
    return true;
  }

  // public getSweptShapes(target: Rect | Circle | Stadium): (Rect | Circle | Stadium | ExpandedRect)[] {
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

  public clone(): ExpandedStadium {
    return new ExpandedStadium(this.position.clone(), this.size.clone(), this.expansion.clone(), this.orientation);
  }
}
