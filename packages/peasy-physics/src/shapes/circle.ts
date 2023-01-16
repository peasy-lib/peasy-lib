import { GeometricShape } from './geometric-shape';
import { Point } from './point';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from '../vector';
import { ExpandedRect } from './expanded-rect';
import { Box } from '../box';
import { ExpandedStadium } from './expanded-stadium';

export class Circle extends GeometricShape {
  public constructor(
    position: Vector,
    public radius: number,
    orientation = 0,
  ) {
    super(position, orientation);
  }

  public get size(): Vector {
    return new Vector(this.radius * 2, this.radius * 2);
  }

  public get half(): Vector {
    return this.size.half;
  }
  public get left(): number {
    return this.position.x - this.radius;
  }
  public get right(): number {
    return this.position.x + this.radius;
  }
  public get top(): number {
    return this.position.y - this.radius;
  }
  public get bottom(): number {
    return this.position.y + this.radius;
  }

  public get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  public get boundingRadius(): number {
    return this.radius;
  }

  public get boundingBox(): Box {
    return new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom));
  }

  public get shapes(): GeometricShape[] {
    return [this];
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

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const point = Point.from(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public getSweptShape(target: Rect | Circle | Stadium): Rect | Circle | Stadium | RoundedRect | ExpandedRect | ExpandedStadium {
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
      // const expanded = new RoundedRect(target.position.clone(), target.size.add(new Vector(this.radius * 2, this.radius * 2)), this.radius);
      // return expanded;
      const expansion = this.clone();
      expansion.position = new Vector();
      const expanded = new ExpandedRect(target.position.clone(), target.size.clone(), expansion, target.orientation);
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

  public getEdgesVertex(edges: Vector[]): { vertex: Vector }[] {
    const best: { vertex: Vector }[] = [];
    const r = this.radius;
    for (let i = 0, ii = edges.length; i < ii; i++) {
      best.push({ vertex: this.position.add(edges[i].multiply(r)) });
    }
    return best;
  }

  public clone(): Circle {
    return new Circle(this.position.clone(), this.radius);
  }
}
