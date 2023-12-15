import { PathNode } from '@peasy-lib/peasy-path';
import { Action, IAction } from '../action';
import { Combatant } from '../entity';
import { MovingTo } from '../states/moving-to';
import { Vector } from '@peasy-lib/peasy-viewport';

export interface IMoveToAction extends Omit<IAction, 'type' | 'name' | 'title'> {
  path: PathNode[];
}

export class MoveToAction extends Action {
  public path: PathNode[];

  public constructor() {
    super('move-to', 'Moving', MovingTo);
  }

  public static execute(input: IMoveToAction): boolean {
    const action = super.create(input) as MoveToAction;
    action.path = input.path;
    action.remaining = action.duration;

    (action.entity as Combatant).currentActivity.set(MovingTo, action);

    return true;
  }

  public get duration(): number {
    return this.path.at(-1).gCost;
  }

  // public update(deltaTime: number): boolean {
  //   const camper = this.entity as Combatant;
  //   const pos = camper.position;
  //   const targetPos = this.position;
  //   const delta = targetPos.subtract(pos);
  //   const distance = delta.magnitude;
  //   const direction = delta.normalize();

  //   if (distance === 0) {
  //     return false;
  //   }
  //   const maxSpeed = camper.maxSpeed;
  //   if (distance <= maxSpeed * deltaTime) {
  //     camper.position = targetPos;
  //     return true;
  //   }
  //   camper.position.add(direction.multiply(maxSpeed * deltaTime), true);
  //   return true;
  // }
}
