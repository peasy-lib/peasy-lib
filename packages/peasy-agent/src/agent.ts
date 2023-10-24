import { Action } from './action';
import { Entity } from './entity';
import { Goal } from './goal';
import { Planner } from './planner';

export interface IPreferredAction {
  agent: Agent;
  action: Action;
}

export interface IAgent {
  id: number | string;
  actions: (typeof Action)[];
  goals?: Goal[];
  type?: typeof Agent;
  planner?: typeof Planner;
  external?: any;
}

export class Agent {
  public static agents: Agent[] = [];

  public external?: any;
  public actions: (typeof Action)[] = [];
  public goals: Goal[] = [];

  public planner: typeof Planner = Planner;

  public state = {};
  // public maxHp = 100;
  // public hp = this.maxHp;

  // public crossbow?: { loaded: boolean } = { loaded: false };
  // public bolts = 0;
  // public potions = 3;

  // public evading = false;

  public currentAction: Action | null = null;
  public previousAction: Action | null = null;
  public currentDuration = 0;
  public currentTarget?: Entity;

  public startTime: number = -Infinity;

  public constructor(public id: number | string, actions: (typeof Action)[]) {
    this.actions = [...actions];
  }

  public getCurrentAction(): Action | null {
    return this.currentAction;
  }
  public setCurrentAction(value: IPreferredAction | null) {
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
    const agent = new (input.type ?? Agent)(input.id, input.actions);

    agent.external = input.external;
    agent.goals = [...(input.goals ?? agent.goals)];
    agent.planner = input.planner ?? agent.planner;

    Agent.agents.push(agent);
    return agent;
  }
  // public get name(): string {
  //   return `<span style="color: ${this.color}">${this.color}</span>`;
  // }

  public static getPreferredActions(world: any): IPreferredAction[] {
    const actions = [];

    for (const agent of this.agents) {
      if (agent.isLocked) {
        continue;
      }
      const action = agent.getPreferredAction(world);
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

  public getPreferredAction(world: any) {
    const planner = Planner.create({ world, agent: this });
    // return planner.getAvailableActions(planner.world, this);
    const action = planner.chooseAction(world);
    return action;
  }
}
