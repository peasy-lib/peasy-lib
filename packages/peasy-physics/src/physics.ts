import { QuadTreeResolver } from './quadtree-resolver';
/* eslint-disable max-lines-per-function */
import { Entity, IEntity } from "./entity";
import { Force, IForce } from "./force";
import { Intersection } from './intersection';
import { RadiusResolver } from './radius-resolver';
import { Ray } from './ray';
import { Vector } from "./vector";
import { SpatialHashGridResolver } from './hash-grid-resolver';
import { Canvas } from './canvas';

export interface IPhysics {
  collisions?: Record<string, string[]>;
  signals?: Record<string, string[]>;
  ctx?: CanvasRenderingContext2D;
  showAreas?: boolean;
  resolver?: 'radius' | 'quadtree' | 'spatial-hash-grid';
}

export class Physics {
  public static entities: Entity[] = [];
  public static forces: Force[] = [];

  public static collisions: Record<string, Record<string, boolean>> = {};
  public static signals: Record<string, any> = {}; // { signal: { signal: (mover, entity, event, collision) => console.log(`Signalling '${event}' from`, mover, entity, collision) }, },

  private static _proximityResolver: any;
  // private static readonly _proximityResolver = new QuadTreeResolver(new Vector(500, 500), new Vector(2000, 2000));
  // private static readonly _proximityResolver = new RadiusResolver();

  // Optional canvas for debug output
  public static canvas?: Canvas;
  public static showAreas = false;

  public static initialize(input?: IPhysics): void {
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
    if (input.ctx != null) {
      Physics.canvas = new Canvas(input.ctx);
      Physics.showAreas = input.showAreas ?? Physics.showAreas;
    }
    switch (input.resolver) {
      case 'quadtree':
        Physics._proximityResolver = new QuadTreeResolver(new Vector(500, 500), new Vector(2000, 2000));
        break;
      case 'spatial-hash-grid':
        Physics._proximityResolver = new SpatialHashGridResolver(new Vector(100, 100), Physics.canvas);
        break;
      default:
        Physics._proximityResolver = new RadiusResolver(Physics.canvas);
        break;
    }
  }

  public static dontClear = false;

