import { Entity } from './entity';
import { World } from './world';
import { ActivityState } from './states/activity-states';

export interface IPerform {
  duration: number;
  message?: string | string[];
  target?: Entity;
}

export interface IInterrupt {
  duration: number;
  message?: string | string[];
  target?: Entity;
}

export interface IDone {
  message?: string | string[];
  target?: Entity;
}

export interface IAction {
  world?: World;
  entity: Entity;
  target?: Entity;
}

export class Action {
  public remaining: number;

  public world: World;
  public entity: Entity;
  public target?: Entity;

  public start: number;

  public constructor(public name: string, public title: string, public state: typeof ActivityState) { }

  public static create(input: IAction): Action {
    const action = new (this as any)() as Action;

    action.world = input.world ?? input.entity.world;
    action.entity = input.entity;
    action.target = input.target;

    return action;
  }

  public get duration(): number {
    return 0;
  }

  public perform(): IPerform | null {
    return null;
  }

  public done(): IDone | null {
    return null;
  }

  public interrupt(): IInterrupt | null {
    return null;
  }

  public update(deltaTime: number): boolean {
    if (this.abort()) {
      return false;
    }
    this.remaining -= deltaTime;
    if (this.remaining <= 0) {
      this.done();
      return false;
    }
    return true;
  }

  public abort(): boolean {
    return false;
  }
}
