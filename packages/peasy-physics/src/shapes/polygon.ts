import { Vector } from "../vector";

export class Polygon {
  public worldSpace = false;

  public constructor(
    public position: Vector,
    public vertices: Vector[],
    public orientation: number = 0,
  ) { }

  public get left(): number {
    return this.position.x + Math.min(...this.vertices.map(vertex => vertex.x));
  }
  public set left(value: number) {
    this.position.x = value - Math.min(...this.vertices.map(vertex => vertex.x));
  }
  public get right(): number {
    return this.position.x + Math.max(...this.vertices.map(vertex => vertex.x));
  }
  public set right(value: number) {
    this.position.x = value - Math.max(...this.vertices.map(vertex => vertex.x));
  }
  public get top(): number {
    return this.position.y + Math.min(...this.vertices.map(vertex => vertex.y));
  }
  public set top(value: number) {
    this.position.y = value - Math.min(...this.vertices.map(vertex => vertex.y));
  }
  public get bottom(): number {
    return this.position.y + Math.max(...this.vertices.map(vertex => vertex.y));
  }
  public set bottom(value: number) {
    this.position.y = value - Math.max(...this.vertices.map(vertex => vertex.y));
  }

  public get width(): number {
    return this.right - this.left;
  }
  public get height(): number {
    return this.bottom - this.top;
  }

  public rotate(degrees: number): Polygon {
    if (degrees !== 0) {
      this.vertices.forEach(vertex => vertex.rotate(degrees, true));
      this.orientation += degrees;
    }
    return this;
  }

  public translate(position: Vector): Polygon {
    this.vertices.forEach(vertex => vertex.add(position, true));
    this.position.add(position, true);
    return this;
  }

  public clone(): Polygon {
    return new Polygon(this.position.clone(), this.vertices.map(vertex => vertex.clone()), this.orientation);
  }
}
