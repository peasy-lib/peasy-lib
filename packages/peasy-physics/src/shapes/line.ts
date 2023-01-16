import { Box } from '../box';
import { Vector } from "../vector";
import { GeometricShape } from './geometric-shape';

export class Line extends GeometricShape {
  // public element: SVGLineElement;

  public constructor(
    public start: Vector,
    public end: Vector,
  ) {
    super(start);
  }

  public get normal(): Vector {
    return new Vector(
      -(this.end.y - this.start.y),
      this.end.x - this.start.x,
    );
  }

  public get direction(): Vector {
    return this.end.subtract(this.start);
  }

  public get magnitude(): number {
    return this.direction.magnitude;
  }

  public get boundingBox(): Box {
    const min = new Vector(Math.min(this.start.x, this.end.x), Math.min(this.start.y, this.end.y));
    const max = new Vector(Math.max(this.start.x, this.end.x), Math.max(this.start.y, this.end.y));
    return new Box(min, max);
  }

  public get shapes(): Line[] {
    return this.start.x === this.end.x || this.start.y === this.end.y ? [] : [this];
  }

  public get vertices(): Vector[] {
    if (this._vertices.length > 0) {
      return this._vertices;
    }
    this._vertices = [
      this.start,
      this.end,
    ];
    const position = this._position;
    const orientation = this._orientation;
    this._position = new Vector(0, 0);
    this._orientation = 0;
    this.transform(orientation, position);
    return this._vertices;
  }
}
