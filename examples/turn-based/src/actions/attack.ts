import { IVector, PathNode } from '@peasy-lib/peasy-path';
import { Action, IAction } from '../action';
import { Combatant } from '../entity';
import { Attacking } from '../states/attacking';
import { Vector } from '@peasy-lib/peasy-viewport';

export interface IAttackAction extends Omit<IAction, 'type' | 'name' | 'title'> {
  position: IVector;
}

export class AttackAction extends Action {
  public position: Vector;

  public constructor() {
    super('attack', 'Attacking', Attacking);
  }

  public static execute(input: IAttackAction): boolean {
    const action = super.create(input) as AttackAction;

    action.position = new Vector(input.position.x, input.position.y);
    action.remaining = action.duration;

    (action.entity as Combatant).currentActivity.set(Attacking, action);

    return true;
  }

  public get duration(): number {
    const combatant = this.entity as Combatant;
    const pos = combatant.position;
    const targetPos = this.position;
    return targetPos.subtract(pos).magnitude;
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
