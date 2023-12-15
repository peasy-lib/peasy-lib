import { Action, IAction, SelectorNode } from '@peasy-lib/peasy-agent';
import { TurnBasedWorld } from '../turn-based-world';
import { TurnBasedAgent } from '../turn-based-agent';
import { ICombatant } from '../../entity';
import { App } from '../../app';
import { Path, PathNode } from '@peasy-lib/peasy-path';
import { IVector } from '../../vector';

export interface IAgentMoveTo extends IAction {
  path: PathNode[];
}

export class AgentMoveTo extends Action {
  public path: PathNode[];

  public oldPosition: IVector;

  public static getAvailableActions(agentWorld: TurnBasedWorld, agent: TurnBasedAgent, previous: SelectorNode | null): AgentMoveTo[] {
    // Don't do two movements in a row
    if (previous?.action instanceof AgentMoveTo) {
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

    for (const target of targets) {
      for (const direction of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]) {
        let start = agentEntity;
        const stepSize = world.tileSize;
        const pathFinder = Path.create({
          stepSize,
          directions: App.directions8 ? 8 : 4,
          movementCostCallback: world.getMovementCost,
          // atTargetCallback: this.isAtTarget,
        });
        const x = (Math.floor(target.position.x / stepSize) * stepSize) + (direction[0] * stepSize);
        const y = (Math.floor(target.position.y / stepSize) * stepSize) + (direction[1] * stepSize);
        let path = pathFinder.findPath(start.position, { x, y }) ?? [];
        if (path.length === 0) {
          continue;
        }
        path = path.slice(0, 6);
        const action = AgentMoveTo.create({
          name: 'move-to',
          world: agentWorld,
          agent,
          target: { x, y },
          duration: path.at(-1).gCost,
          path,
        });
        actions.push(action);
      }
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
    //   actions.push(AgentMoveTo.create({
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

  public static create(input: IAgentMoveTo): AgentMoveTo {
    const action = super.create(input as IAction) as AgentMoveTo;
    action.path = input.path;
    // console.log('created AgentMoveTo', action);
    return action as AgentMoveTo;
  }

  // Affect the state of the world, agent and/or target
  public apply(): void {
    const world = this.context.world as TurnBasedWorld;
    const { agent, target } = this.context;
    // console.log('evaluate', agent, target, structuredClone(world));
    const agentEntity = world.getEntity(agent.id) as ICombatant;
    this.oldPosition = agentEntity.position;
    agentEntity.position = target;
    // const agentState = world.getAgent(agent.id) as ITurnBasedAgent;
    // agentState.previousPositions.unshift({ x: target.x, y: target.y });
    // agentState.previousPositions = agentState.previousPositions.slice(0, 5);
    // console.log('evaluated', agent, target, structuredClone(world));
  }

  public undo = (): void => {
    const world = this.context.world as TurnBasedWorld;
    const agentEntity = world.getEntity(this.context.agent.id) as ICombatant;
    agentEntity.position = this.oldPosition;
  }

  public isSame(other: AgentMoveTo): boolean {
    return this.context.target.x === other.context.target.x && this.context.target.y === other.context.target.y;
  }
}
