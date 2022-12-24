import { Circle } from './circle';
import { Point } from './point';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Vector } from './vector';

export type StadiumAlignment = 'horizontal' | 'vertical';

export class Stadium {
  public horizontal: boolean;
  public worldSpace = false;

  private _vertices: Vector[] = [];

  public constructor(
    public position: Vector,
    public size: Vector,
    alignment: StadiumAlignment,
    public orientation: number = 0,
  ) {
    this.horizontal = alignment === 'horizontal';
  }

  // public get horizontal(): boolean {
  //   return this.width > this.height;
  // }
  public get radius(): number {
    return (this.horizontal ? this.height : this.width) / 2;
    // return Math.min(this.width, this.height) / 2;
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

  public get area(): number {
    const r = this.radius;
    const circle = Math.PI * r * r;
    const rect = this.horizontal
      ? (this.width - (r * 2)) * this.height
      : (this.height - (r * 2)) * this.width;
    return circle + rect;
  }

  public get boundingRadius(): number {
    return Math.max(this.half.x, this.half.y);
  }

  public get boundingBox(): Rect {
    return new Rect(this.position.clone(), this.size.clone());
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
    this.transform(position, orientation);
    return this._vertices;
  }

  public equals(rect: Rect): boolean {
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

  public transform(position: Vector, degrees: number): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public resetVertices(): void {
    this._vertices = [];
  }

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const point = Point.from(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public getSweptShape(target: Rect | Circle | Stadium): (Rect | Circle | Stadium | RoundedRect) {
    if (target instanceof Circle) {
      const expanded = this.clone();
      expanded.size.add(new Vector(target.radius * 2, target.radius * 2), true);
      // if (this.horizontal) {
      //   expanded.size.add(new Vector(target.radius, target.radius * 2), true);
      // } else {
      //   expanded.size.add(new Vector(target.radius * 2, target.radius), true);
      // }
      expanded.position = target.position.clone();
      return expanded;
    }
    if (target instanceof Stadium) {
      let expanded;
      if (this.horizontal === target.horizontal) {
        expanded = target.clone();
        expanded.size.add(this.size, true);
      } else {
        expanded = new RoundedRect(target.position.clone(), target.size.add(this.size), this.radius + target.radius);
        // expanded = new RoundedRect(target.position.clone(), target.size.add(this.size).add(new Vector(this.radius * 2, this.radius * 2)), this.radius + target.radius);
      }
      return expanded;
    }
    if (target instanceof Rect) {
      const expanded = new RoundedRect(target.position.clone(), target.size.add(this.size), this.radius);
      // if (this.horizontal) {
      //   expanded.size.add(new Vector(this.radius * 2, 0), true);
      // } else {
      //   expanded.size.add(new Vector(0, this.radius * 2), true);
      // }
      return expanded;
    }
    // if (target instanceof Rect) {
    //   const expanded = new RoundedRect(target.position.clone(), target.size.add(new Vector(this.radius * 2, this.radius * 2)), this.radius);
    //   return [expanded];
    //   // const shapes: (Rect | Circle)[] = [];

    //   // let expanded: Rect | Circle = target.clone();
    //   // expanded.size.add(new Vector(this.radius * 2, 0), true);
    //   // shapes.push(expanded);

    //   // expanded = target.clone();
    //   // expanded.size.add(new Vector(0, this.radius * 2), true);
    //   // shapes.push(expanded);

    //   // expanded = this.clone();
    //   // expanded.position = new Vector(target.left, target.top);
    //   // shapes.push(expanded);

    //   // expanded = this.clone();
    //   // expanded.position = new Vector(target.right, target.top);
    //   // shapes.push(expanded);

    //   // expanded = this.clone();
    //   // expanded.position = new Vector(target.right, target.bottom);
    //   // shapes.push(expanded);

    //   // expanded = this.clone();
    //   // expanded.position = new Vector(target.left, target.bottom);
    //   // shapes.push(expanded);

    //   // return shapes;
    // }
    return this;
  }

  public toString(): string {
    return `[${this.position}] (${this.size})`;
  }

  public clone(): Stadium {
    return new Stadium(
      this.position.clone(),
      this.size.clone(),
      this.horizontal ? 'horizontal' : 'vertical',
      this.orientation,
    );
  }
}
