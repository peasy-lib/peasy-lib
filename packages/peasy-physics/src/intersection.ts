import { Entity } from './entity';
import { Shape } from './shape';
import { Vector } from './vector';

export class Intersection {
  public intersects: boolean = false;
  public time = Infinity;
  public mover?: Entity;
  public entity?: Entity;
  public point?: Vector;
  public moverShape?: Shape;
  public entityShape?: Shape;
  public normal?: Vector;
  public tangent?: Vector;
  public shapes?: any;
}
