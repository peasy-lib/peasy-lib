import { IdleAction } from '../actions/idle';
import { MoveToAction } from '../actions/move-to';
import { Combatant } from '../entity';
import { Vector } from '@peasy-lib/peasy-viewport';
import { ActivityState, ActivityStates } from './activity-states';
import { IVector, PathNode } from '@peasy-lib/peasy-path';
import { Tile } from '../tile';

export class MovingTo extends ActivityState {
  public title = 'Moving';
  public path: PathNode[];
  public previousPathNode: PathNode | Tile;

  public world = (this.states as ActivityStates).world;


  public enter(previous: ActivityState, action: MoveToAction) {
    super.enter(previous, action);
    this.path = action.path;
    this.previousPathNode = this.world.getTile(this.entity.x, this.entity.y);
  }

  public leave(_next: ActivityState, action: MoveToAction): void | Promise<void> {
    super.leave(_next, action);
    // Not done!
    if (this.remaining > 0) {
      // console.log('%%%% Not there yet', this.remaining);
      return;
    }
    // this.entity.position = this.path;
    // this.entity.agent.addPreviousPosition(this.position);
  }

  public update(deltaTime: number): void {
    let target = this.path[0];
    let targetPos = new Vector(target.x, target.y);
    let previousPos = new Vector(this.previousPathNode.x, this.previousPathNode.y);
    let tileDistance = previousPos.subtract(targetPos).magnitude;
    let tileSpeed = target.worldCost / tileDistance;

    const combatant = this.entity as Combatant;
    const pos = combatant.position;

    let delta = targetPos.subtract(pos);
    let distance = delta.magnitude;
    let direction = delta.normalize();

    // if (distance === 0) {
    //   // if (distance <= speed * deltaTime) {
    //   this.previousPathNode = this.path.shift();
    //   if (this.path.length === 0) {
    //     this.remaining = 0;
    //     IdleAction.execute({ entity: combatant });
    //     return;
    //   }

    //   previousPos = targetPos;
    //   target = this.path[0];
    //   targetPos = new Vector(target.x, target.y);
    //   tileDistance = previousPos.subtract(targetPos).magnitude;
    //   tileSpeed = target.worldCost / tileDistance;

    //   delta = targetPos.subtract(pos);
    //   distance = delta.magnitude;
    //   direction = delta.normalize();
    // }

    // this.remaining = distance;

    let speed = combatant.maxSpeed / tileSpeed;

    if (distance <= speed * deltaTime) {
      combatant.position.x = targetPos.x;
      combatant.position.y = targetPos.y;

      this.previousPathNode = this.path.shift();
      if (this.path.length === 0) {
        this.remaining = 0;
        IdleAction.execute({ entity: combatant });
        return;
      }
      this.remaining -= speed * deltaTime;

      const moveTime = distance / speed;
      deltaTime -= moveTime;

      previousPos = targetPos;
      target = this.path[0];

      if (this._targetOccupied(target)) {
        this.remaining = 0;
        IdleAction.execute({ entity: combatant });
        return;
      }

      targetPos = new Vector(target.x, target.y);
      tileDistance = previousPos.subtract(targetPos).magnitude;
      tileSpeed = target.worldCost / tileDistance;

      speed = combatant.maxSpeed / tileSpeed;

      delta = targetPos.subtract(pos);
      distance = delta.magnitude;
      direction = delta.normalize();
    }
    this.remaining -= speed * deltaTime;

    combatant.position.add(direction.multiply(speed * deltaTime), true);
  }

  private _targetOccupied(target: PathNode): boolean {
    return this.world.getEntities(target.x, target.y).length > 0;
    // return this.world.combatants.some(combatant => {
    //   const distance = combatant.position.subtract([target.x, target.y]).magnitude;
    //   return distance < this.world.tileSize;
    // });
  }
}
