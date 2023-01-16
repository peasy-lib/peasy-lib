import { Circle } from './circle';
import { Point } from './point';
import { Rect } from './rect';
import { RoundedRect } from './rounded-rect';
import { Vector } from '../vector';
import { GeometricShape } from './geometric-shape';
import { ExpandedRect } from './expanded-rect';
import { Line } from './line';
import { Box } from '../box';
import { ExpandedStadium } from './expanded-stadium';

export type StadiumAlignment = 'horizontal' | 'vertical';

export class Stadium extends GeometricShape {
  public horizontal: boolean;
  public worldSpace = false;

  private _size: Vector;

  public constructor(
    position: Vector,
    size: Vector,
    alignment: StadiumAlignment,
    orientation: number = 0,
  ) {
    super(position, orientation);
    this._size = size;
    this.horizontal = alignment === 'horizontal';
  }

  public get size(): Vector {
    return this._size;
  }
  public set size(value: Vector) {
    this._size = value;
    this._vertices = [];
  }

  // public get horizontal(): boolean {
  //   return this.width > this.height;
  // }
  public get radius(): number {
    return (this.horizontal ? this.height : this.width) / 2;
    // return Math.min(this.width, this.height) / 2;
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

  public get boundingBox(): Box {
    if (this._orientation === 0 || this._orientation === 180) {
      return new Box(new Vector(this.left, this.top), new Vector(this.right, this.bottom));
    }
    const vertices = this.vertices;
    if (vertices.length === 0) {
      return new Box(new Vector(), new Vector());
    }

    const min = new Vector(vertices[0].x, vertices[0].y);
    const max = new Vector(vertices[0].x, vertices[0].y);
    for (let i = 1, ii = 4; i < ii; i++) {
      const vertex = vertices[i];
      if (vertex.x < min.x) {
        min.x = vertex.x;
      }
      if (vertex.x > max.x) {
        max.x = vertex.x;
      }
      if (vertex.y < min.y) {
        min.y = vertex.y;
      }
      if (vertex.y > max.y) {
        max.y = vertex.y;
      }
    }

    const r = this.radius;
    for (let i = 4, ii = 6; i < ii; i++) {
      const vertex = vertices[i];
      if (vertex.x - r < min.x) {
        min.x = vertex.x - r;
      }
      if (vertex.x + r > max.x) {
        max.x = vertex.x + r;
      }
      if (vertex.y - r < min.y) {
        min.y = vertex.y - r;
      }
      if (vertex.y + r > max.y) {
        max.y = vertex.y + r;
      }
    }
    return new Box(min, max);
  }

  public get shapes(): GeometricShape[] {
    if (this._orientation === 0 || this._orientation === 180) {
      if (this.horizontal) {
        return [
          new Rect(this._position, this._size.subtract(new Vector(this.radius * 2, 0))),
          new Circle(new Vector(this.left + this.radius, this._position.y), this.radius),
          new Circle(new Vector(this.right - this.radius, this._position.y), this.radius),
        ];
      } else {
        return [
          new Rect(this._position, this._size.subtract(new Vector(0, this.radius * 2))),
          new Circle(new Vector(this._position.x, this.top + this.radius), this.radius),
          new Circle(new Vector(this._position.x, this.bottom - this.radius), this.radius),
        ];
      }
    } else {
      const vertices = this.vertices;
      return [
        new Line(vertices[0], vertices[1]),
        // new Line(vertices[1], vertices[2]),
        new Line(vertices[2], vertices[3]),
        // new Line(vertices[3], vertices[0]),
        new Circle(vertices[4], this.radius),
        new Circle(vertices[5], this.radius),
      ];
    }
  }

  public get vertices(): Vector[] {
    if (this._vertices.length > 0) {
      return this._vertices;
    }
    const r = this.radius;
    const half = this.half;
    const innerHalf = this.size.subtract(new Vector(r * 2, r * 2)).half;
    if (this.horizontal) {
      this._vertices = [
        new Vector(-half.x, -innerHalf.y),
        new Vector(half.x, -innerHalf.y),
        new Vector(half.x, innerHalf.y),
        new Vector(-half.x, innerHalf.y),

        new Vector(-innerHalf.x, 0),
        new Vector(innerHalf.y, 0),
      ];
      console.log('vertices', this._vertices);
    } else {
      this._vertices = [
        new Vector(half.x, -innerHalf.y),
        new Vector(half.x, innerHalf.y),
        new Vector(-half.x, innerHalf.y),
        new Vector(-half.x, -innerHalf.y),

        new Vector(0, -innerHalf.y),
        new Vector(0, innerHalf.y),
      ];
      // this._vertices = [
      //   new Vector(half.x, -half.y + r),
      //   new Vector(half.x, half.y - r),
      //   new Vector(-half.x, half.y - r),
      //   new Vector(-half.x, -half.y + r),

      //   new Vector(0, -(half.y * 0.5)),
      //   new Vector(0, half.y * 0.5),
      // ];
    }
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

  public overlaps(target: Rect | Circle | Stadium): boolean {
    const point = Point.from(this.position);
    const expanded = this.getSweptShape(target);
    return point.within(expanded);
  }

  public getSweptShape(target: Rect | Circle | Stadium): (Rect | Circle | Stadium | RoundedRect | ExpandedRect | ExpandedStadium) {
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
      const expansion = this.clone();
      expansion.size.add(new Vector(target.radius * 2, target.radius * 2), true);
      expansion.position = new Vector();
      const expanded = new ExpandedStadium(target.position.clone(), target.size.clone(), expansion, target.orientation);
      return expanded;
      // let expanded;
      // if (this.horizontal === target.horizontal) {
      //   expanded = target.clone();
      //   expanded.size.add(this.size, true);
      // } else {
      //   expanded = new RoundedRect(target.position.clone(), target.size.add(this.size), this.radius + target.radius);
      //   // expanded = new RoundedRect(target.position.clone(), target.size.add(this.size).add(new Vector(this.radius * 2, this.radius * 2)), this.radius + target.radius);
      // }
      // return expanded;
    }
    if (target instanceof Rect) {
      if (this.orientation === 0 && target.orientation === 0) {
        const expanded = new RoundedRect(target.position.clone(), target.size.add(this.size), this.radius);
        // if (this.horizontal) {
        //   expanded.size.add(new Vector(this.radius * 2, 0), true);
        // } else {
        //   expanded.size.add(new Vector(0, this.radius * 2), true);
        // }
        return expanded;
      } else {
        const expansion = this.clone();
        expansion.position = new Vector();
        // console.log('getSweptShape Stadium - Rect', this.orientation, rotatedSize, this.size, this.vertices);
        // const expanded = new ExpandedRect(target.position.clone(), target.size.add(rotatedSize), corner);
        const expanded = new ExpandedRect(target.position.clone(), target.size.clone(), expansion, target.orientation);
        return expanded;
      }
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
      const r = this.radius;
      for (let j = 4; j < 6; j++) {
        const vertex = vertices[j].add(edge.multiply(r));
        const dot = vertex.dot(edge);
        if (dot > best[i].dot) {
          best[i] = { vertex, dot, index: j };
        }
      }
    }
    return best;
  }

  public getEdgeVertices(edges: Vector[]): any {
    const pairs: { vertex: Vector; index: number; dot: number }[][] = [];
    const vertices = this.vertices;
    for (let i = 0, ii = edges.length; i < ii; i++) {
      const edge = edges[i];
      pairs.push([]);
      const pair = pairs[i];
      pair.push(
        { vertex: vertices[0], index: 0, dot: vertices[0].dot(edge) },
        { vertex: vertices[1], index: 1, dot: vertices[1].dot(edge) },
      );
      if (pair[1].dot > pair[0].dot) {
        [pair[0], pair[1]] = [pair[1], pair[0]];
      }
      for (let j = 2; j < 4; j++) {
        const vertex = vertices[j];
        const dot = vertex.dot(edge);
        if (dot > pair[0].dot) {
          pair.unshift({ vertex, index: j, dot });
          pair.pop();
        } else if (dot > pair[1].dot) {
          pair.splice(1, 1, { vertex, index: j, dot });
        }
      }
      const r = this.radius;
      for (let j = 4; j < 6; j++) {
        const vertex = vertices[j].add(edge.multiply(r));
        const dot = vertex.dot(edge);
        if (dot > pair[0].dot) {
          pair.unshift({ vertex, index: j, dot });
          pair.pop();
        } else if (dot > pair[1].dot) {
          pair.splice(1, 1, { vertex, index: j, dot });
        }
      }
    }
    return pairs;
  }

  public getMinMax(): { min: Vector; max: Vector } {
    const { min, max } = super.getMinMax();
    const vertices = this.vertices;
    const r = this.radius;

    for (let i = 4; i < 6; i++) {
      const vertex = vertices[i];
      if (vertex.x - r < min.x) {
        min.x = vertex.x - r;
      }
      if (vertex.x + r > max.x) {
        max.x = vertex.x + r;
      }
      if (vertex.y - r < min.y) {
        min.y = vertex.y - r;
      }
      if (vertex.y + r > max.y) {
        max.y = vertex.y + r;
      }
    }
    return { min, max };
  }

  public toString(): string {
    return `[${this.position}] (${this.size})`;
  }

  public clone(): Stadium {
    return new Stadium(
      this._position.clone(),
      this._size.clone(),
      this.horizontal ? 'horizontal' : 'vertical',
      this._orientation,
    );
  }
}
