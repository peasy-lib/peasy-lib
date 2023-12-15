import { Action } from './action';
import { Entity } from './entity';
import { Goal } from './goal';
import { Selector } from './selector';
import { World } from './world';

export interface ISelectedAction {
  agent: Agent;
  action: Action;
}

export interface IAgent {
  id: number | string;
  actions: (typeof Action)[];
  goals?: Goal[];
  selector?: typeof Selector;
  external?: any;
  active?: boolean;
  team?: string;
  selectorDepth?: number;
}

export class Agent {
  public static agents: Agent[] = [];

  public external?: any;
  public actions: (typeof Action)[] = [];
  public goals: Goal[] = [];

  public selector!: Selector;

  public currentAction: Action | null = null;
  public previousAction: Action | null = null;
  public currentDuration = 0;
  public currentTarget?: Entity;

  public startTime: number = -Infinity;

  public active = true;
  public team!: string;

  public constructor(public id: number | string, actions: (typeof Action)[]) {
    this.actions = [...actions];
  }

  public getCurrentAction(): Action | null {
    return this.currentAction;
  }
  public setCurrentAction(value: ISelectedAction | null) {
    this.previousAction = this.currentAction;
    this.currentAction = value?.action ?? null;
    this.startTime = this.currentAction != null ? performance.now() : -Infinity;
  }

  public get isLocked(): boolean {
    // console.log('lockout', this.startTime, this.currentAction?.getLockoutTime(), performance.now());
    if (this.startTime == null || this.currentAction == null) {
      return false;
    }
    const locked = this.startTime + this.currentAction.getLockoutTime() >= performance.now();
    // if (locked) {
    //   console.log(this.id, 'is LOCKED');
    // } else {
    //   console.log(this.id, 'is not locked');
    // }
    return locked;
  }

  public static create(input: IAgent): Agent {
    const agent = new this(input.id, input.actions);

    agent.external = input.external;
    agent.goals = [...(input.goals ?? agent.goals)];
    agent.selector = (input.selector ?? Selector).create({ agent });
    agent.active = input.active ?? agent.active;
    agent.team = input.team ?? `${input.id}`;

    agent.selector.maxLevel = input.selectorDepth ?? agent.selector.maxLevel;

    Agent.agents.push(agent);
    return agent;
  }

  public destroy(): void {
    const index = Agent.agents.indexOf(this);
    Agent.agents.splice(index, 1);
  }

  public static getSelectedActions(world: World): ISelectedAction[] {
    const actions = [];

    for (const agent of this.agents) {
      if (!agent.active || agent.isLocked) {
        continue;
      }
      const action = agent.getSelectedAction(world);
      if (action == null) {
        continue;
      }
      const current = agent.getCurrentAction();
      if (current != null && action.name === current.name && action.isSame(current)) {
        // console.log('Skipping same action', agent.currentAction, action);
        continue;
      }

      actions.push({ agent, action });
    }
    return actions;
  }

  // Keep this for convenient overloading of Agent
  public getSelectedAction(world: World) {
    const action = this.selector.selectAction(world);
    return action;
  }
}
