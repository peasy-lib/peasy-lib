export type EngineCallback = (deltaTime: number, runtime: number) => void | Promise<void>;

export interface IEngine {
  callback: EngineCallback;
  started?: boolean;
  fps?: number;
  ms?: number;
  resetThreshold?: number;
  oneTime?: boolean;
  isolated?: boolean;
}

export class Engine {
  public static engines: Engine[] = [];

  public startTime?: number;

  private started = false;
  private paused = false;
  private destroyed = false;
  private lastTime = 0;
  private resetThreshold = 1000;
  private timeSinceLast = 0;
  private accTime = 0;
  private oneTime = false;
  private isolated = false;

  private constructor(private readonly interval: number, private readonly callback: EngineCallback) { }

  public static create(options: IEngine | EngineCallback): Engine {
    if (typeof options === 'function') {
      options = { callback: options };
    }
    const interval = options.ms ?? 1000 / (options.fps ?? 60);
    const engine = new Engine(interval, options.callback);
    engine.resetThreshold = options.resetThreshold ?? engine.resetThreshold;
    engine.oneTime = options.oneTime ?? engine.oneTime;
    engine.isolated = options.isolated ?? engine.isolated;

    if (!engine.isolated) {
      Engine.engines.push(engine);
    }

    if (options.started ?? true) {
      engine.start();
    }
    return engine;
  }

  public static start(): boolean[] {
    return Engine.engines.map(engine => engine.start());
  }
  public static stop(): boolean[] {
    return Engine.engines.map(engine => engine.stop());
  }
  public static pause(): boolean[] {
    return Engine.engines.map(engine => engine.pause());
  }
  public static destroy(): void {
    Engine.engines.forEach(engine => engine.destroy());
  }

  public start(): boolean {
    if (this.started && !this.paused) {
      return false;
    }

    requestAnimationFrame(this.paused ? this.tick : this.doStart);
    this.paused = false;

    return true;
  }
  public stop(): boolean {
    if (!this.started) {
      return false;
    }
    this.started = false;
    this.paused = false;
    return true;
  }
  public pause(): boolean {
    if (!this.started) {
      return false;
    }
    this.paused = true;
    return true;
  }

  public destroy(): void {
    this.destroyed = true;
    this.stop();
    const index = Engine.engines.indexOf(this);
    if (index >= 0) {
      Engine.engines.splice(index, 1);
    }
  }

  private readonly doStart = (timestamp: number) => {
    this.started = true;
    this.startTime = timestamp;
    this.lastTime = timestamp;
    this.accTime = 0;
    requestAnimationFrame(this.tick);
  };

  private readonly tick = (timestamp: number) => {
    if (!this.started || this.paused) {
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (deltaTime > this.resetThreshold) {
      console.log(`Too long since last tick: ${deltaTime}ms. Resetting.`);
      this.timeSinceLast = 0;
      requestAnimationFrame(this.tick);
      return;
    }
    // deltaTime /= 1000;
    // console.log(timestamp, deltaTime * 1000);

    this.timeSinceLast += deltaTime;

    // let ticked = false;
    // while (this.timeSinceLast >= this.interval) {
    //   const result = this.callback(this.interval, this.accTime);
    //   this.accTime += this.interval;
    //   this.timeSinceLast -= this.interval;
    //   ticked = true;

    // }
    // if (this.oneTime && ticked) {
    //   this.destroy();
    // } else {
    //   requestAnimationFrame(this.tick);
    // }
    const result = this.call();
    if (result instanceof Promise) {
      void result.then(() => requestAnimationFrame(this.tick));
    } else {
      requestAnimationFrame(this.tick);
    }
  };

  private readonly call = (): boolean | Promise<boolean> => {
    if (this.timeSinceLast >= this.interval) {
      const result = this.callback(this.interval, this.accTime);
      this.accTime += this.interval;
      this.timeSinceLast -= this.interval;
      if (this.oneTime) {
        this.destroy();
      }
      if (result instanceof Promise) {
        return result.then(() => this.call());
      } else {
        void this.call();
      }
      return true;
    }
    return false;
  };
}
