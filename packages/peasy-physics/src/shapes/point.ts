import { ExpandedRect } from './expanded-rect';
import { Circle } from './circle';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Stadium } from './stadium';
import { Vector } from '../vector';

export class Point extends Vector {
  public static from(x: number | number[] | Vector | string | { x: number; y: number; z?: number } = 0, y = 0, z = 0): Point {
    const vector = Vector.from(x, y, z);
    return new Point(vector.x, vector.y, vector.z);
  }

  public within(shape: Rect | Circle | Stadium | RoundedRect | ExpandedRect): boolean {
    if (shape instanceof Rect) {
      return !(this.x < shape.left ||
        this.x > shape.right ||
        this.y < shape.top ||
        this.y > shape.bottom);
    }
    if (shape instanceof Circle) {
      const distance = shape.position.subtract(this);
      const magnitude = distance.magnitude;
      return magnitude * magnitude < shape.radius * shape.radius;
    }
    if (shape instanceof Stadium) {
      if (shape.horizontal) {
        return this.within(new Rect(shape.position, shape.size.subtract(new Vector(shape.radius * 2, 0)))) ||
          this.within(new Circle(new Vector(shape.left + shape.radius, shape.position.y), shape.radius)) ||
          this.within(new Circle(new Vector(shape.right - shape.radius, shape.position.y), shape.radius));
      } else {
        return this.within(new Rect(shape.position, shape.size.subtract(new Vector(0, shape.radius * 2)))) ||
          this.within(new Circle(new Vector(shape.position.x, shape.top + shape.radius), shape.radius)) ||
          this.within(new Circle(new Vector(shape.position.x, shape.bottom - shape.radius), shape.radius));
      }
    }
    if (shape instanceof RoundedRect) {
      const r = shape.radius;
      const r2 = r * 2;
      return this.within(new Circle(new Vector(shape.left + r, shape.top + r), r)) ||
        this.within(new Circle(new Vector(shape.right - r, shape.top + r), r)) ||

        this.within(new Circle(new Vector(shape.right - r, shape.bottom - r), r)) ||
        this.within(new Circle(new Vector(shape.left + r, shape.bottom - r), r)) ||

        this.within(new Rect(shape.position, shape.size.subtract(new Vector(r2, 0)))) ||
        this.within(new Rect(shape.position, shape.size.subtract(new Vector(0, r2))));
    }
    return false;
  }
}
