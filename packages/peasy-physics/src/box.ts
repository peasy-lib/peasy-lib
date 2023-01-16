import { Vector } from './vector';

export class Box {
  public constructor(
    public min: Vector,
    public max: Vector,
  ) { }

  public get size(): Vector {
    return this.max.subtract(this.min);
  }

  public toString(): string {
    return `[${this.min}] (${this.max})`;
  }

  public clone(): Box {
    return new Box(this.min.clone(), this.max.clone());
  }
}
