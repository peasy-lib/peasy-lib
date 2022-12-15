import { Vector } from "./vector";

export class Line {
  // public element: SVGLineElement;

  public constructor(
    public start: Vector,
    public end: Vector,
  ) { }

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

  public get directionVector(): Vector {
    return this.direction.divide(this.magnitude);
  }
}
