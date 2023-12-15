import { IdleAction } from '../actions/idle';
import { Combatant } from '../entity';
import { ActivityState } from './activity-states';

export class Idling extends ActivityState {
  public title = 'Idling';

  public enter(previous: ActivityState, action: IdleAction) {
    super.enter(previous, action);
    (action.entity as Combatant).agent.setCurrentAction(null);
  }
}