  public static update(deltaTime: number, now: number) {
    const start = performance.now();
    const friction = 1; // 0.9835;
    const stats = {
      time: -1,
      movers: 0,
      moving: 0,
      totalChecks: 0,
      skipped: 0,
      solitaires: 0,
      collisionCandidates: 0,
      proximities: 0,
      checks: 0,
      moved: new Set<Entity>(),
    };

    if (deltaTime > 0.5) {
      return stats;
    }
    // console.log('Physics update start');
    if (Physics.dontClear) {
      debugger;
      Physics.dontClear = false;
    }
    Physics.canvas?.clear();

    const moving = new Set<Entity>();
    const movers = this.entities.filter(mover => {
      if (!mover.applyForces(deltaTime, now)) {
        return false;
      }
      mover.prepareMovement(deltaTime, now);
      if (mover.speed > 0) {
        moving.add(mover);
      }
      mover.near.clear();
      return true;
    });

    stats.movers = movers.length;
    stats.moving = moving.size;
    stats.totalChecks = movers.length * movers.length;

    this._proximityResolver.updateEntityProximities(movers, stats);

    // for (let i = 0, ii = movers.length; i < ii; i++) {
    //   const mover = movers[i];
    //   for (let j = i + 1, jj = movers.length; j < jj; j++) {
    //     const entity = movers[j];
    //     const distance = entity.position.subtract(mover.position).magnitude;
    //     if (mover.movementRadius + entity.movementRadius < distance * distance) {
    //       stats.skipped++;
    //       continue;
    //     }
    //     mover.near.add(entity);
    //     entity.near.add(mover);
    //     stats.proximities++;
    //   }
    // }


    // for (let i = 0, ii = this.entities.length; i < ii; i++) {
    //   const mover = this.entities[i];
    //   if (!mover.applyForces(deltaTime, now)) {
    //     continue;
    //   }
    //   mover.prepareMovement(deltaTime, now);
    //   movers.push(mover);
    //   mover.near.clear();
    //   if (mover.speed > 0) {
    //     moving.add(mover);
    //   }
    //   for (let j = i + 1, jj = this.entities.length; j < jj; j++) {
    //     const entity = this.entities[j];
    //     if (entity.position == null) {
    //       continue;
    //     }
    //     const distance = entity.position.subtract(mover.position).magnitude;
    //     if (mover.movementRadius + entity.movementRadius < distance * distance) {
    //       continue;
    //     }
    //     mover.near.add(entity);
    //     entity.near.add(mover);
    //   }
    // }

    const collisions = true;
    if (!collisions) {
      moving.forEach(mover => {
        mover.move(deltaTime);
        stats.moved.add(mover);
      });
    }

    let remainingTime = deltaTime;
    while (collisions && remainingTime > 0.0001) {
      let moveTime = remainingTime;
      let intersections = [new Intersection()];
      const checked = new WeakMap<Entity, Set<Entity>>();
      for (const mover of moving) {
        // console.log('Checking near', mover.near.size);
        // TODO: movers with 0 near can be fully moved and removed from moving?
        // if (mover.near.size === 0) {
        //   // console.log('Removing mover');
        //   mover.move(remainingTime);
        //   stats.moved.add(mover);
        //   moving.delete(mover);
        //   stats.solitaires++;
        //   continue;
        // }
        stats.collisionCandidates++;

        for (const entity of mover.near) {
          if (!checked.has(entity)) {
            checked.set(entity, new Set<Entity>());
          }
          if (checked.get(mover)?.has(entity)) {
            // console.log('skipping already done');
            continue;
          }
          checked.get(entity)?.add(mover);
          stats.checks++;

          // if (mover.nearChecked.has(entity)) {
          //   // console.log('Skipping already checked near');
          //   continue;
          // }
          // entity.nearChecked.add(mover);

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
            // if (intersection.time === 0) {
            //   intersections = [intersection];
            //   break;
            // } else
            if (intersection.time === intersections[0].time) {
              intersections.push(intersection);
            } else if (intersection.time < intersections[0].time) {
              intersections = [intersection];
            }
          }
        }
        // if (intersections[0].intersects && intersections[0].time === 0) {
        //   break;
        // }
      }
      if (intersections[0].intersects) {
        // if (intersections[0].time < 0.0001) {
        //   console.log('time', intersections[0].time, intersections); // This is very useful for debugging!
        //   const intersection = intersections[0];
        //   Physics.dontClear = true;
        //   this.canvas?.drawShape(intersection.mover!.shapes[0].worldShape.shape, 'cyan', 'white');
        //   this.canvas?.drawShape(intersection.entity!.shapes[0].worldShape.shape, 'purple', 'white');
        //   debugger;
        // }
        moveTime = moveTime * intersections[0].time;
      }

      if (moveTime > 0) {
        moving.forEach(mover => {
          mover.move(moveTime);
          // if (!mover.prepareMovement(remainingTime, now)) {
          //   moving.delete(mover);
          // }
          stats.moved.add(mover);
        });
        remainingTime -= moveTime;
      }

      if (intersections[0].intersects) {
        // if (intersections.length > 1) {
        //   console.log('##### Multiple intersections', intersections);
        // }
        for (const intersection of intersections) {
          const mover = intersection.mover!;
          const entity = intersection.entity!;
          const tangent = intersection.tangent!;
          const normal = intersection.normal!;

          // if (intersection.time === 0) {
          //   console.log('Intersection', mover.color, '=>', entity.color, intersection);
          // }

          const moverData: { mass?: number; direction?: Vector; speed?: number } = {};
          if (mover.mass !== 0) {
            moverData.mass = mover.mass;
            moverData.direction = mover.direction;
            moverData.speed = mover.speed;
          } else { // No mass means immovable
            moverData.mass = entity.mass;
            moverData.direction = entity.direction.multiply(-1);
            moverData.speed = entity.speed;
          }
          const entityData: { mass?: number; direction?: Vector; speed?: number } = {};
          if (entity.mass !== 0) {
            entityData.mass = entity.mass;
            entityData.direction = entity.direction;
            entityData.speed = entity.speed;
          } else { // No mass means immovable
            entityData.mass = mover.mass;
            entityData.direction = mover.direction.multiply(-1);
            entityData.speed = mover.speed;
          }

          const moverTangent = moverData.direction.multiply(moverData.speed).dot(tangent);
          const entityTangent = entityData.direction.multiply(entityData.speed).dot(tangent);
          const moverNormal = moverData.direction.multiply(moverData.speed).dot(normal);
          const entityNormal = entityData.direction.multiply(entityData.speed).dot(normal);

          const moverMomentum = (moverNormal * (moverData.mass - entityData.mass) + 2 * entityData.mass * entityNormal) / (moverData.mass + entityData.mass);
          const entityMomentum = (entityNormal * (entityData.mass - moverData.mass) + 2 * moverData.mass * moverNormal) / (moverData.mass + entityData.mass);

          if (mover.mass !== 0) {
            mover.velocity = tangent.multiply(moverTangent).add(normal.multiply(moverMomentum));
          }
          if (mover.prepareMovement(remainingTime, now)) {
            moving.add(mover);
          } else {
            moving.delete(mover);
          }
          if (entity.mass !== 0) {
            entity.velocity = tangent.multiply(entityTangent).add(normal.multiply(entityMomentum));
          }
          if (entity.prepareMovement(remainingTime, now)) {
            moving.add(entity);
          } else {
            moving.delete(entity);
          }
        }
      }

      if (moving.size === 0) {
        break;
      }
    }
    stats.time = performance.now() - start;
    return stats;
  }

  public static update_WORKING(deltaTime: number, now: number) {
    const friction = 1; // 0.9835;

    const movers = [];
    for (let i = 0, ii = this.entities.length; i < ii; i++) {
      const mover = this.entities[i];
      if (!mover.applyForces(deltaTime, now)) {
        continue;
      }
      mover.prepareMovement(deltaTime, now);
      movers.push(mover);
      mover.near.clear();
      for (let j = i + 1, jj = this.entities.length; j < jj; j++) {
        const entity = this.entities[j];
        if (entity.position == null) {
          continue;
        }
        const distance = entity.position.subtract(mover.position).magnitude;
        if (mover.movementRadius + entity.movementRadius < distance * distance) {
          console.log('skipping');
          continue;
        }
        mover.near.add(entity);
        entity.near.add(mover);
      }
    }
    // const movers = this.entities.filter(entity => {
    //   // Returns false if we're not actually a positioned entity
    //   if (!entity.applyForces(deltaTime, now)) {
    //     return false;
    //   }
    //   entity.prepareMovement(deltaTime, now);

    //   // entity.velocity.multiply(friction, true);
    //   // if (entity.velocity.magnitude < 0.5) {
    //   //   entity.velocity = new Vector(0, 0);
    //   // }

    //   return true;
    // });

    let remainingTime = deltaTime;
    const moving = new Set<Entity>();
    while (remainingTime > 0.0001) {
      let moveTime = remainingTime;
      let intersections = [new Intersection()];
      const checks = new WeakMap<Entity, Set<Entity>>();
      // let firstIntersection = new Intersection();

      for (const mover of movers) {
        if (mover.speed === 0) {
          continue;
        }
        // const velocity = mover.velocity;
        // if (velocity.zero) {
        //   continue;
        // }
        moving.add(mover);

        // if (!checks.has(mover)) {
        //   checks.set(mover, new Set<Entity>());
        // }
        // checks.get(mover)?.add(mover);

        console.log('Checking near', mover.near.size);
        // for (const entity of Physics.entities) {
        for (const entity of mover.near) {
          // if (!checks.has(entity)) {
          //   checks.set(entity, new Set<Entity>());
          // }
          // if (checks.get(mover)?.has(entity)) {
          //   // console.log('skipping same', entity === mover);
          //   continue;
          // }
          // checks.get(entity)?.add(mover);
          entity.near.delete(mover);

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
        mover.move(moveTime);
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

          mover.velocity = tangent.multiply(moverTangent).add(normal.multiply(moverMomentum));
          entity.velocity = tangent.multiply(entityTangent).add(normal.multiply(entityMomentum));

          if (mover.prepareMovement(remainingTime, now)) {
            moving.add(mover);
          } else {
            moving.delete(mover);
          }
          if (!entity.prepareMovement(remainingTime, now)) {
            moving.add(entity);
          } else {
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
    console.log('addEntities', entities);
    return entities.map(input => {
      const entity = input instanceof Entity ? input : Entity.create(input);
      Physics.forces.forEach(force => entity.addForce(force.clone().reset()));
      Physics.entities.push(entity);
      if (entity.position != null) {
        Physics._proximityResolver.addEntity(entity);
      }
      console.log('addEntities map', entity);
      return entity;
    });
  }

  public static updateEntity(entity: Entity): void {
    Physics._proximityResolver.updateEntity(entity);
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
      Physics._proximityResolver.removeEntity(entity);
    });
  }
}
