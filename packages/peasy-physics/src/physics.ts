import { Entity, IEntity } from "./entity";
import { Force, IForce } from "./force";
import { Intersection } from './intersection';
import { Ray } from './ray';
import { Vector } from "./vector";

export class Physics {
  public static entities: Entity[] = [];
  public static forces: Force[] = [];

  public static collisions: Record<string, Record<string, boolean>> = {};
  public static signals: Record<string, any> = {}; // { signal: { signal: (mover, entity, event, collision) => console.log(`Signalling '${event}' from`, mover, entity, collision) }, },

  public static initialize(input?: { collisions?: Record<string, string[]>; signals?: Record<string, string[]> }): void {
    input = input ?? {};
    const collisions = input.collisions ?? { collision: ['collision'] };
    const signals = input.signals ?? {};

    for (const collision in collisions) {
      for (const opposite of collisions[collision]) {
        if (Physics.collisions[collision] == null) {
          Physics.collisions[collision] = {};
        }
        Physics.collisions[collision][opposite] = true;
        if (Physics.collisions[opposite] == null) {
          Physics.collisions[opposite] = {};
        }
        Physics.collisions[opposite][collision] = true;
      }
    }
  }

  public static update(deltaTime: number, now: number) {
    const friction = 1; // 0.9835;
    const movers = this.entities.filter(entity => {
      // Returns false if we're not actually a positioned entity
      if (!entity.applyForces(deltaTime, now)) {
        return false;
      }
      entity.prepareMovement(deltaTime, now);

      // entity.velocity.multiply(friction, true);
      // if (entity.velocity.magnitude < 0.5) {
      //   entity.velocity = new Vector(0, 0);
      // }

      return true;
    });

    let remainingTime = deltaTime;
    const moving = new Set<Entity>();
    while (remainingTime > 0.0001) {
      let moveTime = remainingTime;
      let intersections = [new Intersection()];
      const checks = new WeakMap<Entity, Set<Entity>>();
      // let firstIntersection = new Intersection();

      for (const mover of movers) {
        const speed = mover.speed;
        if (speed === 0) {
          continue;
        }
        // const velocity = mover.velocity;
        // if (velocity.zero) {
        //   continue;
        // }
        moving.add(mover);

        if (!checks.has(mover)) {
          checks.set(mover, new Set<Entity>());
        }
        checks.get(mover)?.add(mover);

        // let nextPosition = mover.nextPosition;
        for (const entity of Physics.entities) {
          // if (entity === mover) {
          //   continue;
          // }
          if (!checks.has(entity)) {
            checks.set(entity, new Set<Entity>());
          }
          if (checks.get(mover)?.has(entity)) {
            // console.log('skipping same', entity === mover);
            continue;
          }
          checks.get(entity)?.add(mover);

          const movements = mover.velocity.multiply(moveTime).subtract((entity.velocity ?? new Vector()).multiply(moveTime));
          const movement = new Ray(mover.position, movements.normalize(), movements.magnitude);

          const currentShape = mover.shapes[0].worldShape.shape;
          const entityShape = entity.shapes[0].worldShape.shape;
          const swept = currentShape.getSweptShape(entityShape);
          // canvas.drawShape(swept, 'green');
          const intersection = movement.getIntersection(swept);
          if (intersection.intersects) {
            intersection.mover = mover;
            intersection.entity = entity;
            // console.log('intersects', intersection); // This is very useful for debugging!
            if (intersection.time === intersections[0].time) {
              intersections.push(intersection);
            } else if (intersection.time < intersections[0].time) {
              intersections = [intersection];
            }
          }

          // if (intersection.intersects) {
          //   // canvas.drawShape(entityShape, 'red');
          //   if (intersection.time < firstIntersection.time) {
          //     firstIntersection = intersection;
          //   }
          // } else {
          //   // canvas.drawShape(entityShape, 'purple');
          // }
        }
      }
      if (intersections[0].intersects) {
        // console.log('time', intersections[0].time, intersections); // This is very useful for debugging!
        moveTime = moveTime * intersections[0].time;
      }

      moving.forEach(mover => {
        mover.move(mover.direction, mover.speed, moveTime);
      });
      remainingTime -= moveTime;

      // Resolve! (but just stop for now)
      if (intersections[0].intersects) {
        for (const intersection of intersections) {
          const mover = intersection.mover!;
          const entity = intersection.entity!;
          const tangent = intersection.tangent!;
          const normal = intersection.normal!;

          const moverMass = 1;
          const entityMass = 1;

          const moverTangent = mover.direction.multiply(mover.speed).dot(tangent);
          const entityTangent = entity.direction.multiply(entity.speed).dot(tangent);
          const moverNormal = mover.direction.multiply(mover.speed).dot(normal);
          const entityNormal = entity.direction.multiply(entity.speed).dot(normal);

          const moverMomentum = (moverNormal * (moverMass - entityMass) + 2 * entityMass * entityNormal) / (moverMass + entityMass);
          const entityMomentum = (entityNormal * (entityMass - moverMass) + 2 * moverMass * moverNormal) / (moverMass + entityMass);

          // mover.velocity = normal.multiply(moverMomentum);
          // entity.velocity = normal.multiply(entityMomentum);
          mover.velocity = tangent.multiply(moverTangent).add(normal.multiply(moverMomentum));
          entity.velocity = tangent.multiply(entityTangent).add(normal.multiply(entityMomentum));

          // mover.velocity = new Vector();
          // entity.velocity = new Vector();
          if (!mover.prepareMovement(remainingTime, now)) {
            moving.delete(mover);
          }
          if (!entity.prepareMovement(remainingTime, now)) {
            moving.delete(entity);
          }
        }
      }

      if (moving.size === 0) {
        break;
      }

      // if (firstIntersection.intersects) {
      //   // canvas.drawShape(new Circle(firstIntersection.point, 10), 'red');
      //   // canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.normal.multiply(15))), 'red');
      //   // canvas.drawShape(new Line(firstIntersection.point, firstIntersection.point.add(firstIntersection.tangent.multiply(15))), 'black');

      //   // if (Array.isArray(firstIntersection.shapes)) {
      //   //   firstIntersection.shapes.forEach(shape => canvas.drawShape(shape, 'red'));
      //   // }

      //   nextPosition = mover.position.add(movement.directionVector.multiply(movement.magnitude * firstIntersection.time));
      // }

      for (const mover of movers) {
        mover.position.add([1100, 1100], true).modulus(1100, true);

        const shape = mover.shapes[0].worldShape.shape;
        if (shape.position.x < 0) {
          mover.velocity.x = -mover.velocity.x;
        } else if (shape.position.x > 1100) {
          mover.velocity.x = -mover.velocity.x;
        }
        if (shape.position.y < 0) {
          mover.velocity.y = -mover.velocity.y;
        } else if (shape.position.y > 1100) {
          mover.velocity.y = -mover.velocity.y;
        }

        // const shape = mover.shapes[0].shape;
        // const halfWidth = shape.size.half.x;
        // const halfHeight = shape.size.half.y;
        // if (nextPosition.x - halfWidth < 0) {
        //   nextPosition.x = halfWidth;
        //   velocity.x = -velocity.x;
        // } else if (nextPosition.x + halfWidth > 1000) {
        //   nextPosition.x = 1000 - halfWidth;
        //   velocity.x = -velocity.x;
        // }
        // if (nextPosition.y - halfHeight < 0) {
        //   nextPosition.y = halfHeight;
        //   velocity.y = -velocity.y;
        // } else if (nextPosition.y + halfHeight > 1000) {
        //   nextPosition.y = 1000 - halfHeight;
        //   velocity.y = -velocity.y;
        // }
      }
      // mover.moveTo(nextPosition);

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

  public static addEntities(entities: Entity | IEntity | (Entity | IEntity)[]): Entity[] {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    return entities.map(input => {
      const entity = input instanceof Entity ? input : Entity.create(input);
      Physics.forces.forEach(force => entity.addForce(force.clone().reset()));
      Physics.entities.push(entity);
      console.log('Entity', entity);
      return entity;
    });
  }

  public static removeEntities(entities: Entity | Entity[]): void {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    entities.forEach(entity => {
      const index = Physics.entities.findIndex(e => e === entity);
      if (index > -1) {
        Physics.entities.splice(index, 1);
      }
    });
  }
}
