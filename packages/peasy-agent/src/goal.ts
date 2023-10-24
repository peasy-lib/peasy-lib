import { IContext } from './context';
import { World } from './world';

export class Goal {

  public constructor(public name: string, public priority: number) { }

  // 0 - 1, 0 means no priority, 1 is top priority. Score is weighed with this
  public getPriority(context: IContext): number {
    return this.priority;
  }

  public getScore(context: IContext, originalWorld: World): number {
    return 0;
  }

  public static clamp(value: number, min = 0, max = 1): number {
    return Math.max(Math.min(value, max), min);
  }
}
