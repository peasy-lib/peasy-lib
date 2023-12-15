import { Agent, IAgent } from '@peasy-lib/peasy-agent';
import { Idling } from '../states/idling';

export interface ITurnBasedAgent extends IAgent { }

export class TurnBasedAgent extends Agent {
  public previousPositions: { x: number; y: number }[] = [];

  public static create(input: ITurnBasedAgent): TurnBasedAgent {
    const agent = super.create(input);
    console.log('created agent', agent);
    return agent as TurnBasedAgent;
  }

  public get isLocked(): boolean {
    return this.external.currentActivity.current != null && !(this.external.currentActivity.current instanceof Idling);
  }

  public addPreviousPosition(position: { x: number; y: number }): void {
    this.previousPositions.unshift({ x: position.x, y: position.y });
    this.previousPositions = this.previousPositions.slice(0, 5);
  }

  public clearPreviousPositions(): void {
    this.previousPositions = [];
  }
}
