import { Vector } from '@peasy-lib/peasy-physics';

export interface IVector {
  x: number;
  y: number;
}

export class Entity {
  public shapes = [];
  public forces = [];
  public mass: number = 1;
  public color?;
  public maxSpeed?;
  public colliding?;

  public constructor(
    public position: Vector,
    public orientation = 0,
  ) { }
}
