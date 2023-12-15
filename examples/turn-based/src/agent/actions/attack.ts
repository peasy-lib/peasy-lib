import { Action, IAction, SelectorNode } from '@peasy-lib/peasy-agent';
import { TurnBasedWorld } from '../turn-based-world';
import { TurnBasedAgent } from '../turn-based-agent';
import { ICombatant } from '../../entity';
import { App } from '../../app';
import { Path, PathNode } from '@peasy-lib/peasy-path';
import { Vector } from '../../vector';

export interface IAgentAttack extends IAction { }

export class AgentAttack extends Action {
  public path: PathNode[];

  public static getAvailableActions(agentWorld: TurnBasedWorld, agent: TurnBasedAgent, previous: SelectorNode | null): AgentAttack[] {
    // Don't do two movements in a row
    if (previous?.action instanceof AgentAttack) {
      return [];
    }

    // const agentState = world.getAgent(agent.id) as ITurnBasedAgent;
    // const previousPositions = agentState.previousPositions;
    // console.log('--------> previousPositions', structuredClone(previousPositions));

    const actions = [];
    const agentEntity = agentWorld.getEntity(agent.id) as ICombatant;
    const types = ['combatant']
    const targets = agentWorld.findEntities(types).filter(target => (target as ICombatant).team !== agentEntity.team);
    const world = agent.external.world;

    let start = agentEntity;
    const stepSize = world.tileSize;
    for (const direction of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]) {
      const targetPosition = new Vector(start.position.x + (direction[0] * stepSize), start.position.y + (direction[1] * stepSize));
      let hits = agentWorld.getEntities(targetPosition.x, targetPosition.y);
      hits = hits.filter(hit => hit.entity.team !== agentEntity.team);
      if (hits.length === 0) {
        continue;
      }
      const action = AgentAttack.create({
        name: 'attack',
        world: agentWorld,
        agent,
        target: { x: targetPosition.x, y: targetPosition.y },
        duration: stepSize / 2,
      });
      actions.push(action);
    }
    return actions;

    // const pointsOfInterest = {
    //   combatant: { distance: Infinity },
    // };
    // for (const target of targets) {
    //   const delta = new Vector(target.position.x - agentEntity.position.x, target.position.y - agentEntity.position.y);
    //   const distance = delta.magnitudeSquared;
    //   if (distance === 0) {
    //     // console.log('target', distance, target);
    //     continue;
    //   }
    //   if (distance < pointsOfInterest[target.type].distance) {
    //     pointsOfInterest[target.type] = {
    //       distance,
    //       position: target.position,
    //       delta,
    //     };
    //   }
    // }
    // for (const type of types) {
    //   const poi = pointsOfInterest[type];
    //   if (poi.distance === Infinity) {
    //     continue;
    //   }
    //   actions.push(AgentAttack.create({
    //     name: 'move-to',
    //     world,
    //     agent,
    //     target: structuredClone(poi.position),
    //     duration: poi.delta.magnitude / agentEntity.maxSpeed
    //   }));
    // }
    // return actions;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getCost(): number {
    return this.getDuration() * 10;
  }

  public static create(input: IAgentAttack): AgentAttack {
    const action = super.create(input as IAction) as AgentAttack;
    // console.log('created AgentAttack', action);
    return action as AgentAttack;
  }

  // Affect the state of the world, agent and/or target
  public apply(): void {
    const world = this.context.world as TurnBasedWorld;
    const { agent, target } = this.context;
    // console.log('evaluate', agent, target, structuredClone(world));
    const agentEntity = world.getEntity(agent.id) as ICombatant;

    const hits = world.getEntities(target.x, target.y);
    hits.forEach(hit => {
      const { entity, ratio } = hit;
      entity.hitPoints -= 20 * ratio;
    });
  }

  public undo = (): void => {

  }

  public isSame(other: AgentAttack): boolean {
    return this.context.target.x === other.context.target.x && this.context.target.y === other.context.target.y;
  }
}
