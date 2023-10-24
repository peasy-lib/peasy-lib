import { Agent } from './agent';
import { IContext } from './context';
import { World } from './world';
import { PlannerNode } from './planner-node';

// Actions are shared and should be agent stateless!
export class Action {
  public static external?: any;

  public constructor(public name: string, public context: IContext, public duration: number) { }

  public get external(): any {
    return (this.constructor as typeof Action).external;
  }

  public static create() {

  }

  public get description(): string {
    const target = this.context.target;
    if (target == null) {
      return this.name;
    }
    const targetDescription = target.type == null
      ? `[${target.x},${target.y}]`
      : `[${target.id} ${target.type} ${target.position.x},${target.position.y}]`;
    return `${this.name}${target != null ? ` ${targetDescription}` : ''}`;
  }

  // Should return a list with an instantiated action for each available target
  public static getAvailableActions(world: World, agent: Agent, previous: PlannerNode | null): Action[] {
    return [];
  }

  // 0 - 1, 0 means unavailable. Passed into evaluate for possible weighing
  public getAvailability(time: number): number {
    return 1;
  }

  // So that it can be overriden
  public getDuration(): number {
    return this.duration;
  }

  // Duration is the norm, but can be overriden to weigh actions (idle in fight is undesired)
  public getCost(): number {
    return this.getDuration();
  }

  // The amount of time (ms) after the action has started that no other action
  // can be performed (should include action duration)
  public getLockoutTime(): number {
    return 0; // this.getDuration() * 1000 + 5000; // this.getDuration();
  }

  // If no other actions can be added as children to this action
  public isForcedLeaf(): boolean {
    return false;
  }

  public evaluate(): void {
    // Affect the state of the world, agent and/or target
    // If action can be interrupted, possibly call interrupt with 100% time
  }

  public interrupt(time: number): void {
    // Partially, based on time, affect the state of the world, agent and/or target
  }

  public isSame(other: Action): boolean {
    return this.context.target.id === other.context.target.id;
  }
}
