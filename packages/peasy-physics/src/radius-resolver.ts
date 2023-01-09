import { Canvas } from './canvas';
import { Circle } from './shapes/circle';
import { Entity } from './entity';
import { Physics } from './physics';

export class RadiusResolver {
  private readonly _entities = new Set<Entity>();

  public constructor(private readonly _canvas?: Canvas) { }

  public updateEntityProximities(movers: Entity[], stats: any) {
    for (let i = 0, ii = movers.length; i < ii; i++) {
      const mover = movers[i];
      if (this._canvas != null) {
        this._canvas?.drawShape(mover.shapes[0].worldShape.shape, mover.mass === 0 ? 'red' : 'black', mover.color);
        if (Physics.showAreas) {
          this._canvas.drawShape(new Circle(mover.position, mover.movementRadiusDebug), 'red');
        }
      }
      for (let j = i + 1, jj = movers.length; j < jj; j++) {
        const entity = movers[j];
        const distance = entity.position.subtract(mover.position).magnitude;
        if (mover.movementRadius + entity.movementRadius < distance * distance) {
          stats.skipped++;
          continue;
        }
        mover.near.add(entity);
        entity.near.add(mover);
        stats.proximities++;
      }
    }
  }

  public addEntity(entity: Entity) {
    this._entities.add(entity);

  }
  public updateEntity(entity: Entity) {
    this._entities.add(entity);
  }

  public removeEntity(entity: Entity) {
    this._entities.delete(entity);
  }

  public findEntities(area: Circle): Entity[] {
    return [];
  }
}
