import { Vector } from '@peasy-lib/peasy-viewport';
import { Combatant, Entity, IEntity } from './entity';
import { Tile } from './tile';
import { Path, PathNode, IVector } from '@peasy-lib/peasy-path';
import { App } from './app';
import { MoveToAction } from './actions/move-to';
import { ShootAction } from './actions/shoot';
import { AttackAction } from './actions/attack';
import { TurnBasedAgent } from './agent/turn-based-agent';
import { TurnBasedWorld } from './agent/turn-based-world';
import { AgentMoveTo } from './agent/actions/move-to';
import { AgentAttack } from './agent/actions/attack';

export class World {
  public static template = `
    <div class="tile z-\${tile.z}" pui="click @=> click; mouseenter @=> highlight; mouseleave @=> clear; tile <=* tiles" style="left: \${tile.x}px; top: \${tile.y}px;"></div>
    <div class="entity \${entity.type} \${entity.team} \${'current' = entity.isCurrent}" pui="entity <=* entities" style="left: \${entity.x}px; top: \${entity.y}px;">
      <span class="short-name">\${entity.shortName}</span>
      <div class="stats" \${ === entity.combatant}>
        <div class="activity">\${entity.activity}</div>
      </div>
      <span class="value">\${entity.value}</span>
    </div>
    `;

  public width: number;
  public height: number;
  public tiles: Tile[] = [];
  public entities = [];

  public combatants = [] as Combatant[];
  public currentCombatant: Combatant;
  public performingAction = false;
  public action: string = 'move';

  public cuttingCorners = true;
  public stopBefore!: number;
  public path: PathNode[] = [];

  public updatingActions = false;
  public agents: TurnBasedAgent[] = [];

  // public nodes: Record<string, PathNode> = {};
  // public open: PathNode[] = [];

  public get canShoot(): boolean {
    return this.currentCombatant?.hasArrows ?? true;
  }

  public constructor(public tileSize: number) { }

  public get orderedCombatants() {
    // let sorted = this.combatants.filter(c => c != null);
    let sorted = [...this.combatants];
    // if (Math.min(...sorted.map(c => c.remaining)) > 0) debugger;
    sorted = sorted.sort((a, b) => a.remaining - b.remaining);
    const mapped = [];
    for (let i = 0; i < sorted.length; i++) {
      const combatant = sorted[i];
      mapped.push({
        id: combatant.id,
        name: combatant.name,
        index: i,
        team: combatant.team,
        hp: combatant.hitPoints,
        arrows: combatant.arrows,
      });
      // if (this.combatants[i].remaining !== sorted[i].remaining) {
      //   debugger;
      // }
    }
    return mapped;
    // return sorted.map(combatant => ());
  }

  public load(map: string, x?: number, y?: number): void {
    x = x ?? Math.sqrt(map.length);
    y = y ?? x;

    this.width = x * this.tileSize;
    this.height = y * this.tileSize;

    for (let r = 0; r < y; r++) {
      for (let c = 0; c < x; c++) {
        let value: string | number = map[r * x + c];
        switch (value) {
          case '#':
            value = 0;
            break;
          case ' ':
            value = 1;
            break;
          default:
            value = +value;
            break;
        }
        this.tiles.push(new Tile(this, c * this.tileSize, r * this.tileSize, value));
      }
    }

    // this.entities.push(new Entity(17 * this.tileSize, 6 * this.tileSize, 'red'));
    // this.entities.push(new Entity(2 * this.tileSize, 7 * this.tileSize, 'blue'));
    this.combatants = [
      Combatant.create(this, { name: 'Hero 1', team: 'player', arrows: 5, position: { x: 2 * this.tileSize, y: 5 * this.tileSize } }),
      Combatant.create(this, { name: 'Hero 2', team: 'player', position: { x: 2 * this.tileSize, y: 9 * this.tileSize } }),
      Combatant.create(this, { name: 'Enemy 1', team: 'enemy', arrows: 5, position: { x: 22 * this.tileSize, y: 5 * this.tileSize } }),
      Combatant.create(this, { name: 'Enemy 2', team: 'enemy', position: { x: 22 * this.tileSize, y: 9 * this.tileSize } }),
    ];
    this.addEntities(this.combatants);
    this.setCurrentCombatant();
    // this.addEntity({type: 'player', position: {x: 2 * this.tileSize, y: 7 * this.tileSize}});
    // this.addEntity({type: 'target', position: {x: 2 * this.tileSize, y: 7 * this.tileSize}});
    // this.entities.push(new Entity(3 * this.tileSize, 7 * this.tileSize, 'red'));

    AgentMoveTo.external = MoveToAction;
    AgentAttack.external = AttackAction;

    for (const combatant of this.combatants) {
      combatant.agent = TurnBasedAgent.create({
        id: combatant.id,
        external: combatant,
        actions: [AgentMoveTo, AgentAttack], //[AgentWander, AgentGatherWood, AgentChopTree, AgentMoveTo, AgentFeedFire],
        // goals: [
        //   new KeepFireAlive(1.0),
        //   // new KeepWarm(i / this.combatants),
        //   new AvoidOthers(0.5),
        //   new AvoidBear(2),
        // ],
        goals: [], //[new Nothing(1.0)],
        active: combatant.team === 'enemy',
      });
      this.agents.push(combatant.agent);
    }
  }

