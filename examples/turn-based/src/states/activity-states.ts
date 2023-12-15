import { State, States } from '@peasy-lib/peasy-states';
import { Action } from '../action';
import { Combatant } from '../entity';
import { World } from '../world';

export class ActivityStates extends States {
  public constructor(public world: World) {
    super();
  }
}

export class ActivityState extends State {
  public title: string;
  // public constructor(states: States, name: string, public title: string) {
  //   super(states, name);
  // }
  public entity: Combatant;
  public duration: number;
  public remaining = 0;
  public progress = 0;

  public enter(previous: ActivityState, action: Action) {
    // console.log('Entering', this);
    this.entity = action.entity as Combatant;
    this.duration = action.duration;
    this.remaining = action.remaining;
    this.progress = 0;
  }

  // Returns 0 if aborted, 1 if completed, void otherwise
  public update(deltaTime: number): void | boolean {
    if (this.abort()) {
      // IdleAction.execute({ entity: this.entity });
      return false; // Aborted
    }
    this.remaining -= deltaTime;
    this.progress += deltaTime;
    // console.log('update, remaining', this.remaining);
    if (this.remaining <= 0) {
      // IdleAction.execute({ entity: this.entity });
      return true; // Done
    }
  }

  public leave(next: ActivityState, action: Action): void | Promise<void> {
    // console.log('Leaving', this);
  }

  public abort(): boolean {
    return false;
  }
}
