import { Entity, IEntity } from "./entity";
import { Force, IForce } from "./force";
import { Vector } from "./vector";

export class Physics {
  public static entities: Entity[] = [];
  public static forces: Force[] = [];

  public static update(deltaTime: number, now: number) {
    const friction = 0.5;
    for (const entity of this.entities) {
      entity.updateForces(deltaTime, now);
      const velocity = entity.velocity;

      const newPosition = new Vector(entity.position.x, entity.position.y);
      newPosition.add(velocity.multiply(deltaTime), true);

      if (newPosition.x < 0) {
        newPosition.x = 0;
        entity.forces.forEach(force => force.direction.x = -force.direction.x * friction);
      } else if (newPosition.x > 380) {
        newPosition.x = 380;
        entity.forces.forEach(force => force.direction.x = -force.direction.x * friction);
      }

      if (newPosition.y < 0) {
        newPosition.y = 0;
        entity.forces.forEach(force => {
          if (force.name !== 'gravity') {
            force.direction.y *= friction;
            if (force.direction.y < 0) {
              force.direction.y = -force.direction.y;
            }
          } else if (force.magnitude < 0) {
            force.magnitude = -force.magnitude * friction;
          }
        });
      } else if (newPosition.y > 380) {
        newPosition.y = 380;

        entity.forces.forEach(force => {
          if (force.name !== 'gravity') {
            force.direction.y *= friction;
            if (force.direction.y > 0) {
              force.direction.y = -force.direction.y;
            }
          } else if (force.magnitude > 0) {
            force.magnitude = -force.magnitude * friction;
          }
        });
      }
      entity.position.x = newPosition.x;
      entity.position.y = newPosition.y;
    }
  }

  public static addForce(force: Force | IForce) {
    if (!(force instanceof Force)) {
      force = Force.create(force);
    }
    Physics.forces.push(force as Force);
  }

  public static removeForce(force: string, entity: IEntity | Physics = Physics) {
    const index = Physics.forces.findIndex(item => item === entity);
    if (index < 0) {
      return;
    }
    Physics.forces.splice(index, 1);
  }

  public static addEntities(entities: Entity | IEntity | (Entity | IEntity)[]) {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    entities.forEach(input => {
      const entity = input instanceof Entity ? input : Entity.create(input);
      Physics.forces.forEach(force => entity.addForce(force.clone().reset()));
      Physics.entities.push(entity);
    });
  }
}