  public start(directions, stopBefore: number, cuttingCorners = true) {
    this.entities = this.entities.slice(-2);
    this.stopBefore = stopBefore;
    this.cuttingCorners = cuttingCorners;

    /*
    const pathFinder = Path.create({
      world: this,
      stepSize: this.tileSize,
      directions: App.directions8 ? 8 : 4,
      movementCostCallback: this.getMovementCost,
      // atTargetCallback: this.isAtTarget,
    });
    const start = performance.now();
    const path = pathFinder.findPath(this.entities[1], this.entities[0]);
    // path.then(path => {
    console.log('path', performance.now() - start, path);
    path.forEach(node => {
      this.addEntity(node.x, node.y, 'gold', `${Math.round(node.fCost)}<br>${node.gCost}`);
      //   const entity = this.getEntity(node);
      //   entity.color = 'gold';
    });
    // for (let i = this.entities.length - 1; i >= 0; i--) {
    //   if (!['blue', 'red', 'gold'].includes(this.entities[i].color)) {
    //     this.entities.splice(i, 1);
    //   }
    // }
    // });
    */
  }

  public click = (e: MouseEvent, model: any) => {
    if (e.ctrlKey) {
      return this.incZ(e, model);
    }
    switch (this.action) {
      case 'move':
        return this.moveTo(e, model);
      case 'attack':
        return this.attack(e, model);
      case 'shoot':
        return this.shoot(e, model);
    }
  }

  public incZ = (e: MouseEvent, model: any) => {
    const { tile } = model;
    tile.z = ++tile.z % 4;
  }

  public attack(e: MouseEvent, model: any) {
    const { tile } = model;
    if (!this._canAttack(tile)) {
      return;
    }
    let start = this.currentCombatant;
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if (tile.x === start.x && tile.y === start.y) {
      return true;
    }

    AttackAction.execute({ entity: this.currentCombatant, position: { x: tile.x, y: tile.y } });
    this.removeEntities(['attack-target']);
    return true;
  }

  public shoot(e: MouseEvent, model: any) {
    const { tile } = model;
    let start = this.currentCombatant;
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if (tile.x === start.x && tile.y === start.y) {
      return true;
    }

    ShootAction.execute({ entity: this.currentCombatant, position: { x: tile.x, y: tile.y } });
    this.removeEntities(['shoot-target']);
    return true;
  }

  public moveTo = (e: MouseEvent, model: any) => {
    const { tile } = model;
    let start = this.currentCombatant;
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if (tile.x === start.x && tile.y === start.y) {
      return true;
    }

    const pathFinder = Path.create({
      stepSize: this.tileSize,
      directions: App.directions8 ? 8 : 4,
      movementCostCallback: this.getMovementCost,
      // atTargetCallback: this.isAtTarget,
    });
    const path = pathFinder.findPath(start.position, tile) ?? [];
    // this.currentCombatant.path = path;
    MoveToAction.execute({ entity: this.currentCombatant, path });
    this.removeEntities(['path', 'path unsafe', 'path-target', 'path-target unsafe']);
    return true;
  }

