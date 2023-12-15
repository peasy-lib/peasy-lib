import { Action, IAction } from '../action';
import { Combatant } from '../entity';
import { Idling } from '../states/idling';

export interface IIdleAction extends Omit<IAction, 'type' | 'name' | 'title'> {
}

export class IdleAction extends Action {
  public constructor() {
    super('idle', 'Idling', Idling);
  }

  public static execute(input: IIdleAction): boolean {
    const action = super.create(input) as IdleAction;

    const combatant = action.entity as Combatant;

    action.remaining = action.duration;

    combatant.currentActivity.set(Idling, action);

    return true;
  }

  public get duration(): number {
    return 1;
  }
}
