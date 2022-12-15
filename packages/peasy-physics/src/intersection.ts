import { Entity } from './entity';
import { Vector } from './vector';

export class Intersection {
  public intersects: boolean = false;
  public time = Infinity;
  public mover?: Entity;
  public entity?: Entity;
  public point?: Vector;
  public normal?: Vector;
  public tangent?: Vector;
  public shapes?: any;
}
