import { States } from './states';

export class State {
  public constructor(
    public states: States,
    public name: string,
  ) { }

  public enter(_previous: State | null, ...params: any): void | Promise<void> { }
  public leave(_next: State | null, ...params: any): void | Promise<void> { }
  public update(...params: any): void | Promise<void> { }
}
