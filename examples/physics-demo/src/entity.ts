import { Vector } from '@peasy-lib/peasy-physics';

export interface IVector {
  x: number;
  y: number;
}

export class Entity {
  public shapes = [];
  public forces = [];
  public color?;

  public constructor(
    public position: Vector,
    public orientation = 0,
  ) { }
}
