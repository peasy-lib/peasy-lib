import { Circle } from './circle';
import { Rect } from './rect';
import { Stadium } from './stadium';
import { Vector } from "../vector";

export class ExpandedRect {
  public worldSpace = false;

  private _vertices: Vector[] = [];

  public constructor(
    public position: Vector,
    public size: Vector,
    public corner: Rect,
    public orientation: number = 0,
  ) { }

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
    this.position = new Vector(0, 0);
    this.orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }

  public equals(rect: ExpandedRect): boolean {
    if (!this.position.equals(rect.position) ||
      !this.size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  public rotate(degrees: number): void {
    const vertices = this.vertices;
    if (Math.abs(degrees) !== 0) {
      vertices.forEach(vertex => vertex.rotate(degrees, true));
      this.position.rotate(degrees, true);
      this.orientation += degrees;
    }
    this._vertices = vertices;
    // console.log('orientation', this.orientation);
    // if (this.orientation < 0) {
    //   this.rotate(-this.orientation);
    // }
  }

  public translate(position: Vector): void {
    const vertices = this.vertices;
    vertices.forEach(vertex => vertex.add(position, true));
    this.position.add(position, true);
    this._vertices = vertices;
  }

  public transform(degrees: number, position: Vector): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public resetVertices(): void {
    this._vertices = [];
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

  public clone(): ExpandedRect {
    return new ExpandedRect(this.position.clone(), this.size.clone(), this.corner.clone(), this.orientation);
  }
}
