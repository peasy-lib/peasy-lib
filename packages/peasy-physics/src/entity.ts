import { Force, IForce } from "./force";
import { IVector, Vector } from "./vector";

export interface IEntity extends Partial<Entity> { }

export class Entity {
  public forces: Force[] = [];

  public color?: string;

  public constructor(
    public position: IVector, // Reference, update original
  ) { }

  public static create(input: IEntity): Entity {
    const entity = new Entity(input.position!);

    entity.forces = (input.forces ?? []).map(force => (force instanceof Force) ? force : force = Force.create(force));

    entity.color = input.color;

    return entity;
  }

  public get velocity(): Vector {
    const velocity = new Vector();
    this.forces.forEach(force => velocity.add(force.effect!, true));
    return velocity;
  }

  public addForce(force: Force | IForce) {
    if (!(force instanceof Force)) {
      force = Force.create(force);
    }
    this.forces.push(force as Force);
  }

  public updateForces(deltaTime: number, now: number): void {
    this.forces.forEach(force => force.update!(deltaTime, now));
  }
}
