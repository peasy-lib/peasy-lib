import { IdleAction } from '../actions/idle';
import { AttackAction } from '../actions/attack';
import { Combatant } from '../entity';
import { Vector } from '@peasy-lib/peasy-viewport';
import { ActivityState, ActivityStates } from './activity-states';

export class Attacking extends ActivityState {
  public title = 'Attacking';
  public position: Vector;

  public world = (this.states as ActivityStates).world;


  public enter(previous: ActivityState, action: AttackAction) {
    super.enter(previous, action);
    this.position = action.position;
  }

  public leave(_next: ActivityState, action: AttackAction): void | Promise<void> {
    super.leave(_next, action);
    // Not done!
    if (this.remaining > 0) {
      // console.log('%%%% Not there yet', this.remaining);
      return;
    }
    // this.entity.position = this.path;
    // this.entity.agent.addPreviousPosition(this.position);
    const hit = this.world.addEntities({ type: 'attack-hit', position: this.position });
    const hits = this.world.getEntities(this.position.x, this.position.y);
    hits.forEach(hit => {
      const { entity, ratio} = hit;
      (entity as Combatant).damage(Math.round(this.entity.shootDamage * ratio));
      // console.log('HIT entity', hit.ratio, hit.entity)
    });
    setTimeout(() => this.world.removeEntities(hit), 800);
    // console.log('ATTACK HIT!!!!', this.position);
  }

  public update(deltaTime: number): void | boolean {
    const combatant = this.entity as Combatant;
    if (typeof super.update(deltaTime * combatant.attackSpeed) === 'boolean') {
      IdleAction.execute({ entity: combatant });
    }

    // const remaining = Math.round(this.remaining * 10);
    // combatant.color = remaining % 2 === 0 ? combatant.originalColor : 'transparent';
  }

  /*
  public update(deltaTime: number): void {
    let target = this.target[0];
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

      this.previousPathNode = this.target.shift();
      if (this.target.length === 0) {
        this.remaining = 0;
        IdleAction.execute({ entity: combatant });
        return;
      }

      const moveTime = distance / speed;
      deltaTime -= moveTime;

      previousPos = targetPos;
      target = this.target[0];
      targetPos = new Vector(target.x, target.y);
      tileDistance = previousPos.subtract(targetPos).magnitude;
      tileSpeed = target.worldCost / tileDistance;

      speed = combatant.maxSpeed / tileSpeed;

      delta = targetPos.subtract(pos);
      distance = delta.magnitude;
      direction = delta.normalize();
    }
    this.remaining = distance;

    combatant.position.add(direction.multiply(speed * deltaTime), true);
  }
  */
}
