import { Circle } from './shapes/circle';
import { Entity } from './entity';
import { Rect } from './shapes/rect';
import { Vector } from './vector';

export class QuadTreeResolver {
  public constructor(position: Vector, size: Vector) {
    this._root = new QuadTree(new Rect(position, size));
  }

  private readonly _entities = new WeakMap<Entity, QuadTreeItem>();
  private _root: QuadTree;

  public updateEntityProximities(movers: Entity[], stats: any) {
    movers.forEach(mover => {
      const area = new Rect(mover.position, mover.movementBox.size);
      const entities = this._root.search(area);
      entities.forEach(entity => {
        mover.near.add(entity);
        // entity.near.add(mover);
        stats.proximities++;
      });
      // console.log('Before delete:', entities.length, mover.near.size);
      mover.near.delete(mover);
      stats.proximities--;
      // console.log('Found:', entities.length, mover.near.size, entities.map(e => e.color));
    });
  }

  public addEntity(entity: Entity) {
    const area = new Rect(entity.position, entity.movementBox.size);
    const item = new QuadTreeItem(entity, area);
    item.quadtree = this._root.add(item);
    while (item.quadtree == null) {
      this._root = this._root.createParent(entity.position);
      item.quadtree = this._root.add(item);
    }
    this._entities.set(entity, item);
  }

  public updateEntity(entity: Entity) {
    const item = this._entities.get(entity)!;
    const area = new Rect(entity.position, entity.movementBox.size);
    // const key = QuadTreeItem.getKey(area);
    // if (item.key === key) {
    //   return;
    // }
    // item.key = key;
    item.area = area;
    item.quadtree = item.quadtree!.update(item);
    while (item.quadtree == null) {
      this._root = this._root.createParent(entity.position);
      item.quadtree = this._root.update(item);
    }
    this._entities.set(entity, item);
  }

  public removeEntity(entity: Entity) {
    const item = this._entities.get(entity)!;
    item.quadtree!.remove(item);
    this._entities.delete(entity);
  }

  public findEntities(circle: Circle): Entity[] {
    const rect = new Rect(circle.position, new Vector(circle.radius, circle.radius));
    return this._root.search(rect);
  }
}

class QuadTreeItem {
  public key?: string;
  public constructor(public entity: Entity, public area: Rect, public quadtree?: QuadTree) {
    // this.key = QuadTreeItem.getKey(area);
  }

  public static getKey(area: Rect): string {
    return `${area.position.x},${area.position.y},${area.size.x},${area.size.y}`;
  }
}

class QuadTree {
  public constructor(
    public area: Rect,
    public parent: QuadTree | null = null,
  ) {
    const half = this.area.half;
    const quarter = half.half;
    this._childAreas = [
      new Rect(this.area.position.add(new Vector(+quarter.x, -quarter.y)), half),
      new Rect(this.area.position.add(new Vector(-quarter.x, +quarter.y)), half),
      new Rect(this.area.position.add(new Vector(+quarter.x, +quarter.y)), half),
      new Rect(this.area.position.add(new Vector(-quarter.x, -quarter.y)), half),
    ];
    this._children = [null, null, null, null];
    console.log('Created new quadtree', area);
  }

  private readonly _childAreas: Rect[];
  private _children: (QuadTree | null)[];
  private readonly _items: QuadTreeItem[] = [];
  // #entities = new Set<Entity>();

  public add(item: QuadTreeItem, fromChild?: QuadTree): QuadTree | undefined {
    for (let i = 0; i < 4; i++) {
      if (this._children[i] === fromChild) {
        continue;
      }
      if (item.area.within(this._childAreas[i])) {
        if (this._children[i] == null) {
          this._children[i] = new QuadTree(this._childAreas[i], this);
        }
        return this._children[i]?.add(item);
      }
    }
    if (item.area.within(this.area)) {
      this._items.push(item);
      return this;
    }
    if (this.parent == null) {
      console.log('CREATE NEW QUADTREE ROOT');
    }
    return this.parent?.add(item, this);

    // if (area.within(this.area)) {
    //   if (this.#children.length === 0 && this.area.size.x >= 200) {
    //     this.#createChildren();
    //   }
    //   for (const child of this.#children) {
    //     if (child !== fromChild && area.within(child.area)) {
    //       return child.add(entity, area);
    //     }
    //   }
    //   this.#entities.add(entity);
    //   return this;
    // }
    // if (this.parent) {
    //   return this.parent.add(entity, area, this);
    // }
  }

  public remove(item: QuadTreeItem): void {
    const index = this._items.indexOf(item);
    if (index > -1) {
      this._items.splice(index, 1);
    }
  }

  public update(item: QuadTreeItem): QuadTree | undefined {
    this.remove(item);
    return this.add(item);
  }

  public search(area: Rect): Entity[] {
    const entities = [];
    for (const item of this._items) {
      if (area.overlaps(item.area)) {
        entities.push(item.entity);
      }
    }

    for (const child of this._children) {
      if (child == null) {
        continue;
      }
      if (child.area.within(area)) {
        entities.push(...child.entities);
      } else if (area.overlaps(child.area)) {
        entities.push(...child.search(area));
      }
    }
    return entities;
  }

  public get entities(): Entity[] {
    const entities = [...this._items.map(item => item.entity)];
    for (const child of this._children) {
      if (child != null) {
        entities.push(...child.entities);
      }
    }
    return entities;
  }

  // TODO: NOT DONE YET
  public createParent(position: Vector): QuadTree {
    const size = this.area.half;
    const half = size.half;
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(-half.x, -half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(+half.x, -half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(-half.x, +half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(+half.x, +half.y)), size), this));
    return this;
  }

  #createChildren(): void {
    const size = this.area.half;
    const half = size.half;
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(-half.x, -half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(+half.x, -half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(-half.x, +half.y)), size), this));
    this._children.push(new QuadTree(new Rect(this.area.position.add(new Vector(+half.x, +half.y)), size), this));
  }
}
