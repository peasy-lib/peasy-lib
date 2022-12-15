import { Circle } from './circle';
import { Point } from './point';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from "./vector";

export class Rect {
  public worldSpace = false;

  #position: Vector;
  #size: Vector;
  #orientation: number = 0;

  #vertices: Vector[] = [];

  public constructor(
    position: Vector,
    size: Vector,
    orientation: number = 0,
  ) {
    this.#position = position;
    this.#size = size;
    this.#orientation = orientation;
  }

  public get position(): Vector {
    return this.#position;
  }
  public set position(value: Vector) {
    this.#position = value;
    this.#vertices = [];
  }

  public get size(): Vector {
    return this.#size;
  }
  public set size(value: Vector) {
    this.#size = value;
    this.#vertices = [];
  }

  public get orientation(): number {
    return this.#orientation;
  }
  public set orientation(value: number) {
    this.#orientation = value;
    this.#vertices = [];
  }

  public get half(): Vector {
    return this.#size.half;
  }

  public get left(): number {
    return this.#position.x - this.half.x;
  }
  public set left(value: number) {
    this.#position.x = value + this.half.x;
    this.#vertices = [];
  }
  public get right(): number {
    return this.#position.x + this.half.x;
  }
  public set right(value: number) {
    this.#position.x = value - this.half.x;
    this.#vertices = [];
  }
  public get top(): number {
    return this.#position.y - this.half.y;
  }
  public set top(value: number) {
    this.#position.y = value + this.half.y;
    this.#vertices = [];
  }
  public get bottom(): number {
    return this.#position.y + this.half.y;
  }
  public set bottom(value: number) {
    this.#position.y = value - this.half.y;
    this.#vertices = [];
  }

  public get width(): number {
    return this.#size.x;
  }
  public set width(value: number) {
    this.#size.x = value;
    this.#vertices = [];
  }
  public get height(): number {
    return this.#size.y;
  }
  public set height(value: number) {
    this.#size.y = value;
    this.#vertices = [];
  }

  public get vertices(): Vector[] {
    if (this.#vertices.length > 0) {
      return this.#vertices;
    }
    this.#vertices = [
      new Vector(-this.half.x, -this.half.y),
      new Vector(+this.half.x, -this.half.y),
      new Vector(+this.half.x, +this.half.y),
      new Vector(-this.half.x, +this.half.y),
    ];
    const position = this.#position;
    const orientation = this.#orientation;
    this.#position = new Vector(0, 0);
    this.#orientation = 0;
    this.transform(position, orientation);
    return this.#vertices;
  }

  public equals(rect: Rect): boolean {
    if (!this.#position.equals(rect.position) ||
      !this.#size.equals(rect.size)
    ) {
      return false;
    }
    return true;
  }

  public rotate(degrees: number): void {
    const vertices = this.vertices;
    if (Math.abs(degrees) !== 0) {
      vertices.forEach(vertex => vertex.rotate(degrees, true));
      this.#position.rotate(degrees, true);
      this.#orientation += degrees;
    }
    this.#vertices = vertices;
    // console.log('orientation', this.#orientation);
    // if (this.#orientation < 0) {
    //   this.rotate(-this.#orientation);
    // }
  }

  public translate(position: Vector): void {
    const vertices = this.vertices;
    vertices.forEach(vertex => vertex.add(position, true));
    this.#position.add(position, true);
    this.#vertices = vertices;
  }

  public transform(position: Vector, degrees: number): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public resetVertices(): void {
    this.#vertices = [];
  }

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const point = new Point(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public getSweptShape(target: Rect | Circle | Stadium): Rect | Circle | Stadium | RoundedRect {
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
      const expanded = target.clone();
      expanded.size.add(this.size, true);
      return expanded;
    }
    if (target instanceof Circle) {
      const expanded = target.getSweptShape(this);
      expanded.position = target.position.clone();
      return expanded;
    }
    return this;
  }

  public toString(): string {
    return `[${this.#position}] (${this.#size})`;
  }

  public clone(): Rect {
    return new Rect(this.#position.clone(), this.#size.clone(), this.#orientation);
  }
}