  public highlight = (e: MouseEvent, model: any) => {
    if (this.performingAction) {
      return;
    }

    const { tile } = model;
    switch (this.action) {
      case 'move': {
        let start = this.currentCombatant;

        const pathFinder = Path.create({
          stepSize: this.tileSize,
          directions: App.directions8 ? 8 : 4,
          movementCostCallback: this.getMovementCost,
          // atTargetCallback: this.isAtTarget,
        });
        const path = pathFinder.findPath(start.position, tile) ?? [];
        if (path.length === 0) {
          return;
        }
        const remaining = Math.min(...this.combatants
          .filter(combatant => combatant.team !== this.currentCombatant.team)
          .map(combatant => combatant.remaining));
        for (let i = 0, ii = path.length - 1; i < ii; i++) {
          const { x, y, gCost } = path[i];
          this.addEntities({ type: gCost < remaining ? 'path' : 'path unsafe', position: { x, y } });
          // this.addEntities({ type: 'path', position: { x, y } });
        }
        const { x, y, gCost } = path.at(-1);
        // this.addEntities({ type: gCost <= 400 ? 'path-target' : 'path-target unsafe', position: { x, y } });
        this.addEntities({ type: 'path-target', position: { x, y } });
        break;
      }
      case 'attack': {
        if (!this._canAttack(tile)) {
          return;
        }
        const { x, y } = tile;
        this.addEntities({ type: 'attack-target', position: { x, y } });
        break;
      }
      case 'shoot': {
        const { x, y } = tile;
        this.addEntities({ type: 'shoot-target', position: { x, y } });
        break;
      }
    }
  }
  public clear = (e: MouseEvent, model: any) => {
    this.removeEntities(['path', 'path unsafe', 'path-target', 'path-target unsafe', 'attack-target', 'shoot-target']);
  }

  private _canAttack(tile: Tile): boolean {
    const pos = this.currentCombatant.position;
    const { x, y } = tile;
    const dx = Math.abs(x - pos.x);
    const dy = Math.abs(y - pos.y);
    // console.log('canAttack', pos, x, y, dx, dy);
    if (dx > this.tileSize || dy > this.tileSize || (dx === 0 && dy === 0)) {
      return false;
    }
    return true;
  }

  public lastTime: number;
  public update(deltaTime: number) {
    // this.combatants.forEach(combatant => combatant.update(deltaTime));
    // this.lastTime ??= 0;
    // if (now - this.lastTime > 200) {
    let acting = this.combatants.map(combatant => combatant.acting);
    if (this.performingAction) {
      this.combatants.forEach(combatant => combatant.update(deltaTime));
      acting = this.combatants.map(combatant => combatant.acting);
      // const done = this.combatants.map(combatant => combatant.update(200));
      // if (done.includes(true)) {
      if (acting.includes(false)) {
        this.performingAction = false;
      }
    } else {
      if (!acting.includes(false)) {
        this.performingAction = true;
      } else {
        // this.setCurrentCombatant();
        // if (this.currentCombatant.acting) {
        //   let index = this.combatants.indexOf(this.currentCombatant);
        //   while (this.combatants[index].moving) {
        //     index = (index + 1) % this.combatants.length;
        //   }
        //   this.currentCombatant.isCurrent = false;
        //   this.currentCombatant = this.combatants[index];
        //   this.currentCombatant.isCurrent = true;
        // }
      }
    }
    //   this.lastTime = now;
    // }

    for (let i = this.combatants.length - 1; i >= 0; i--) {
      if (this.combatants[i].hitPoints <= 0) {
        this.combatants.splice(i, 1);
      }
    }
    // this.combatants = this.combatants.filter(combatant => combatant.hitPoints <= 0);
    const dead = this.entities.filter(entity => (entity as Combatant).hitPoints <= 0);
    this.removeEntities(dead);

    if (this.entities.filter(entity => entity.team === 'enemy').length === 0) {
      setTimeout(() => alert('Congratulations! You won!'), 50);
      App.engine.stop();
      return;
    }
    if (this.entities.filter(entity => entity.team === 'player').length === 0) {
      setTimeout(() => alert('Sorry! You lost.'), 50);
      App.engine.stop();
      return;
    }

    this.setCurrentCombatant();

    // const duration = Math.min(...this.entities.map(entity => entity.currentDuration));
    // this.entities.forEach(entity => {
    //   entity.currentDuration -= duration;
    //   if (entity.currentDuration === 0) {
    //     const done = entity.currentAction.done(this, entity, entity.currentTarget);
    //     if (done != null) {
    //       this.log(done.message);
    //     }
    //     entity.currentAction = null;
    //   }
    // });

    if (this.currentCombatant.team === 'enemy' && !this.updatingActions) {
      setTimeout(this.updateActions, 0);
    }


    // console.log(this.path, now);
  }

  public setCurrentCombatant(): void {
    for (let combatant of this.combatants) {
      if (!combatant.acting) {
        if (combatant !== this.currentCombatant) {
          if (this.currentCombatant != null) {
            this.currentCombatant.isCurrent = false;
          }
          this.currentCombatant = combatant;
          this.currentCombatant.isCurrent = true;
          this.action = 'move';
        }
        break;
      }
    }
  }

