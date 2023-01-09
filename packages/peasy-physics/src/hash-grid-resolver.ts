import { Canvas } from './canvas';
import { Circle } from './shapes/circle';
import { Entity } from './entity';
import { Rect } from './shapes/rect';
import { Vector } from './vector';

export class SpatialHashGridResolver {
  public constructor(public size: Vector, private readonly _canvas?: Canvas) {
    this._grid = new SpatialHashGrid(size);
  }

  private readonly _entities = new WeakMap<Entity, SpatialHashGridItem>();
  private readonly _grid: SpatialHashGrid;

  public updateEntityProximities(movers: Entity[], stats: any) {
    movers.forEach(mover => {
      const area = new Rect(mover.position, mover.movementBox.size);
      if (this._canvas != null) {
        this._canvas?.drawShape(mover.shapes[0].worldShape.shape, 'black', mover.color);
        this._canvas.drawShape(area, 'red');
      }
      const entities = this._grid.search(area);
      entities.forEach(entity => {
        if (entity === mover) {
          return;
        }
        const distance = entity.position.subtract(mover.position).magnitude;
        if (mover.movementRadius + entity.movementRadius < distance * distance) {
          return;
        }
        mover.near.add(entity);
        // entity.near.add(mover);
        stats.proximities++;
      });
      // console.log('Before delete:', entities.length, mover.near.size);
      stats.proximities--;
      // console.log('Found:', entities.length, mover.near.size, entities.map(e => e.color));
    });
  }

  public addEntity(entity: Entity) {
    const area = new Rect(entity.position, entity.movementBox.size);
    const item = new SpatialHashGridItem(entity, area);
    this._grid.add(item);
    this._entities.set(entity, item);
  }

  public updateEntity(entity: Entity) {
    const item = this._entities.get(entity)!;
    const area = new Rect(entity.position, entity.movementBox.size);
    item.area = area;
    this._grid.update(item);
  }

  public removeEntity(entity: Entity) {
    const item = this._entities.get(entity)!;
    this._grid.remove(item);
    this._entities.delete(entity);
  }

  public findEntities(circle: Circle): Entity[] {
    const rect = new Rect(circle.position, new Vector(circle.radius, circle.radius));
    return this._grid.search(rect);
  }
}

class SpatialHashGridItem {
  public key?: string;
  public keys!: string[];
  public locations!: Set<SpatialHashGridItem>[];
  public query = -1;

  public constructor(public entity: Entity, public area: Rect) { }

}

class SpatialHashGrid {
  private readonly _grid = new Map<string, Set<SpatialHashGridItem>>();

  public constructor(public size: Vector) { }

  private _query = 0;

  private readonly _items = new Map<string, SpatialHashGridItem>();
  // #entities = new Set<Entity>();

  public add(item: SpatialHashGridItem): void {
    item.keys = this.getKeys(item.area);
    item.key = item.keys.join('/');
    item.locations = item.keys.map(key => {
      let location = this._grid.get(key);
      if (location == null) {
        location = new Set<SpatialHashGridItem>();
        // console.log('Created new location', key);
        this._grid.set(key, location);
      }
      location.add(item);
      return location;
    });
  }

  public remove(item: SpatialHashGridItem): void {
    item.locations.forEach(location => location.delete(item));
    item.locations = [];
    item.keys = [];
  }

  public update(item: SpatialHashGridItem): void {
    const keys = this.getKeys(item.area);
    // if (item.keys[0] === keys[0] && item.keys[item.keys.length - 1] === keys[keys.length - 1]) {
    //   return;
    // }
    if (keys.join('/') === item.key) {
      return;
    }
    this.remove(item);
    this.add(item);
  }

  public search(area: Rect): Entity[] {
    const query = this._query++;
    const entities = [];
    const keys = this.getKeys(area);
    for (const key of keys) {
      const location = this._grid.get(key);
      if (location == null) {
        continue;
      }
      for (const item of location) {
        if (item.query === query) {
          continue;
        }
        entities.push(item.entity);
        item.query = query;
      }
    }
    return entities;
  }

  public getKeys(area: Rect): string[] {
    const keys = [];
    const x = Math.floor(area.left / this.size.x);
    const xx = Math.floor(area.right / this.size.x) + 1;
    const y = Math.floor(area.top / this.size.y);
    const yy = Math.floor(area.bottom / this.size.y) + 1;

    for (let i = x; i < xx; i++) {
      for (let j = y; j < yy; j++) {
        keys.push(`${i},${j}`);
      }
    }
    return keys;
  }
}
