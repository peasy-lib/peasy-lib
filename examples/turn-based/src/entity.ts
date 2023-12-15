import { IVector, PathNode } from '@peasy-lib/peasy-path';
import { Vector } from '@peasy-lib/peasy-viewport';
import { Action } from './action';
import { ActivityState, ActivityStates } from './states/activity-states';
import { World } from './world';
import { MovingTo } from './states/moving-to';
import { Idling } from './states/idling';
import { Shooting } from './states/shooting';
import { Attacking } from './states/attacking';
import { TurnBasedAgent } from './agent/turn-based-agent';

export interface IEntity extends Partial<Omit<Entity, 'position'>> {
  position: IVector;
}

export class Entity {
  public static lastEntity = 0;
  public id: number;
  public value = '';

  public constructor(public type: string, public world: World, public position: Vector) {
    this.id = ++Entity.lastEntity;
  }

  public get x(): number {
    return this.position.x;
  }
  public set x(value: number) {
    this.position.x = value;
  }
  public get y(): number {
    return this.position.y;
  }
  public set y(value: number) {
    this.position.y = value;
  }

  public get combatant(): boolean {
    return false;
  }

  public get shortName(): string {
    return '';
  }

  public get activity(): string {
    return '';
  }

  public static create(world: World, input: IEntity): Entity {
    const position = input.position instanceof Vector ? input.position : new Vector(input.position.x, input.position.y);
    return new this(input.type, world, position);
  }
}

export interface ICombatant extends Partial<Omit<Combatant, 'position'>> {
  position: IVector;
}

export class Combatant extends Entity {
  public name: string = '';
  public team: string = '';

  public path: PathNode[] = [];
  public currentDuration = 0;
  public isCurrent = false;


  public maxSpeed = 150;
  public shootSpeed = 300;
  public attackSpeed = 100;

  public hitPoints = 100;
  public shootDamage = 25;
  public attackDamage = 35;
  public arrows = 0;

  public currentAction: Action | null = null;
  public currentActivity = new ActivityStates(this.world);

  public agent: TurnBasedAgent;

  public constructor(type: string, world: World, position: Vector) {
    super(type, world, position);

    this.currentActivity.register(Idling, MovingTo, Shooting, Attacking);
  }

  public get hasArrows(): boolean {
    return this.arrows > 0;
  }

  public get combatant(): boolean {
    return true;
  }

  public get acting(): boolean {
    return this.currentActivity.current != null && !(this.currentActivity.current instanceof Idling);
  }

  public get remaining(): number {
    return (this.currentActivity.current as ActivityState)?.remaining ?? 0;
  }

  public get activity(): string {
    return (this.currentActivity?.current as ActivityState)?.title ?? 'Idling';
  }

  public get shortName(): string {
    return this.name.split(' ').pop();
  }

  public static create(world: World, input: ICombatant): Combatant {
    const combatant = super.create(world, { ...input, ...{ type: 'combatant' } }) as Combatant;

    combatant.name = input.name ?? combatant.name;
    combatant.team = input.team ?? combatant.team;
    combatant.arrows = input.arrows ?? combatant.arrows;

    return combatant;
  }

  // public update(time: number) {
  //   this.currentDuration -= time;
  //   if (this.path.length > 0) {
  //     const target = this.path.shift();
  //     this.x = target.x;
  //     this.y = target.y;
  //   }
  //   return this.path.length === 0;
  // }

  public update(deltaTime: number): boolean {
    this.currentActivity.update(deltaTime);
    return true;
  }

  public damage(hp: number) {
    hp = Math.max(hp, 0);
    this.hitPoints -= hp;
    console.log(this, this.hitPoints);
    const damage = this.world.addEntities({ type: 'damage', position: this.position })[0];
    damage.value = `-${hp}`;
    setTimeout(() => this.world.removeEntities([damage]), 1000);
  }
}
