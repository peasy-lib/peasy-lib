import { World } from './world';

export class Tile {
  public constructor(public world: World, public x: number, public y: number, public z: number) { }

  public get blocked(): boolean {
    return this.z === 0 || this.world.getEntities(this.x, this.y).length > 0;
  }
}

/*
import { Entity } from './entity';
import { Tile } from './tile';
import { Node } from './node';
import { Vector } from '@peasy-lib/peasy-viewport';

export class World {
  public static template = `
    <div class="tile z-\${tile.z}" pui="tile <=* tiles" style="left: \${tile.x}px; top: \${tile.y}px;"></div>
    <div class="entity \${entity.color}" pui="innerHTML <=> entity.value; entity <=* entities" style="background-color: \${entity.color}; left: \${entity.x}px; top: \${entity.y}px;"></div>
    `;

  public tiles = [];
  public entities = [];

  public nodes: Record<string, Node> = {};
  public open: Node[] = [];

  public constructor(public tileSize: number) { }

  public load(map: string, x?: number, y?: number): void {
    x = x ?? Math.sqrt(map.length);
    y = y ?? x;

    for (let r = 0; r < y; r++) {
      for (let c = 0; c < x; c++) {
        let value = map[r * y + c];
        this.tiles.push(new Tile(c * this.tileSize, r * this.tileSize, value === '#' ? 0 : 1));
      }
    }

    this.entities.push(new Entity(2 * this.tileSize, 7 * this.tileSize, 'green'));
    this.entities.push(new Entity(10 * this.tileSize, 6 * this.tileSize, 'red'));
  }

  public async start() {
    // const deltas = [[1, 0], [0, 1], [-1, 0], [0, -1],];
    const deltas = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];
    // const deltas = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],];
    const start = this.entities[0];
    const end = this.entities[1];
    const current = new Node(start.x, start.y, start.z, null);
    current.g = 0;
    current.h = getH(current, end);
    current.f = current.g + current.h;
    const id = `${current.x},${current.y}`;
    this.nodes[id] = current;

    this.open.push(current);
    let counter = 0;
    let resolved = false;
    while (this.open.length) {
      if (counter > 100) break;
      counter++;
      let current = this.open[0];
      for (let i = 1, ii = this.open.length - 1; i < ii; i++) {
        if (this.open[i].f < current.f) {
          current = this.open[i];
        }
      }
      const entity = this.getEntity(current);
      if (entity.color !== 'green') {
        entity.color = 'cyan';
      }
      await new Promise(res => setTimeout(res, 300));
      // if (this.isAtTarget(current, end)) {
      //   this.resolvePath(current);
      //   break;
      // }
      for (const delta of deltas) {
        // let jumped = current;
        let neighbour = this.getNode(current.x + (delta[0] * this.tileSize), current.y + (delta[1] * this.tileSize));
        if (neighbour == null) {
          neighbour = this.createNode(current, current.x + (delta[0] * this.tileSize), current.y + (delta[1] * this.tileSize), end);
          if (neighbour != null) {
            if (this.isAtTarget(neighbour, end)) {
              this.resolvePath(neighbour);
              resolved = true;
              break;
            }
            this.open.push(neighbour);
            this.entities.unshift(new Entity(neighbour.x, neighbour.y, 'blue', `${Math.round(neighbour.f)}<br>${counter}`));
          }
        } else if (this.updateNode(current, current.x + (delta[0] * this.tileSize), current.y + (delta[1] * this.tileSize), end)) {
          const index = this.open.findIndex(open => open === neighbour);
          if (index === -1) {
            this.open.push(neighbour);
          }
        }
      }
      if (resolved) {
        break;
      }
      const index = this.open.findIndex(open => open === current);
      if (index >= 0) {
        this.open.splice(index, 1);
        const entity = this.getEntity(current);
        if (entity.color !== 'green') {
          entity.color = 'gray';
        }
      }
      console.log('open', this.open);
      // await new Promise(res => setTimeout(res, 150));
    }
  }

  public resolvePath(current: Node): void {
    while (current != null) {
      console.log('Found it', current);
      const entity = this.getEntity(current);
      if (entity != null && !['green', 'red'].includes(entity.color)) {
        entity.color = 'gold';
      }
      current = current.parent;
    }
  }

  public isAtTarget(current: Node, target: Node): boolean {
    return current.x === target.x && current.y === target.y;
  }

  public getMovementCost(fromX: number, fromY: number, toX: number, toY: number): number {
    const tile = this.tiles.find(tile => tile.x === toX && tile.y === toY);
    if (tile == null) {
      return 0;
    }
    const deltaX = Math.abs(toX) - Math.abs(fromX);
    const deltaY = Math.abs(toY) - Math.abs(fromY);
    return tile.z * (this.tileSize);// * (deltaX === 0 || deltaY === 0 ? 1 : 1.4));
  }

  public getEntity(node: Node): Entity {
    return this.entities.find(ent => ent.x === node.x && ent.y === node.y);
  }

  public getNode(x: number, y: number): Node {
    const id = `${x},${y}`;
    return this.nodes[id];
  }

  public createNode(parent: Node, x: number, y: number, end: Node): Node {
    let g = this.getMovementCost(parent.x, parent.y, x, y);
    if (g === 0) {
      return null;
    }
    g += parent.g;
    const id = `${x},${y}`;
    const created = new Node(x, y, 0, parent);
    created.g = g;
    created.h = getH(created, end);
    created.f = created.g + created.h;
    this.nodes[id] = created;
    return created;
  }

  public updateNode(parent: Node, x: number, y: number, end: Node): boolean {
    let g = this.getMovementCost(parent.x, parent.y, x, y);
    const id = `${x},${y}`;
    let update = this.nodes[id];
    g += parent.g;
    if (g >= update.g) {
      return false;
    }
    update.parent = parent;
    update.g = g;
    update.f = update.g + update.h;
    return true;
  }
}

function getH(current: Node, end: Node): number {
  return new Vector(end.x, end.y).subtract(new Vector(current.x, current.y)).magnitude;
  // return Math.abs(end.x - current.x) + Math.abs(end.y - current.y);
}
*/
