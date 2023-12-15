import { World as AgentWorld, IAgent } from '@peasy-lib/peasy-agent';
import { World } from '../world';
import { TurnBasedAgent } from './turn-based-agent';
import { Vector } from '../vector';

export interface IEntity {
  id: number | string;
  type: string;
  position: { x: number; y: number };
  amount: number;
}

export class TurnBasedWorld extends AgentWorld {
  public world: World;
  public types?: Record<string, IEntity[]>;

  public static create(input: World): TurnBasedWorld {
    const world = super.create(input) as TurnBasedWorld;
    world.world = input;
    world.state = this.createState(input);
    return world as TurnBasedWorld;
  }

  public get nextId(): number {
    return Math.max(...this.state.entities.map(entity => entity.id)) + 1;
  }

  public getEntity(id: number | string): IEntity {
    return this.state.entities.find((entity: { id: number | string }) => entity.id == id);
  }

  public findEntities(types: string[]): IEntity[] {
    return this.state.entities.filter((entity: { type: string }) => types.includes(entity.type));
  }

  public getEntities(x: number, y: number): { entity: any; ratio: number }[] {
    const result = [];
    const position = new Vector(x, y);
    this.state.entities.forEach(entity => {
      if (entity.type !== 'combatant') {
        return;
      }
      const distance = position.subtract(entity.position).magnitude;
      if (distance < this.world.tileSize) {
        result.push({ entity, ratio: 1 - (distance / this.world.tileSize) });
      }
    });
    return result;
  }

  public removeEntity(entity: IEntity): void {
    const instance = this.state.entities.find(ent => ent.id == entity.id) as IEntity;
    const index = this.state.entities.indexOf(instance);
    if (index > -1) {
      this.state.entities.splice(index, 1);
    }
  }

  public addEntity(entity: IEntity): void {
    entity.id = this.nextId;
    this.state.entities.push(entity);
  }

  public getAgent(id: number | string): IAgent {
    return this.state.agents.find((agent: { id: number | string }) => agent.id == id);
  }

  public isAt(entity: IEntity, other: IEntity): boolean {
    const delta = new Vector(other.position.x - entity.position.x, other.position.y - entity.position.y);
    return delta.magnitudeSquared === 0;
  }

  public getDistance(entityId: number | string, otherId: number | string): number {
    const entity = this.getEntity(entityId);
    const other = this.getEntity(otherId);
    return new Vector(other.position.x - entity.position.x, other.position.y - entity.position.y).magnitude;
  }
  public getDistanceSquared(entityId: number | string, otherId: number | string): number {
    const entity = this.getEntity(entityId);
    const other = this.getEntity(otherId);
    return new Vector(other.position.x - entity.position.x, other.position.y - entity.position.y).magnitudeSquared;
  }

  // isNear

  public clone(): TurnBasedWorld {
    const clone = super.clone() as TurnBasedWorld;
    clone.world = this.world;
    return clone;
  }

  private static createState(world: World): any {
    const state = {
      entities: [],
      agents: [],
    };

    for (const entity of world.entities) {
      state.entities.push(this._createStateEntity(entity));
    }
    for (const agent of TurnBasedAgent.agents) {
      state.agents.push(this._createStateAgent(agent));
    }

    return state;
  }

  private static _createStateEntity(input: any): any {
    const entity: any = {
      id: input.id,
      type: input.type,
      position: { x: input.position.x, y: input.position.y },
      amount: input.amount,
    };

    switch (input.type) {
      case 'combatant':
        entity.hitPoints = input.hitPoints;
        entity.maxSpeed = input.maxSpeed;
        entity.currentActivity = input.currentActivity.current?.name ?? '';
        entity.team = input.team;
        // entity.currentPosition = input.currentActivity
        break;
    }
    return entity;
  }

  private static _createStateAgent(input: any): any {
    const agent: any = {
      id: input.id,
      previousPositions: [...input.previousPositions],
    };
    return agent;
  }

}
