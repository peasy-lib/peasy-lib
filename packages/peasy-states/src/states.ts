import { State } from './index';

export class States {
  public states = new Map<string | typeof State, State>();
  public current: State | null = null;
  public currentParams: any[] = [];
  public currentTime: number = 0;

  public constructor() { }

  public register(...types: (string | typeof State)[]): State[] {
    const created = [];
    let names = [];
    const reversed = [...types];
    reversed.reverse();
    for (const type of reversed) {
      if (typeof type === 'string') {
        names.push(type);
        continue;
      }

      if (names.length === 0) {
        names = [type.name];
      }
      created.push(...names.map(name => {
        const state = new type(this, name);
        this.states.set(state.name, state);
        this.states.set(state.constructor as typeof State, state);
        return state;
      }));
      names = [];
    }
    return created;
  }

  //
  // Supports states that return promises in leave and enter (and awaits them if desired) as
  // well as not return promises (and then stays sync)
  //
  public set(state: string | State | typeof State | null, now = 0, ...params: any[]): void | Promise<void> {
    // console.log('STATE NOW', now, state, states);
    const next = typeof state === 'string' || (state != null && 'prototype' in state) ? this.states.get(state) ?? null : state;

    if ((next ?? null) == (this.current ?? null)) {
      if (params.length === this.currentParams.length) {
        let sameParams = true;
        for (let i = 0; i < params.length; i++) {
          if (params[i] !== this.currentParams[i]) {
            sameParams = false;
            break;
          }
        }
        if (sameParams) {
          return;
        }
      }
    }

    let leaving: void | Promise<void>;
    let entering: void | Promise<void>;
    if (this.current != null) {
      leaving = this.current.leave(next, ...params);
    }
    if (leaving instanceof Promise) {
      return leaving.then(() => {
        if (next != null) {
          entering = next.enter(this.current, ...params);
        }
        if (entering instanceof Promise) {
          return entering.then(() => {
            this.current = next;
            this.currentParams = [...params];
            this.currentTime = now;
          });
        }
        this.current = next;
        this.currentParams = [...params];
        this.currentTime = now;
      });
    }

    if (next != null) {
      entering = next.enter(this.current, ...params);
    }
    if (entering instanceof Promise) {
      return entering.then(() => {
        this.current = next;
        this.currentParams = [...params];
        this.currentTime = now;
      });
    }
    this.current = next;
    this.currentParams = [...params];
    this.currentTime = now;
  }

  public get(now?: number): { state: State | null; since: number } {
    if (now != null && this.currentTime > now) {
      this.currentTime = now;
    }
    return {
      state: this.current,
      since: this.currentTime,
    };
  }

  public update(...params: any[]): void | Promise<void> {
    return this.current?.update(...params);
  }
}
