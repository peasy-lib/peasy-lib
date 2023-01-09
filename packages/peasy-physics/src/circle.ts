import { GeometricShape } from './geometric-shape';
import { Point } from './point';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from './vector';

export class Circle {
  public constructor(
    public position: Vector,
    public radius: number,
    public orientation = 0,
  ) { }

  public get size(): Vector {
    return new Vector(this.radius * 2, this.radius * 2);
  }

  public get half(): Vector {
    return this.size.half;
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

  public get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  public get boundingRadius(): number {
    return this.radius;
  }

  public get boundingBox(): Rect {
    return new Rect(this.position.clone(), new Vector(this.radius * 2, this.radius * 2));
  }

  public shapes(): GeometricShape[] {
    return [];
  }

  public get vertices(): Vector[] {
    return [];
  }

  public equals(circle: Circle): boolean {
    if (!this.position.equals(circle.position) ||
      this.radius !== circle.radius
    ) {
      return false;
    }
    return true;
  }

  public rotate(degrees: number): void {
    this.orientation += degrees;
  }

  public translate(position: Vector): void {
    this.position.add(position, true);
  }

  public transform(degrees: number, position: Vector): void {
    this.rotate(degrees);
    this.translate(position);
  }

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const point = Point.from(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public getSweptShape(target: Rect | Circle | Stadium): Rect | Circle | Stadium | RoundedRect {
    if (target instanceof Circle) {
      const expanded = target.clone();
      expanded.radius += this.radius;
      return expanded;
    }
    if (target instanceof Stadium) {
      // const expanded = target.clone();
      // expanded.size.add(new Vector(this.radius * 2, this.radius * 2), true);
      // return [expanded];
      const expanded = target.getSweptShape(this);
      expanded.position = target.position.clone();
      return expanded;
    }
    if (target instanceof Rect) {
      const expanded = new RoundedRect(target.position.clone(), target.size.add(new Vector(this.radius * 2, this.radius * 2)), this.radius);
      return expanded;
      // const shapes: (Rect | Circle)[] = [];

      // let expanded: Rect | Circle = target.clone();
      // expanded.size.add(new Vector(this.radius * 2, 0), true);
      // shapes.push(expanded);

      // expanded = target.clone();
      // expanded.size.add(new Vector(0, this.radius * 2), true);
      // shapes.push(expanded);

      // expanded = this.clone();
      // expanded.position = new Vector(target.left, target.top);
      // shapes.push(expanded);

      // expanded = this.clone();
      // expanded.position = new Vector(target.right, target.top);
      // shapes.push(expanded);

      // expanded = this.clone();
      // expanded.position = new Vector(target.right, target.bottom);
      // shapes.push(expanded);

      // expanded = this.clone();
      // expanded.position = new Vector(target.left, target.bottom);
      // shapes.push(expanded);

      // return shapes;
    }
    return this;
  }

  public clone(): Circle {
    return new Circle(this.position.clone(), this.radius);
  }
}