  public updateActions = () => {
    this.updatingActions = true;
    const start = performance.now();
    const turnBasedWorld = TurnBasedWorld.create(this);

    const worldAny = turnBasedWorld as any;
    worldAny.nodeCounts = {};
    worldAny.performances = {};
    // console.log('TurnBasedWorld', performance.now() - start, turnBasedWorld);

    const agentActions = TurnBasedAgent.getSelectedActions(turnBasedWorld);
    for (const agentAction of agentActions) {
      const { agent, action } = agentAction;
      console.log('==> Action for agent', agent.external.type, agent.id, action.name, action.context.target);
      let success = false;
      switch (action.name) {
        case 'move-to':
          success = action.external.execute({ entity: agent.external, position: action.context.target, path: (action as AgentMoveTo).path });
          break;
        case 'attack':
          success = action.external.execute({ entity: agent.external, position: action.context.target });
          break;
        default:
          success = action.external.execute({ entity: agent.external, target: action.context.target });
          break;
      }
      if (success) {
        agent.setCurrentAction(agentAction);
      }
    }
    // const time = Math.round(performance.now() - start);
    // performances[time] = (performances[time] ?? 0) + 1;

    // countdown += 1000 / 60;
    // if (countdown > 10000) {
    //   countdown -= 10000;
    //   console.log('Node counts:', worldAny.nodeCounts, 'Performance:', performances);
    // }
    this.updatingActions = false;
  }

  public isInBounds(x: number, y: number): boolean {
    return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
  }

  public isAtTarget = (current: PathNode, target: IVector): boolean => {
    const distance = new Vector(target.x - current.x, target.y - current.y).magnitude;
    return distance <= this.tileSize * this.stopBefore * 1.5;
    // return current.x === target.x && current.y === target.y;
  }

  public getMovementCost = (to: IVector, from: IVector): number => {
    const tile = this.tiles.find(tile => tile.x === to.x && tile.y === to.y);
    if (tile == null || tile.blocked) {
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!', to)
      return 0;
    }

    const parent = this.tiles.find(t => t.x === from.x && t.y === from.y);
    let dz = Math.max(0, tile.z - parent.z) + 1;
    // if (dz !== 1) debugger;
    dz *= dz;
    // console.log('Z', parent.z, tile.z, dz);
    // Non-diagonal
    if (to.x === from.x || to.y === from.y) {
      return dz * this.tileSize;
    }

    if (!this.cuttingCorners) {
      let neighbour = this.tiles.find(t => t.x === from.x && t.y === to.y);
      if (neighbour == null || neighbour.blocked) {
        // console.log('???????????????????', to)
        return 0;
      }
      neighbour = this.tiles.find(t => t.x === to.x && t.y === from.y);
      if (neighbour == null || neighbour.blocked) {
        // console.log('???????????????????', to)
        return 0;
      }
    }

    return dz * this.tileSize * 1.4;
  }

  public getTile(x: number, y: number): Tile {
    const tile = this.tiles.find(tile => tile.x === x && tile.y === y);
    return tile;
  }

  public getEntity(node: PathNode): Entity {
    return this.entities.find(ent => ent.x === node.x && ent.y === node.y);
  }

  public getEntities(x: number, y: number): { entity: Entity; ratio: number }[] {
    const result = [];
    const position = new Vector(x, y);
    this.entities.forEach(entity => {
      if (entity.type !== 'combatant') {
        return;
      }
      const distance = position.subtract(entity.position).magnitude;
      if (distance < this.tileSize) {
        result.push({ entity, ratio: 1 - (distance / this.tileSize) });
      }
    });
    return result;
  }

  public addEntities(entities: IEntity | Entity | IEntity[] | Entity[]): Entity[] {
    const added = [];
    if (!Array.isArray(entities)) {
      entities = [entities];
    }
    entities.forEach(entity => {
      added.push(entity instanceof Entity ? entity : Entity.create(this, entity));
    });
    this.entities.unshift(...added);
    return added;
  }

  public removeEntities(types: string[] | Entity[]): void {
    if (typeof types[0] === 'string') {
      this.entities = this.entities.filter(entity => !types.includes(entity.type));
    } else {
      types.forEach(entity => entity.agent?.destroy());
      this.entities = this.entities.filter(entity => !types.includes(entity));
    }
  }
}
